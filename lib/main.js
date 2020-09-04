"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/// <reference path="node_modules/@types/nouislider/index.d.ts" />
function pause() {
  if (status_next == STATUS_NEXT.PLAY) {
    status_next = STATUS_NEXT.PAUSE;
  }
}

function play() {
  if (status_next == STATUS_NEXT.PAUSE) {
    status_next = STATUS_NEXT.PLAY;
    window.requestAnimationFrame(update);
  }

  if (status_next == STATUS_NEXT.STOP) {
    status_next = STATUS_NEXT.PLAY;
    start();
  }
}

function reset() {
  status_next = STATUS_NEXT.PAUSE;
  start();
}

var PARTICLE_STATUS;

(function (PARTICLE_STATUS) {
  PARTICLE_STATUS[PARTICLE_STATUS["Susceptible"] = 0] = "Susceptible";
  PARTICLE_STATUS[PARTICLE_STATUS["Infectious"] = 1] = "Infectious";
  PARTICLE_STATUS[PARTICLE_STATUS["Removed"] = 2] = "Removed";
})(PARTICLE_STATUS || (PARTICLE_STATUS = {}));

;

var Particle = /*#__PURE__*/function () {
  function Particle(_position, _velocity, obey_social_distance) {
    var _this = this;

    _classCallCheck(this, Particle);

    this._random_walk = function (speed_range) {
      if (_this.is_quarantined == false) {
        var alpha = Random.make(0, 1);
        var beta = Random.make(0, 1);
        var a = Math.sqrt(-2.0 * Math.log(alpha)) * Math.sin(2.0 * Math.PI * beta);
        var b = Math.sqrt(-2.0 * Math.log(alpha)) * Math.cos(2.0 * Math.PI * beta);
        _this.velocity.x += speed_range * a;
        _this.velocity.y += speed_range * b;
      }
    };

    this._apply_velocity_limitation = function (speed_limit) {
      _this.velocity.x = Math.abs(_this.velocity.x) > speed_limit ? Math.sign(_this.velocity.x) * speed_limit : _this.velocity.x;
      _this.velocity.y = Math.abs(_this.velocity.y) > speed_limit ? Math.sign(_this.velocity.y) * speed_limit : _this.velocity.y;
    };

    this._apply_boundary_condition = function (boundary_condition) {
      _this.velocity.x += Math.exp(-(_this.position.x - boundary_condition.xmin)) - Math.exp(_this.position.x - boundary_condition.xmax);
      _this.velocity.y += Math.exp(-(_this.position.y - boundary_condition.ymin)) - Math.exp(_this.position.y - boundary_condition.ymax);
    };

    this._calculate_next_position = function () {
      return new Vector2(_this.position.x + _this.velocity.x, _this.position.y + _this.velocity.y);
    };

    this._apply_social_distancing = function (repulsive_force_coefficient) {
      if (_this.obey_social_distance == false) return;
      if (_this.is_quarantined) return;

      var _iterator = _createForOfIteratorHelper(particles),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var other = _step.value;
          if (_this == other) continue;
          var r2 = Vector2.dis2(_this._calculate_next_position(), other._calculate_next_position());

          if (r2 <= SOCIAL_DISTANCE * SOCIAL_DISTANCE) {
            var vec = {
              x: _this.position.x - other.position.x,
              y: _this.position.y - other.position.y
            };
            _this.velocity.x += repulsive_force_coefficient * vec.x / r2;
            _this.velocity.y += repulsive_force_coefficient * vec.y / r2;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    };

    this._update_status = function () {
      if (_this.status != PARTICLE_STATUS.Infectious) return;
      _this.infected_frames++;

      if (INFECTED_FRAMES_DURATION < _this.infected_frames) {
        _this.status = PARTICLE_STATUS.Removed;
        return;
      }

      if (_this.is_quarantined) return;

      var _iterator2 = _createForOfIteratorHelper(particles),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var other = _step2.value;
          if (_this == other) continue;

          if (Vector2.dis2(_this.position, other.position) < INFECTIOUS_RADIUS * INFECTIOUS_RADIUS) {
            if (other.status == PARTICLE_STATUS.Susceptible && Random.make(0, 1) < INFECTIOUS_PROBABILITY) {
              other.status = PARTICLE_STATUS.Infectious;
            }
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };

    this.position = _position;
    this.velocity = _velocity;
    this.obey_social_distance = obey_social_distance;
    this.status = PARTICLE_STATUS.Susceptible;
    this.infected_frames = 0;
    this.is_quarantined = false;
  }

  _createClass(Particle, [{
    key: "evolve",
    value: function evolve() {
      var _canvas_simulation = canvas_list.get("simulation");

      var _canvas_quarantine = canvas_list.get("quarantine"); // random walk


      this._random_walk(0.1); // apply velocity


      this.position = this._calculate_next_position(); // apply boundary condition

      var canvas = this.is_quarantined ? _canvas_quarantine.canvas : _canvas_simulation.canvas;

      this._apply_boundary_condition({
        xmin: 0,
        xmax: canvas.width,
        ymin: 0,
        ymax: canvas.height
      }); // social distancing


      this._apply_social_distancing(8); // infection / recovery


      this._update_status(); // speed limit


      this._apply_velocity_limitation(0.8);
    }
  }]);

  return Particle;
}();

var Vector2 = function Vector2(x, y) {
  _classCallCheck(this, Vector2);

  this.x = x;
  this.y = y;
};

Vector2.dis2 = function (r1, r2) {
  var x_diff = r2.x - r1.x;
  var y_diff = r2.y - r1.y;
  return x_diff * x_diff + y_diff * y_diff;
};

var Random = /*#__PURE__*/function () {
  function Random() {
    _classCallCheck(this, Random);
  }

  _createClass(Random, null, [{
    key: "make",
    value: function make() {
      if (arguments.length >= 2) {
        var min = arguments.length <= 0 ? undefined : arguments[0];
        var max = arguments.length <= 1 ? undefined : arguments[1];
        return Math.random() * (max - min) + min;
      } else {
        return Math.random();
      }
    } // choose random items from an array without duplication

  }, {
    key: "choices",
    value: function choices(array, n) {
      if (n > array.length) {
        throw new RangeError("Error: Random.choices()");
      }

      var choices_index = [];
      var result = [];
      var left = n;

      while (left > 0) {
        var index = Math.floor(Random.make(0, array.length));

        if (choices_index.includes(index) == false) {
          result.push(array[index]);
          choices_index.push(index);
          left--;
        }
      }

      return result;
    }
  }]);

  return Random;
}();

var Canvas = /*#__PURE__*/function () {
  function Canvas(id) {
    _classCallCheck(this, Canvas);

    this.canvas = document.getElementById(id);
    this.context = this.canvas.getContext("2d");
    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  _createClass(Canvas, [{
    key: "draw",
    value: function draw() {}
  }, {
    key: "reset",
    value: function reset() {}
  }]);

  return Canvas;
}();

var SimulationCanvas = /*#__PURE__*/function (_Canvas) {
  _inherits(SimulationCanvas, _Canvas);

  var _super = _createSuper(SimulationCanvas);

  function SimulationCanvas(id) {
    _classCallCheck(this, SimulationCanvas);

    return _super.call(this, id);
  }

  _createClass(SimulationCanvas, [{
    key: "draw",
    value: function draw(particle) {
      drawParticle(particle, this.canvas, this.context);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.context.fillStyle = "#FFFFFF";
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }, {
    key: "drawFPS",
    value: function drawFPS(fps) {
      this.context.font = "1.15em 'Source Sans Pro'";
      this.context.fillStyle = "#B0C4DE";
      this.context.textAlign = "right";
      var padding_top = 20;
      var padding_right = 10;
      this.context.fillText(fps + " FPS", this.width - padding_right, padding_top);
    }
  }]);

  return SimulationCanvas;
}(Canvas);

var PlotCanvas = /*#__PURE__*/function (_Canvas2) {
  _inherits(PlotCanvas, _Canvas2);

  var _super2 = _createSuper(PlotCanvas);

  function PlotCanvas(id) {
    var _this2;

    _classCallCheck(this, PlotCanvas);

    _this2 = _super2.call(this, id);
    var X_AXIS_HEIGHT = 50;
    var LABEL_WIDTH = 130;
    var GRAPH_WIDTH = _this2.width - LABEL_WIDTH;
    var GRAPH_HEIGHT = _this2.height - X_AXIS_HEIGHT;
    var LABEL_HEIGHT = GRAPH_HEIGHT;
    var X_AXIS_WIDTH = GRAPH_WIDTH;
    _this2.graph = {
      width: GRAPH_WIDTH,
      height: GRAPH_HEIGHT,
      offset: {
        x: 5,
        y: 0
      }
    };
    _this2.label = {
      width: LABEL_WIDTH,
      height: LABEL_HEIGHT,
      offset: {
        x: _this2.graph.width + 5 + _this2.graph.offset.x,
        y: 0
      }
    };
    _this2.axis = {
      width: X_AXIS_WIDTH,
      height: X_AXIS_HEIGHT,
      offset: {
        x: _this2.graph.offset.x,
        y: _this2.graph.height
      }
    };
    return _this2;
  }

  _createClass(PlotCanvas, [{
    key: "draw",
    value: function draw(stats) {
      var _this3 = this;

      var LAST_STATS = stats[stats.length - 1];
      var ratio_graph = this.graph.height / PARTICLE_NUMBER;
      this.reset();

      if (stats.length > 0) {
        var plot = function plot() {
          var INFECT_PATH = new Path2D();
          INFECT_PATH.moveTo(_this3.graph.offset.x, _this3.graph.height + _this3.graph.offset.y);
          var x = 0;
          var dx = _this3.graph.width / (stats.length - 1);

          var _iterator3 = _createForOfIteratorHelper(stats),
              _step3;

          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var event = _step3.value;
              INFECT_PATH.lineTo(x + _this3.graph.offset.x, _this3.graph.height - ratio_graph * event[PARTICLE_STATUS.Infectious] + _this3.graph.offset.y);
              x += dx;
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }

          INFECT_PATH.lineTo(_this3.graph.width + _this3.graph.offset.x, _this3.graph.height + _this3.graph.offset.y);
          INFECT_PATH.lineTo(_this3.graph.offset.x, _this3.graph.height + _this3.graph.offset.y);
          _this3.context.fillStyle = STATUS_COLOR.Infectious;

          _this3.context.fill(INFECT_PATH);

          var REMOVED_PATH = new Path2D();
          REMOVED_PATH.moveTo(_this3.graph.offset.x, _this3.graph.height + _this3.graph.offset.y);
          x = 0;

          var _iterator4 = _createForOfIteratorHelper(stats),
              _step4;

          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var _event = _step4.value;
              REMOVED_PATH.lineTo(x + _this3.graph.offset.x, ratio_graph * _event[PARTICLE_STATUS.Removed] + _this3.graph.offset.y);
              x += dx;
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }

          REMOVED_PATH.lineTo(_this3.graph.width + _this3.graph.offset.x, _this3.graph.offset.y);
          REMOVED_PATH.lineTo(_this3.graph.offset.x, _this3.graph.offset.y);
          _this3.context.fillStyle = STATUS_COLOR.Removed;

          _this3.context.fill(REMOVED_PATH);
        };

        plot();
      }

      var setLabels = function setLabels() {
        var fontsize = 15;
        _this3.context.font = fontsize + "px 'Source Sans Pro'";
        _this3.context.textAlign = "left";

        var toPercent = function toPercent(ratio) {
          return (100 * ratio).toFixed(1);
        };

        var ratio = LAST_STATS[PARTICLE_STATUS.Removed] / PARTICLE_NUMBER;
        _this3.context.fillStyle = STATUS_COLOR.Removed;
        var y = 0.5 * ratio * _this3.label.height + _this3.label.offset.y;
        y = y < fontsize ? fontsize : y;

        _this3.context.fillText(toPercent(ratio) + "%  removed", _this3.label.offset.x, y);

        ratio = LAST_STATS[PARTICLE_STATUS.Susceptible] / PARTICLE_NUMBER;
        _this3.context.fillStyle = STATUS_COLOR.Susceptible;
        y = (0.5 * LAST_STATS[PARTICLE_STATUS.Susceptible] + LAST_STATS[PARTICLE_STATUS.Removed]) / PARTICLE_NUMBER * _this3.label.height + _this3.label.offset.y;

        _this3.context.fillText(toPercent(ratio) + "%  susceptible", _this3.label.offset.x, y);

        ratio = LAST_STATS[PARTICLE_STATUS.Infectious] / PARTICLE_NUMBER;
        _this3.context.fillStyle = STATUS_COLOR.Infectious;

        _this3.context.fillText(toPercent(ratio) + "%  infected", _this3.label.offset.x, (1.0 - 0.5 * ratio) * _this3.label.height + _this3.label.offset.y);
      };

      setLabels(); // Draw X Axis

      var setXAxis = function setXAxis() {
        _this3.context.fillStyle = "Black";
        _this3.context.strokeStyle = "#656565";
        _this3.context.lineWidth = 1;
        var FONTSIZE = 15;
        _this3.context.font = FONTSIZE + "px 'Source Sans Pro'";
        _this3.context.textAlign = "center";
        var dx = _this3.axis.width / infect_history.length;
        var SKIP_DATA_NUMBER = 100;

        for (var i = 0; i <= infect_history.length; i += SKIP_DATA_NUMBER) {
          _this3.context.beginPath();

          _this3.context.moveTo(dx * i + _this3.axis.offset.x, _this3.axis.offset.y - 5);

          _this3.context.lineTo(dx * i + _this3.axis.offset.x, _this3.axis.offset.y + 3);

          _this3.context.closePath();

          _this3.context.stroke();

          _this3.context.fillText((i / SKIP_DATA_NUMBER).toString(), dx * i + _this3.axis.offset.x, 15 + _this3.axis.offset.y);
        }

        _this3.context.fillText("Time", 0.5 * _this3.axis.width + _this3.axis.offset.x, _this3.axis.height + _this3.axis.offset.y - FONTSIZE * 0.5);
      };

      setXAxis();
    }
  }, {
    key: "reset",
    value: function reset() {
      // Clear
      this.context.fillStyle = "#FFFFFF";
      this.context.fillRect(0, 0, this.width, this.height); // Susceptible as background

      this.context.fillStyle = STATUS_COLOR.Susceptible;
      this.context.fillRect(this.graph.offset.x, this.graph.offset.y, this.graph.width, this.graph.height); // Border

      this.context.strokeStyle = "gray";
      this.context.lineWidth = 2;
      this.context.strokeRect(this.graph.offset.x, this.graph.offset.y, this.graph.width, this.graph.height);
    }
  }]);

  return PlotCanvas;
}(Canvas);

var QuarantineCanvas = /*#__PURE__*/function (_Canvas3) {
  _inherits(QuarantineCanvas, _Canvas3);

  var _super3 = _createSuper(QuarantineCanvas);

  function QuarantineCanvas(id) {
    _classCallCheck(this, QuarantineCanvas);

    return _super3.call(this, id);
  }

  _createClass(QuarantineCanvas, [{
    key: "draw",
    value: function draw(particle) {
      drawParticle(particle, this.canvas, this.context);
    }
  }, {
    key: "reset",
    value: function reset() {
      this.context.fillStyle = "#FFFFFF";
      this.context.fillRect(0, 0, this.width, this.height);
    }
  }]);

  return QuarantineCanvas;
}(Canvas);

var STATUS_NEXT = {
  PAUSE: 0,
  PLAY: 1,
  STOP: 2
};
var STATUS_COLOR = {
  Susceptible: "#7AD9FF",
  Infectious: "#E24040",
  Removed: "#7F7F7F"
};
var PARTICLE_NUMBER = 300;
var INFECTIOUS_RADIUS = 10;
var INFECTED_FRAMES_DURATION = 500;
var INFECTIOUS_PROBABILITY = 0.3;
var SOCIAL_DISTANCE = 10;
var SOCIAL_DISTANCE_PROBABILITY = 0.5;
var QUARANTINE_PROBABILITY = 0;
var ATTRACT_NUMBER = 5;
var status_next = STATUS_NEXT.PLAY;
var startTime;
var startTime_;
var particles;
var infect_history;
var canvas_list = new Map();
var tm_quarantine;
var tm_attract;
var tm_update; // Awake is called only 'once' when document is ready

function awake() {
  console.log("awake() called");
  canvas_list.set("simulation", new SimulationCanvas("simulation_graph"));
  canvas_list.set("plot", new PlotCanvas("counts_graph"));
  canvas_list.set("quarantine", new QuarantineCanvas("quarantine_graph"));

  if (canvas_list.has(undefined)) {
    document.write("Couldn't get the Canvas context");
    return;
  }

  start();
} // Start is called before Update is fired.


function start() {
  console.log("start() called");
  startTime = new Date().getTime();
  startTime_ = new Date().getTime();
  particles = [];
  tm_quarantine = new TimeManagement();
  tm_attract = new TimeManagement();
  tm_update = new TimeManagement();
  document.getElementById("label_population").innerText = "Population";
  PARTICLE_NUMBER = parseInt(sliders.population.noUiSlider.get());
  var INITIAL_INFECTED_NUMBER = 3;
  var DATA = [PARTICLE_NUMBER - INITIAL_INFECTED_NUMBER, INITIAL_INFECTED_NUMBER, 0];
  infect_history = [DATA]; // Create Initial Particles

  var _canvas = canvas_list.get("simulation");

  for (var i = 0; i < PARTICLE_NUMBER; i++) {
    var position = new Vector2(_canvas.width * Random.make(0.05, 0.95), _canvas.height * Random.make(0.05, 0.95));
    var velocity = new Vector2(Random.make(-0.8, 0.8), Random.make(-0.8, 0.8));
    var particle = new Particle(position, velocity, true);
    particles.push(particle);
  }

  Random.choices(particles, INITIAL_INFECTED_NUMBER).map(function (x) {
    return x.status = PARTICLE_STATUS.Infectious;
  });
  Random.choices(particles, PARTICLE_NUMBER * (1 - SOCIAL_DISTANCE_PROBABILITY)).map(function (x) {
    return x.obey_social_distance = false;
  });

  _canvas.reset();

  var _iterator5 = _createForOfIteratorHelper(particles),
      _step5;

  try {
    for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
      var _particle = _step5.value;

      _canvas.draw(_particle);
    }
  } catch (err) {
    _iterator5.e(err);
  } finally {
    _iterator5.f();
  }

  canvas_list.get("quarantine").reset();
  canvas_list.get("plot").reset();
  canvas_list.get("plot").draw(infect_history);
  updateCountDisplay(infect_history[0]);

  if (status_next == STATUS_NEXT.PLAY) {
    update();
  }
}

function quarantine(particle, ratio) {
  particle.is_quarantined = true;
  particle.position.x *= ratio.x;
  particle.position.y *= ratio.y;
  particle.velocity.x *= ratio.x;
  particle.velocity.y *= ratio.y;
}

function attract(chosen_particles, spot) {
  var _iterator6 = _createForOfIteratorHelper(chosen_particles),
      _step6;

  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var chosen_particle = _step6.value;

      if (!chosen_particle.is_quarantined) {
        chosen_particle.position.x = spot.x;
        chosen_particle.position.y = spot.y;
      }
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
}

function updateCountDisplay(counts) {
  var counts_element = document.getElementById("counts");
  counts_element.innerText = "Removed: " + counts[PARTICLE_STATUS.Removed] + " (" + (100 * counts[PARTICLE_STATUS.Removed] / PARTICLE_NUMBER).toFixed(1) + "%) " + "Infectious: " + counts[PARTICLE_STATUS.Infectious] + " (" + (100 * counts[PARTICLE_STATUS.Infectious] / PARTICLE_NUMBER).toFixed(1) + "%) " + "Susceptible: " + counts[PARTICLE_STATUS.Susceptible] + " (" + (100 * counts[PARTICLE_STATUS.Susceptible] / PARTICLE_NUMBER).toFixed(1) + "%)";
}

var TimeManagement = /*#__PURE__*/function () {
  function TimeManagement() {
    _classCallCheck(this, TimeManagement);

    this.frames = 0;
    this.is_elapsed = false;
  }

  _createClass(TimeManagement, [{
    key: "suppressExecutionBySeconds",
    value: function suppressExecutionBySeconds(fps, sec, func) {
      this.frames++;

      if (this.frames / fps > sec) {
        this.is_elapsed = true;
      }

      if (this.is_elapsed) {
        this.is_elapsed = false;
        this.frames = 0;
        func();
      }
    }
  }, {
    key: "waitBySeconds",
    value: function waitBySeconds(fps, sec) {
      this.frames++;

      if (this.frames / fps > sec) {
        this.is_elapsed = true;
      }

      if (this.is_elapsed) {
        this.is_elapsed = false;
        this.frames = 0;
        return true;
      } else {
        return false;
      }
    }
  }]);

  return TimeManagement;
}(); // Update is called once per frame, although the rate might change.


var update = function update() {
  // Calculate FPS
  var FPS = Math.round(1000 / (new Date().getTime() - startTime));
  startTime = new Date().getTime();

  if (tm_update.waitBySeconds(FPS, 0.02) == false) {
    requestAnimationFrame(update);
    return;
  }

  fixedUpdate();

  if (status_next == STATUS_NEXT.PLAY) {
    window.requestAnimationFrame(update);
  }
}; // FixedUpdate is called in each time interval.


var fixedUpdate = function fixedUpdate() {
  // Calculate FPS
  var FPS = Math.round(1000 / (new Date().getTime() - startTime_));
  startTime_ = new Date().getTime();

  var _canvas_simulation = canvas_list.get("simulation");

  var _canvas_quarantine = canvas_list.get("quarantine");

  _canvas_simulation.reset();

  _canvas_quarantine.reset(); // Display FPS


  _canvas_simulation.drawFPS(FPS);

  var counts = [0, 0, 0];

  var _iterator7 = _createForOfIteratorHelper(particles),
      _step7;

  try {
    for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
      var particle = _step7.value;
      particle.evolve();
      counts[particle.status]++;
    }
  } catch (err) {
    _iterator7.e(err);
  } finally {
    _iterator7.f();
  }

  infect_history.push(counts); // Quarantine

  tm_quarantine.suppressExecutionBySeconds(FPS, 1, function () {
    var ratio = {
      x: _canvas_quarantine.width / _canvas_simulation.width,
      y: _canvas_quarantine.height / _canvas_simulation.height
    };

    var _iterator8 = _createForOfIteratorHelper(particles),
        _step8;

    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var particle = _step8.value;

        if (particle.status == PARTICLE_STATUS.Infectious && Math.random() < QUARANTINE_PROBABILITY && !particle.is_quarantined) {
          quarantine(particle, ratio);
        }
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }
  }); // Attractive Spot

  var SPOT_WIDTH = 30;
  var SPOT_HEIGHT = 30;
  var SPOT_X = _canvas_simulation.width * 0.5 - SPOT_WIDTH * 0.5;
  var SPOT_Y = _canvas_simulation.height * 0.5 - SPOT_HEIGHT * 0.5;
  var SPOT_POS = {
    x: _canvas_simulation.width * 0.5,
    y: _canvas_simulation.height * 0.5
  };

  if (ATTRACT_NUMBER > 0) {
    _canvas_simulation.context.strokeStyle = "gray";

    _canvas_simulation.context.strokeRect(SPOT_X, SPOT_Y, SPOT_WIDTH, SPOT_HEIGHT);
  }

  tm_attract.suppressExecutionBySeconds(FPS, 1, function () {
    if (ATTRACT_NUMBER > 0) {
      var chosen_particles = Random.choices(particles, ATTRACT_NUMBER);
      attract(chosen_particles, SPOT_POS);
    }
  }); // Draw Particles

  var _iterator9 = _createForOfIteratorHelper(particles),
      _step9;

  try {
    for (_iterator9.s(); !(_step9 = _iterator9.n()).done;) {
      var _particle2 = _step9.value;

      if (_particle2.is_quarantined) {
        _canvas_quarantine.draw(_particle2);
      } else {
        _canvas_simulation.draw(_particle2);
      }
    }
  } catch (err) {
    _iterator9.e(err);
  } finally {
    _iterator9.f();
  }

  updateCountDisplay(counts); // Draw Plot

  canvas_list.get("plot").draw(infect_history); // Forward or End the Simulation

  var infected_count = particles.filter(function (particle) {
    return particle.status == PARTICLE_STATUS.Infectious;
  }).length;

  if (status_next == STATUS_NEXT.PLAY && infected_count == 0) {
    status_next = STATUS_NEXT.STOP;
  }
};

