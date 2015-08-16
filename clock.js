var clocks = [];
window.clocks = clocks;

var width = document.rootElement.width.baseVal.value;
var height = document.rootElement.height.baseVal.value;

NodeList.prototype.map = function (f) {
  return Array.prototype.slice.call(this).map(f);
};

Movement = {
  seconds: function(time) {
    return ((time.getSeconds()*1000 + time.getMilliseconds()) * 360 / 60 / 1000)%360;
  },
  minutes: function(time) {
    return ((60*time.getMinutes() + time.getSeconds()) * 360 / 60 / 60)%360;
  },
  hours: function(time) {
    return (((time.getHours() % 12)*60 + time.getMinutes()) * 360 / 12 / 60)%360;
  },
  fast: function(time) {
    return ((time.getMilliseconds() / 100) * 360 / 10) % 360;
  },
  minus: function(f) {
    return function(time) { return -f(time); };
  }
}

function Clock(element) {
  if (typeof element == "string") {
    element = document.querySelector(element);
  }
  this.element = element;

  var transforms = element.transform.baseVal;
  this.centerTransform = document.rootElement.createSVGTransform();
  this.rotateTransform = document.rootElement.createSVGTransform();
  transforms.insertItemBefore(this.centerTransform, 0);
  transforms.appendItem(this.rotateTransform);

  clocks.push(this);
}
Clock.prototype = {
  tick: function(time) {
    this.centerTransform.setRotate(this.position(time), width/2, height/2);
    this.rotateTransform.setRotate(this.rotate(time), width/2, height/2);
  },
  position: function(time) { return 0 },
  rotate: function(time) { return 0 },
  setAngle: function(position, rotate) {
    if (position) this.position = position;
    if (rotate) this.rotate = rotate;
    return this;
  },
  seconds: function() {
    this.position = function(time) {
      return ((time.getSeconds()*1000 + time.getMilliseconds()) * 360 / 60 / 1000)%360;
    }
    return this;
  },
  minutes: function() {
    this.position = function(time) {
      return ((60*1000*time.getMinutes() + 1000*time.getSeconds() + time.getMilliseconds()) * 360 / 60 / 60 / 1000)%360;
    }
  },
  hours: function() {
    this.position = function(time) {
      return (((time.getHours() % 12)*60*60 + time.getMinutes()*60 + time.getSeconds()) * 360 / 12 / 60 / 60)%360;
    }
  },
}

function tick() {
  var time = new Date();
  clocks.forEach(function (clock) {
    clock.tick(time);
  });
  window.requestAnimationFrame(tick);
}

function main() {
  console.log("Firing main");
  document.querySelectorAll("[clock]").map(function (elem) {
    var movements = elem.getAttribute("clock");
    var clock = new Clock(elem);
    var fns = movements.split(" ").map(function (movement) {
      var negative = false;
      if (movement[0] == "-") {
        negative = true;
        movement = movement.slice(1);
      }
      if (Movement[movement]) {
        return negative ? Movement.minus(Movement[movement]): Movement[movement];
      }
    });
    clock.setAngle(fns[0], fns[1]);
  });

  window.requestAnimationFrame(tick);

  console.log("Running", clocks);
};

document.addEventListener("readystatechange", function (state) {
  if (document.readyState == "complete") {
    main();
  }
});