var drawParticle = function drawParticle(particle, canvas, context) {
  context.beginPath();
  context.arc(particle.position.x, particle.position.y, 4, 0, 2 * Math.PI);

  switch (particle.status) {
    case PARTICLE_STATUS.Susceptible:
      context.fillStyle = STATUS_COLOR.Susceptible;
      break;

    case PARTICLE_STATUS.Infectious:
      context.fillStyle = STATUS_COLOR.Infectious;
      break;

    case PARTICLE_STATUS.Removed:
      context.fillStyle = STATUS_COLOR.Removed;
      break;
  }

  context.closePath();
  context.fill();

  if (particle.status == PARTICLE_STATUS.Infectious) {
    context.beginPath();
    context.strokeStyle = "orange";
    context.arc(particle.position.x, particle.position.y, INFECTIOUS_RADIUS, 0, 2 * Math.PI);
    context.closePath();
    context.stroke();
  }
};

var sliders = {
  population: document.getElementById("slider_population"),
  infect_radius: document.getElementById("slider_infect_radius"),
  infect_duration: document.getElementById("slider_infect_duration"),
  infect_probability: document.getElementById("slider_infect_probability"),
  sd_radius: document.getElementById("slider_sd_radius"),
  sd_probability: document.getElementById("slider_sd_probability"),
  quarantine_probability: document.getElementById("slider_quarantine_probability"),
  attract_probability: document.getElementById("slider_attract_probability")
};
var tooltips_nodes = document.getElementsByClassName("noUi-tooltip");
noUiSlider.create(sliders.population, {
  start: 300,
  range: {
    "min": [0],
    "max": [500]
  },
  step: 1,
  format: {
    to: function to(val) {
      return Math.round(val);
    },
    from: function from(val) {
      return val;
    }
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.infect_radius, {
  start: 10,
  range: {
    "min": [0],
    "max": [20]
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.infect_duration, {
  start: 300,
  range: {
    "min": [0],
    "max": [1000]
  },
  step: 50,
  format: {
    to: function to(val) {
      return Math.round(val);
    },
    from: function from(val) {
      return val;
    }
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.infect_probability, {
  start: 0.3,
  range: {
    "min": [0],
    "max": [1]
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.sd_radius, {
  start: 10,
  range: {
    "min": [0],
    "max": [20]
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.sd_probability, {
  start: 0.5,
  range: {
    "min": [0],
    "max": [1]
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.quarantine_probability, {
  start: 0.0,
  range: {
    "min": [0],
    "max": [1]
  },
  connect: "lower",
  tooltips: true
});
noUiSlider.create(sliders.attract_probability, {
  start: 0.02,
  range: {
    "min": [0],
    "max": [1]
  },
  connect: "lower",
  tooltips: true
});
sliders.population.noUiSlider.on("update", function (vals) {
  var node = document.getElementById("label_population");

  if (vals[0] != PARTICLE_NUMBER) {
    node.innerHTML = "Population <span style='color: red;'>*NEED TO RESTART</span>";
  } else {
    node.innerHTML = "Population";
  }
});
sliders.infect_radius.noUiSlider.on("update", function (vals) {
  INFECTIOUS_RADIUS = vals[0];
});
sliders.infect_duration.noUiSlider.on("update", function (vals) {
  INFECTED_FRAMES_DURATION = vals[0];
});
sliders.infect_probability.noUiSlider.on("update", function (vals) {
  INFECTIOUS_PROBABILITY = vals[0];
});
sliders.sd_radius.noUiSlider.on("update", function (vals) {
  SOCIAL_DISTANCE = vals[0];
});
sliders.sd_probability.noUiSlider.on("set", function (vals) {
  if (SOCIAL_DISTANCE_PROBABILITY != vals[0]) {
    SOCIAL_DISTANCE_PROBABILITY = vals[0];

    var _iterator10 = _createForOfIteratorHelper(particles),
        _step10;

    try {
      for (_iterator10.s(); !(_step10 = _iterator10.n()).done;) {
        var particle = _step10.value;
        particle.obey_social_distance = false;
      }
    } catch (err) {
      _iterator10.e(err);
    } finally {
      _iterator10.f();
    }

    Random.choices(particles, PARTICLE_NUMBER * SOCIAL_DISTANCE_PROBABILITY).map(function (x) {
      return x.obey_social_distance = true;
    });
  }
});
sliders.quarantine_probability.noUiSlider.on("update", function (vals) {
  QUARANTINE_PROBABILITY = vals[0];
});
sliders.attract_probability.noUiSlider.on("update", function (vals) {
  ATTRACT_NUMBER = Math.round(vals[0] * PARTICLE_NUMBER);
});

var _loop = function _loop(key) {
  sliders[key].noUiSlider.on("slide", function (vals) {
    sliders[key].getElementsByClassName("noUi-tooltip")[0].style.opacity = 1.0;
  });
  sliders[key].noUiSlider.on("end", function (vals) {
    sliders[key].getElementsByClassName("noUi-tooltip")[0].style.opacity = 0.3;
  });
};

for (var key in sliders) {
  _loop(key);
}

var _iterator11 = _createForOfIteratorHelper(tooltips_nodes),
    _step11;

try {
  var _loop2 = function _loop2() {
    var tooltips_node = _step11.value;
    tooltips_node.addEventListener("mouseover", function (event) {
      tooltips_node.style.opacity = "1.0";
    });
    tooltips_node.addEventListener("mouseout", function (event) {
      tooltips_node.style.opacity = "0.3";
    });
  };

  for (_iterator11.s(); !(_step11 = _iterator11.n()).done;) {
    _loop2();
  }
} catch (err) {
  _iterator11.e(err);
} finally {
  _iterator11.f();
}

console.log("calling awake()");
document.addEventListener("DOMContentLoaded", awake);

