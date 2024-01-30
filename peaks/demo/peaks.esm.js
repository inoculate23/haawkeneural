import Konva from 'konva/lib/Core';
import { Line } from 'konva/lib/shapes/Line';
import { Rect } from 'konva/lib/shapes/Rect';
import { Text } from 'konva/lib/shapes/Text';
import { Animation } from 'konva/lib/Animation';
import WaveformData from 'waveform-data';

var eventemitter3 = {exports: {}};

(function (module) {

  var has = Object.prototype.hasOwnProperty,
    prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }
    var listener = new EE(fn, context || emitter, once),
      evt = prefix ? prefix + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
      events,
      name;
    if (this._eventsCount === 0) return names;
    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }
    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }
    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
      handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];
    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }
    return ee;
  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
      listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt],
      len = arguments.length,
      args,
      i;
    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);
      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;
        case 2:
          return listeners.fn.call(listeners.context, a1), true;
        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;
        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }
      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }
      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
        j;
      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);
        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;
          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;
          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;
          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;
          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }
    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }
    var listeners = this._events[evt];
    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
    }
    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;
    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }
    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
})(eventemitter3);
var EventEmitter = eventemitter3.exports;

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }
  return _typeof(obj);
}

/**
 * @file
 *
 * Defines the {@link Cue} class.
 *
 * @module cue
 */

/**
 * A cue represents an event to be triggered at some point on the media
 * timeline.
 *
 * @class
 * @alias Cue
 *
 * @param {Number} time Cue time, in seconds.
 * @param {Number} type Cue mark type, either <code>Cue.POINT</code>,
 *   <code>Cue.SEGMENT_START</code>, or <code>Cue.SEGMENT_END</code>.
 * @param {String} id The id of the {@link Point} or {@link Segment}.
 */

function Cue(time, type, id) {
  this.time = time;
  this.type = type;
  this.id = id;
}

/**
  * @constant
  * @type {Number}
  */

Cue.POINT = 0;
Cue.SEGMENT_START = 1;
Cue.SEGMENT_END = 2;

/**
 * Callback function for use with Array.prototype.sort().
 *
 * @static
 * @param {Cue} a
 * @param {Cue} b
 * @return {Number}
 */

Cue.sorter = function (a, b) {
  return a.time - b.time;
};

function zeroPad(number, precision) {
  number = number.toString();
  while (number.length < precision) {
    number = '0' + number;
  }
  return number;
}

/**
 * Returns a formatted time string.
 *
 * @param {Number} time The time to be formatted, in seconds.
 * @param {Number} precision Decimal places to which time is displayed
 * @returns {String}
 */

function formatTime(time, precision) {
  var result = [];
  var fractionSeconds = Math.floor(time % 1 * Math.pow(10, precision));
  var seconds = Math.floor(time);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  if (hours > 0) {
    result.push(hours); // Hours
  }

  result.push(minutes % 60); // Mins
  result.push(seconds % 60); // Seconds

  for (var i = 0; i < result.length; i++) {
    result[i] = zeroPad(result[i], 2);
  }
  result = result.join(':');
  if (precision > 0) {
    result += '.' + zeroPad(fractionSeconds, precision);
  }
  return result;
}

/**
 * Rounds the given value up to the nearest given multiple.
 *
 * @param {Number} value
 * @param {Number} multiple
 * @returns {Number}
 *
 * @example
 * roundUpToNearest(5.5, 3); // returns 6
 * roundUpToNearest(141.0, 10); // returns 150
 * roundUpToNearest(-5.5, 3); // returns -6
 */

function roundUpToNearest(value, multiple) {
  if (multiple === 0) {
    return 0;
  }
  var multiplier = 1;
  if (value < 0.0) {
    multiplier = -1;
    value = -value;
  }
  var roundedUp = Math.ceil(value);
  return multiplier * ((roundedUp + multiple - 1) / multiple | 0) * multiple;
}
function clamp(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max;
  } else {
    return value;
  }
}
function objectHasProperty(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}
function extend(to, from) {
  for (var key in from) {
    if (objectHasProperty(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}

/**
 * Checks whether the given array contains values in ascending order.
 *
 * @param {Array<Number>} array The array to test
 * @returns {Boolean}
 */

function isInAscendingOrder(array) {
  if (array.length === 0) {
    return true;
  }
  var value = array[0];
  for (var i = 1; i < array.length; i++) {
    if (value >= array[i]) {
      return false;
    }
    value = array[i];
  }
  return true;
}

/**
 * Checks whether the given value is a number.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isNumber(value) {
  return typeof value === 'number';
}

/**
 * Checks whether the given value is a finite number.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isFinite(value) {
  if (typeof value !== 'number') {
    return false;
  }

  // Check for NaN and infinity
  // eslint-disable-next-line no-self-compare
  if (value !== value || value === Infinity || value === -Infinity) {
    return false;
  }
  return true;
}

/**
 * Checks whether the given value is a valid timestamp.
 *
 * @param {Number} value The value to test
 * @returns {Boolean}
 */

function isValidTime(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Checks whether the given value is a valid object.
 *
 * @param {Object|Array} value The value to test
 * @returns {Boolean}
 */

function isObject(value) {
  return value !== null && _typeof(value) === 'object' && !Array.isArray(value);
}

/**
 * Checks whether the given value is a valid string.
 *
 * @param {String} value The value to test
 * @returns {Boolean}
 */

function isString(value) {
  return typeof value === 'string';
}

/**
 * Checks whether the given value is a valid ArrayBuffer.
 *
 * @param {ArrayBuffer} value The value to test
 * @returns {Boolean}
 */

function isArrayBuffer(value) {
  return Object.prototype.toString.call(value).includes('ArrayBuffer');
}

/**
 * Checks whether the given value is null or undefined.
 *
 * @param {Object} value The value to test
 * @returns {Boolean}
 */

function isNullOrUndefined(value) {
  return value === undefined || value === null;
}

/**
 * Checks whether the given value is a function.
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Checks whether the given value is a boolean.
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isBoolean(value) {
  return value === true || value === false;
}

/**
 * Checks whether the given value is a valid HTML element.
 *
 * @param {HTMLElement} value The value to test
 * @returns {Boolean}
 */

function isHTMLElement(value) {
  return value instanceof HTMLElement;
}

/**
 * Checks whether the given value is an array
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isArray(value) {
  return Array.isArray(value);
}

/**
 * Checks whether the given value is a valid linear gradient color
 *
 * @param {Function} value The value to test
 * @returns {Boolean}
 */

function isLinearGradientColor(value) {
  return isObject(value) && objectHasProperty(value, 'linearGradientStart') && objectHasProperty(value, 'linearGradientEnd') && objectHasProperty(value, 'linearGradientColorStops') && isNumber(value.linearGradientStart) && isNumber(value.linearGradientEnd) && isArray(value.linearGradientColorStops) && value.linearGradientColorStops.length === 2;
}
function getMarkerObject(obj) {
  while (obj.parent !== null) {
    if (obj.parent instanceof Konva.Layer) {
      return obj;
    }
    obj = obj.parent;
  }
  return null;
}

var isHeadless = /HeadlessChrome/.test(navigator.userAgent);
function windowIsVisible() {
  if (isHeadless || navigator.webdriver) {
    return false;
  }
  return (typeof document === "undefined" ? "undefined" : _typeof(document)) === 'object' && 'visibilityState' in document && document.visibilityState === 'visible';
}
var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
var eventTypes = {
  forward: {},
  reverse: {}
};
var EVENT_TYPE_POINT = 0;
var EVENT_TYPE_SEGMENT_ENTER = 1;
var EVENT_TYPE_SEGMENT_EXIT = 2;
eventTypes.forward[Cue.POINT] = EVENT_TYPE_POINT;
eventTypes.forward[Cue.SEGMENT_START] = EVENT_TYPE_SEGMENT_ENTER;
eventTypes.forward[Cue.SEGMENT_END] = EVENT_TYPE_SEGMENT_EXIT;
eventTypes.reverse[Cue.POINT] = EVENT_TYPE_POINT;
eventTypes.reverse[Cue.SEGMENT_START] = EVENT_TYPE_SEGMENT_EXIT;
eventTypes.reverse[Cue.SEGMENT_END] = EVENT_TYPE_SEGMENT_ENTER;
var eventNames = {};
eventNames[EVENT_TYPE_POINT] = 'points.enter';
eventNames[EVENT_TYPE_SEGMENT_ENTER] = 'segments.enter';
eventNames[EVENT_TYPE_SEGMENT_EXIT] = 'segments.exit';
var eventAttributes = {};
eventAttributes[EVENT_TYPE_POINT] = 'point';
eventAttributes[EVENT_TYPE_SEGMENT_ENTER] = 'segment';
eventAttributes[EVENT_TYPE_SEGMENT_EXIT] = 'segment';

/**
 * Given a cue instance, returns the corresponding {@link Point}
 * {@link Segment}.
 *
 * @param {Peaks} peaks
 * @param {Cue} cue
 * @return {Point|Segment}
 * @throws {Error}
 */

function getPointOrSegment(peaks, cue) {
  switch (cue.type) {
    case Cue.POINT:
      return peaks.points.getPoint(cue.id);
    case Cue.SEGMENT_START:
    case Cue.SEGMENT_END:
      return peaks.segments.getSegment(cue.id);
    default:
      throw new Error('getPointOrSegment: id not found?');
  }
}

/**
 * CueEmitter is responsible for emitting <code>points.enter</code>,
 * <code>segments.enter</code>, and <code>segments.exit</code> events.
 *
 * @class
 * @alias CueEmitter
 *
 * @param {Peaks} peaks Parent {@link Peaks} instance.
 */

function CueEmitter(peaks) {
  this._cues = [];
  this._peaks = peaks;
  this._previousTime = -1;
  this._updateCues = this._updateCues.bind(this);
  this._onPlaying = this._onPlaying.bind(this);
  this._onSeeked = this._onSeeked.bind(this);
  this._onTimeUpdate = this._onTimeUpdate.bind(this);
  this._onAnimationFrame = this._onAnimationFrame.bind(this);
  this._rAFHandle = null;
  this._activeSegments = {};
  this._attachEventHandlers();
}

/**
 * This function is bound to all {@link Peaks} events relating to mutated
 * [Points]{@link Point} or [Segments]{@link Segment}, and updates the
 * list of cues accordingly.
 *
 * @private
 */

CueEmitter.prototype._updateCues = function () {
  var self = this;
  var points = self._peaks.points.getPoints();
  var segments = self._peaks.segments.getSegments();
  self._cues.length = 0;
  points.forEach(function (point) {
    self._cues.push(new Cue(point.time, Cue.POINT, point.id));
  });
  segments.forEach(function (segment) {
    self._cues.push(new Cue(segment.startTime, Cue.SEGMENT_START, segment.id));
    self._cues.push(new Cue(segment.endTime, Cue.SEGMENT_END, segment.id));
  });
  self._cues.sort(Cue.sorter);
  var time = self._peaks.player.getCurrentTime();
  self._updateActiveSegments(time);
};

/**
 * Emits events for any cues passed through during media playback.
 *
 * @param {Number} time The current time on the media timeline.
 * @param {Number} previousTime The previous time on the media timeline when
 *   this function was called.
 */

CueEmitter.prototype._onUpdate = function (time, previousTime) {
  var isForward = time > previousTime;
  var start;
  var end;
  var step;
  if (isForward) {
    start = 0;
    end = this._cues.length;
    step = 1;
  } else {
    start = this._cues.length - 1;
    end = -1;
    step = -1;
  }

  // Cues are sorted.

  for (var i = start; isForward ? i < end : i > end; i += step) {
    var cue = this._cues[i];
    if (isForward ? cue.time > previousTime : cue.time < previousTime) {
      if (isForward ? cue.time > time : cue.time < time) {
        break;
      }

      // Cue falls between time and previousTime.

      var marker = getPointOrSegment(this._peaks, cue);
      var eventType = isForward ? eventTypes.forward[cue.type] : eventTypes.reverse[cue.type];
      if (eventType === EVENT_TYPE_SEGMENT_ENTER) {
        this._activeSegments[marker.id] = marker;
      } else if (eventType === EVENT_TYPE_SEGMENT_EXIT) {
        delete this._activeSegments[marker.id];
      }
      var event = {
        time: time
      };
      event[eventAttributes[eventType]] = marker;
      this._peaks.emit(eventNames[eventType], event);
    }
  }
};

// The next handler and onAnimationFrame are bound together
// when the window isn't in focus, rAF is throttled
// falling back to timeUpdate.

CueEmitter.prototype._onTimeUpdate = function (time) {
  if (windowIsVisible()) {
    return;
  }
  if (this._peaks.player.isPlaying() && !this._peaks.player.isSeeking()) {
    this._onUpdate(time, this._previousTime);
  }
  this._previousTime = time;
};
CueEmitter.prototype._onAnimationFrame = function () {
  var time = this._peaks.player.getCurrentTime();
  if (!this._peaks.player.isSeeking()) {
    this._onUpdate(time, this._previousTime);
  }
  this._previousTime = time;
  if (this._peaks.player.isPlaying()) {
    this._rAFHandle = requestAnimationFrame(this._onAnimationFrame);
  }
};
CueEmitter.prototype._onPlaying = function () {
  this._previousTime = this._peaks.player.getCurrentTime();
  this._rAFHandle = requestAnimationFrame(this._onAnimationFrame);
};
CueEmitter.prototype._onSeeked = function (time) {
  this._previousTime = time;
  this._updateActiveSegments(time);
};
function getSegmentIdComparator(id) {
  return function compareSegmentIds(segment) {
    return segment.id === id;
  };
}

/**
 * The active segments is the set of all segments which overlap the current
 * playhead position. This function updates that set and emits
 * <code>segments.enter</code> and <code>segments.exit</code> events.
 */

CueEmitter.prototype._updateActiveSegments = function (time) {
  var self = this;
  var activeSegments = self._peaks.segments.getSegmentsAtTime(time);

  // Remove any segments no longer active.

  for (var id in self._activeSegments) {
    if (objectHasProperty(self._activeSegments, id)) {
      var segment = activeSegments.find(getSegmentIdComparator(id));
      if (!segment) {
        self._peaks.emit('segments.exit', {
          segment: self._activeSegments[id],
          time: time
        });
        delete self._activeSegments[id];
      }
    }
  }

  // Add new active segments.

  activeSegments.forEach(function (segment) {
    if (!(segment.id in self._activeSegments)) {
      self._activeSegments[segment.id] = segment;
      self._peaks.emit('segments.enter', {
        segment: segment,
        time: time
      });
    }
  });
};
var events = ['points.update', 'points.dragmove', 'points.add', 'points.remove', 'points.remove_all', 'segments.update', 'segments.dragged', 'segments.add', 'segments.remove', 'segments.remove_all'];
CueEmitter.prototype._attachEventHandlers = function () {
  this._peaks.on('player.timeupdate', this._onTimeUpdate);
  this._peaks.on('player.playing', this._onPlaying);
  this._peaks.on('player.seeked', this._onSeeked);
  for (var i = 0; i < events.length; i++) {
    this._peaks.on(events[i], this._updateCues);
  }
  this._updateCues();
};
CueEmitter.prototype._detachEventHandlers = function () {
  this._peaks.off('player.timeupdate', this._onTimeUpdate);
  this._peaks.off('player.playing', this._onPlaying);
  this._peaks.off('player.seeked', this._onSeeked);
  for (var i = 0; i < events.length; i++) {
    this._peaks.off(events[i], this._updateCues);
  }
};
CueEmitter.prototype.destroy = function () {
  if (this._rAFHandle) {
    cancelAnimationFrame(this._rAFHandle);
    this._rAFHandle = null;
  }
  this._detachEventHandlers();
  this._previousTime = -1;
};

/**
 * @file
 *
 * Defines the {@link Point} class.
 *
 * @module point
 */
var pointOptions = ['id', 'pid', 'time', 'labelText', 'color', 'editable'];
var invalidOptions$1 = ['update', 'isVisible', 'peaks', 'pid'];
function setDefaultPointOptions(options, peaksOptions) {
  if (isNullOrUndefined(options.labelText)) {
    options.labelText = '';
  }
  if (isNullOrUndefined(options.editable)) {
    options.editable = false;
  }
  if (isNullOrUndefined(options.color)) {
    options.color = peaksOptions.pointMarkerColor;
  }
}
function validatePointOptions(options, updating) {
  var context = updating ? 'update()' : 'add()';
  if (!updating || updating && objectHasProperty(options, 'time')) {
    if (!isValidTime(options.time)) {
      // eslint-disable-next-line max-len
      throw new TypeError('peaks.points.' + context + ': time should be a numeric value');
    }
  }
  if (options.time < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.points.' + context + ': time should not be negative');
  }
  if (objectHasProperty(options, 'labelText') && !isString(options.labelText)) {
    throw new TypeError('peaks.points.' + context + ': labelText must be a string');
  }
  if (objectHasProperty(options, 'editable') && !isBoolean(options.editable)) {
    throw new TypeError('peaks.points.' + context + ': editable must be true or false');
  }
  if (objectHasProperty(options, 'color') && !isString(options.color) && !isLinearGradientColor(options.color)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.points.' + context + ': color must be a string or a valid linear gradient object');
  }
  invalidOptions$1.forEach(function (name) {
    if (objectHasProperty(options, name)) {
      throw new Error('peaks.points.' + context + ': invalid option name: ' + name);
    }
  });
  pointOptions.forEach(function (name) {
    if (objectHasProperty(options, '_' + name)) {
      throw new Error('peaks.points.' + context + ': invalid option name: _' + name);
    }
  });
}

/**
 * A point is a single instant of time, with associated label and color.
 *
 * @class
 * @alias Point
 *
 * @param {Peaks} peaks A reference to the Peaks instance.
 * @param {Number} pid An internal unique identifier for the point.
 * @param {PointOptions} options User specified point attributes.
 */

function Point(peaks, pid, options) {
  this._peaks = peaks;
  this._pid = pid;
  this._setUserData(options);
}
Point.prototype._setUserData = function (options) {
  for (var key in options) {
    if (objectHasProperty(options, key)) {
      if (pointOptions.indexOf(key) === -1) {
        this[key] = options[key];
      } else {
        this['_' + key] = options[key];
      }
    }
  }
};
Object.defineProperties(Point.prototype, {
  id: {
    enumerable: true,
    get: function get() {
      return this._id;
    }
  },
  pid: {
    enumerable: true,
    get: function get() {
      return this._pid;
    }
  },
  time: {
    enumerable: true,
    get: function get() {
      return this._time;
    }
  },
  labelText: {
    get: function get() {
      return this._labelText;
    }
  },
  color: {
    enumerable: true,
    get: function get() {
      return this._color;
    }
  },
  editable: {
    enumerable: true,
    get: function get() {
      return this._editable;
    }
  }
});
Point.prototype.update = function (options) {
  validatePointOptions(options, true);
  if (objectHasProperty(options, 'id')) {
    if (isNullOrUndefined(options.id)) {
      throw new TypeError('point.update(): invalid id');
    }
    this._peaks.points.updatePointId(this, options.id);
  }
  this._setUserData(options);
  this._peaks.emit('points.update', this, options);
};

/**
 * Returns <code>true</code> if the point lies with in a given time range.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Boolean}
 */

Point.prototype.isVisible = function (startTime, endTime) {
  return this.time >= startTime && this.time < endTime;
};
Point.prototype._setTime = function (time) {
  this._time = time;
};

/**
 * @file
 *
 * Defines the {@link WaveformPoints} class.
 *
 * @module waveform-points
 */

/**
 * Point parameters.
 *
 * @typedef {Object} PointOptions
 * @global
 * @property {Number} time Point time, in seconds.
 * @property {Boolean=} editable If <code>true</code> the point time can be
 *   adjusted via the user interface.
 *   Default: <code>false</code>.
 * @property {String=} color Point marker color.
 *   Default: a random color.
 * @property {String=} labelText Point label text.
 *   Default: an empty string.
 * @property {String=} id A unique point identifier.
 *   Default: an automatically generated identifier.
 * @property {*} data Optional application-specific data.
 */

/**
 * Handles all functionality related to the adding, removing and manipulation
 * of points. A point is a single instant of time.
 *
 * @class
 * @alias WaveformPoints
 *
 * @param {Peaks} peaks The parent Peaks object.
 */

function WaveformPoints(peaks) {
  this._peaks = peaks;
  this._points = [];
  this._pointsById = {};
  this._pointsByPid = {};
  this._pointIdCounter = 0;
  this._pointPid = 0;
}

/**
 * Returns a new unique point id value.
 *
 * @returns {String}
 */

WaveformPoints.prototype._getNextPointId = function () {
  return 'peaks.point.' + this._pointIdCounter++;
};

/**
 * Returns a new unique point id value, for internal use within
 * Peaks.js only.
 *
 * @returns {Number}
 */

WaveformPoints.prototype._getNextPid = function () {
  return this._pointPid++;
};

/**
 * Adds a new point object.
 *
 * @private
 * @param {Point} point
 */

WaveformPoints.prototype._addPoint = function (point) {
  this._points.push(point);
  this._pointsById[point.id] = point;
  this._pointsByPid[point.pid] = point;
};

/**
 * Creates a new point object.
 *
 * @private
 * @param {PointOptions} options
 * @returns {Point}
 */

WaveformPoints.prototype._createPoint = function (options) {
  var pointOptions = {};
  extend(pointOptions, options);
  if (isNullOrUndefined(pointOptions.id)) {
    pointOptions.id = this._getNextPointId();
  }
  var pid = this._getNextPid();
  setDefaultPointOptions(pointOptions, this._peaks.options);
  validatePointOptions(pointOptions, false);
  return new Point(this._peaks, pid, pointOptions);
};

/**
 * Returns all points.
 *
 * @returns {Array<Point>}
 */

WaveformPoints.prototype.getPoints = function () {
  return this._points;
};

/**
 * Returns the point with the given id, or <code>undefined</code> if not found.
 *
 * @param {String} id
 * @returns {Point}
 */

WaveformPoints.prototype.getPoint = function (id) {
  return this._pointsById[id];
};

/**
 * Returns all points within a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Array<Point>}
 */

WaveformPoints.prototype.find = function (startTime, endTime) {
  return this._points.filter(function (point) {
    return point.isVisible(startTime, endTime);
  });
};

/**
 * Adds one or more points to the timeline.
 *
 * @param {PointOptions|Array<PointOptions>} pointOrPoints
 *
 * @returns Point|Array<Point>
 */

WaveformPoints.prototype.add = function /* pointOrPoints */
() {
  var self = this;
  var arrayArgs = Array.isArray(arguments[0]);
  var points = arrayArgs ? arguments[0] : Array.prototype.slice.call(arguments);
  points = points.map(function (pointOptions) {
    var point = self._createPoint(pointOptions);
    if (objectHasProperty(self._pointsById, point.id)) {
      throw new Error('peaks.points.add(): duplicate id');
    }
    return point;
  });
  points.forEach(function (point) {
    self._addPoint(point);
  });
  this._peaks.emit('points.add', {
    points: points
  });
  return arrayArgs ? points : points[0];
};
WaveformPoints.prototype.updatePointId = function (point, newPointId) {
  if (this._pointsById[point.id]) {
    if (this._pointsById[newPointId]) {
      throw new Error('point.update(): duplicate id');
    } else {
      delete this._pointsById[point.id];
      this._pointsById[newPointId] = point;
    }
  }
};

/**
 * Returns the indexes of points that match the given predicate.
 *
 * @private
 * @param {Function} predicate Predicate function to find matching points.
 * @returns {Array<Number>} An array of indexes into the points array of
 *   the matching elements.
 */

WaveformPoints.prototype._findPoint = function (predicate) {
  var indexes = [];
  for (var i = 0, length = this._points.length; i < length; i++) {
    if (predicate(this._points[i])) {
      indexes.push(i);
    }
  }
  return indexes;
};

/**
 * Removes the points at the given array indexes.
 *
 * @private
 * @param {Array<Number>} indexes The array indexes to remove.
 * @returns {Array<Point>} The removed {@link Point} objects.
 */

WaveformPoints.prototype._removeIndexes = function (indexes) {
  var removed = [];
  for (var i = 0; i < indexes.length; i++) {
    var index = indexes[i] - removed.length;
    var itemRemoved = this._points.splice(index, 1)[0];
    delete this._pointsById[itemRemoved.id];
    delete this._pointsByPid[itemRemoved.pid];
    removed.push(itemRemoved);
  }
  return removed;
};

/**
 * Removes all points that match a given predicate function.
 *
 * After removing the points, this function emits a
 * <code>points.remove</code> event with the removed {@link Point}
 * objects.
 *
 * @private
 * @param {Function} predicate A predicate function that identifies which
 *   points to remove.
 * @returns {Array<Point>} The removed {@link Points} objects.
 */

WaveformPoints.prototype._removePoints = function (predicate) {
  var indexes = this._findPoint(predicate);
  var removed = this._removeIndexes(indexes);
  this._peaks.emit('points.remove', {
    points: removed
  });
  return removed;
};

/**
 * Removes the given point.
 *
 * @param {Point} point The point to remove.
 * @returns {Array<Point>} The removed points.
 */

WaveformPoints.prototype.remove = function (point) {
  return this._removePoints(function (p) {
    return p === point;
  });
};

/**
 * Removes any points with the given id.
 *
 * @param {String} id
 * @returns {Array<Point>} The removed {@link Point} objects.
 */

WaveformPoints.prototype.removeById = function (pointId) {
  return this._removePoints(function (point) {
    return point.id === pointId;
  });
};

/**
 * Removes any points at the given time.
 *
 * @param {Number} time
 * @returns {Array<Point>} The removed {@link Point} objects.
 */

WaveformPoints.prototype.removeByTime = function (time) {
  return this._removePoints(function (point) {
    return point.time === time;
  });
};

/**
 * Removes all points.
 *
 * After removing the points, this function emits a
 * <code>points.remove_all</code> event.
 */

WaveformPoints.prototype.removeAll = function () {
  this._points = [];
  this._pointsById = {};
  this._pointsByPid = {};
  this._peaks.emit('points.remove_all');
};

/**
 * @file
 *
 * Defines the {@link Segment} class.
 *
 * @module segment
 */
var segmentOptions = ['id', 'pid', 'startTime', 'endTime', 'labelText', 'color', 'borderColor', 'editable'];
var invalidOptions = ['update', 'isVisible', 'peaks', 'pid'];
function setDefaultSegmentOptions(options, globalSegmentOptions) {
  if (isNullOrUndefined(options.color)) {
    if (globalSegmentOptions.overlay) {
      options.color = globalSegmentOptions.overlayColor;
    } else {
      options.color = globalSegmentOptions.waveformColor;
    }
  }
  if (isNullOrUndefined(options.borderColor)) {
    options.borderColor = globalSegmentOptions.overlayBorderColor;
  }
  if (isNullOrUndefined(options.labelText)) {
    options.labelText = '';
  }
  if (isNullOrUndefined(options.editable)) {
    options.editable = false;
  }
}
function validateSegmentOptions(options, updating) {
  var context = updating ? 'update()' : 'add()';
  if (objectHasProperty(options, 'startTime') && !isValidTime(options.startTime)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': startTime should be a valid number');
  }
  if (objectHasProperty(options, 'endTime') && !isValidTime(options.endTime)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': endTime should be a valid number');
  }
  if (!updating) {
    if (!objectHasProperty(options, 'startTime') || !objectHasProperty(options, 'endTime')) {
      throw new TypeError('peaks.segments.' + context + ': missing startTime or endTime');
    }
  }
  if (options.startTime < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': startTime should not be negative');
  }
  if (options.endTime < 0) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': endTime should not be negative');
  }
  if (options.endTime < options.startTime) {
    // eslint-disable-next-line max-len
    throw new RangeError('peaks.segments.' + context + ': endTime should not be less than startTime');
  }
  if (objectHasProperty(options, 'labelText') && !isString(options.labelText)) {
    throw new TypeError('peaks.segments.' + context + ': labelText must be a string');
  }
  if (objectHasProperty(options, 'editable') && !isBoolean(options.editable)) {
    throw new TypeError('peaks.segments.' + context + ': editable must be true or false');
  }
  if (objectHasProperty(options, 'color') && !isString(options.color) && !isLinearGradientColor(options.color)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': color must be a string or a valid linear gradient object');
  }
  if (objectHasProperty(options, 'borderColor') && !isString(options.borderColor)) {
    // eslint-disable-next-line max-len
    throw new TypeError('peaks.segments.' + context + ': borderColor must be a string');
  }
  invalidOptions.forEach(function (name) {
    if (objectHasProperty(options, name)) {
      throw new Error('peaks.segments.' + context + ': invalid option name: ' + name);
    }
  });
  segmentOptions.forEach(function (name) {
    if (objectHasProperty(options, '_' + name)) {
      throw new Error('peaks.segments.' + context + ': invalid option name: _' + name);
    }
  });
}

/**
 * A segment is a region of time, with associated label and color.
 *
 * @class
 * @alias Segment
 *
 * @param {Peaks} peaks A reference to the Peaks instance.
 * @param {Number} pid An internal unique identifier for the segment.
 * @param {SegmentOptions} options User specified segment attributes.
 */

function Segment(peaks, pid, options) {
  this._peaks = peaks;
  this._pid = pid;
  this._id = options.id;
  this._startTime = options.startTime;
  this._endTime = options.endTime;
  this._labelText = options.labelText;
  this._color = options.color;
  this._borderColor = options.borderColor;
  this._editable = options.editable;
  this._setUserData(options);
}
Segment.prototype._setUserData = function (options) {
  for (var key in options) {
    if (objectHasProperty(options, key)) {
      if (segmentOptions.indexOf(key) === -1) {
        this[key] = options[key];
      } else {
        this['_' + key] = options[key];
      }
    }
  }
};
Object.defineProperties(Segment.prototype, {
  id: {
    enumerable: true,
    get: function get() {
      return this._id;
    }
  },
  pid: {
    enumerable: true,
    get: function get() {
      return this._pid;
    }
  },
  startTime: {
    enumerable: true,
    get: function get() {
      return this._startTime;
    }
  },
  endTime: {
    enumerable: true,
    get: function get() {
      return this._endTime;
    }
  },
  labelText: {
    enumerable: true,
    get: function get() {
      return this._labelText;
    }
  },
  color: {
    enumerable: true,
    get: function get() {
      return this._color;
    }
  },
  borderColor: {
    enumerable: true,
    get: function get() {
      return this._borderColor;
    }
  },
  editable: {
    enumerable: true,
    get: function get() {
      return this._editable;
    }
  }
});
Segment.prototype.update = function (options) {
  validateSegmentOptions(options, true);
  if (objectHasProperty(options, 'id')) {
    if (isNullOrUndefined(options.id)) {
      throw new TypeError('segment.update(): invalid id');
    }
    this._peaks.segments.updateSegmentId(this, options.id);
  }
  this._setUserData(options);
  this._peaks.emit('segments.update', this, options);
};

/**
 * Returns <code>true</code> if the segment overlaps a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 * @returns {Boolean}
 *
 * @see http://wiki.c2.com/?TestIfDateRangesOverlap
 */

Segment.prototype.isVisible = function (startTime, endTime) {
  return this.startTime < endTime && startTime < this.endTime;
};
Segment.prototype._setStartTime = function (time) {
  this._startTime = time;
};
Segment.prototype._setEndTime = function (time) {
  this._endTime = time;
};

/**
 * @file
 *
 * Defines the {@link WaveformSegments} class.
 *
 * @module waveform-segments
 */

/**
 * Segment parameters.
 *
 * @typedef {Object} SegmentOptions
 * @global
 * @property {Number} startTime Segment start time, in seconds.
 * @property {Number} endTime Segment end time, in seconds.
 * @property {Boolean=} editable If <code>true</code> the segment start and
 *   end times can be adjusted via the user interface.
 *   Default: <code>false</code>.
 * @property {String=} color Segment waveform color.
 *   Default: Set by the <code>segmentOptions.waveformColor</code> option
 *   or the <code>segmentOptions.overlayColor</code> option.
 * @property {String=} borderColor Segment border color.
 *   Default: Set by the <code>segmentOptions.overlayBorderColor</code> option.
 * @property {String=} labelText Segment label text.
 *   Default: an empty string.
 * @property {String=} id A unique segment identifier.
 *   Default: an automatically generated identifier.
 * @property {*} data Optional application specific data.
 */

/**
 * Handles all functionality related to the adding, removing and manipulation
 * of segments.
 *
 * @class
 * @alias WaveformSegments
 *
 * @param {Peaks} peaks The parent Peaks object.
 */

function WaveformSegments(peaks) {
  this._peaks = peaks;
  this._segments = [];
  this._segmentsById = {};
  this._segmentsByPid = {};
  this._segmentIdCounter = 0;
  this._segmentPid = 0;
  this._isInserting = false;
}

/**
 * Returns a new unique segment id value.
 *
 * @private
 * @returns {String}
 */

WaveformSegments.prototype._getNextSegmentId = function () {
  return 'peaks.segment.' + this._segmentIdCounter++;
};

/**
 * Returns a new unique segment id value, for internal use within
 * Peaks.js only.
 *
 * @private
 * @returns {Number}
 */

WaveformSegments.prototype._getNextPid = function () {
  return this._segmentPid++;
};

/**
 * Adds a new segment object.
 *
 * @private
 * @param {Segment} segment
 */

WaveformSegments.prototype._addSegment = function (segment) {
  this._segments.push(segment);
  this._segmentsById[segment.id] = segment;
  this._segmentsByPid[segment.pid] = segment;
};

/**
 * Creates a new segment object.
 *
 * @private
 * @param {SegmentOptions} options
 * @return {Segment}
 */

WaveformSegments.prototype._createSegment = function (options) {
  var segmentOptions = {};
  extend(segmentOptions, options);
  if (isNullOrUndefined(segmentOptions.id)) {
    segmentOptions.id = this._getNextSegmentId();
  }
  var pid = this._getNextPid();
  setDefaultSegmentOptions(segmentOptions, this._peaks.options.segmentOptions);
  validateSegmentOptions(segmentOptions, false);
  return new Segment(this._peaks, pid, segmentOptions);
};

/**
 * Returns all segments.
 *
 * @returns {Array<Segment>}
 */

WaveformSegments.prototype.getSegments = function () {
  return this._segments;
};

/**
 * Returns the segment with the given id, or <code>undefined</code> if not found.
 *
 * @param {String} id
 * @returns {Segment}
 */

WaveformSegments.prototype.getSegment = function (id) {
  return this._segmentsById[id];
};

/**
 * Returns all segments that overlap a given point in time.
 *
 * @param {Number} time
 * @returns {Array<Segment>}
 */

WaveformSegments.prototype.getSegmentsAtTime = function (time) {
  return this._segments.filter(function (segment) {
    return time >= segment.startTime && time < segment.endTime;
  });
};

/**
 * Returns all segments that overlap a given time region.
 *
 * @param {Number} startTime The start of the time region, in seconds.
 * @param {Number} endTime The end of the time region, in seconds.
 *
 * @returns {Array<Segment>}
 */

WaveformSegments.prototype.find = function (startTime, endTime) {
  return this._segments.filter(function (segment) {
    return segment.isVisible(startTime, endTime);
  });
};

/**
 * Returns a copy of the segments array, sorted by ascending segment start time.
 *
 * @returns {Array<Segment>}
 */

WaveformSegments.prototype._getSortedSegments = function () {
  return this._segments.slice().sort(function (a, b) {
    return a.startTime - b.startTime;
  });
};
WaveformSegments.prototype.findPreviousSegment = function (segment) {
  var sortedSegments = this._getSortedSegments();
  var index = sortedSegments.findIndex(function (s) {
    return s.id === segment.id;
  });
  if (index !== -1) {
    return sortedSegments[index - 1];
  }
  return undefined;
};
WaveformSegments.prototype.findNextSegment = function (segment) {
  var sortedSegments = this._getSortedSegments();
  var index = sortedSegments.findIndex(function (s) {
    return s.id === segment.id;
  });
  if (index !== -1) {
    return sortedSegments[index + 1];
  }
  return undefined;
};

/**
 * Adds one or more segments to the timeline.
 *
 * @param {SegmentOptions|Array<SegmentOptions>} segmentOrSegments
 *
 * @returns Segment|Array<Segment>
 */

WaveformSegments.prototype.add = function /* segmentOrSegments */
() {
  var self = this;
  var arrayArgs = Array.isArray(arguments[0]);
  var segments = arrayArgs ? arguments[0] : Array.prototype.slice.call(arguments);
  segments = segments.map(function (segmentOptions) {
    var segment = self._createSegment(segmentOptions);
    if (objectHasProperty(self._segmentsById, segment.id)) {
      throw new Error('peaks.segments.add(): duplicate id');
    }
    return segment;
  });
  segments.forEach(function (segment) {
    self._addSegment(segment);
  });
  this._peaks.emit('segments.add', {
    segments: segments,
    insert: this._isInserting
  });
  return arrayArgs ? segments : segments[0];
};
WaveformSegments.prototype.updateSegmentId = function (segment, newSegmentId) {
  if (this._segmentsById[segment.id]) {
    if (this._segmentsById[newSegmentId]) {
      throw new Error('segment.update(): duplicate id');
    } else {
      delete this._segmentsById[segment.id];
      this._segmentsById[newSegmentId] = segment;
    }
  }
};

/**
 * Returns the indexes of segments that match the given predicate.
 *
 * @private
 * @param {Function} predicate Predicate function to find matching segments.
 * @returns {Array<Number>} An array of indexes into the segments array of
 *   the matching elements.
 */

WaveformSegments.prototype._findSegment = function (predicate) {
  var indexes = [];
  for (var i = 0, length = this._segments.length; i < length; i++) {
    if (predicate(this._segments[i])) {
      indexes.push(i);
    }
  }
  return indexes;
};

/**
 * Removes the segments at the given array indexes.
 *
 * @private
 * @param {Array<Number>} indexes The array indexes to remove.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */

WaveformSegments.prototype._removeIndexes = function (indexes) {
  var removed = [];
  for (var i = 0; i < indexes.length; i++) {
    var index = indexes[i] - removed.length;
    var itemRemoved = this._segments.splice(index, 1)[0];
    delete this._segmentsById[itemRemoved.id];
    delete this._segmentsByPid[itemRemoved.pid];
    removed.push(itemRemoved);
  }
  return removed;
};

/**
 * Removes all segments that match a given predicate function.
 *
 * After removing the segments, this function also emits a
 * <code>segments.remove</code> event with the removed {@link Segment}
 * objects.
 *
 * @private
 * @param {Function} predicate A predicate function that identifies which
 *   segments to remove.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */

WaveformSegments.prototype._removeSegments = function (predicate) {
  var indexes = this._findSegment(predicate);
  var removed = this._removeIndexes(indexes);
  this._peaks.emit('segments.remove', {
    segments: removed
  });
  return removed;
};

/**
 * Removes the given segment.
 *
 * @param {Segment} segment The segment to remove.
 * @returns {Array<Segment>} The removed segment.
 */

WaveformSegments.prototype.remove = function (segment) {
  return this._removeSegments(function (s) {
    return s === segment;
  });
};

/**
 * Removes any segments with the given id.
 *
 * @param {String} id
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */

WaveformSegments.prototype.removeById = function (segmentId) {
  return this._removeSegments(function (segment) {
    return segment.id === segmentId;
  });
};

/**
 * Removes any segments with the given start time, and optional end time.
 *
 * @param {Number} startTime Segments with this start time are removed.
 * @param {Number?} endTime If present, only segments with both the given
 *   start time and end time are removed.
 * @returns {Array<Segment>} The removed {@link Segment} objects.
 */

WaveformSegments.prototype.removeByTime = function (startTime, endTime) {
  endTime = typeof endTime === 'number' ? endTime : 0;
  var filter;
  if (endTime > 0) {
    filter = function filter(segment) {
      return segment.startTime === startTime && segment.endTime === endTime;
    };
  } else {
    filter = function filter(segment) {
      return segment.startTime === startTime;
    };
  }
  return this._removeSegments(filter);
};

/**
 * Removes all segments.
 *
 * After removing the segments, this function emits a
 * <code>segments.remove_all</code> event.
 */

WaveformSegments.prototype.removeAll = function () {
  this._segments = [];
  this._segmentsById = {};
  this._segmentsByPid = {};
  this._peaks.emit('segments.remove_all');
};
WaveformSegments.prototype.setInserting = function (value) {
  this._isInserting = value;
};
WaveformSegments.prototype.isInserting = function () {
  return this._isInserting;
};

/**
 * @file
 *
 * Defines the {@link KeyboardHandler} class.
 *
 * @module keyboard-handler
 */

var nodes = ['OBJECT', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'];
var SPACE = 32,
  TAB = 9,
  LEFT_ARROW = 37,
  RIGHT_ARROW = 39;
var keys = [SPACE, TAB, LEFT_ARROW, RIGHT_ARROW];

/**
 * Configures keyboard event handling.
 *
 * @class
 * @alias KeyboardHandler
 *
 * @param {EventEmitter} eventEmitter
 */

function KeyboardHandler(eventEmitter) {
  this.eventEmitter = eventEmitter;
  this._handleKeyEvent = this._handleKeyEvent.bind(this);
  document.addEventListener('keydown', this._handleKeyEvent);
  document.addEventListener('keypress', this._handleKeyEvent);
  document.addEventListener('keyup', this._handleKeyEvent);
}

/**
 * Keyboard event handler function.
 *
 * @note Arrow keys only triggered on keydown, not keypress.
 *
 * @param {KeyboardEvent} event
 * @private
 */

KeyboardHandler.prototype._handleKeyEvent = function handleKeyEvent(event) {
  if (nodes.indexOf(event.target.nodeName) === -1) {
    if (keys.indexOf(event.type) > -1) {
      event.preventDefault();
    }
    if (event.type === 'keydown' || event.type === 'keypress') {
      switch (event.keyCode) {
        case SPACE:
          this.eventEmitter.emit('keyboard.space');
          break;
        case TAB:
          this.eventEmitter.emit('keyboard.tab');
          break;
      }
    } else if (event.type === 'keyup') {
      switch (event.keyCode) {
        case LEFT_ARROW:
          if (event.shiftKey) {
            this.eventEmitter.emit('keyboard.shift_left');
          } else {
            this.eventEmitter.emit('keyboard.left');
          }
          break;
        case RIGHT_ARROW:
          if (event.shiftKey) {
            this.eventEmitter.emit('keyboard.shift_right');
          } else {
            this.eventEmitter.emit('keyboard.right');
          }
          break;
      }
    }
  }
};
KeyboardHandler.prototype.destroy = function () {
  document.removeEventListener('keydown', this._handleKeyEvent);
  document.removeEventListener('keypress', this._handleKeyEvent);
  document.removeEventListener('keyup', this._handleKeyEvent);
};

/**
 * @file
 *
 * Implementation of {@link Player} adapter based on the HTML5 media element.
 *
 * @module mediaelement-player
 */

/**
 * Checks whether the given HTMLMediaElement has either a src attribute
 * or any child <code>&lt;source&gt;</code> nodes
 */

function mediaElementHasSource(mediaElement) {
  if (mediaElement.src) {
    return true;
  }
  if (mediaElement.querySelector('source')) {
    return true;
  }
  return false;
}

/**
 * A wrapper for interfacing with the HTML5 media element API.
 * Initializes the player for a given media element.
 *
 * @class
 * @alias MediaElementPlayer
 * @param {HTMLMediaElement} mediaElement The HTML <code>&lt;audio&gt;</code>
 *   or <code>&lt;video&gt;</code> element to associate with the
 *   {@link Peaks} instance.
 */

function MediaElementPlayer(mediaElement) {
  this._mediaElement = mediaElement;
}

/**
 * Adds an event listener to the media element.
 *
 * @private
 * @param {String} type The event type to listen for.
 * @param {Function} callback An event handler function.
 */

MediaElementPlayer.prototype._addMediaListener = function (type, callback) {
  this._listeners.push({
    type: type,
    callback: callback
  });
  this._mediaElement.addEventListener(type, callback);
};
MediaElementPlayer.prototype.init = function (eventEmitter) {
  var self = this;
  self._eventEmitter = eventEmitter;
  self._listeners = [];
  self._duration = self.getDuration();
  self._addMediaListener('timeupdate', function () {
    self._eventEmitter.emit('player.timeupdate', self.getCurrentTime());
  });
  self._addMediaListener('playing', function () {
    self._eventEmitter.emit('player.playing', self.getCurrentTime());
  });
  self._addMediaListener('pause', function () {
    self._eventEmitter.emit('player.pause', self.getCurrentTime());
  });
  self._addMediaListener('ended', function () {
    self._eventEmitter.emit('player.ended');
  });
  self._addMediaListener('seeked', function () {
    self._eventEmitter.emit('player.seeked', self.getCurrentTime());
  });
  self._addMediaListener('canplay', function () {
    self._eventEmitter.emit('player.canplay');
  });
  self._addMediaListener('error', function (event) {
    self._eventEmitter.emit('player.error', event.target.error);
  });
  self._interval = null;
  if (!mediaElementHasSource(self._mediaElement)) {
    return Promise.resolve();
  }
  return new Promise(function (resolve, reject) {
    function eventHandler(event) {
      self._mediaElement.removeEventListener('loadedmetadata', eventHandler);
      self._mediaElement.removeEventListener('error', eventHandler);
      if (event.type === 'loadedmetadata') {
        resolve();
      } else {
        reject(event.target.error);
      }
    }

    // If the media element has preload="none", clicking to seek in the
    // waveform won't work, so here we force the media to load.
    if (self._mediaElement.readyState === HTMLMediaElement.HAVE_NOTHING) {
      // Wait for the readyState to change to HAVE_METADATA so we know the
      // duration is valid, otherwise it could be NaN.
      self._mediaElement.addEventListener('loadedmetadata', eventHandler);
      self._mediaElement.addEventListener('error', eventHandler);
      self._mediaElement.load();
    } else {
      resolve();
    }
  });
};

/**
 * Cleans up the player object, removing all event listeners from the
 * associated media element.
 */

MediaElementPlayer.prototype.destroy = function () {
  for (var i = 0; i < this._listeners.length; i++) {
    var listener = this._listeners[i];
    this._mediaElement.removeEventListener(listener.type, listener.callback);
  }
  this._listeners.length = 0;
  this._mediaElement = null;
};
MediaElementPlayer.prototype.play = function () {
  return this._mediaElement.play();
};
MediaElementPlayer.prototype.pause = function () {
  this._mediaElement.pause();
};
MediaElementPlayer.prototype.isPlaying = function () {
  return !this._mediaElement.paused;
};
MediaElementPlayer.prototype.isSeeking = function () {
  return this._mediaElement.seeking;
};
MediaElementPlayer.prototype.getCurrentTime = function () {
  return this._mediaElement.currentTime;
};
MediaElementPlayer.prototype.getDuration = function () {
  return this._mediaElement.duration;
};
MediaElementPlayer.prototype.seek = function (time) {
  this._mediaElement.currentTime = time;
};
function SetSourceHandler(eventEmitter, mediaElement) {
  this._eventEmitter = eventEmitter;
  this._mediaElement = mediaElement;
  this._playerCanPlayHandler = this._playerCanPlayHandler.bind(this);
  this._playerErrorHandler = this._playerErrorHandler.bind(this);
}
SetSourceHandler.prototype.setSource = function (options, callback) {
  var self = this;
  self._options = options;
  self._callback = callback;
  self._eventEmitter.on('player.canplay', self._playerCanPlayHandler);
  self._eventEmitter.on('player.error', self._playerErrorHandler);
  return new Promise(function (resolve, reject) {
    self._resolve = resolve;
    self._reject = reject;
    self._eventEmitter.on('player.canplay', self._playerCanPlayHandler);
    self._eventEmitter.on('player.error', self._playerErrorHandler);
    self._mediaElement.setAttribute('src', options.mediaUrl);

    // Force the media element to load, in case the media element
    // has preload="none".
    if (self._mediaElement.readyState === HTMLMediaElement.HAVE_NOTHING) {
      self._mediaElement.load();
    }
  });
};
SetSourceHandler.prototype._reset = function () {
  this._eventEmitter.removeListener('player.canplay', this._playerCanPlayHandler);
  this._eventEmitter.removeListener('player.error', this._playerErrorHandler);
};
SetSourceHandler.prototype._playerCanPlayHandler = function () {
  this._reset();
  this._resolve();
};
SetSourceHandler.prototype._playerErrorHandler = function (err) {
  this._reset();

  // Return the MediaError object from the media element
  this._reject(err);
};
MediaElementPlayer.prototype.setSource = function (options) {
  if (!options.mediaUrl) {
    // eslint-disable-next-line max-len
    return Promise.reject(new Error('peaks.setSource(): options must contain a mediaUrl when using mediaElement'));
  }
  var setSourceHandler = new SetSourceHandler(this._eventEmitter, this._mediaElement);
  return setSourceHandler.setSource(options);
};

/**
 * @file
 *
 * A general audio player class which interfaces with external audio players.
 * The default audio player in Peaks.js is {@link MediaElementPlayer}.
 *
 * @module player
 */
function getAllPropertiesFrom(adapter) {
  var allProperties = [];
  var obj = adapter;
  while (obj) {
    Object.getOwnPropertyNames(obj).forEach(function (p) {
      allProperties.push(p);
    });
    obj = Object.getPrototypeOf(obj);
  }
  return allProperties;
}
function validateAdapter(adapter) {
  var publicAdapterMethods = ['init', 'destroy', 'play', 'pause', 'isPlaying', 'isSeeking', 'getCurrentTime', 'getDuration', 'seek'];
  var allProperties = getAllPropertiesFrom(adapter);
  publicAdapterMethods.forEach(function (method) {
    if (!allProperties.includes(method)) {
      throw new TypeError('Peaks.init(): Player method ' + method + ' is undefined');
    }
    if (typeof adapter[method] !== 'function') {
      throw new TypeError('Peaks.init(): Player method ' + method + ' is not a function');
    }
  });
}

/**
 * A wrapper for interfacing with an external player API.
 *
 * @class
 * @alias Player
 *
 * @param {Peaks} peaks The parent {@link Peaks} object.
 * @param {Adapter} adapter The player adapter.
 */

function Player(peaks, adapter) {
  this._peaks = peaks;
  this._playingSegment = false;
  this._segment = null;
  this._loop = false;
  this._playSegmentTimerCallback = this._playSegmentTimerCallback.bind(this);
  validateAdapter(adapter);
  this._adapter = adapter;
}
Player.prototype.init = function () {
  return this._adapter.init(this._peaks);
};

/**
 * Cleans up the player object.
 */

Player.prototype.destroy = function () {
  this._adapter.destroy();
};

/**
 * Starts playback.
 * @returns {Promise}
 */

Player.prototype.play = function () {
  return this._adapter.play();
};

/**
 * Pauses playback.
 */

Player.prototype.pause = function () {
  this._adapter.pause();
};

/**
 * @returns {Boolean} <code>true</code> if playing, <code>false</code>
 * otherwise.
 */

Player.prototype.isPlaying = function () {
  return this._adapter.isPlaying();
};

/**
 * @returns {boolean} <code>true</code> if seeking
 */

Player.prototype.isSeeking = function () {
  return this._adapter.isSeeking();
};

/**
 * Returns the current playback time position, in seconds.
 *
 * @returns {Number}
 */

Player.prototype.getCurrentTime = function () {
  return this._adapter.getCurrentTime();
};

/**
 * Returns the media duration, in seconds.
 *
 * @returns {Number}
 */

Player.prototype.getDuration = function () {
  return this._adapter.getDuration();
};

/**
 * Seeks to a given time position within the media.
 *
 * @param {Number} time The time position, in seconds.
 */

Player.prototype.seek = function (time) {
  if (!isValidTime(time)) {
    this._peaks._logger('peaks.player.seek(): parameter must be a valid time, in seconds');
    return;
  }
  this._adapter.seek(time);
};

/**
 * Plays the given segment.
 *
 * @param {Segment} segment The segment denoting the time region to play.
 * @param {Boolean} loop If true, playback is looped.
 */

Player.prototype.playSegment = function (segment, loop) {
  var self = this;
  if (!segment || !isValidTime(segment.startTime) || !isValidTime(segment.endTime)) {
    return Promise.reject(new Error('peaks.player.playSegment(): parameter must be a segment object'));
  }
  self._segment = segment;
  self._loop = loop;

  // Set audio time to segment start time
  self.seek(segment.startTime);
  self._peaks.once('player.playing', function () {
    if (!self._playingSegment) {
      self._playingSegment = true;

      // We need to use requestAnimationFrame here as the timeupdate event
      // doesn't fire often enough.
      window.requestAnimationFrame(self._playSegmentTimerCallback);
    }
  });

  // Start playing audio
  return self.play();
};
Player.prototype._playSegmentTimerCallback = function () {
  if (!this.isPlaying()) {
    this._playingSegment = false;
    return;
  } else if (this.getCurrentTime() >= this._segment.endTime) {
    if (this._loop) {
      this.seek(this._segment.startTime);
    } else {
      this.pause();
      this._peaks.emit('player.ended');
      this._playingSegment = false;
      return;
    }
  }
  window.requestAnimationFrame(this._playSegmentTimerCallback);
};
Player.prototype._setSource = function (options) {
  return this._adapter.setSource(options);
};

/**
 * @file
 *
 * Defines the {@link DefaultPointMarker} class.
 *
 * @module default-point-marker
 */

/**
 * Creates a point marker handle.
 *
 * @class
 * @alias DefaultPointMarker
 *
 * @param {CreatePointMarkerOptions} options
 */

function DefaultPointMarker(options) {
  this._options = options;
  this._draggable = options.editable;
}
DefaultPointMarker.prototype.init = function (group) {
  var handleWidth = 10;
  var handleHeight = 20;
  var handleX = -(handleWidth / 2) + 0.5; // Place in the middle of the marker

  // Label

  if (this._options.view === 'zoomview') {
    // Label - create with default y, the real value is set in fitToView().
    this._label = new Text({
      x: 2,
      y: 0,
      text: this._options.point.labelText,
      textAlign: 'left',
      fontFamily: this._options.fontFamily || 'sans-serif',
      fontSize: this._options.fontSize || 10,
      fontStyle: this._options.fontStyle || 'normal',
      fill: '#000'
    });
  }

  // Handle - create with default y, the real value is set in fitToView().

  this._handle = new Rect({
    x: handleX,
    y: 0,
    width: handleWidth,
    height: handleHeight,
    fill: this._options.color,
    visible: this._draggable
  });

  // Line - create with default y and points, the real values
  // are set in fitToView().
  this._line = new Line({
    x: 0,
    y: 0,
    stroke: this._options.color,
    strokeWidth: 1
  });

  // Time label - create with default y, the real value is set
  // in fitToView().
  this._time = new Text({
    x: -24,
    y: 0,
    text: this._options.layer.formatTime(this._options.point.time),
    fontFamily: this._options.fontFamily,
    fontSize: this._options.fontSize,
    fontStyle: this._options.fontStyle,
    fill: '#000',
    textAlign: 'center'
  });
  this._time.hide();
  group.add(this._handle);
  group.add(this._line);
  if (this._label) {
    group.add(this._label);
  }
  group.add(this._time);
  this.fitToView();
  this.bindEventHandlers(group);
};
DefaultPointMarker.prototype.bindEventHandlers = function (group) {
  var self = this;
  self._handle.on('mouseover touchstart', function () {
    if (self._draggable) {
      // Position text to the left of the marker
      self._time.setX(-24 - self._time.getWidth());
      self._time.show();
    }
  });
  self._handle.on('mouseout touchend', function () {
    if (self._draggable) {
      self._time.hide();
    }
  });
  group.on('dragstart', function () {
    self._time.setX(-24 - self._time.getWidth());
    self._time.show();
  });
  group.on('dragend', function () {
    self._time.hide();
  });
};
DefaultPointMarker.prototype.fitToView = function () {
  var height = this._options.layer.getHeight();
  this._line.points([0.5, 0, 0.5, height]);
  if (this._label) {
    this._label.y(12);
  }
  if (this._handle) {
    this._handle.y(height / 2 - 10.5);
  }
  if (this._time) {
    this._time.y(height / 2 - 5);
  }
};
DefaultPointMarker.prototype.update = function (options) {
  if (options.time !== undefined) {
    if (this._time) {
      this._time.setText(this._options.layer.formatTime(options.time));
    }
  }
  if (options.labelText !== undefined) {
    if (this._label) {
      this._label.text(options.labelText);
    }
  }
  if (options.color !== undefined) {
    if (this._handle) {
      this._handle.fill(options.color);
    }
    this._line.stroke(options.color);
  }
  if (options.editable !== undefined) {
    this._draggable = options.editable;
    this._handle.visible(this._draggable);
  }
};

/**
 * @file
 *
 * Defines the {@link DefaultSegmentMarker} class.
 *
 * @module default-segment-marker
 */

/**
 * Creates a segment marker handle.
 *
 * @class
 * @alias DefaultSegmentMarker
 *
 * @param {CreateSegmentMarkerOptions} options
 */

function DefaultSegmentMarker(options) {
  this._options = options;
  this._editable = options.editable;
}
DefaultSegmentMarker.prototype.init = function (group) {
  var handleWidth = 10;
  var handleHeight = 20;
  var handleX = -(handleWidth / 2) + 0.5; // Place in the middle of the marker

  var xPosition = this._options.startMarker ? -24 : 24;
  var time = this._options.startMarker ? this._options.segment.startTime : this._options.segment.endTime;

  // Label - create with default y, the real value is set in fitToView().
  this._label = new Text({
    x: xPosition,
    y: 0,
    text: this._options.layer.formatTime(time),
    fontFamily: this._options.fontFamily,
    fontSize: this._options.fontSize,
    fontStyle: this._options.fontStyle,
    fill: '#000',
    textAlign: 'center',
    visible: this._editable
  });
  this._label.hide();

  // Handle - create with default y, the real value is set in fitToView().
  this._handle = new Rect({
    x: handleX,
    y: 0,
    width: handleWidth,
    height: handleHeight,
    fill: this._options.color,
    stroke: this._options.color,
    strokeWidth: 1,
    visible: this._editable
  });

  // Vertical Line - create with default y and points, the real values
  // are set in fitToView().
  this._line = new Line({
    x: 0,
    y: 0,
    stroke: this._options.color,
    strokeWidth: 1,
    visible: this._editable
  });
  group.add(this._label);
  group.add(this._line);
  group.add(this._handle);
  this.fitToView();
  this.bindEventHandlers(group);
};
DefaultSegmentMarker.prototype.bindEventHandlers = function (group) {
  var self = this;
  var xPosition = self._options.startMarker ? -24 : 24;
  group.on('dragstart', function () {
    if (self._options.startMarker) {
      self._label.setX(xPosition - self._label.getWidth());
    }
    self._label.show();
  });
  group.on('dragend', function () {
    self._label.hide();
  });
  self._handle.on('mouseover touchstart', function () {
    if (self._options.startMarker) {
      self._label.setX(xPosition - self._label.getWidth());
    }
    self._label.show();
  });
  self._handle.on('mouseout touchend', function () {
    self._label.hide();
  });
};
DefaultSegmentMarker.prototype.fitToView = function () {
  var height = this._options.layer.getHeight();
  this._label.y(height / 2 - 5);
  this._handle.y(height / 2 - 10.5);
  this._line.points([0.5, 0, 0.5, height]);
};
DefaultSegmentMarker.prototype.update = function (options) {
  if (options.startTime !== undefined && this._options.startMarker) {
    this._label.text(this._options.layer.formatTime(options.startTime));
  }
  if (options.endTime !== undefined && !this._options.startMarker) {
    this._label.text(this._options.layer.formatTime(options.endTime));
  }
  if (options.editable !== undefined) {
    this._editable = options.editable;
    this._label.visible(this._editable);
    this._handle.visible(this._editable);
    this._line.visible(this._editable);
  }
};

/**
 * @file
 *
 * Factory functions for creating point and segment marker handles.
 *
 * @module marker-factories
 */

/**
 * Parameters for the {@link createSegmentMarker} function.
 *
 * @typedef {Object} CreateSegmentMarkerOptions
 * @global
 * @property {Segment} segment
 * @property {Boolean} draggable If true, marker is draggable.
 * @property {Boolean} startMarker
 * @property {String} color
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 * @property {Layer} layer
 * @property {String} view
 * @property {SegmentDisplayOptions} segmentOptions
 */

/**
 * Creates a left or right side segment marker handle.
 *
 * @param {CreateSegmentMarkerOptions} options
 * @returns {Marker}
 */

function createSegmentMarker(options) {
  if (options.view === 'zoomview') {
    return new DefaultSegmentMarker(options);
  }
  return null;
}

/**
 * Parameters for the {@link createSegmentLabel} function.
 *
 * @typedef {Object} SegmentLabelOptions
 * @global
 * @property {Segment} segment The {@link Segment} object associated with this
 *   label.
 * @property {String} view The name of the view that the label is being
 *   created in, either <code>zoomview</code> or <code>overview</code>.
 * @property {SegmentsLayer} layer
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 */

/**
 * Creates a Konva object that renders information about a segment, such as
 * its label text.
 *
 * @param {SegmentLabelOptions} options
 * @returns {Konva.Text}
 */

function createSegmentLabel(options) {
  return new Text({
    x: 12,
    y: 12,
    text: options.segment.labelText,
    textAlign: 'center',
    fontFamily: options.fontFamily || 'sans-serif',
    fontSize: options.fontSize || 12,
    fontStyle: options.fontStyle || 'normal',
    fill: '#000'
  });
}

/**
 * Parameters for the {@link createPointMarker} function.
 *
 * @typedef {Object} CreatePointMarkerOptions
 * @global
 * @property {Point} point
 * @property {Boolean} editable If true, marker is draggable.
 * @property {String} color
 * @property {Layer} layer
 * @property {String} view
 * @property {String} fontFamily
 * @property {Number} fontSize
 * @property {String} fontStyle
 */

/**
 * Creates a point marker handle.
 *
 * @param {CreatePointMarkerOptions} options
 * @returns {Marker}
 */

function createPointMarker(options) {
  return new DefaultPointMarker(options);
}

/**
 * @file
 *
 * Defines the {@link HighlightLayer} class.
 *
 * @module highlight-layer
 */

/**
 * Highlight layer options
 *
 * @typedef {Object} HighlightLayerOptions
 * @global
 * @property {Number} highlightOffset
 * @property {String} highlightColor
 * @property {String} highlightStrokeColor
 * @property {Number} highlightOpacity
 * @property {Number} highlightCornerRadius
 */

/**
 * Creates the highlight region that shows the position of the zoomable
 * waveform view in the overview waveform.
 *
 * @class
 * @alias HighlightLayer
 *
 * @param {WaveformOverview} view
 * @param {HighlightLayerOptions} options
 */

function HighlightLayer(view, options) {
  this._view = view;
  this._offset = options.highlightOffset;
  this._color = options.highlightColor;
  this._layer = new Konva.Layer({
    listening: false
  });
  this._highlightRect = null;
  this._startTime = null;
  this._endTime = null;
  this._strokeColor = options.highlightStrokeColor;
  this._opacity = options.highlightOpacity;
  this._cornerRadius = options.highlightCornerRadius;
}
HighlightLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};
HighlightLayer.prototype.showHighlight = function (startTime, endTime) {
  if (!this._highlightRect) {
    this._createHighlightRect(startTime, endTime);
  }
  this._update(startTime, endTime);
};

/**
 * Updates the position of the highlight region.
 *
 * @param {Number} startTime The start of the highlight region, in seconds.
 * @param {Number} endTime The end of the highlight region, in seconds.
 */

HighlightLayer.prototype._update = function (startTime, endTime) {
  this._startTime = startTime;
  this._endTime = endTime;
  var startOffset = this._view.timeToPixels(startTime);
  var endOffset = this._view.timeToPixels(endTime);
  this._highlightRect.setAttrs({
    x: startOffset,
    width: endOffset - startOffset
  });
};
HighlightLayer.prototype._createHighlightRect = function (startTime, endTime) {
  this._startTime = startTime;
  this._endTime = endTime;
  var startOffset = this._view.timeToPixels(startTime);
  var endOffset = this._view.timeToPixels(endTime);

  // Create with default y and height, the real values are set in fitToView().
  this._highlightRect = new Rect({
    x: startOffset,
    y: 0,
    width: endOffset - startOffset,
    height: 0,
    stroke: this._strokeColor,
    strokeWidth: 1,
    fill: this._color,
    opacity: this._opacity,
    cornerRadius: this._cornerRadius
  });
  this.fitToView();
  this._layer.add(this._highlightRect);
};
HighlightLayer.prototype.removeHighlight = function () {
  if (this._highlightRect) {
    this._highlightRect.destroy();
    this._highlightRect = null;
  }
};
HighlightLayer.prototype.updateHighlight = function () {
  if (this._highlightRect) {
    this._update(this._startTime, this._endTime);
  }
};
HighlightLayer.prototype.fitToView = function () {
  if (this._highlightRect) {
    var height = this._view.getHeight();
    var offset = clamp(this._offset, 0, Math.floor(height / 2));
    this._highlightRect.setAttrs({
      y: offset,
      height: height - offset * 2
    });
  }
};

/**
 * @file
 *
 * Defines the {@link PointMarker} class.
 *
 * @module point-marker
 */

/**
 * Parameters for the {@link PointMarker} constructor.
 *
 * @typedef {Object} PointMarkerOptions
 * @global
 * @property {Point} point Point object with timestamp.
 * @property {Boolean} editable If true, marker is draggable.
 * @property {Marker} marker
 * @property {Function} onclick
 * @property {Function} onDblClick
 * @property {Function} onDragStart
 * @property {Function} onDragMove Callback during mouse drag operations.
 * @property {Function} onDragEnd
 * @property {Function} dragBoundFunc
 * @property {Function} onMouseEnter
 * @property {Function} onMouseLeave
 * @property {Function} onContextMenu
 */

/**
 * Creates a point marker handle.
 *
 * @class
 * @alias PointMarker
 *
 * @param {PointMarkerOptions} options
 */

function PointMarker(options) {
  this._point = options.point;
  this._marker = options.marker;
  this._draggable = options.draggable;
  this._onDragStart = options.onDragStart;
  this._onDragMove = options.onDragMove;
  this._onDragEnd = options.onDragEnd;
  this._dragBoundFunc = options.dragBoundFunc;
  this._onMouseEnter = options.onMouseEnter;
  this._onMouseLeave = options.onMouseLeave;
  this._group = new Konva.Group({
    name: 'point-marker',
    point: this._point,
    draggable: this._draggable,
    dragBoundFunc: options.dragBoundFunc
  });
  this._bindDefaultEventHandlers();
  this._marker.init(this._group);
}
PointMarker.prototype._bindDefaultEventHandlers = function () {
  var self = this;
  self._group.on('dragstart', function (event) {
    self._onDragStart(event, self._point);
  });
  self._group.on('dragmove', function (event) {
    self._onDragMove(event, self._point);
  });
  self._group.on('dragend', function (event) {
    self._onDragEnd(event, self._point);
  });
  self._group.on('mouseenter', function (event) {
    self._onMouseEnter(event, self._point);
  });
  self._group.on('mouseleave', function (event) {
    self._onMouseLeave(event, self._point);
  });
};

/**
 * @param {Konva.Layer} layer
 */

PointMarker.prototype.addToLayer = function (layer) {
  layer.add(this._group);
};
PointMarker.prototype.fitToView = function () {
  this._marker.fitToView();
};
PointMarker.prototype.getPoint = function () {
  return this._point;
};
PointMarker.prototype.getX = function () {
  return this._group.getX();
};
PointMarker.prototype.setX = function (x) {
  this._group.setX(x);
};
PointMarker.prototype.getWidth = function () {
  return this._group.getWidth();
};
PointMarker.prototype.getAbsolutePosition = function () {
  return this._group.getAbsolutePosition();
};
PointMarker.prototype.update = function (options) {
  if (options.editable !== undefined) {
    this._group.draggable(options.editable);
  }
  if (this._marker.update) {
    this._marker.update(options);
  }
};
PointMarker.prototype.destroy = function () {
  if (this._marker.destroy) {
    this._marker.destroy();
  }
  this._group.destroyChildren();
  this._group.destroy();
};

/**
 * @file
 *
 * Defines the {@link PointsLayer} class.
 *
 * @module points-layer
 */
var defaultFontFamily$1 = 'sans-serif';
var defaultFontSize$1 = 10;
var defaultFontShape$1 = 'normal';

/**
 * Creates a Konva.Layer that displays point markers against the audio
 * waveform.
 *
 * @class
 * @alias PointsLayer
 *
 * @param {Peaks} peaks
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Boolean} allowEditing
 */

function PointsLayer(peaks, view, allowEditing) {
  this._peaks = peaks;
  this._view = view;
  this._allowEditing = allowEditing;
  this._pointMarkers = {};
  this._layer = new Konva.Layer();
  this._onPointsDrag = this._onPointsDrag.bind(this);
  this._onPointMarkerDragStart = this._onPointMarkerDragStart.bind(this);
  this._onPointMarkerDragMove = this._onPointMarkerDragMove.bind(this);
  this._onPointMarkerDragEnd = this._onPointMarkerDragEnd.bind(this);
  this._pointMarkerDragBoundFunc = this._pointMarkerDragBoundFunc.bind(this);
  this._onPointMarkerMouseEnter = this._onPointMarkerMouseEnter.bind(this);
  this._onPointMarkerMouseLeave = this._onPointMarkerMouseLeave.bind(this);
  this._onPointsUpdate = this._onPointsUpdate.bind(this);
  this._onPointsAdd = this._onPointsAdd.bind(this);
  this._onPointsRemove = this._onPointsRemove.bind(this);
  this._onPointsRemoveAll = this._onPointsRemoveAll.bind(this);
  this._peaks.on('points.update', this._onPointsUpdate);
  this._peaks.on('points.add', this._onPointsAdd);
  this._peaks.on('points.remove', this._onPointsRemove);
  this._peaks.on('points.remove_all', this._onPointsRemoveAll);
  this._peaks.on('points.dragstart', this._onPointsDrag);
  this._peaks.on('points.dragmove', this._onPointsDrag);
  this._peaks.on('points.dragend', this._onPointsDrag);
}

/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */

PointsLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};
PointsLayer.prototype.enableEditing = function (enable) {
  this._allowEditing = enable;
};
PointsLayer.prototype.getPointMarker = function (point) {
  return this._pointMarkers[point.pid];
};
PointsLayer.prototype.formatTime = function (time) {
  return this._view.formatTime(time);
};
PointsLayer.prototype._onPointsUpdate = function (point, options) {
  var frameStartTime = this._view.getStartTime();
  var frameEndTime = this._view.getEndTime();
  var pointMarker = this.getPointMarker(point);
  var isVisible = point.isVisible(frameStartTime, frameEndTime);
  if (pointMarker && !isVisible) {
    // Remove point marker that is no longer visible.
    this._removePoint(point);
  } else if (!pointMarker && isVisible) {
    // Add point marker for visible point.
    this._updatePoint(point);
  } else if (pointMarker && isVisible) {
    // Update the point marker with the changed attributes.
    if (objectHasProperty(options, 'time')) {
      var pointMarkerOffset = this._view.timeToPixels(point.time);
      var pointMarkerX = pointMarkerOffset - this._view.getFrameOffset();
      pointMarker.setX(pointMarkerX);
    }
    pointMarker.update(options);
  }
};
PointsLayer.prototype._onPointsAdd = function (event) {
  var self = this;
  var frameStartTime = self._view.getStartTime();
  var frameEndTime = self._view.getEndTime();
  event.points.forEach(function (point) {
    if (point.isVisible(frameStartTime, frameEndTime)) {
      self._updatePoint(point);
    }
  });
};
PointsLayer.prototype._onPointsRemove = function (event) {
  var self = this;
  event.points.forEach(function (point) {
    self._removePoint(point);
  });
};
PointsLayer.prototype._onPointsRemoveAll = function () {
  this._layer.removeChildren();
  this._pointMarkers = {};
};

/**
 * Creates the Konva UI objects for a given point.
 *
 * @private
 * @param {Point} point
 * @returns {PointMarker}
 */

PointsLayer.prototype._createPointMarker = function (point) {
  var editable = this._allowEditing && point.editable;
  var marker = this._peaks.options.createPointMarker({
    point: point,
    editable: editable,
    color: point.color,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily$1,
    fontSize: this._peaks.options.fontSize || defaultFontSize$1,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape$1,
    layer: this,
    view: this._view.getName()
  });
  return new PointMarker({
    point: point,
    draggable: editable,
    marker: marker,
    onDragStart: this._onPointMarkerDragStart,
    onDragMove: this._onPointMarkerDragMove,
    onDragEnd: this._onPointMarkerDragEnd,
    dragBoundFunc: this._pointMarkerDragBoundFunc,
    onMouseEnter: this._onPointMarkerMouseEnter,
    onMouseLeave: this._onPointMarkerMouseLeave
  });
};
PointsLayer.prototype.getHeight = function () {
  return this._view.getHeight();
};

/**
 * Adds a Konva UI object to the layer for a given point.
 *
 * @private
 * @param {Point} point
 * @returns {PointMarker}
 */

PointsLayer.prototype._addPointMarker = function (point) {
  var pointMarker = this._createPointMarker(point);
  this._pointMarkers[point.pid] = pointMarker;
  pointMarker.addToLayer(this._layer);
  return pointMarker;
};
PointsLayer.prototype._onPointsDrag = function (event) {
  var pointMarker = this._updatePoint(event.point);
  pointMarker.update({
    time: event.point.time
  });
};

/**
 * @param {KonvaEventObject} event
 * @param {Point} point
 */

PointsLayer.prototype._onPointMarkerMouseEnter = function (event, point) {
  this._peaks.emit('points.mouseenter', {
    point: point,
    evt: event.evt
  });
};

/**
 * @param {KonvaEventObject} event
 * @param {Point} point
 */

PointsLayer.prototype._onPointMarkerMouseLeave = function (event, point) {
  this._peaks.emit('points.mouseleave', {
    point: point,
    evt: event.evt
  });
};

/**
 * @param {KonvaEventObject} event
 * @param {Point} point
 */

PointsLayer.prototype._onPointMarkerDragStart = function (event, point) {
  this._dragPointMarker = this.getPointMarker(point);
  this._peaks.emit('points.dragstart', {
    point: point,
    evt: event.evt
  });
};

/**
 * @param {KonvaEventObject} event
 * @param {Point} point
 */

PointsLayer.prototype._onPointMarkerDragMove = function (event, point) {
  var pointMarker = this._pointMarkers[point.pid];
  var markerX = pointMarker.getX();
  var offset = markerX + pointMarker.getWidth();
  point._setTime(this._view.pixelOffsetToTime(offset));
  this._peaks.emit('points.dragmove', {
    point: point,
    evt: event.evt
  });
};

/**
 * @param {KonvaEventObject} event
 * @param {Point} point
 */

PointsLayer.prototype._onPointMarkerDragEnd = function (event, point) {
  this._dragPointMarker = null;
  this._peaks.emit('points.dragend', {
    point: point,
    evt: event.evt
  });
};
PointsLayer.prototype._pointMarkerDragBoundFunc = function (pos) {
  // Allow the marker to be moved horizontally but not vertically.
  return {
    x: clamp(pos.x, 0, this._view.getWidth()),
    y: this._dragPointMarker.getAbsolutePosition().y
  };
};

/**
 * Updates the positions of all displayed points in the view.
 *
 * @param {Number} startTime The start of the visible range in the view,
 *   in seconds.
 * @param {Number} endTime The end of the visible range in the view,
 *   in seconds.
 */

PointsLayer.prototype.updatePoints = function (startTime, endTime) {
  // Update all points in the visible time range.
  var points = this._peaks.points.find(startTime, endTime);
  points.forEach(this._updatePoint.bind(this));

  // TODO: In the overview all points are visible, so no need to do this.
  this._removeInvisiblePoints(startTime, endTime);
};

/**
 * @private
 * @param {Point} point
 */

PointsLayer.prototype._updatePoint = function (point) {
  var pointMarker = this.getPointMarker(point);
  if (!pointMarker) {
    pointMarker = this._addPointMarker(point);
  }
  var pointMarkerOffset = this._view.timeToPixels(point.time);
  var pointMarkerX = pointMarkerOffset - this._view.getFrameOffset();
  pointMarker.setX(pointMarkerX);
  return pointMarker;
};

/**
 * Remove any points that are not visible, i.e., are outside the given time
 * range.
 *
 * @private
 * @param {Number} startTime The start of the visible time range, in seconds.
 * @param {Number} endTime The end of the visible time range, in seconds.
 */

PointsLayer.prototype._removeInvisiblePoints = function (startTime, endTime) {
  for (var pointPid in this._pointMarkers) {
    if (objectHasProperty(this._pointMarkers, pointPid)) {
      var point = this._pointMarkers[pointPid].getPoint();
      if (!point.isVisible(startTime, endTime)) {
        this._removePoint(point);
      }
    }
  }
};

/**
 * Removes the UI object for a given point.
 *
 * @private
 * @param {Point} point
 */

PointsLayer.prototype._removePoint = function (point) {
  var pointMarker = this.getPointMarker(point);
  if (pointMarker) {
    pointMarker.destroy();
    delete this._pointMarkers[point.pid];
  }
};

/**
 * Toggles visibility of the points layer.
 *
 * @param {Boolean} visible
 */

PointsLayer.prototype.setVisible = function (visible) {
  this._layer.setVisible(visible);
};
PointsLayer.prototype.destroy = function () {
  this._peaks.off('points.update', this._onPointsUpdate);
  this._peaks.off('points.add', this._onPointsAdd);
  this._peaks.off('points.remove', this._onPointsRemove);
  this._peaks.off('points.remove_all', this._onPointsRemoveAll);
  this._peaks.off('points.dragstart', this._onPointsDrag);
  this._peaks.off('points.dragmove', this._onPointsDrag);
  this._peaks.off('points.dragend', this._onPointsDrag);
};
PointsLayer.prototype.fitToView = function () {
  for (var pointPid in this._pointMarkers) {
    if (objectHasProperty(this._pointMarkers, pointPid)) {
      var pointMarker = this._pointMarkers[pointPid];
      pointMarker.fitToView();
    }
  }
};
PointsLayer.prototype.draw = function () {
  this._layer.draw();
};

/**
 * @file
 *
 * Defines the {@link PlayheadLayer} class.
 *
 * @module playhead-layer
 */

/**
 * Creates a Konva.Layer that displays a playhead marker.
 *
 * @class
 * @alias PlayheadLayer
 *
 * @param {Object} options
 * @param {Player} options.player
 * @param {WaveformOverview|WaveformZoomView} options.view
 * @param {Boolean} options.showPlayheadTime If <code>true</code> The playback time position
 *   is shown next to the playhead.
 * @param {String} options.playheadColor
 * @param {String} options.playheadTextColor
 * @param {String} options.playheadBackgroundColor
 * @param {Number} options.playheadPadding
 * @param {String} options.playheadFontFamily
 * @param {Number} options.playheadFontSize
 * @param {String} options.playheadFontStyle
 */

function PlayheadLayer(options) {
  this._player = options.player;
  this._view = options.view;
  this._playheadPixel = 0;
  this._playheadLineAnimation = null;
  this._playheadVisible = false;
  this._playheadColor = options.playheadColor;
  this._playheadTextColor = options.playheadTextColor;
  this._playheadBackgroundColor = options.playheadBackgroundColor;
  this._playheadPadding = options.playheadPadding;
  this._playheadFontFamily = options.playheadFontFamily;
  this._playheadFontSize = options.playheadFontSize;
  this._playheadFontStyle = options.playheadFontStyle;
  this._playheadLayer = new Konva.Layer();
  this._createPlayhead();
  if (options.showPlayheadTime) {
    this._createPlayheadText();
  }
  this.fitToView();
  this.zoomLevelChanged();
}

/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */

PlayheadLayer.prototype.addToStage = function (stage) {
  stage.add(this._playheadLayer);
};

/**
 * Decides whether to use an animation to update the playhead position.
 *
 * If the zoom level is such that the number of pixels per second of audio is
 * low, we can use timeupdate events from the HTMLMediaElement to
 * set the playhead position. Otherwise, we use an animation to update the
 * playhead position more smoothly. The animation is CPU intensive, so we
 * avoid using it where possible.
 */

PlayheadLayer.prototype.zoomLevelChanged = function () {
  var pixelsPerSecond = this._view.timeToPixels(1.0);
  this._useAnimation = pixelsPerSecond >= 5;
  if (this._useAnimation) {
    if (this._player.isPlaying() && !this._playheadLineAnimation) {
      // Start the animation
      this._start();
    }
  } else {
    if (this._playheadLineAnimation) {
      // Stop the animation
      var time = this._player.getCurrentTime();
      this.stop(time);
    }
  }
};

/**
 * Resizes the playhead UI objects to fit the available space in the
 * view.
 */

PlayheadLayer.prototype.fitToView = function () {
  var height = this._view.getHeight();
  this._playheadLine.points([0.5, 0, 0.5, height]);
  if (this._playheadText) {
    this._playheadText.y(12);
  }
};

/**
 * Creates the playhead UI objects.
 *
 * @private
 * @param {String} color
 */

PlayheadLayer.prototype._createPlayhead = function () {
  // Create with default points, the real values are set in fitToView().
  this._playheadLine = new Line({
    stroke: this._playheadColor,
    strokeWidth: 1
  });
  this._playheadGroup = new Konva.Group({
    x: 0,
    y: 0
  });
  this._playheadGroup.add(this._playheadLine);
  this._playheadLayer.add(this._playheadGroup);
};
PlayheadLayer.prototype._createPlayheadText = function () {
  var self = this;
  var time = self._player.getCurrentTime();
  var text = self._view.formatTime(time);

  // Create with default y, the real value is set in fitToView().
  self._playheadText = new Text({
    x: 0,
    y: 0,
    padding: self._playheadPadding,
    text: text,
    fontSize: self._playheadFontSize,
    fontFamily: self._playheadFontFamily,
    fontStyle: self._playheadFontStyle,
    fill: self._playheadTextColor,
    align: 'right',
    sceneFunc: function sceneFunc(context, shape) {
      var width = shape.width();
      var height = shape.height() + 2 * self._playheadPadding;
      context.fillStyle = self._playheadBackgroundColor;
      context.fillRect(0, -self._playheadPadding, width, height);
      shape._sceneFunc(context);
    }
  });
  self._playheadGroup.add(self._playheadText);
};

/**
 * Updates the playhead position.
 *
 * @param {Number} time Current playhead position, in seconds.
 */

PlayheadLayer.prototype.updatePlayheadTime = function (time) {
  this._syncPlayhead(time);
  if (this._player.isPlaying()) {
    this._start();
  }
};

/**
 * Updates the playhead position.
 *
 * @private
 * @param {Number} time Current playhead position, in seconds.
 */

PlayheadLayer.prototype._syncPlayhead = function (time) {
  var pixelIndex = this._view.timeToPixels(time);
  var frameOffset = this._view.getFrameOffset();
  var width = this._view.getWidth();
  var isVisible = pixelIndex >= frameOffset && pixelIndex <= frameOffset + width;
  this._playheadPixel = pixelIndex;
  if (isVisible) {
    var playheadX = this._playheadPixel - frameOffset;
    if (!this._playheadVisible) {
      this._playheadVisible = true;
      this._playheadGroup.show();
    }
    this._playheadGroup.setX(playheadX);
    if (this._playheadText) {
      var text = this._view.formatTime(time);
      var playheadTextWidth = this._playheadText.width();
      this._playheadText.setText(text);
      if (playheadTextWidth + playheadX > width - 2) {
        this._playheadText.setX(-playheadTextWidth);
      } else if (playheadTextWidth + playheadX < width) {
        this._playheadText.setX(0);
      }
    }
  } else {
    if (this._playheadVisible) {
      this._playheadVisible = false;
      this._playheadGroup.hide();
    }
  }
  if (this._view.playheadPosChanged) {
    this._view.playheadPosChanged(time);
  }
};

/**
 * Starts a playhead animation in sync with the media playback.
 *
 * @private
 */

PlayheadLayer.prototype._start = function () {
  var self = this;
  if (self._playheadLineAnimation) {
    self._playheadLineAnimation.stop();
    self._playheadLineAnimation = null;
  }
  if (!self._useAnimation) {
    return;
  }
  var lastPlayheadPosition = null;
  self._playheadLineAnimation = new Animation(function () {
    var time = self._player.getCurrentTime();
    var playheadPosition = self._view.timeToPixels(time);
    if (playheadPosition !== lastPlayheadPosition) {
      self._syncPlayhead(time);
      lastPlayheadPosition = playheadPosition;
    }
  }, self._playheadLayer);
  self._playheadLineAnimation.start();
};
PlayheadLayer.prototype.stop = function (time) {
  if (this._playheadLineAnimation) {
    this._playheadLineAnimation.stop();
    this._playheadLineAnimation = null;
  }
  this._syncPlayhead(time);
};
PlayheadLayer.prototype.getPlayheadPixel = function () {
  return this._playheadPixel;
};
PlayheadLayer.prototype.showPlayheadTime = function (show) {
  if (show) {
    if (!this._playheadText) {
      // Create it
      this._createPlayheadText(this._playheadTextColor, this._playheadBackgroundColor, this._playheadPadding);
      this.fitToView();
    }
  } else {
    if (this._playheadText) {
      this._playheadText.remove();
      this._playheadText.destroy();
      this._playheadText = null;
    }
  }
};
PlayheadLayer.prototype.updatePlayheadText = function () {
  if (this._playheadText) {
    var time = this._player.getCurrentTime();
    var text = this._view.formatTime(time);
    this._playheadText.setText(text);
  }
};
PlayheadLayer.prototype.destroy = function () {
  if (this._playheadLineAnimation) {
    this._playheadLineAnimation.stop();
    this._playheadLineAnimation = null;
  }
};

/**
 * @file
 *
 * Defines the {@link OverlaySegmentMarker} class.
 *
 * @module overlay-segment-marker
 */

/**
 * Creates a segment marker handle.
 *
 * @class
 * @alias OverlaySegmentMarker
 *
 * @param {CreateSegmentMarkerOptions} options
 */

function OverlaySegmentMarker(options) {
  this._options = options;
}
OverlaySegmentMarker.prototype.init = function (group) {
  var handleWidth = 10;
  var handleHeight = 20;
  var handleX = -(handleWidth / 2) + 0.5; // Place in the middle of the marker

  var xPosition = this._options.startMarker ? -24 : 24;
  var time = this._options.startMarker ? this._options.segment.startTime : this._options.segment.endTime;

  // Label - create with default y, the real value is set in fitToView().
  this._label = new Text({
    x: xPosition,
    y: 0,
    text: this._options.layer.formatTime(time),
    fontFamily: this._options.fontFamily,
    fontSize: this._options.fontSize,
    fontStyle: this._options.fontStyle,
    fill: '#000',
    textAlign: 'center',
    visible: false
  });

  // Handle - create with default y, the real value is set in fitToView().
  this._handle = new Rect({
    x: handleX,
    y: 0,
    width: handleWidth,
    height: handleHeight
  });
  group.add(this._label);
  group.add(this._handle);
  this.fitToView();
  this.bindEventHandlers(group);
};
OverlaySegmentMarker.prototype.bindEventHandlers = function (group) {
  var self = this;
  var xPosition = self._options.startMarker ? -24 : 24;
  group.on('dragstart', function () {
    if (self._options.startMarker) {
      self._label.setX(xPosition - self._label.getWidth());
    }
    self._label.show();
  });
  group.on('dragend', function () {
    self._label.hide();
  });
  self._handle.on('mouseover touchstart', function () {
    if (self._options.startMarker) {
      self._label.setX(xPosition - self._label.getWidth());
    }
    self._label.show();
    document.body.style.cursor = 'ew-resize';
  });
  self._handle.on('mouseout touchend', function () {
    self._label.hide();
    document.body.style.cursor = 'default';
  });
};
OverlaySegmentMarker.prototype.fitToView = function () {
  var viewHeight = this._options.layer.getHeight();
  var overlayOffset = this._options.segmentOptions.overlayOffset;
  var overlayRectHeight = clamp(0, viewHeight - 2 * overlayOffset);
  this._label.y(viewHeight / 2 - 5);
  this._handle.y(overlayOffset);
  this._handle.height(overlayRectHeight);
};
OverlaySegmentMarker.prototype.update = function (options) {
  if (options.startTime !== undefined && this._options.startMarker) {
    this._label.text(this._options.layer.formatTime(options.startTime));
  }
  if (options.endTime !== undefined && !this._options.startMarker) {
    this._label.text(this._options.layer.formatTime(options.endTime));
  }
};

/**
 * @file
 *
 * Defines the {@link SegmentMarker} class.
 *
 * @module segment-marker
 */

/**
 * Parameters for the {@link SegmentMarker} constructor.
 *
 * @typedef {Object} SegmentMarkerOptions
 * @global
 * @property {Segment} segment
 * @property {SegmentShape} segmentShape
 * @property {Boolean} editable If true, marker is draggable.
 * @property {Boolean} startMarker If <code>true</code>, the marker indicates
 *   the start time of the segment. If <code>false</code>, the marker
 *   indicates the end time of the segment.
 * @property {Function} onDragStart
 * @property {Function} onDragMove
 * @property {Function} onDragEnd
 * @property {Function} dragBoundFunc
 */

/**
 * Creates a segment handle marker for the start or end of a segment.
 *
 * @class
 * @alias SegmentMarker
 *
 * @param {SegmentMarkerOptions} options
 */

function SegmentMarker(options) {
  var self = this;
  self._segment = options.segment;
  self._marker = options.marker;
  self._segmentShape = options.segmentShape;
  self._editable = options.editable;
  self._startMarker = options.startMarker;
  self._onDragStart = options.onDragStart;
  self._onDragMove = options.onDragMove;
  self._onDragEnd = options.onDragEnd;
  self._group = new Konva.Group({
    name: 'segment-marker',
    segment: self._segment,
    draggable: self._editable,
    visible: self._editable,
    dragBoundFunc: function dragBoundFunc(pos) {
      return options.dragBoundFunc(self, pos);
    }
  });
  self._bindDefaultEventHandlers();
  self._marker.init(self._group);
}
SegmentMarker.prototype._bindDefaultEventHandlers = function () {
  var self = this;
  self._group.on('dragstart', function (event) {
    self._onDragStart(self, event);
  });
  self._group.on('dragmove', function (event) {
    self._onDragMove(self, event);
  });
  self._group.on('dragend', function (event) {
    self._onDragEnd(self, event);
  });
};
SegmentMarker.prototype.addToLayer = function (layer) {
  layer.add(this._group);
};
SegmentMarker.prototype.moveToTop = function () {
  this._group.moveToTop();
};
SegmentMarker.prototype.fitToView = function () {
  this._marker.fitToView();
};
SegmentMarker.prototype.getSegment = function () {
  return this._segment;
};
SegmentMarker.prototype.getX = function () {
  return this._group.getX();
};
SegmentMarker.prototype.setX = function (x) {
  this._group.setX(x);
};
SegmentMarker.prototype.getWidth = function () {
  return this._group.getWidth();
};
SegmentMarker.prototype.getAbsolutePosition = function () {
  return this._group.getAbsolutePosition();
};
SegmentMarker.prototype.isStartMarker = function () {
  return this._startMarker;
};
SegmentMarker.prototype.update = function (options) {
  if (options.editable !== undefined) {
    this._group.visible(options.editable);
    this._group.draggable(options.editable);
  }
  if (this._marker.update) {
    this._marker.update(options);
  }
};
SegmentMarker.prototype.destroy = function () {
  if (this._marker.destroy) {
    this._marker.destroy();
  }
  this._group.destroyChildren();
  this._group.destroy();
};
SegmentMarker.prototype.startDrag = function () {
  this._group.startDrag();
};
SegmentMarker.prototype.stopDrag = function () {
  this._group.stopDrag();
};

/**
 * @file
 *
 * Defines the {@link WaveformShape} class.
 *
 * @module waveform-shape
 */

/**
 * Waveform shape options.
 *
 * @typedef {Object} WaveformShapeOptions
 * @global
 * @property {String | LinearGradientColor} color Waveform color.
 * @property {WaveformOverview|WaveformZoomView} view The view object
 *   that contains the waveform shape.
 * @property {Segment?} segment If given, render a waveform image
 *   covering the segment's time range. Otherwise, render the entire
 *   waveform duration.
 */

/**
 * Creates a Konva.Shape object that renders a waveform image.
 *
 * @class
 * @alias WaveformShape
 *
 * @param {WaveformShapeOptions} options
 */

function WaveformShape(options) {
  this._color = options.color;
  var shapeOptions = {};
  if (isString(options.color)) {
    shapeOptions.fill = options.color;
  } else if (isLinearGradientColor(options.color)) {
    var startY = options.view._height * (options.color.linearGradientStart / 100);
    var endY = options.view._height * (options.color.linearGradientEnd / 100);
    shapeOptions.fillLinearGradientStartPointY = startY;
    shapeOptions.fillLinearGradientEndPointY = endY;
    shapeOptions.fillLinearGradientColorStops = [0, options.color.linearGradientColorStops[0], 1, options.color.linearGradientColorStops[1]];
  } else {
    throw new TypeError('Unknown type for color property');
  }
  this._shape = new Konva.Shape(shapeOptions);
  this._view = options.view;
  this._segment = options.segment;
  this._shape.sceneFunc(this._sceneFunc.bind(this));
}
WaveformShape.prototype.getX = function () {
  return this._shape.getX();
};
WaveformShape.prototype.setX = function (x) {
  return this._shape.setX(x);
};
WaveformShape.prototype.setSegment = function (segment) {
  this._segment = segment;
};
WaveformShape.prototype.setWaveformColor = function (color) {
  if (isString(color)) {
    this._shape.fill(color);
    this._shape.fillLinearGradientStartPointY(null);
    this._shape.fillLinearGradientEndPointY(null);
    this._shape.fillLinearGradientColorStops(null);
  } else if (isLinearGradientColor(color)) {
    this._shape.fill(null);
    var startY = this._view._height * (color.linearGradientStart / 100);
    var endY = this._view._height * (color.linearGradientEnd / 100);
    this._shape.fillLinearGradientStartPointY(startY);
    this._shape.fillLinearGradientEndPointY(endY);
    this._shape.fillLinearGradientColorStops([0, color.linearGradientColorStops[0], 1, color.linearGradientColorStops[1]]);
  } else {
    throw new TypeError('Unknown type for color property');
  }
};
WaveformShape.prototype.fitToView = function () {
  this.setWaveformColor(this._color);
};
WaveformShape.prototype._sceneFunc = function (context) {
  var frameOffset = this._view.getFrameOffset();
  var width = this._view.getWidth();
  var height = this._view.getHeight();
  this._drawWaveform(context, this._view.getWaveformData(), frameOffset, this._segment ? this._view.timeToPixels(this._segment.startTime) : frameOffset, this._segment ? this._view.timeToPixels(this._segment.endTime) : frameOffset + width, width, height);
};

/**
 * Draws a waveform on a canvas context.
 *
 * @param {Konva.Context} context The canvas context to draw on.
 * @param {WaveformData} waveformData The waveform data to draw.
 * @param {Number} frameOffset The start position of the waveform shown
 *   in the view, in pixels.
 * @param {Number} startPixels The start position of the waveform to draw,
 *   in pixels.
 * @param {Number} endPixels The end position of the waveform to draw,
 *   in pixels.
 * @param {Number} width The width of the waveform area, in pixels.
 * @param {Number} height The height of the waveform area, in pixels.
 */

WaveformShape.prototype._drawWaveform = function (context, waveformData, frameOffset, startPixels, endPixels, width, height) {
  if (startPixels < frameOffset) {
    startPixels = frameOffset;
  }
  var limit = frameOffset + width;
  if (endPixels > limit) {
    endPixels = limit;
  }
  if (endPixels > waveformData.length - 1) {
    endPixels = waveformData.length - 1;
  }
  var channels = waveformData.channels;
  var waveformTop = 0;
  var waveformHeight = Math.floor(height / channels);
  for (var i = 0; i < channels; i++) {
    if (i === channels - 1) {
      waveformHeight = height - (channels - 1) * waveformHeight;
    }
    this._drawChannel(context, waveformData.channel(i), frameOffset, startPixels, endPixels, waveformTop, waveformHeight);
    waveformTop += waveformHeight;
  }
};

/**
 * Draws a single waveform channel on a canvas context.
 *
 * @param {Konva.Context} context The canvas context to draw on.
 * @param {WaveformDataChannel} channel The waveform data to draw.
 * @param {Number} frameOffset The start position of the waveform shown
 *   in the view, in pixels.
 * @param {Number} startPixels The start position of the waveform to draw,
 *   in pixels.
 * @param {Number} endPixels The end position of the waveform to draw,
 *   in pixels.
 * @param {Number} top The top of the waveform channel area, in pixels.
 * @param {Number} height The height of the waveform channel area, in pixels.
 */

WaveformShape.prototype._drawChannel = function (context, channel, frameOffset, startPixels, endPixels, top, height) {
  var x, amplitude;
  var amplitudeScale = this._view.getAmplitudeScale();
  var lineX, lineY;
  context.beginPath();
  for (x = startPixels; x <= endPixels; x++) {
    amplitude = channel.min_sample(x);
    lineX = x - frameOffset + 0.5;
    lineY = top + WaveformShape.scaleY(amplitude, height, amplitudeScale) + 0.5;
    context.lineTo(lineX, lineY);
  }
  for (x = endPixels; x >= startPixels; x--) {
    amplitude = channel.max_sample(x);
    lineX = x - frameOffset + 0.5;
    lineY = top + WaveformShape.scaleY(amplitude, height, amplitudeScale) + 1.0;
    context.lineTo(lineX, lineY);
  }
  context.closePath();
  context.fillShape(this._shape);
};
WaveformShape.prototype.addToLayer = function (layer) {
  layer.add(this._shape);
};
WaveformShape.prototype.destroy = function () {
  this._shape.destroy();
  this._shape = null;
};
WaveformShape.prototype.on = function (event, handler) {
  this._shape.on(event, handler);
};
WaveformShape.prototype.off = function (event, handler) {
  this._shape.off(event, handler);
};

/**
 * Scales the waveform data for drawing on a canvas context.
 *
 * @see {@link https://stats.stackexchange.com/questions/281162}
 *
 * @todo Assumes 8-bit waveform data (-128 to 127 range)
 *
 * @param {Number} amplitude The waveform data point amplitude.
 * @param {Number} height The height of the waveform, in pixels.
 * @param {Number} scale Amplitude scaling factor.
 * @returns {Number} The scaled waveform data point.
 */

WaveformShape.scaleY = function (amplitude, height, scale) {
  var y = -(height - 1) * (amplitude * scale + 128) / 255 + (height - 1);
  return clamp(Math.floor(y), 0, height - 1);
};

/**
 * @file
 *
 * Defines the {@link SegmentShape} class.
 *
 * @module segment-shape
 */
var defaultFontFamily = 'sans-serif';
var defaultFontSize = 10;
var defaultFontShape = 'normal';

/**
 * Options that control segments' visual appearance
 *
 * @typedef {Object} SegmentDisplayOptions
 * @global
 * @property {Boolean} markers
 * @property {Boolean} overlay
 * @property {String} startMarkerColor
 * @property {String} endMarkerColor
 * @property {String} waveformColor
 * @property {String} overlayColor
 * @property {Number} overlayOpacity
 * @property {String} overlayBorderColor
 * @property {Number} overlayBorderWidth
 * @property {Number} overlayCornerRadius
 * @property {Number} overlayOffset
 * @property {String} overlayLabelAlign
 * @property {String} overlayLabelVerticalAlign
 * @property {Number} overlayLabelPadding
 * @property {String} overlayLabelColor
 * @property {String} overlayFontFamily
 * @property {Number} overlayFontSize
 * @property {String} overlayFontStyle
 */

/**
 * Creates a waveform segment shape with optional start and end markers.
 *
 * @class
 * @alias SegmentShape
 *
 * @param {Segment} segment
 * @param {Peaks} peaks
 * @param {SegmentsLayer} layer
 * @param {WaveformOverview|WaveformZoomView} view
 */

function SegmentShape(segment, peaks, layer, view) {
  this._segment = segment;
  this._peaks = peaks;
  this._layer = layer;
  this._view = view;
  this._label = null;
  this._startMarker = null;
  this._endMarker = null;
  this._color = segment.color;
  this._borderColor = segment.borderColor;
  this._draggable = this._segment.editable && this._view.isSegmentDraggingEnabled();
  this._dragging = false;
  var segmentOptions = view.getViewOptions().segmentOptions;
  this._overlayOffset = segmentOptions.overlayOffset;
  if (!segmentOptions.overlay) {
    this._waveformShape = new WaveformShape({
      color: segment.color,
      view: view,
      segment: segment
    });
  }
  this._onMouseEnter = this._onMouseEnter.bind(this);
  this._onMouseLeave = this._onMouseLeave.bind(this);
  this._onMouseDown = this._onMouseDown.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._dragBoundFunc = this._dragBoundFunc.bind(this);
  this._onSegmentDragStart = this._onSegmentDragStart.bind(this);
  this._onSegmentDragMove = this._onSegmentDragMove.bind(this);
  this._onSegmentDragEnd = this._onSegmentDragEnd.bind(this);

  // Event handlers for markers
  this._onSegmentMarkerDragStart = this._onSegmentMarkerDragStart.bind(this);
  this._onSegmentMarkerDragMove = this._onSegmentMarkerDragMove.bind(this);
  this._onSegmentMarkerDragEnd = this._onSegmentMarkerDragEnd.bind(this);
  this._segmentMarkerDragBoundFunc = this._segmentMarkerDragBoundFunc.bind(this);
  this._label = this._peaks.options.createSegmentLabel({
    segment: segment,
    view: this._view.getName(),
    layer: this._layer,
    fontFamily: this._peaks.options.fontFamily,
    fontSize: this._peaks.options.fontSize,
    fontStyle: this._peaks.options.fontStyle
  });
  if (this._label) {
    this._label.hide();
  }

  // Create with default y and height, the real values are set in fitToView().
  var segmentStartOffset = this._view.timeToPixelOffset(this._segment.startTime);
  var segmentEndOffset = this._view.timeToPixelOffset(this._segment.endTime);
  var overlayRectHeight = clamp(0, this._view.getHeight() - 2 * this._overlayOffset);

  // The clip rectangle prevents text in the overlay from appearing
  // outside the overlay.

  this._overlay = new Konva.Group({
    name: 'segment-overlay',
    segment: this._segment,
    x: segmentStartOffset,
    y: 0,
    width: segmentEndOffset - segmentStartOffset,
    height: this._view.getHeight(),
    clipX: 0,
    clipY: this._overlayOffset,
    clipWidth: segmentEndOffset - segmentStartOffset,
    clipHeight: overlayRectHeight,
    draggable: this._draggable,
    dragBoundFunc: this._dragBoundFunc
  });
  var overlayBorderColor, overlayBorderWidth, overlayColor, overlayOpacity, overlayCornerRadius;
  if (segmentOptions.overlay) {
    overlayBorderColor = this._borderColor || segmentOptions.overlayBorderColor;
    overlayBorderWidth = segmentOptions.overlayBorderWidth;
    overlayColor = this._color || segmentOptions.overlayColor;
    overlayOpacity = segmentOptions.overlayOpacity;
    overlayCornerRadius = segmentOptions.overlayCornerRadius;
  }
  this._overlayRect = new Konva.Rect({
    x: 0,
    y: this._overlayOffset,
    width: segmentEndOffset - segmentStartOffset,
    stroke: overlayBorderColor,
    strokeWidth: overlayBorderWidth,
    height: overlayRectHeight,
    fill: overlayColor,
    opacity: overlayOpacity,
    cornerRadius: overlayCornerRadius
  });
  this._overlay.add(this._overlayRect);
  if (segmentOptions.overlay) {
    this._overlayText = new Konva.Text({
      x: 0,
      y: this._overlayOffset,
      text: this._segment.labelText,
      fontFamily: segmentOptions.overlayFontFamily,
      fontSize: segmentOptions.overlayFontSize,
      fontStyle: segmentOptions.overlayFontStyle,
      fill: segmentOptions.overlayLabelColor,
      listening: false,
      align: segmentOptions.overlayLabelAlign,
      width: segmentEndOffset - segmentStartOffset,
      verticalAlign: segmentOptions.overlayLabelVerticalAlign,
      height: overlayRectHeight,
      padding: segmentOptions.overlayLabelPadding
    });
    this._overlay.add(this._overlayText);
  }

  // Set up event handlers to show/hide the segment label text when the user
  // hovers the mouse over the segment.
  this._overlay.on('mouseenter', this._onMouseEnter);
  this._overlay.on('mouseleave', this._onMouseLeave);
  this._overlay.on('mousedown', this._onMouseDown);
  this._overlay.on('mouseup', this._onMouseUp);
  if (this._draggable) {
    this._overlay.on('dragstart', this._onSegmentDragStart);
    this._overlay.on('dragmove', this._onSegmentDragMove);
    this._overlay.on('dragend', this._onSegmentDragEnd);
  }
  this._createMarkers();
}
function createOverlayMarker(options) {
  return new OverlaySegmentMarker(options);
}
SegmentShape.prototype._createMarkers = function () {
  var editable = this._layer.isEditingEnabled() && this._segment.editable;
  var segmentOptions = this._view.getViewOptions().segmentOptions;
  var createSegmentMarker = segmentOptions.markers ? this._peaks.options.createSegmentMarker : createOverlayMarker;
  var startMarker = createSegmentMarker({
    segment: this._segment,
    editable: editable,
    startMarker: true,
    color: segmentOptions.startMarkerColor,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily,
    fontSize: this._peaks.options.fontSize || defaultFontSize,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape,
    layer: this._layer,
    view: this._view.getName(),
    segmentOptions: this._view.getViewOptions().segmentOptions
  });
  if (startMarker) {
    this._startMarker = new SegmentMarker({
      segment: this._segment,
      segmentShape: this,
      editable: editable,
      startMarker: true,
      marker: startMarker,
      onDragStart: this._onSegmentMarkerDragStart,
      onDragMove: this._onSegmentMarkerDragMove,
      onDragEnd: this._onSegmentMarkerDragEnd,
      dragBoundFunc: this._segmentMarkerDragBoundFunc
    });
  }
  var endMarker = createSegmentMarker({
    segment: this._segment,
    editable: editable,
    startMarker: false,
    color: segmentOptions.endMarkerColor,
    fontFamily: this._peaks.options.fontFamily || defaultFontFamily,
    fontSize: this._peaks.options.fontSize || defaultFontSize,
    fontStyle: this._peaks.options.fontStyle || defaultFontShape,
    layer: this._layer,
    view: this._view.getName(),
    segmentOptions: this._view.getViewOptions().segmentOptions
  });
  if (endMarker) {
    this._endMarker = new SegmentMarker({
      segment: this._segment,
      segmentShape: this,
      editable: editable,
      startMarker: false,
      marker: endMarker,
      onDragStart: this._onSegmentMarkerDragStart,
      onDragMove: this._onSegmentMarkerDragMove,
      onDragEnd: this._onSegmentMarkerDragEnd,
      dragBoundFunc: this._segmentMarkerDragBoundFunc
    });
  }
};
SegmentShape.prototype._dragBoundFunc = function (pos) {
  // Allow the segment to be moved horizontally but not vertically.
  return {
    x: pos.x,
    y: 0
  };
};

/**
 * Update the segment shape after the segment's attributes have changed.
 */

SegmentShape.prototype.update = function (options) {
  var segmentStartOffset = this._view.timeToPixelOffset(this._segment.startTime);
  var segmentEndOffset = this._view.timeToPixelOffset(this._segment.endTime);
  var width = segmentEndOffset - segmentStartOffset;
  var marker;
  if (marker = this.getStartMarker()) {
    marker.setX(segmentStartOffset - marker.getWidth());
    if (options) {
      marker.update(options);
    }
  }
  if (marker = this.getEndMarker()) {
    marker.setX(segmentEndOffset);
    if (options) {
      marker.update(options);
    }
  }
  this._color = this._segment.color;
  this._borderColor = this._segment.bordercolor;
  if (this._overlayText) {
    this._overlayText.text(this._segment.labelText);
  }
  var segmentOptions = this._view.getViewOptions().segmentOptions;
  if (segmentOptions.overlay) {
    if (this._color) {
      this._overlayRect.fill(this._color);
    }
    if (this._borderColor) {
      this._overlayRect.stroke(this._borderColor);
    }
  } else {
    this._waveformShape.setWaveformColor(this._segment.color);
  }

  // While dragging, the overlay position is controlled in _onSegmentDragMove().

  if (!this._dragging) {
    if (this._overlay) {
      this._overlay.setAttrs({
        x: segmentStartOffset,
        width: width,
        clipWidth: width < 1 ? 1 : width
      });
      this._overlayRect.setAttrs({
        x: 0,
        width: width
      });
      if (this._overlayText) {
        this._overlayText.setAttrs({
          width: width
        });
      }
    }
  }
};
SegmentShape.prototype.getSegment = function () {
  return this._segment;
};
SegmentShape.prototype.getStartMarker = function () {
  return this._startMarker;
};
SegmentShape.prototype.getEndMarker = function () {
  return this._endMarker;
};
SegmentShape.prototype.addToLayer = function (layer) {
  if (this._waveformShape) {
    this._waveformShape.addToLayer(layer);
  }
  if (this._label) {
    layer.add(this._label);
  }
  if (this._overlay) {
    layer.add(this._overlay);
  }
  if (this._startMarker) {
    this._startMarker.addToLayer(layer);
  }
  if (this._endMarker) {
    this._endMarker.addToLayer(layer);
  }
};
SegmentShape.prototype.isDragging = function () {
  return this._dragging;
};
SegmentShape.prototype._onMouseEnter = function (event) {
  if (this._label) {
    this._label.moveToTop();
    this._label.show();
  }
  this._peaks.emit('segments.mouseenter', {
    segment: this._segment,
    evt: event.evt
  });
};
SegmentShape.prototype._onMouseLeave = function (event) {
  if (this._label) {
    this._label.hide();
  }
  this._peaks.emit('segments.mouseleave', {
    segment: this._segment,
    evt: event.evt
  });
};
SegmentShape.prototype._onMouseDown = function (event) {
  this._peaks.emit('segments.mousedown', {
    segment: this._segment,
    evt: event.evt
  });
};
SegmentShape.prototype._onMouseUp = function (event) {
  this._peaks.emit('segments.mouseup', {
    segment: this._segment,
    evt: event.evt
  });
};
SegmentShape.prototype.segmentClicked = function (eventName, event) {
  this._moveToTop();
  this._peaks.emit('segments.' + eventName, event);
};
SegmentShape.prototype._moveToTop = function () {
  this._overlay.moveToTop();
  this._layer.moveSegmentMarkersToTop();
};
SegmentShape.prototype.enableSegmentDragging = function (enable) {
  if (!this._segment.editable) {
    return;
  }
  if (!this._draggable && enable) {
    this._overlay.on('dragstart', this._onSegmentDragStart);
    this._overlay.on('dragmove', this._onSegmentDragMove);
    this._overlay.on('dragend', this._onSegmentDragEnd);
  } else if (this._draggable && !enable) {
    this._overlay.off('dragstart', this._onSegmentDragStart);
    this._overlay.off('dragmove', this._onSegmentDragMove);
    this._overlay.off('dragend', this._onSegmentDragEnd);
  }
  this._overlay.draggable(enable);
  this._draggable = enable;
};
SegmentShape.prototype._setPreviousAndNextSegments = function () {
  if (this._view.getSegmentDragMode() !== 'overlap') {
    this._nextSegment = this._peaks.segments.findNextSegment(this._segment);
    this._previousSegment = this._peaks.segments.findPreviousSegment(this._segment);
  } else {
    this._nextSegment = null;
    this._previousSegment = null;
  }
};
SegmentShape.prototype._onSegmentDragStart = function (event) {
  this._setPreviousAndNextSegments();
  this._dragging = true;
  this._dragStartX = this._overlay.getX();
  this._dragStartTime = this._segment.startTime;
  this._dragEndTime = this._segment.endTime;
  this._peaks.emit('segments.dragstart', {
    segment: this._segment,
    marker: false,
    startMarker: false,
    evt: event.evt
  });
};
SegmentShape.prototype._onSegmentDragMove = function (event) {
  var x = this._overlay.getX();
  var offsetX = x - this._dragStartX;
  var timeOffset = this._view.pixelsToTime(offsetX);

  // The WaveformShape for a segment fills the canvas width
  // but only draws a subset of the horizontal range. When dragged
  // we need to keep the shape object in its position but
  // update the segment start and end time so that the right
  // subset is drawn.

  // Calculate new segment start/end time based on drag position. We'll
  // correct this later based on the drag mode, to prevent overlapping
  // segments or to compress the adjacent segment.

  var startTime = this._dragStartTime + timeOffset;
  var endTime = this._dragEndTime + timeOffset;
  var segmentDuration = this._segment.endTime - this._segment.startTime;
  var dragMode;
  var minSegmentWidth = this._view.getMinSegmentDragWidth();
  var minSegmentDuration = this._view.pixelsToTime(minSegmentWidth);
  var previousSegmentUpdated = false;
  var nextSegmentUpdated = false;

  // Prevent the segment from being dragged beyond the start of the waveform.

  if (startTime < 0) {
    startTime = 0;
    endTime = segmentDuration;
    this._overlay.setX(this._view.timeToPixelOffset(startTime));
  }

  // Adjust segment position if it now overlaps the previous segment?

  if (this._previousSegment) {
    var previousSegmentEndX = this._view.timeToPixelOffset(this._previousSegment.endTime);
    if (startTime < this._previousSegment.endTime) {
      dragMode = this._view.getSegmentDragMode();
      if (dragMode === 'no-overlap' || dragMode === 'compress' && !this._previousSegment.editable) {
        startTime = this._previousSegment.endTime;
        endTime = startTime + segmentDuration;
        this._overlay.setX(previousSegmentEndX);
      } else if (dragMode === 'compress') {
        var previousSegmentEndTime = startTime;
        var minPreviousSegmentEndTime = this._previousSegment.startTime + minSegmentDuration;
        if (previousSegmentEndTime < minPreviousSegmentEndTime) {
          previousSegmentEndTime = minPreviousSegmentEndTime;
          previousSegmentEndX = this._view.timeToPixelOffset(previousSegmentEndTime);
          this._overlay.setX(previousSegmentEndX);
          startTime = previousSegmentEndTime;
          endTime = startTime + segmentDuration;
        }
        this._previousSegment.update({
          endTime: previousSegmentEndTime
        });
        previousSegmentUpdated = true;
      }
    }
  }

  // Adjust segment position if it now overlaps the following segment?

  if (this._nextSegment) {
    var nextSegmentStartX = this._view.timeToPixelOffset(this._nextSegment.startTime);
    if (endTime > this._nextSegment.startTime) {
      dragMode = this._view.getSegmentDragMode();
      if (dragMode === 'no-overlap' || dragMode === 'compress' && !this._nextSegment.editable) {
        endTime = this._nextSegment.startTime;
        startTime = endTime - segmentDuration;
        this._overlay.setX(nextSegmentStartX - this._overlay.getWidth());
      } else if (dragMode === 'compress') {
        var nextSegmentStartTime = endTime;
        var maxNextSegmentStartTime = this._nextSegment.endTime - minSegmentDuration;
        if (nextSegmentStartTime > maxNextSegmentStartTime) {
          nextSegmentStartTime = maxNextSegmentStartTime;
          nextSegmentStartX = this._view.timeToPixelOffset(nextSegmentStartTime);
          this._overlay.setX(nextSegmentStartX - this._overlay.getWidth());
          endTime = nextSegmentStartTime;
          startTime = endTime - segmentDuration;
        }
        this._nextSegment.update({
          startTime: nextSegmentStartTime
        });
        nextSegmentUpdated = true;
      }
    }
  }
  this._segment._setStartTime(startTime);
  this._segment._setEndTime(endTime);
  this._peaks.emit('segments.dragged', {
    segment: this._segment,
    marker: false,
    startMarker: false,
    evt: event.evt
  });
  if (previousSegmentUpdated) {
    this._peaks.emit('segments.dragged', {
      segment: this._previousSegment,
      marker: false,
      startMarker: false,
      evt: event.evt
    });
  } else if (nextSegmentUpdated) {
    this._peaks.emit('segments.dragged', {
      segment: this._nextSegment,
      marker: false,
      startMarker: false,
      evt: event.evt
    });
  }
};
SegmentShape.prototype._onSegmentDragEnd = function (event) {
  this._dragging = false;
  this._peaks.emit('segments.dragend', {
    segment: this._segment,
    marker: false,
    startMarker: false,
    evt: event.evt
  });
};
SegmentShape.prototype.moveMarkersToTop = function () {
  if (this._startMarker) {
    this._startMarker.moveToTop();
  }
  if (this._endMarker) {
    this._endMarker.moveToTop();
  }
};
SegmentShape.prototype.startDrag = function () {
  if (this._endMarker) {
    this._endMarker.startDrag();
  }
};
SegmentShape.prototype.stopDrag = function () {
  if (this._endMarker) {
    this._endMarker.stopDrag();
  }
};

/**
 * @param {SegmentMarker} segmentMarker
 */

SegmentShape.prototype._onSegmentMarkerDragStart = function (segmentMarker, event) {
  this._setPreviousAndNextSegments();

  // Move this segment to the top of the z-order, so that it remains on top
  // of any adjacent segments that the marker is dragged over.
  this._moveToTop();
  this._startMarkerX = this._startMarker.getX();
  this._endMarkerX = this._endMarker.getX();
  this._peaks.emit('segments.dragstart', {
    segment: this._segment,
    marker: true,
    startMarker: segmentMarker.isStartMarker(),
    evt: event.evt
  });
};

/**
 * @param {SegmentMarker} segmentMarker
 */

SegmentShape.prototype._onSegmentMarkerDragMove = function (segmentMarker, event) {
  if (segmentMarker.isStartMarker()) {
    this._segmentStartMarkerDragMove(segmentMarker, event);
    segmentMarker.update({
      startTime: this._segment.startTime
    });
  } else {
    this._segmentEndMarkerDragMove(segmentMarker, event);
    segmentMarker.update({
      endTime: this._segment.endTime
    });
  }
};
function getDuration(segment) {
  return segment.endTime - segment.startTime;
}
SegmentShape.prototype._segmentStartMarkerDragMove = function (segmentMarker, event) {
  var width = this._view.getWidth();
  var startMarkerX = this._startMarker.getX();
  var endMarkerX = this._endMarker.getX();
  var minSegmentDuration = this._view.pixelsToTime(50);
  var minSegmentWidth = this._view.getMinSegmentDragWidth();
  var upperLimit = this._endMarker.getX() - minSegmentWidth;
  if (upperLimit > width) {
    upperLimit = width;
  }
  var previousSegmentVisible = false;
  var previousSegmentUpdated = false;
  var previousSegmentEndX;
  if (this._previousSegment) {
    previousSegmentEndX = this._view.timeToPixelOffset(this._previousSegment.endTime);
    previousSegmentVisible = previousSegmentEndX >= 0;
  }
  if (startMarkerX > upperLimit) {
    segmentMarker.setX(upperLimit);
    this._overlay.clipWidth(upperLimit - endMarkerX);
    if (minSegmentWidth === 0 && upperLimit < width) {
      this._segment._setStartTime(this._segment.endTime);
    } else {
      this._segment._setStartTime(this._view.pixelOffsetToTime(upperLimit));
    }
  } else if (this._previousSegment && previousSegmentVisible) {
    var dragMode = this._view.getSegmentDragMode();
    var fixedPreviousSegment = dragMode === 'no-overlap' || dragMode === 'compress' && !this._previousSegment.editable;
    var compressPreviousSegment = dragMode === 'compress' && this._previousSegment.editable;
    if (startMarkerX <= previousSegmentEndX) {
      if (fixedPreviousSegment) {
        segmentMarker.setX(previousSegmentEndX);
        this._overlay.clipWidth(previousSegmentEndX - endMarkerX);
        this._segment._setStartTime(this._previousSegment.endTime);
      } else if (compressPreviousSegment) {
        var previousSegmentDuration = getDuration(this._previousSegment);
        if (previousSegmentDuration < minSegmentDuration) {
          minSegmentDuration = previousSegmentDuration;
        }
        var lowerLimit = this._view.timeToPixelOffset(this._previousSegment.startTime + minSegmentDuration);
        if (startMarkerX < lowerLimit) {
          startMarkerX = lowerLimit;
        }
        segmentMarker.setX(startMarkerX);
        this._overlay.clipWidth(endMarkerX - startMarkerX);
        this._segment._setStartTime(this._view.pixelOffsetToTime(startMarkerX));
        this._previousSegment.update({
          endTime: this._view.pixelOffsetToTime(startMarkerX)
        });
        previousSegmentUpdated = true;
      }
    } else {
      if (startMarkerX < 0) {
        startMarkerX = 0;
      }
      segmentMarker.setX(startMarkerX);
      this._overlay.clipWidth(endMarkerX - startMarkerX);
      this._segment._setStartTime(this._view.pixelOffsetToTime(startMarkerX));
    }
  } else {
    if (startMarkerX < 0) {
      startMarkerX = 0;
    }
    segmentMarker.setX(startMarkerX);
    this._overlay.clipWidth(endMarkerX - startMarkerX);
    this._segment._setStartTime(this._view.pixelOffsetToTime(startMarkerX));
  }
  this._peaks.emit('segments.dragged', {
    segment: this._segment,
    marker: true,
    startMarker: true,
    evt: event.evt
  });
  if (previousSegmentUpdated) {
    this._peaks.emit('segments.dragged', {
      segment: this._previousSegment,
      marker: true,
      startMarker: false,
      evt: event.evt
    });
  }
};
SegmentShape.prototype._segmentEndMarkerDragMove = function (segmentMarker, event) {
  var width = this._view.getWidth();
  var startMarkerX = this._startMarker.getX();
  var endMarkerX = this._endMarker.getX();
  var minSegmentDuration = this._view.pixelsToTime(50);
  var minSegmentWidth = this._view.getMinSegmentDragWidth();
  var lowerLimit = this._startMarker.getX() + minSegmentWidth;
  if (lowerLimit < 0) {
    lowerLimit = 0;
  }
  var nextSegmentVisible = false;
  var nextSegmentUpdated = false;
  var nextSegmentStartX;
  if (this._nextSegment) {
    nextSegmentStartX = this._view.timeToPixelOffset(this._nextSegment.startTime);
    nextSegmentVisible = nextSegmentStartX < width;
  }
  if (endMarkerX < lowerLimit) {
    segmentMarker.setX(lowerLimit);
    this._overlay.clipWidth(lowerLimit - startMarkerX);
    if (minSegmentWidth === 0 && lowerLimit > 0) {
      this._segment._setEndTime(this._segment.startTime);
    } else {
      this._segment._setEndTime(this._view.pixelOffsetToTime(lowerLimit));
    }
  } else if (this._nextSegment && nextSegmentVisible) {
    var dragMode = this._view.getSegmentDragMode();
    var fixedNextSegment = dragMode === 'no-overlap' || dragMode === 'compress' && !this._nextSegment.editable;
    var compressNextSegment = dragMode === 'compress' && this._nextSegment.editable;
    if (endMarkerX >= nextSegmentStartX) {
      if (fixedNextSegment) {
        segmentMarker.setX(nextSegmentStartX);
        this._overlay.clipWidth(nextSegmentStartX - startMarkerX);
        this._segment._setEndTime(this._nextSegment.startTime);
      } else if (compressNextSegment) {
        var nextSegmentDuration = getDuration(this._nextSegment);
        if (nextSegmentDuration < minSegmentDuration) {
          minSegmentDuration = nextSegmentDuration;
        }
        var upperLimit = this._view.timeToPixelOffset(this._nextSegment.endTime - minSegmentDuration);
        if (endMarkerX > upperLimit) {
          endMarkerX = upperLimit;
        }
        segmentMarker.setX(endMarkerX);
        this._overlay.clipWidth(endMarkerX - startMarkerX);
        this._segment._setEndTime(this._view.pixelOffsetToTime(endMarkerX));
        this._nextSegment.update({
          startTime: this._view.pixelOffsetToTime(endMarkerX)
        });
        nextSegmentUpdated = true;
      }
    } else {
      if (endMarkerX > width) {
        endMarkerX = width;
      }
      segmentMarker.setX(endMarkerX);
      this._overlay.clipWidth(endMarkerX - startMarkerX);
      this._segment._setEndTime(this._view.pixelOffsetToTime(endMarkerX));
    }
  } else {
    if (endMarkerX > width) {
      endMarkerX = width;
    }
    segmentMarker.setX(endMarkerX);
    this._overlay.clipWidth(endMarkerX - startMarkerX);
    this._segment._setEndTime(this._view.pixelOffsetToTime(endMarkerX));
  }
  this._peaks.emit('segments.dragged', {
    segment: this._segment,
    marker: true,
    startMarker: false,
    evt: event.evt
  });
  if (nextSegmentUpdated) {
    this._peaks.emit('segments.dragged', {
      segment: this._nextSegment,
      marker: true,
      startMarker: true,
      evt: event.evt
    });
  }
};

/**
 * @param {SegmentMarker} segmentMarker
 */

SegmentShape.prototype._onSegmentMarkerDragEnd = function (segmentMarker, event) {
  this._nextSegment = null;
  this._previousSegment = null;
  var startMarker = segmentMarker.isStartMarker();
  this._peaks.emit('segments.dragend', {
    segment: this._segment,
    marker: true,
    startMarker: startMarker,
    evt: event.evt
  });
};

// eslint-disable-next-line no-unused-vars
SegmentShape.prototype._segmentMarkerDragBoundFunc = function (segmentMarker, pos) {
  // Allow the marker to be moved horizontally but not vertically.
  return {
    x: pos.x,
    y: segmentMarker.getAbsolutePosition().y
  };
};
SegmentShape.prototype.fitToView = function () {
  if (this._startMarker) {
    this._startMarker.fitToView();
  }
  if (this._endMarker) {
    this._endMarker.fitToView();
  }
  if (this._overlay) {
    var height = this._view.getHeight();
    var overlayRectHeight = clamp(0, height - this._overlayOffset * 2);
    this._overlay.setAttrs({
      y: 0,
      height: height,
      clipY: this._overlayOffset,
      clipHeight: overlayRectHeight
    });
    this._overlayRect.setAttrs({
      y: this._overlayOffset,
      height: overlayRectHeight
    });
    if (this._overlayText) {
      this._overlayText.setAttrs({
        y: this._overlayOffset,
        height: overlayRectHeight
      });
    }
  }
};
SegmentShape.prototype.destroy = function () {
  if (this._waveformShape) {
    this._waveformShape.destroy();
  }
  if (this._label) {
    this._label.destroy();
  }
  if (this._startMarker) {
    this._startMarker.destroy();
  }
  if (this._endMarker) {
    this._endMarker.destroy();
  }
  if (this._overlay) {
    this._overlay.destroy();
  }
};

/**
 * @file
 *
 * Defines the {@link SegmentsLayer} class.
 *
 * @module segments-layer
 */

/**
 * Creates a Konva.Layer that displays segment markers against the audio
 * waveform.
 *
 * @class
 * @alias SegmentsLayer
 *
 * @param {Peaks} peaks
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Boolean} allowEditing
 */

function SegmentsLayer(peaks, view, allowEditing) {
  this._peaks = peaks;
  this._view = view;
  this._allowEditing = allowEditing;
  this._segmentShapes = {};
  this._layer = new Konva.Layer();
  this._onSegmentsUpdate = this._onSegmentsUpdate.bind(this);
  this._onSegmentsAdd = this._onSegmentsAdd.bind(this);
  this._onSegmentsRemove = this._onSegmentsRemove.bind(this);
  this._onSegmentsRemoveAll = this._onSegmentsRemoveAll.bind(this);
  this._onSegmentsDragged = this._onSegmentsDragged.bind(this);
  this._peaks.on('segments.update', this._onSegmentsUpdate);
  this._peaks.on('segments.add', this._onSegmentsAdd);
  this._peaks.on('segments.remove', this._onSegmentsRemove);
  this._peaks.on('segments.remove_all', this._onSegmentsRemoveAll);
  this._peaks.on('segments.dragged', this._onSegmentsDragged);
}

/**
 * Adds the layer to the given {Konva.Stage}.
 *
 * @param {Konva.Stage} stage
 */

SegmentsLayer.prototype.addToStage = function (stage) {
  stage.add(this._layer);
};
SegmentsLayer.prototype.enableEditing = function (enable) {
  this._allowEditing = enable;
};
SegmentsLayer.prototype.isEditingEnabled = function () {
  return this._allowEditing;
};
SegmentsLayer.prototype.enableSegmentDragging = function (enable) {
  for (var segmentPid in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentPid)) {
      this._segmentShapes[segmentPid].enableSegmentDragging(enable);
    }
  }
};
SegmentsLayer.prototype.getSegmentShape = function (segment) {
  return this._segmentShapes[segment.pid];
};
SegmentsLayer.prototype.formatTime = function (time) {
  return this._view.formatTime(time);
};
SegmentsLayer.prototype._onSegmentsUpdate = function (segment, options) {
  var frameStartTime = this._view.getStartTime();
  var frameEndTime = this._view.getEndTime();
  var segmentShape = this.getSegmentShape(segment);
  var isVisible = segment.isVisible(frameStartTime, frameEndTime);
  if (segmentShape && !isVisible) {
    // Remove segment shape that is no longer visible.

    if (!segmentShape.isDragging()) {
      this._removeSegment(segment);
    }
  } else if (!segmentShape && isVisible) {
    // Add segment shape for visible segment.
    segmentShape = this._updateSegment(segment);
  } else if (segmentShape && isVisible) {
    // Update the segment shape with the changed attributes.
    segmentShape.update(options);
  }
};
SegmentsLayer.prototype._onSegmentsAdd = function (event) {
  var self = this;
  var frameStartTime = self._view.getStartTime();
  var frameEndTime = self._view.getEndTime();
  event.segments.forEach(function (segment) {
    if (segment.isVisible(frameStartTime, frameEndTime)) {
      var segmentShape = self._addSegmentShape(segment);
      segmentShape.update();
    }
  });

  // Ensure segment markers are always draggable.
  this.moveSegmentMarkersToTop();
};
SegmentsLayer.prototype._onSegmentsRemove = function (event) {
  var self = this;
  event.segments.forEach(function (segment) {
    self._removeSegment(segment);
  });
};
SegmentsLayer.prototype._onSegmentsRemoveAll = function () {
  this._layer.removeChildren();
  this._segmentShapes = {};
};
SegmentsLayer.prototype._onSegmentsDragged = function (event) {
  this._updateSegment(event.segment);
};

/**
 * Creates the Konva UI objects for a given segment.
 *
 * @private
 * @param {Segment} segment
 * @returns {SegmentShape}
 */

SegmentsLayer.prototype._createSegmentShape = function (segment) {
  return new SegmentShape(segment, this._peaks, this, this._view);
};

/**
 * Adds a Konva UI object to the layer for a given segment.
 *
 * @private
 * @param {Segment} segment
 * @returns {SegmentShape}
 */

SegmentsLayer.prototype._addSegmentShape = function (segment) {
  var segmentShape = this._createSegmentShape(segment);
  segmentShape.addToLayer(this._layer);
  this._segmentShapes[segment.pid] = segmentShape;
  return segmentShape;
};

/**
 * Updates the positions of all displayed segments in the view.
 *
 * @param {Number} startTime The start of the visible range in the view,
 *   in seconds.
 * @param {Number} endTime The end of the visible range in the view,
 *   in seconds.
 */

SegmentsLayer.prototype.updateSegments = function (startTime, endTime) {
  // Update segments in visible time range.
  var segments = this._peaks.segments.find(startTime, endTime);
  segments.forEach(this._updateSegment.bind(this));

  // TODO: In the overview all segments are visible, so no need to do this.
  this._removeInvisibleSegments(startTime, endTime);
};

/**
 * @private
 * @param {Segment} segment
 */

SegmentsLayer.prototype._updateSegment = function (segment) {
  var segmentShape = this.getSegmentShape(segment);
  if (!segmentShape) {
    segmentShape = this._addSegmentShape(segment);
  }
  segmentShape.update();
};

/**
 * Removes any segments that are not visible, i.e., are not within and do not
 * overlap the given time range.
 *
 * @private
 * @param {Number} startTime The start of the visible time range, in seconds.
 * @param {Number} endTime The end of the visible time range, in seconds.
 */

SegmentsLayer.prototype._removeInvisibleSegments = function (startTime, endTime) {
  for (var segmentPid in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentPid)) {
      var segment = this._segmentShapes[segmentPid].getSegment();
      if (!segment.isVisible(startTime, endTime)) {
        this._removeSegment(segment);
      }
    }
  }
};

/**
 * Removes the given segment from the view.
 *
 * @param {Segment} segment
 */

SegmentsLayer.prototype._removeSegment = function (segment) {
  var segmentShape = this._segmentShapes[segment.pid];
  if (segmentShape) {
    segmentShape.destroy();
    delete this._segmentShapes[segment.pid];
  }
};

/**
 * Moves all segment markers to the top of the z-order,
 * so the user can always drag them.
 */

SegmentsLayer.prototype.moveSegmentMarkersToTop = function () {
  for (var segmentPid in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentPid)) {
      this._segmentShapes[segmentPid].moveMarkersToTop();
    }
  }
};

/**
 * Toggles visibility of the segments layer.
 *
 * @param {Boolean} visible
 */

SegmentsLayer.prototype.setVisible = function (visible) {
  this._layer.setVisible(visible);
};
SegmentsLayer.prototype.segmentClicked = function (eventName, event) {
  var segmentShape = this._segmentShapes[event.segment.pid];
  if (segmentShape) {
    segmentShape.segmentClicked(eventName, event);
  }
};
SegmentsLayer.prototype.destroy = function () {
  this._peaks.off('segments.update', this._onSegmentsUpdate);
  this._peaks.off('segments.add', this._onSegmentsAdd);
  this._peaks.off('segments.remove', this._onSegmentsRemove);
  this._peaks.off('segments.remove_all', this._onSegmentsRemoveAll);
  this._peaks.off('segments.dragged', this._onSegmentsDragged);
};
SegmentsLayer.prototype.fitToView = function () {
  for (var segmentPid in this._segmentShapes) {
    if (objectHasProperty(this._segmentShapes, segmentPid)) {
      var segmentShape = this._segmentShapes[segmentPid];
      segmentShape.fitToView();
    }
  }
};
SegmentsLayer.prototype.draw = function () {
  this._layer.draw();
};
SegmentsLayer.prototype.getHeight = function () {
  return this._layer.getHeight();
};

/**
 * @file
 *
 * Defines the {@link WaveformAxis} class.
 *
 * @module waveform-axis
 */

/**
 * Creates the waveform axis shapes and adds them to the given view layer.
 *
 * @class
 * @alias WaveformAxis
 *
 * @param {WaveformOverview|WaveformZoomView} view
 * @param {Object} options
 * @param {String} options.axisGridlineColor
 * @param {String} options.axisLabelColor
 * @param {Boolean} options.showAxisLabels
 * @param {Function} options.formatAxisTime
 * @param {String} options.fontFamily
 * @param {Number} options.fontSize
 * @param {String} options.fontStyle
 */

function WaveformAxis(view, options) {
  var self = this;
  self._axisGridlineColor = options.axisGridlineColor;
  self._axisLabelColor = options.axisLabelColor;
  self._showAxisLabels = options.showAxisLabels;
  self._axisTopMarkerHeight = options.axisTopMarkerHeight;
  self._axisBottomMarkerHeight = options.axisBottomMarkerHeight;
  if (options.formatAxisTime) {
    self._formatAxisTime = options.formatAxisTime;
  } else {
    self._formatAxisTime = function (time) {
      // precision = 0, drops the fractional seconds
      return formatTime(time, 0);
    };
  }
  self._axisLabelFont = WaveformAxis._buildFontString(options.fontFamily, options.fontSize, options.fontStyle);
  self._axisShape = new Konva.Shape({
    sceneFunc: function sceneFunc(context) {
      self._drawAxis(context, view);
    }
  });
}
WaveformAxis._buildFontString = function (fontFamily, fontSize, fontStyle) {
  if (!fontSize) {
    fontSize = 11;
  }
  if (!fontFamily) {
    fontFamily = 'sans-serif';
  }
  if (!fontStyle) {
    fontStyle = 'normal';
  }
  return fontStyle + ' ' + fontSize + 'px ' + fontFamily;
};
WaveformAxis.prototype.addToLayer = function (layer) {
  layer.add(this._axisShape);
};
WaveformAxis.prototype.showAxisLabels = function (show, options) {
  this._showAxisLabels = show;
  if (options) {
    if (objectHasProperty(options, 'topMarkerHeight')) {
      this._axisTopMarkerHeight = options.topMarkerHeight;
    }
    if (objectHasProperty(options, 'bottomMarkerHeight')) {
      this._axisBottomMarkerHeight = options.bottomMarkerHeight;
    }
  }
};

/**
 * Returns number of seconds for each x-axis marker, appropriate for the
 * current zoom level, ensuring that markers are not too close together
 * and that markers are placed at intuitive time intervals (i.e., every 1,
 * 2, 5, 10, 20, 30 seconds, then every 1, 2, 5, 10, 20, 30 minutes, then
 * every 1, 2, 5, 10, 20, 30 hours).
 *
 * @param {WaveformOverview|WaveformZoomView} view
 * @returns {Number}
 */

WaveformAxis.prototype._getAxisLabelScale = function (view) {
  var baseSecs = 1; // seconds
  var steps = [1, 2, 5, 10, 20, 30];
  var minSpacing = 60;
  var index = 0;
  var secs;
  for (;;) {
    secs = baseSecs * steps[index];
    var pixels = view.timeToPixels(secs);
    if (pixels < minSpacing) {
      if (++index === steps.length) {
        baseSecs *= 60; // seconds -> minutes -> hours
        index = 0;
      }
    } else {
      break;
    }
  }
  return secs;
};

/**
 * Draws the time axis and labels onto a view.
 *
 * @param {Konva.Context} context The context to draw on.
 * @param {WaveformOverview|WaveformZoomView} view
 */

WaveformAxis.prototype._drawAxis = function (context, view) {
  var currentFrameStartTime = view.getStartTime();

  // Time interval between axis markers (seconds)
  var axisLabelIntervalSecs = this._getAxisLabelScale(view);

  // Time of first axis marker (seconds)
  var firstAxisLabelSecs = roundUpToNearest(currentFrameStartTime, axisLabelIntervalSecs);

  // Distance between waveform start time and first axis marker (seconds)
  var axisLabelOffsetSecs = firstAxisLabelSecs - currentFrameStartTime;

  // Distance between waveform start time and first axis marker (pixels)
  var axisLabelOffsetPixels = view.timeToPixels(axisLabelOffsetSecs);
  context.setAttr('strokeStyle', this._axisGridlineColor);
  context.setAttr('lineWidth', 1);

  // Set text style
  context.setAttr('font', this._axisLabelFont);
  context.setAttr('fillStyle', this._axisLabelColor);
  context.setAttr('textAlign', 'left');
  context.setAttr('textBaseline', 'bottom');
  var width = view.getWidth();
  var height = view.getHeight();
  var secs = firstAxisLabelSecs;
  for (;;) {
    // Position of axis marker (pixels)
    var x = axisLabelOffsetPixels + view.timeToPixels(secs - firstAxisLabelSecs);
    if (x >= width) {
      break;
    }
    if (this._axisTopMarkerHeight > 0) {
      context.beginPath();
      context.moveTo(x + 0.5, 0);
      context.lineTo(x + 0.5, 0 + this._axisTopMarkerHeight);
      context.stroke();
    }
    if (this._axisBottomMarkerHeight) {
      context.beginPath();
      context.moveTo(x + 0.5, height);
      context.lineTo(x + 0.5, height - this._axisBottomMarkerHeight);
      context.stroke();
    }
    if (this._showAxisLabels) {
      var label = this._formatAxisTime(secs);
      var labelWidth = context.measureText(label).width;
      var labelX = x - labelWidth / 2;
      var labelY = height - 1 - this._axisBottomMarkerHeight;
      if (labelX >= 0) {
        context.fillText(label, labelX, labelY);
      }
    }
    secs += axisLabelIntervalSecs;
  }
};

/**
 * @file
 *
 * Defines the {@link WaveformView} class.
 *
 * @module waveform-view
 */
function WaveformView(waveformData, container, peaks, viewOptions) {
  var self = this;
  self._container = container;
  self._peaks = peaks;
  self._options = peaks.options;
  self._viewOptions = viewOptions;
  self._originalWaveformData = waveformData;
  self._data = waveformData;

  // The pixel offset of the current frame being displayed
  self._frameOffset = 0;
  self._width = container.clientWidth;
  self._height = container.clientHeight;
  self._amplitudeScale = 1.0;
  self._waveformColor = self._viewOptions.waveformColor;
  self._playedWaveformColor = self._viewOptions.playedWaveformColor;
  self._timeLabelPrecision = self._viewOptions.timeLabelPrecision;
  if (self._viewOptions.formatPlayheadTime) {
    self._formatPlayheadTime = self._viewOptions.formatPlayheadTime;
  } else {
    self._formatPlayheadTime = function (time) {
      return formatTime(time, self._timeLabelPrecision);
    };
  }
  self._enableSeek = true;
  self.initWaveform();

  // Disable warning: The stage has 6 layers.
  // Recommended maximum number of layers is 3-5.
  Konva.showWarnings = false;
  self._stage = new Konva.Stage({
    container: container,
    width: self._width,
    height: self._height
  });
  self._createWaveform();
  if (self._viewOptions.enableSegments) {
    self._segmentsLayer = new SegmentsLayer(peaks, self, self._viewOptions.enableEditing);
    self._segmentsLayer.addToStage(self._stage);
  }
  if (self._viewOptions.enablePoints) {
    self._pointsLayer = new PointsLayer(peaks, self, self._viewOptions.enableEditing);
    self._pointsLayer.addToStage(self._stage);
  }
  self.initHighlightLayer();
  self._createAxisLabels();
  self._playheadLayer = new PlayheadLayer({
    player: self._peaks.player,
    view: self,
    showPlayheadTime: self._viewOptions.showPlayheadTime,
    playheadColor: self._viewOptions.playheadColor,
    playheadTextColor: self._viewOptions.playheadTextColor,
    playheadBackgroundColor: self._viewOptions.playheadBackgroundColor,
    playheadPadding: self._viewOptions.playheadPadding,
    playheadFontFamily: self._viewOptions.fontFamily,
    playheadFontSize: self._viewOptions.fontSize,
    playheadFontStyle: self._viewOptions.fontStyle
  });
  self._playheadLayer.addToStage(self._stage);
  self._onClick = self._onClick.bind(self);
  self._onDblClick = self._onDblClick.bind(self);
  self._onContextMenu = self._onContextMenu.bind(self);
  self._stage.on('click', self._onClick);
  self._stage.on('dblclick', self._onDblClick);
  self._stage.on('contextmenu', self._onContextMenu);
}
WaveformView.prototype.getViewOptions = function () {
  return this._viewOptions;
};

/**
 * @returns {WaveformData} The view's waveform data.
 */

WaveformView.prototype.getWaveformData = function () {
  return this._data;
};
WaveformView.prototype.setWaveformData = function (waveformData) {
  this._data = waveformData;
};

/**
 * Returns the pixel index for a given time, for the current zoom level.
 *
 * @param {Number} time Time, in seconds.
 * @returns {Number} Pixel index.
 */

WaveformView.prototype.timeToPixels = function (time) {
  return Math.floor(time * this._data.sample_rate / this._data.scale);
};

/**
 * Returns the time for a given pixel index, for the current zoom level.
 *
 * @param {Number} pixels Pixel index.
 * @returns {Number} Time, in seconds.
 */

WaveformView.prototype.pixelsToTime = function (pixels) {
  return pixels * this._data.scale / this._data.sample_rate;
};

/**
 * Returns the time for a given pixel offset (relative to the
 * current scroll position), for the current zoom level.
 *
 * @param {Number} offset Offset from left-visible-edge of view
 * @returns {Number} Time, in seconds.
 */

WaveformView.prototype.pixelOffsetToTime = function (offset) {
  var pixels = this._frameOffset + offset;
  return pixels * this._data.scale / this._data.sample_rate;
};
WaveformView.prototype.timeToPixelOffset = function (time) {
  return Math.floor(time * this._data.sample_rate / this._data.scale) - this._frameOffset;
};

/**
 * @returns {Number} The start position of the waveform shown in the view,
 *   in pixels.
 */

WaveformView.prototype.getFrameOffset = function () {
  return this._frameOffset;
};

/**
 * @returns {Number} The width of the view, in pixels.
 */

WaveformView.prototype.getWidth = function () {
  return this._width;
};

/**
 * @returns {Number} The height of the view, in pixels.
 */

WaveformView.prototype.getHeight = function () {
  return this._height;
};

/**
 * @returns {Number} The time at the left edge of the waveform view.
 */

WaveformView.prototype.getStartTime = function () {
  return this.pixelOffsetToTime(0);
};

/**
 * @returns {Number} The time at the right edge of the waveform view.
 */

WaveformView.prototype.getEndTime = function () {
  return this.pixelOffsetToTime(this._width);
};

/**
 * @returns {Number} The media duration, in seconds.
 */

WaveformView.prototype._getDuration = function () {
  return this._peaks.player.getDuration();
};
WaveformView.prototype._createWaveform = function () {
  this._waveformLayer = new Konva.Layer({
    listening: false
  });
  this._createWaveformShapes();
  this._stage.add(this._waveformLayer);
};
WaveformView.prototype._createWaveformShapes = function () {
  if (!this._waveformShape) {
    this._waveformShape = new WaveformShape({
      color: this._waveformColor,
      view: this
    });
    this._waveformShape.addToLayer(this._waveformLayer);
  }
  if (this._playedWaveformColor && !this._playedWaveformShape) {
    var time = this._peaks.player.getCurrentTime();
    this._playedSegment = {
      startTime: 0,
      endTime: time
    };
    this._unplayedSegment = {
      startTime: time,
      endTime: this._getDuration()
    };
    this._waveformShape.setSegment(this._unplayedSegment);
    this._playedWaveformShape = new WaveformShape({
      color: this._playedWaveformColor,
      view: this,
      segment: this._playedSegment
    });
    this._playedWaveformShape.addToLayer(this._waveformLayer);
  }
};
WaveformView.prototype.setWaveformColor = function (color) {
  this._waveformColor = color;
  this._waveformShape.setWaveformColor(color);
};
WaveformView.prototype.setPlayedWaveformColor = function (color) {
  this._playedWaveformColor = color;
  if (color) {
    if (!this._playedWaveformShape) {
      this._createWaveformShapes();
    }
    this._playedWaveformShape.setWaveformColor(color);
  } else {
    if (this._playedWaveformShape) {
      this._destroyPlayedWaveformShape();
    }
  }
};
WaveformView.prototype._destroyPlayedWaveformShape = function () {
  this._waveformShape.setSegment(null);
  this._playedWaveformShape.destroy();
  this._playedWaveformShape = null;
  this._playedSegment = null;
  this._unplayedSegment = null;
};
WaveformView.prototype._createAxisLabels = function () {
  this._axisLayer = new Konva.Layer({
    listening: false
  });
  this._axis = new WaveformAxis(this, this._viewOptions);
  this._axis.addToLayer(this._axisLayer);
  this._stage.add(this._axisLayer);
};
WaveformView.prototype.showAxisLabels = function (show, options) {
  this._axis.showAxisLabels(show, options);
  this._axisLayer.draw();
};
WaveformView.prototype.showPlayheadTime = function (show) {
  this._playheadLayer.showPlayheadTime(show);
};
WaveformView.prototype.setTimeLabelPrecision = function (precision) {
  this._timeLabelPrecision = precision;
  this._playheadLayer.updatePlayheadText();
};
WaveformView.prototype.formatTime = function (time) {
  return this._formatPlayheadTime(time);
};

/**
 * Adjusts the amplitude scale of waveform shown in the view, which allows
 * users to zoom the waveform vertically.
 *
 * @param {Number} scale The new amplitude scale factor
 */

WaveformView.prototype.setAmplitudeScale = function (scale) {
  if (!isNumber(scale) || !isFinite(scale)) {
    throw new Error('view.setAmplitudeScale(): Scale must be a valid number');
  }
  this._amplitudeScale = scale;
  this.drawWaveformLayer();
  if (this._segmentsLayer) {
    this._segmentsLayer.draw();
  }
};
WaveformView.prototype.getAmplitudeScale = function () {
  return this._amplitudeScale;
};
WaveformView.prototype.enableSeek = function (enable) {
  this._enableSeek = enable;
};
WaveformView.prototype.isSeekEnabled = function () {
  return this._enableSeek;
};
WaveformView.prototype._onClick = function (event) {
  this._clickHandler(event, 'click');
};
WaveformView.prototype._onDblClick = function (event) {
  this._clickHandler(event, 'dblclick');
};
WaveformView.prototype._onContextMenu = function (event) {
  this._clickHandler(event, 'contextmenu');
};
WaveformView.prototype._clickHandler = function (event, eventName) {
  var emitViewEvent = true;
  if (event.target !== this._stage) {
    var marker = getMarkerObject(event.target);
    if (marker) {
      if (marker.attrs.name === 'point-marker') {
        var point = marker.getAttr('point');
        if (point) {
          this._peaks.emit('points.' + eventName, {
            point: point,
            evt: event.evt,
            preventViewEvent: function preventViewEvent() {
              emitViewEvent = false;
            }
          });
        }
      } else if (marker.attrs.name === 'segment-overlay') {
        var segment = marker.getAttr('segment');
        if (segment) {
          var clickEvent = {
            segment: segment,
            evt: event.evt,
            preventViewEvent: function preventViewEvent() {
              emitViewEvent = false;
            }
          };
          if (this._segmentsLayer) {
            this._segmentsLayer.segmentClicked(eventName, clickEvent);
          }
        }
      }
    }
  }
  if (emitViewEvent) {
    var mousePosX = event.evt.layerX;
    var time = this.pixelOffsetToTime(mousePosX);
    var viewName = this.getName();
    this._peaks.emit(viewName + '.' + eventName, {
      time: time,
      evt: event.evt
    });
  }
};
WaveformView.prototype.updatePlayheadTime = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};
WaveformView.prototype.playheadPosChanged = function (time) {
  if (this._playedWaveformShape) {
    this._playedSegment.endTime = time;
    this._unplayedSegment.startTime = time;
    this.drawWaveformLayer();
  }
};
WaveformView.prototype.drawWaveformLayer = function () {
  this._waveformLayer.draw();
};
WaveformView.prototype.enableMarkerEditing = function (enable) {
  if (this._segmentsLayer) {
    this._segmentsLayer.enableEditing(enable);
  }
  if (this._pointsLayer) {
    this._pointsLayer.enableEditing(enable);
  }
};
WaveformView.prototype.fitToContainer = function () {
  if (this._container.clientWidth === 0 && this._container.clientHeight === 0) {
    return;
  }
  var updateWaveform = false;
  if (this._container.clientWidth !== this._width) {
    this._width = this._container.clientWidth;
    this._stage.setWidth(this._width);
    updateWaveform = this.containerWidthChange();
  }
  if (this._container.clientHeight !== this._height) {
    this._height = this._container.clientHeight;
    this._stage.height(this._height);
    this._waveformShape.fitToView();
    this._playheadLayer.fitToView();
    if (this._segmentsLayer) {
      this._segmentsLayer.fitToView();
    }
    if (this._pointsLayer) {
      this._pointsLayer.fitToView();
    }
    this.containerHeightChange();
  }
  if (updateWaveform) {
    this.updateWaveform(this._frameOffset);
  }
};
WaveformView.prototype.destroy = function () {
  this._playheadLayer.destroy();
  if (this._segmentsLayer) {
    this._segmentsLayer.destroy();
  }
  if (this._pointsLayer) {
    this._pointsLayer.destroy();
  }
  if (this._stage) {
    this._stage.destroy();
    this._stage = null;
  }
};

/**
 * @file
 *
 * Defines the {@link MouseDragHandler} class.
 *
 * @module mouse-drag-handler
 */

/**
 * An object to receive callbacks on mouse drag events. Each function is
 * called with the current mouse X position, relative to the stage's
 * container HTML element.
 *
 * @typedef {Object} MouseDragHandlers
 * @global
 * @property {Function} onMouseDown Mouse down event handler.
 * @property {Function} onMouseMove Mouse move event handler.
 * @property {Function} onMouseUp Mouse up event handler.
 */

/**
 * Creates a handler for mouse events to allow interaction with the waveform
 * views by clicking and dragging the mouse.
 *
 * @class
 * @alias MouseDragHandler
 *
 * @param {Konva.Stage} stage
 * @param {MouseDragHandlers} handlers
 */

function MouseDragHandler(stage, handlers) {
  this._stage = stage;
  this._handlers = handlers;
  this._dragging = false;
  this._mouseDown = this._mouseDown.bind(this);
  this._mouseUp = this._mouseUp.bind(this);
  this._mouseMove = this._mouseMove.bind(this);
  this._stage.on('mousedown', this._mouseDown);
  this._stage.on('touchstart', this._mouseDown);
  this._lastMouseClientX = null;
}

/**
 * Mouse down event handler.
 *
 * @param {MouseEvent} event
 */

MouseDragHandler.prototype._mouseDown = function (event) {
  var segment = null;
  if (event.type === 'mousedown' && event.evt.button !== 0) {
    // Mouse drag only applies to the primary mouse button.
    // The secondary button may be used to show a context menu
    // and we don't want to also treat this as a mouse drag operation.
    return;
  }
  var marker = getMarkerObject(event.target);
  if (marker && marker.attrs.draggable) {
    // Avoid interfering with drag/drop of point and segment markers.
    if (marker.attrs.name === 'point-marker' || marker.attrs.name === 'segment-marker') {
      return;
    }

    // Check if we're dragging a segment.
    if (marker.attrs.name === 'segment-overlay') {
      segment = marker;
    }
  }
  this._lastMouseClientX = Math.floor(event.type === 'touchstart' ? event.evt.touches[0].clientX : event.evt.clientX);
  if (this._handlers.onMouseDown) {
    var mouseDownPosX = this._getMousePosX(this._lastMouseClientX);
    this._handlers.onMouseDown(mouseDownPosX, segment);
  }

  // Use the window mousemove and mouseup handlers instead of the
  // Konva.Stage ones so that we still receive events if the user moves the
  // mouse outside the stage.
  window.addEventListener('mousemove', this._mouseMove, {
    capture: false,
    passive: true
  });
  window.addEventListener('touchmove', this._mouseMove, {
    capture: false,
    passive: true
  });
  window.addEventListener('mouseup', this._mouseUp, {
    capture: false,
    passive: true
  });
  window.addEventListener('touchend', this._mouseUp, {
    capture: false,
    passive: true
  });
  window.addEventListener('blur', this._mouseUp, {
    capture: false,
    passive: true
  });
};

/**
 * Mouse move event handler.
 *
 * @param {MouseEvent} event
 */

MouseDragHandler.prototype._mouseMove = function (event) {
  var clientX = Math.floor(event.type === 'touchmove' ? event.changedTouches[0].clientX : event.clientX);

  // Don't update on vertical mouse movement.
  if (clientX === this._lastMouseClientX) {
    return;
  }
  this._lastMouseClientX = clientX;
  this._dragging = true;
  if (this._handlers.onMouseMove) {
    var mousePosX = this._getMousePosX(clientX);
    this._handlers.onMouseMove(mousePosX);
  }
};

/**
 * Mouse up event handler.
 *
 * @param {MouseEvent} event
 */

MouseDragHandler.prototype._mouseUp = function (event) {
  var clientX;
  if (event.type === 'touchend') {
    clientX = Math.floor(event.changedTouches[0].clientX);
    if (event.cancelable) {
      event.preventDefault();
    }
  } else {
    clientX = Math.floor(event.clientX);
  }
  if (this._handlers.onMouseUp) {
    var mousePosX = this._getMousePosX(clientX);
    this._handlers.onMouseUp(mousePosX);
  }
  window.removeEventListener('mousemove', this._mouseMove, {
    capture: false
  });
  window.removeEventListener('touchmove', this._mouseMove, {
    capture: false
  });
  window.removeEventListener('mouseup', this._mouseUp, {
    capture: false
  });
  window.removeEventListener('touchend', this._mouseUp, {
    capture: false
  });
  window.removeEventListener('blur', this._mouseUp, {
    capture: false
  });
  this._dragging = false;
};

/**
 * @returns {Number} The mouse X position, relative to the container that
 * received the mouse down event.
 *
 * @private
 * @param {Number} clientX Mouse client X position.
 */

MouseDragHandler.prototype._getMousePosX = function (clientX) {
  var containerPos = this._stage.getContainer().getBoundingClientRect();
  return clientX - containerPos.left;
};

/**
 * Returns <code>true</code> if the mouse is being dragged, i.e., moved with
 * the mouse button held down.
 *
 * @returns {Boolean}
 */

MouseDragHandler.prototype.isDragging = function () {
  return this._dragging;
};
MouseDragHandler.prototype.destroy = function () {
  this._stage.off('mousedown', this._mouseDown);
  this._stage.off('touchstart', this._mouseDown);
};

/**
 * @file
 *
 * Defines the {@link SeekMouseDragHandler} class.
 *
 * @module seek-mouse-drag-handler
 */

/**
 * Creates a handler for mouse events to allow seeking the waveform
 * views by clicking and dragging the mouse.
 *
 * @class
 * @alias SeekMouseDragHandler
 *
 * @param {Peaks} peaks
 * @param {WaveformOverview} view
 */

function SeekMouseDragHandler(peaks, view) {
  this._peaks = peaks;
  this._view = view;
  this._onMouseDown = this._onMouseDown.bind(this);
  this._onMouseMove = this._onMouseMove.bind(this);
  this._mouseDragHandler = new MouseDragHandler(view._stage, {
    onMouseDown: this._onMouseDown,
    onMouseMove: this._onMouseMove
  });
}
SeekMouseDragHandler.prototype._onMouseDown = function (mousePosX) {
  this._seek(mousePosX);
};
SeekMouseDragHandler.prototype._onMouseMove = function (mousePosX) {
  this._seek(mousePosX);
};
SeekMouseDragHandler.prototype._seek = function (mousePosX) {
  if (!this._view.isSeekEnabled()) {
    return;
  }
  mousePosX = clamp(mousePosX, 0, this._width);
  var time = this._view.pixelsToTime(mousePosX);
  var duration = this._peaks.player.getDuration();

  // Prevent the playhead position from jumping by limiting click
  // handling to the waveform duration.
  if (time > duration) {
    time = duration;
  }

  // Update the playhead position. This gives a smoother visual update
  // than if we only use the player.timeupdate event.
  this._view.updatePlayheadTime(time);
  this._peaks.player.seek(time);
};
SeekMouseDragHandler.prototype.destroy = function () {
  this._mouseDragHandler.destroy();
};

/**
 * @file
 *
 * Defines the {@link WaveformOverview} class.
 *
 * @module waveform-overview
 */

/**
 * Creates the overview waveform view.
 *
 * @class
 * @alias WaveformOverview
 *
 * @param {WaveformData} waveformData
 * @param {HTMLElement} container
 * @param {Peaks} peaks
 */

function WaveformOverview(waveformData, container, peaks) {
  var self = this;
  WaveformView.call(self, waveformData, container, peaks, peaks.options.overview);

  // Bind event handlers
  self._onTimeUpdate = self._onTimeUpdate.bind(self);
  self._onPlaying = self._onPlaying.bind(self);
  self._onPause = self._onPause.bind(self);
  self._onZoomviewDisplaying = self._onZoomviewDisplaying.bind(self);

  // Register event handlers
  peaks.on('player.timeupdate', self._onTimeUpdate);
  peaks.on('player.playing', self._onPlaying);
  peaks.on('player.pause', self._onPause);
  peaks.on('zoomview.displaying', self._onZoomviewDisplaying);
  var time = self._peaks.player.getCurrentTime();
  self._playheadLayer.updatePlayheadTime(time);
  self._mouseDragHandler = new SeekMouseDragHandler(peaks, self);
}
WaveformOverview.prototype = Object.create(WaveformView.prototype);
WaveformOverview.prototype.initWaveform = function () {
  if (this._width !== 0) {
    this._resampleAndSetWaveformData(this._originalWaveformData, this._width);
  }
};
WaveformOverview.prototype.initHighlightLayer = function () {
  this._highlightLayer = new HighlightLayer(this, this._viewOptions);
  this._highlightLayer.addToStage(this._stage);
};
WaveformOverview.prototype.isSegmentDraggingEnabled = function () {
  return false;
};
WaveformOverview.prototype.getName = function () {
  return 'overview';
};
WaveformOverview.prototype._onTimeUpdate = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};
WaveformOverview.prototype._onPlaying = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};
WaveformOverview.prototype._onPause = function (time) {
  this._playheadLayer.stop(time);
};
WaveformOverview.prototype._onZoomviewDisplaying = function (startTime, endTime) {
  this.showHighlight(startTime, endTime);
};
WaveformOverview.prototype.showHighlight = function (startTime, endTime) {
  this._highlightLayer.showHighlight(startTime, endTime);
};
WaveformOverview.prototype.setWaveformData = function (waveformData) {
  this._originalWaveformData = waveformData;
  if (this._width !== 0) {
    this._resampleAndSetWaveformData(waveformData, this._width);
  } else {
    this._data = waveformData;
  }
  this.updateWaveform();
};
WaveformOverview.prototype._resampleAndSetWaveformData = function (waveformData, width) {
  try {
    this._data = waveformData.resample({
      width: width
    });
    return true;
  } catch (error) {
    // This error usually indicates that the waveform length
    // is less than the container width. Ignore, and use the
    // given waveform data
    this._data = waveformData;
    return false;
  }
};
WaveformOverview.prototype.removeHighlightRect = function () {
  this._highlightLayer.removeHighlight();
};
WaveformOverview.prototype.updateWaveform = function () {
  this._waveformLayer.draw();
  this._axisLayer.draw();
  var playheadTime = this._peaks.player.getCurrentTime();
  this._playheadLayer.updatePlayheadTime(playheadTime);
  this._highlightLayer.updateHighlight();
  var frameStartTime = 0;
  var frameEndTime = this.pixelsToTime(this._width);
  if (this._pointsLayer) {
    this._pointsLayer.updatePoints(frameStartTime, frameEndTime);
  }
  if (this._segmentsLayer) {
    this._segmentsLayer.updateSegments(frameStartTime, frameEndTime);
  }
};
WaveformOverview.prototype.containerWidthChange = function () {
  return this._resampleAndSetWaveformData(this._originalWaveformData, this._width);
};
WaveformOverview.prototype.containerHeightChange = function () {
  this._highlightLayer.fitToView();
};
WaveformOverview.prototype.destroy = function () {
  // Unregister event handlers
  this._peaks.off('player.playing', this._onPlaying);
  this._peaks.off('player.pause', this._onPause);
  this._peaks.off('player.timeupdate', this._onTimeUpdate);
  this._peaks.off('zoomview.displaying', this._onZoomviewDisplaying);
  this._mouseDragHandler.destroy();
  WaveformView.prototype.destroy.call(this);
};

/**
 * @file
 *
 * Defines the {@link InsertSegmentMouseDragHandler} class.
 *
 * @module insert-segment-mouse-drag-handler
 */

/**
 * Creates a handler for mouse events to allow inserting new waveform
 * segments by clicking and dragging the mouse.
 *
 * @class
 * @alias InsertSegmentMouseDragHandler
 *
 * @param {Peaks} peaks
 * @param {WaveformZoomView} view
 */

function InsertSegmentMouseDragHandler(peaks, view) {
  this._peaks = peaks;
  this._view = view;
  this._onMouseDown = this._onMouseDown.bind(this);
  this._onMouseMove = this._onMouseMove.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._mouseDragHandler = new MouseDragHandler(view._stage, {
    onMouseDown: this._onMouseDown,
    onMouseMove: this._onMouseMove,
    onMouseUp: this._onMouseUp
  });
}
InsertSegmentMouseDragHandler.prototype.isDragging = function () {
  return this._mouseDragHandler.isDragging();
};
InsertSegmentMouseDragHandler.prototype._onMouseDown = function (mousePosX, segment) {
  this._segment = segment;
  if (this._segment) {
    // The user has clicked within a segment. We want to prevent
    // the segment from being dragged while the user inserts a new
    // segment. So we temporarily make the segment non-draggable,
    // and restore its draggable state in onMouseUp().
    this._segmentIsDraggable = this._segment.draggable();
    this._segment.draggable(false);
  }
  var time = this._view.pixelsToTime(mousePosX + this._view.getFrameOffset());
  this._peaks.segments.setInserting(true);
  this._insertSegment = this._peaks.segments.add({
    startTime: time,
    endTime: time,
    editable: true
  });
  this._insertSegmentShape = this._view._segmentsLayer.getSegmentShape(this._insertSegment);
  if (this._insertSegmentShape) {
    this._insertSegmentShape.moveMarkersToTop();
    this._insertSegmentShape.startDrag();
  }
};
InsertSegmentMouseDragHandler.prototype._onMouseMove = function () {};
InsertSegmentMouseDragHandler.prototype._onMouseUp = function () {
  if (this._insertSegmentShape) {
    this._insertSegmentShape.stopDrag();
    this._insertSegmentShape = null;
  }

  // If the user was dragging within an existing segment,
  // restore the segment's original draggable state.
  if (this._segment && this._segmentIsDraggable) {
    this._segment.draggable(true);
  }
  this._peaks.emit('segments.insert', {
    segment: this._insertSegment
  });
  this._peaks.segments.setInserting(false);
};
InsertSegmentMouseDragHandler.prototype.destroy = function () {
  this._mouseDragHandler.destroy();
};

/**
 * @file
 *
 * Defines the {@link ScrollMouseDragHandler} class.
 *
 * @module scroll-mouse-drag-handler
 */

/**
 * Creates a handler for mouse events to allow scrolling the zoomable
 * waveform view by clicking and dragging the mouse.
 *
 * @class
 * @alias ScrollMouseDragHandler
 *
 * @param {Peaks} peaks
 * @param {WaveformZoomView} view
 */

function ScrollMouseDragHandler(peaks, view) {
  this._peaks = peaks;
  this._view = view;
  this._onMouseDown = this._onMouseDown.bind(this);
  this._onMouseMove = this._onMouseMove.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._mouseDragHandler = new MouseDragHandler(view._stage, {
    onMouseDown: this._onMouseDown,
    onMouseMove: this._onMouseMove,
    onMouseUp: this._onMouseUp
  });
}
ScrollMouseDragHandler.prototype.isDragging = function () {
  return this._mouseDragHandler.isDragging();
};
ScrollMouseDragHandler.prototype._onMouseDown = function (mousePosX, segment) {
  this._segment = segment;
  this._seeking = false;
  var playheadOffset = this._view.getPlayheadOffset();
  if (this._view.isSeekEnabled() && Math.abs(mousePosX - playheadOffset) <= this._view.getPlayheadClickTolerance()) {
    this._seeking = true;

    // The user has clicked near the playhead, and the playhead is within
    // a segment. In this case we want to allow the playhead to move, but
    // prevent the segment from being dragged. So we temporarily make the
    // segment non-draggable, and restore its draggable state in onMouseUp().
    if (this._segment) {
      this._segmentIsDraggable = this._segment.draggable();
      this._segment.draggable(false);
    }
  }
  if (this._seeking) {
    mousePosX = clamp(mousePosX, 0, this._view.getWidth());
    var time = this._view.pixelsToTime(mousePosX + this._view.getFrameOffset());
    this._seek(time);
  } else {
    this._initialFrameOffset = this._view.getFrameOffset();
    this._mouseDownX = mousePosX;
  }
};
ScrollMouseDragHandler.prototype._onMouseMove = function (mousePosX) {
  // Prevent scrolling the waveform if the user is dragging a segment.
  if (this._segment && !this._seeking) {
    return;
  }
  if (this._seeking) {
    mousePosX = clamp(mousePosX, 0, this._view.getWidth());
    var time = this._view.pixelsToTime(mousePosX + this._view.getFrameOffset());
    this._seek(time);
  } else {
    // Moving the mouse to the left increases the time position of the
    // left-hand edge of the visible waveform.
    var diff = this._mouseDownX - mousePosX;
    var newFrameOffset = this._initialFrameOffset + diff;
    if (newFrameOffset !== this._initialFrameOffset) {
      this._view.updateWaveform(newFrameOffset);
    }
  }
};
ScrollMouseDragHandler.prototype._onMouseUp = function () {
  if (!this._seeking) {
    // Set playhead position only on click release, when not dragging.
    if (this._view._enableSeek && !this._mouseDragHandler.isDragging()) {
      var time = this._view.pixelOffsetToTime(this._mouseDownX);
      this._seek(time);
    }
  }

  // If the user was dragging within an existing segment,
  // restore the segment's original draggable state.
  if (this._segment && this._seeking) {
    if (this._segmentIsDraggable) {
      this._segment.draggable(true);
    }
  }
};
ScrollMouseDragHandler.prototype._seek = function (time) {
  var duration = this._peaks.player.getDuration();

  // Prevent the playhead position from jumping by limiting click
  // handling to the waveform duration.
  if (time > duration) {
    time = duration;
  }

  // Update the playhead position. This gives a smoother visual update
  // than if we only use the player.timeupdate event.
  this._view.updatePlayheadTime(time);
  this._peaks.player.seek(time);
};
ScrollMouseDragHandler.prototype.destroy = function () {
  this._mouseDragHandler.destroy();
};

/**
 * @file
 *
 * Defines the {@link WaveformZoomView} class.
 *
 * @module waveform-zoomview
 */

/**
 * Creates a zoomable waveform view.
 *
 * @class
 * @alias WaveformZoomView
 *
 * @param {WaveformData} waveformData
 * @param {HTMLElement} container
 * @param {Peaks} peaks
 */

function WaveformZoomView(waveformData, container, peaks) {
  var self = this;
  WaveformView.call(self, waveformData, container, peaks, peaks.options.zoomview);

  // Bind event handlers
  self._onTimeUpdate = self._onTimeUpdate.bind(self);
  self._onPlaying = self._onPlaying.bind(self);
  self._onPause = self._onPause.bind(self);
  self._onKeyboardLeft = self._onKeyboardLeft.bind(self);
  self._onKeyboardRight = self._onKeyboardRight.bind(self);
  self._onKeyboardShiftLeft = self._onKeyboardShiftLeft.bind(self);
  self._onKeyboardShiftRight = self._onKeyboardShiftRight.bind(self);

  // Register event handlers
  self._peaks.on('player.timeupdate', self._onTimeUpdate);
  self._peaks.on('player.playing', self._onPlaying);
  self._peaks.on('player.pause', self._onPause);
  self._peaks.on('keyboard.left', self._onKeyboardLeft);
  self._peaks.on('keyboard.right', self._onKeyboardRight);
  self._peaks.on('keyboard.shift_left', self._onKeyboardShiftLeft);
  self._peaks.on('keyboard.shift_right', self._onKeyboardShiftRight);
  self._autoScroll = self._viewOptions.autoScroll;
  self._autoScrollOffset = self._viewOptions.autoScrollOffset;
  self._enableSegmentDragging = false;
  self._segmentDragMode = 'overlap';
  self._minSegmentDragWidth = 0;
  self._insertSegmentShape = null;
  self._playheadClickTolerance = self._viewOptions.playheadClickTolerance;
  self._zoomLevelAuto = false;
  self._zoomLevelSeconds = null;
  var time = self._peaks.player.getCurrentTime();
  self._syncPlayhead(time);
  self._mouseDragHandler = new ScrollMouseDragHandler(peaks, self);
  self._onWheel = self._onWheel.bind(self);
  self._onWheelCaptureVerticalScroll = self._onWheelCaptureVerticalScroll.bind(self);
  self.setWheelMode(self._viewOptions.wheelMode);
  self._peaks.emit('zoomview.displaying', 0, self.getEndTime());
}
WaveformZoomView.prototype = Object.create(WaveformView.prototype);
WaveformZoomView.prototype.initWaveform = function () {
  this._enableWaveformCache = this._options.waveformCache;
  this._initWaveformCache();
  var initialZoomLevel = this._peaks.zoom.getZoomLevel();
  this._resampleData({
    scale: initialZoomLevel
  });
};
WaveformZoomView.prototype._initWaveformCache = function () {
  if (this._enableWaveformCache) {
    this._waveformData = new Map();
    this._waveformData.set(this._originalWaveformData.scale, this._originalWaveformData);
    this._waveformScales = [this._originalWaveformData.scale];
  }
};
WaveformZoomView.prototype.initHighlightLayer = function () {};
WaveformZoomView.prototype.setWheelMode = function (mode, options) {
  if (!options) {
    options = {};
  }
  if (mode !== this._wheelMode || options.captureVerticalScroll !== this._captureVerticalScroll) {
    this._stage.off('wheel');
    this._wheelMode = mode;
    this._captureVerticalScroll = options.captureVerticalScroll;
    switch (mode) {
      case 'scroll':
        if (options.captureVerticalScroll) {
          this._stage.on('wheel', this._onWheelCaptureVerticalScroll);
        } else {
          this._stage.on('wheel', this._onWheel);
        }
        break;
    }
  }
};
WaveformZoomView.prototype._onWheel = function (event) {
  var wheelEvent = event.evt;
  var delta;
  if (wheelEvent.shiftKey) {
    if (wheelEvent.deltaY !== 0) {
      delta = wheelEvent.deltaY;
    } else if (wheelEvent.deltaX !== 0) {
      delta = wheelEvent.deltaX;
    } else {
      return;
    }
  } else {
    // Ignore the event if it looks like the user is scrolling vertically
    // down the page
    if (Math.abs(wheelEvent.deltaX) < Math.abs(wheelEvent.deltaY)) {
      return;
    }
    delta = wheelEvent.deltaX;
  }
  if (wheelEvent.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    delta *= this._width;
  }
  wheelEvent.preventDefault();
  var newFrameOffset = clamp(this._frameOffset + Math.floor(delta), 0, this._pixelLength - this._width);
  this.updateWaveform(newFrameOffset);
};
WaveformZoomView.prototype._onWheelCaptureVerticalScroll = function (event) {
  var wheelEvent = event.evt;
  var delta = Math.abs(wheelEvent.deltaX) < Math.abs(wheelEvent.deltaY) ? wheelEvent.deltaY : wheelEvent.deltaX;
  wheelEvent.preventDefault();
  var newFrameOffset = clamp(this._frameOffset + Math.floor(delta), 0, this._pixelLength - this._width);
  this.updateWaveform(newFrameOffset);
};
WaveformZoomView.prototype.setWaveformDragMode = function (mode) {
  if (this._viewOptions.enableSegments) {
    this._mouseDragHandler.destroy();
    if (mode === 'insert-segment') {
      this._mouseDragHandler = new InsertSegmentMouseDragHandler(this._peaks, this);
    } else {
      this._mouseDragHandler = new ScrollMouseDragHandler(this._peaks, this);
    }
  }
};
WaveformZoomView.prototype.enableSegmentDragging = function (enable) {
  this._enableSegmentDragging = enable;

  // Update all existing segments
  if (this._segmentsLayer) {
    this._segmentsLayer.enableSegmentDragging(enable);
  }
};
WaveformZoomView.prototype.isSegmentDraggingEnabled = function () {
  return this._enableSegmentDragging;
};
WaveformZoomView.prototype.setSegmentDragMode = function (mode) {
  this._segmentDragMode = mode;
};
WaveformZoomView.prototype.getSegmentDragMode = function () {
  return this._segmentDragMode;
};
WaveformZoomView.prototype.getName = function () {
  return 'zoomview';
};
WaveformZoomView.prototype._onTimeUpdate = function (time) {
  if (this._mouseDragHandler.isDragging()) {
    return;
  }
  this._syncPlayhead(time);
};
WaveformZoomView.prototype._onPlaying = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
};
WaveformZoomView.prototype._onPause = function (time) {
  this._playheadLayer.stop(time);
};
WaveformZoomView.prototype._onKeyboardLeft = function () {
  this._keyboardScroll(-1, false);
};
WaveformZoomView.prototype._onKeyboardRight = function () {
  this._keyboardScroll(1, false);
};
WaveformZoomView.prototype._onKeyboardShiftLeft = function () {
  this._keyboardScroll(-1, true);
};
WaveformZoomView.prototype._onKeyboardShiftRight = function () {
  this._keyboardScroll(1, true);
};
WaveformZoomView.prototype._keyboardScroll = function (direction, large) {
  var increment;
  if (large) {
    increment = direction * this._width;
  } else {
    increment = direction * this.timeToPixels(this._options.nudgeIncrement);
  }
  this.scrollWaveform({
    pixels: increment
  });
};
WaveformZoomView.prototype.setWaveformData = function (waveformData) {
  this._originalWaveformData = waveformData;
  // Clear cached waveforms
  this._initWaveformCache();

  // Don't update the UI here, call setZoom().
};

/**
 * Returns the position of the playhead marker, in pixels relative to the
 * left hand side of the waveform view.
 *
 * @return {Number}
 */

WaveformZoomView.prototype.getPlayheadOffset = function () {
  return this._playheadLayer.getPlayheadPixel() - this._frameOffset;
};
WaveformZoomView.prototype.getPlayheadClickTolerance = function () {
  return this._playheadClickTolerance;
};
WaveformZoomView.prototype._syncPlayhead = function (time) {
  this._playheadLayer.updatePlayheadTime(time);
  if (this._autoScroll) {
    // Check for the playhead reaching the right-hand side of the window.

    var pixelIndex = this.timeToPixels(time);

    // TODO: move this code to animation function?
    // TODO: don't scroll if user has positioned view manually (e.g., using
    // the keyboard)
    var endThreshold = this._frameOffset + this._width - this._autoScrollOffset;
    if (pixelIndex >= endThreshold || pixelIndex < this._frameOffset) {
      // Put the playhead at 100 pixels from the left edge
      this._frameOffset = pixelIndex - this._autoScrollOffset;
      if (this._frameOffset < 0) {
        this._frameOffset = 0;
      }
      this.updateWaveform(this._frameOffset);
    }
  }
};
WaveformZoomView.prototype._getScale = function (duration) {
  return Math.floor(duration * this._data.sample_rate / this._width);
};
function isAutoScale(options) {
  return objectHasProperty(options, 'scale') && options.scale === 'auto' || objectHasProperty(options, 'seconds') && options.seconds === 'auto';
}

/**
 * Options for [WaveformZoomView.setZoom]{@link WaveformZoomView#setZoom}.
 *
 * @typedef {Object} SetZoomOptions
 * @global
 * @property {Number|String} scale Zoom level, in samples per pixel, or 'auto'
 *   to fit the entire waveform to the view width
 * @property {Number|String} seconds Number of seconds to fit to the view width,
 *   or 'auto' to fit the entire waveform to the view width
 */

/**
 * Changes the zoom level.
 *
 * @param {SetZoomOptions} options
 * @returns {Boolean}
 */

WaveformZoomView.prototype.setZoom = function (options) {
  var scale;
  if (isAutoScale(options)) {
    var seconds = this._peaks.player.getDuration();
    if (!isValidTime(seconds)) {
      return false;
    }
    this._zoomLevelAuto = true;
    this._zoomLevelSeconds = null;
    scale = this._getScale(seconds);
  } else {
    if (objectHasProperty(options, 'scale')) {
      this._zoomLevelSeconds = null;
      scale = Math.floor(options.scale);
    } else if (objectHasProperty(options, 'seconds')) {
      if (!isValidTime(options.seconds)) {
        return false;
      }
      this._zoomLevelSeconds = options.seconds;
      scale = this._getScale(options.seconds);
    }
    this._zoomLevelAuto = false;
  }
  if (scale < this._originalWaveformData.scale) {
    // eslint-disable-next-line max-len
    this._peaks._logger('peaks.zoomview.setZoom(): zoom level must be at least ' + this._originalWaveformData.scale);
    scale = this._originalWaveformData.scale;
  }
  var currentTime = this._peaks.player.getCurrentTime();
  var apexTime;
  var playheadOffsetPixels = this.getPlayheadOffset();
  if (playheadOffsetPixels >= 0 && playheadOffsetPixels < this._width) {
    // Playhead is visible. Change the zoom level while keeping the
    // playhead at the same position in the window.
    apexTime = currentTime;
  } else {
    // Playhead is not visible. Change the zoom level while keeping the
    // centre of the window at the same position in the waveform.
    playheadOffsetPixels = Math.floor(this._width / 2);
    apexTime = this.pixelOffsetToTime(playheadOffsetPixels);
  }
  var prevScale = this._scale;
  this._resampleData({
    scale: scale
  });
  var apexPixel = this.timeToPixels(apexTime);
  this._frameOffset = apexPixel - playheadOffsetPixels;
  this.updateWaveform(this._frameOffset);
  this._playheadLayer.zoomLevelChanged();

  // Update the playhead position after zooming.
  this._playheadLayer.updatePlayheadTime(currentTime);
  this._peaks.emit('zoom.update', {
    currentZoom: scale,
    previousZoom: prevScale
  });
  return true;
};
WaveformZoomView.prototype._resampleData = function (options) {
  var scale = options.scale;
  if (this._enableWaveformCache) {
    if (!this._waveformData.has(scale)) {
      var sourceWaveform = this._originalWaveformData;

      // Resample from the next lowest available zoom level

      for (var i = 0; i < this._waveformScales.length; i++) {
        if (this._waveformScales[i] < scale) {
          sourceWaveform = this._waveformData.get(this._waveformScales[i]);
        } else {
          break;
        }
      }
      this._waveformData.set(scale, sourceWaveform.resample(options));
      this._waveformScales.push(scale);
      this._waveformScales.sort(function (a, b) {
        return a - b; // Ascending order
      });
    }

    this._data = this._waveformData.get(scale);
  } else {
    this._data = this._originalWaveformData.resample(options);
  }
  this._scale = this._data.scale;
  this._pixelLength = this._data.length;
};
WaveformZoomView.prototype.setStartTime = function (time) {
  if (time < 0) {
    time = 0;
  }
  if (this._zoomLevelAuto) {
    time = 0;
  }
  this.updateWaveform(this.timeToPixels(time));
};

/**
 * @returns {Number} The length of the waveform, in pixels.
 */

WaveformZoomView.prototype.getPixelLength = function () {
  return this._pixelLength;
};

/**
 * Scrolls the region of waveform shown in the view.
 *
 * @param {Number} scrollAmount How far to scroll, in pixels
 */

WaveformZoomView.prototype.scrollWaveform = function (options) {
  var scrollAmount;
  if (objectHasProperty(options, 'pixels')) {
    scrollAmount = Math.floor(options.pixels);
  } else if (objectHasProperty(options, 'seconds')) {
    scrollAmount = this.timeToPixels(options.seconds);
  } else {
    throw new TypeError('view.scrollWaveform(): Missing umber of pixels or seconds');
  }
  this.updateWaveform(this._frameOffset + scrollAmount);
};

/**
 * Updates the region of waveform shown in the view.
 *
 * @param {Number} frameOffset The new frame offset, in pixels.
 */

WaveformZoomView.prototype.updateWaveform = function (frameOffset) {
  var upperLimit;
  if (this._pixelLength < this._width) {
    // Total waveform is shorter than viewport, so reset the offset to 0.
    frameOffset = 0;
    upperLimit = this._width;
  } else {
    // Calculate the very last possible position.
    upperLimit = this._pixelLength - this._width;
  }
  frameOffset = clamp(frameOffset, 0, upperLimit);
  this._frameOffset = frameOffset;

  // Display playhead if it is within the zoom frame width.
  var playheadPixel = this._playheadLayer.getPlayheadPixel();
  this._playheadLayer.updatePlayheadTime(this.pixelsToTime(playheadPixel));
  this.drawWaveformLayer();
  this._axisLayer.draw();
  var frameStartTime = this.getStartTime();
  var frameEndTime = this.getEndTime();
  if (this._pointsLayer) {
    this._pointsLayer.updatePoints(frameStartTime, frameEndTime);
  }
  if (this._segmentsLayer) {
    this._segmentsLayer.updateSegments(frameStartTime, frameEndTime);
  }
  this._peaks.emit('zoomview.displaying', frameStartTime, frameEndTime);
};
WaveformZoomView.prototype.enableAutoScroll = function (enable, options) {
  this._autoScroll = enable;
  if (objectHasProperty(options, 'offset')) {
    this._autoScrollOffset = options.offset;
  }
};
WaveformZoomView.prototype.getMinSegmentDragWidth = function () {
  return this._insertSegmentShape ? 0 : this._minSegmentDragWidth;
};
WaveformZoomView.prototype.setMinSegmentDragWidth = function (width) {
  this._minSegmentDragWidth = width;
};
WaveformZoomView.prototype.containerWidthChange = function () {
  var updateWaveform = false;
  var resample = false;
  var resampleOptions;
  if (this._zoomLevelAuto) {
    resample = true;
    resampleOptions = {
      width: this._width
    };
  } else if (this._zoomLevelSeconds !== null) {
    resample = true;
    resampleOptions = {
      scale: this._getScale(this._zoomLevelSeconds)
    };
  }
  if (resample) {
    try {
      this._resampleData(resampleOptions);
      updateWaveform = true;
    } catch (error) {
      // Ignore, and leave this._data as it was
    }
  }
  return updateWaveform;
};
WaveformZoomView.prototype.containerHeightChange = function () {
  // Nothing
};
WaveformZoomView.prototype.getStage = function () {
  return this._stage;
};
WaveformZoomView.prototype.getSegmentsLayer = function () {
  return this._segmentsLayer;
};
WaveformZoomView.prototype.destroy = function () {
  // Unregister event handlers
  this._peaks.off('player.playing', this._onPlaying);
  this._peaks.off('player.pause', this._onPause);
  this._peaks.off('player.timeupdate', this._onTimeUpdate);
  this._peaks.off('keyboard.left', this._onKeyboardLeft);
  this._peaks.off('keyboard.right', this._onKeyboardRight);
  this._peaks.off('keyboard.shift_left', this._onKeyboardShiftLeft);
  this._peaks.off('keyboard.shift_right', this._onKeyboardShiftRight);
  this._mouseDragHandler.destroy();
  WaveformView.prototype.destroy.call(this);
};

/**
 * @file
 *
 * Defines the {@link Scrollbar} class.
 *
 * @module scrollbar
 */

/**
 * Creates a scrollbar.
 *
 * @class
 * @alias Scrollbar
 *
 * @param {WaveformData} waveformData
 * @param {HTMLElement} container
 * @param {Peaks} peaks
 */

function Scrollbar(waveformData, container, peaks) {
  this._waveformData = waveformData;
  this._container = container;
  this._peaks = peaks;
  this._options = peaks.options.scrollbar;
  this._zoomview = peaks.views.getView('zoomview');
  this._dragBoundFunc = this._dragBoundFunc.bind(this);
  this._onScrollboxDragStart = this._onScrollboxDragStart.bind(this);
  this._onScrollboxDragMove = this._onScrollboxDragMove.bind(this);
  this._onScrollboxDragEnd = this._onScrollboxDragEnd.bind(this);
  this._onZoomviewDisplaying = this._onZoomviewDisplaying.bind(this);
  this._onScrollbarClick = this._onScrollbarClick.bind(this);
  peaks.on('zoomview.displaying', this._onZoomviewDisplaying);
  this._width = container.clientWidth;
  this._height = container.clientHeight;
  this._stage = new Konva.Stage({
    container: container,
    width: this._width,
    height: this._height
  });
  this._layer = new Konva.Layer();
  this._stage.on('click', this._onScrollbarClick);
  this._stage.add(this._layer);
  this._color = this._options.color;
  this._scrollboxX = 0;
  this._minScrollboxWidth = this._options.minWidth;
  this._offsetY = 0;
  this._scrollbox = new Konva.Group({
    draggable: true,
    dragBoundFunc: this._dragBoundFunc
  });
  this._scrollboxRect = new Rect({
    x: this._scrollboxX,
    y: this._offsetY,
    width: 0,
    height: this._height,
    fill: this._color
  });
  this._scrollbox.add(this._scrollboxRect);
  this._setScrollboxWidth();
  this._scrollbox.on('dragstart', this._onScrollboxDragStart);
  this._scrollbox.on('dragmove', this._onScrollboxDragMove);
  this._scrollbox.on('dragend', this._onScrollboxDragEnd);
  this._layer.add(this._scrollbox);
  this._layer.draw();
}
Scrollbar.prototype.setZoomview = function (zoomview) {
  this._zoomview = zoomview;
  this._updateScrollbarWidthAndPosition();
};

/**
 * Sets the width of the scrollbox, based on the visible waveform region
 * in the zoomview and minimum scrollbox width option.
 */

Scrollbar.prototype._setScrollboxWidth = function () {
  if (this._zoomview) {
    this._scrollboxWidth = Math.floor(this._width * this._zoomview.pixelsToTime(this._zoomview.getWidth()) / this._peaks.player.getDuration());
    if (this._scrollboxWidth < this._minScrollboxWidth) {
      this._scrollboxWidth = this._minScrollboxWidth;
    }
  } else {
    this._scrollboxWidth = this._width;
  }
  this._scrollboxRect.width(this._scrollboxWidth);
};

/**
 * @returns {Number} The maximum scrollbox position, in pixels.
 */

Scrollbar.prototype._getScrollbarRange = function () {
  return this._width - this._scrollboxWidth;
};
Scrollbar.prototype._dragBoundFunc = function (pos) {
  // Allow the scrollbar to be moved horizontally but not vertically.
  return {
    x: pos.x,
    y: 0
  };
};
Scrollbar.prototype._onScrollboxDragStart = function () {
  this._dragging = true;
};
Scrollbar.prototype._onScrollboxDragEnd = function () {
  this._dragging = false;
};
Scrollbar.prototype._onScrollboxDragMove = function () {
  var range = this._getScrollbarRange();
  var x = clamp(this._scrollbox.x(), 0, range);
  this._scrollbox.x(x);
  if (x !== this._scrollboxX) {
    this._scrollboxX = x;
    if (this._zoomview) {
      this._updateWaveform(x);
    }
  }
};
Scrollbar.prototype._onZoomviewDisplaying = function /* startTime , endTime */
() {
  if (!this._dragging) {
    this._updateScrollbarWidthAndPosition();
  }
};
Scrollbar.prototype._updateScrollbarWidthAndPosition = function () {
  this._setScrollboxWidth();
  if (this._zoomview) {
    var startTime = this._zoomview.getStartTime();
    var zoomviewRange = this._zoomview.getPixelLength() - this._zoomview.getWidth();
    var scrollBoxPos = Math.floor(this._zoomview.timeToPixels(startTime) * this._getScrollbarRange() / zoomviewRange);
    this._scrollbox.x(scrollBoxPos);
    this._layer.draw();
  }
};
Scrollbar.prototype._onScrollbarClick = function (event) {
  // Handle clicks on the scrollbar outside the scrollbox.
  if (event.target === this._stage) {
    if (this._zoomview) {
      // Centre the scrollbox where the user clicked.
      var x = Math.floor(event.evt.layerX - this._scrollboxWidth / 2);
      if (x < 0) {
        x = 0;
      }
      this._updateWaveform(x);
    }
  }
};

/**
 * Sets the zoomview waveform position based on scrollbar position.
 */

Scrollbar.prototype._updateWaveform = function (x) {
  var offset = Math.floor((this._zoomview.getPixelLength() - this._zoomview.getWidth()) * x / this._getScrollbarRange());
  this._zoomview.updateWaveform(offset);
};
Scrollbar.prototype.fitToContainer = function () {
  if (this._container.clientWidth === 0 && this._container.clientHeight === 0) {
    return;
  }
  if (this._container.clientWidth !== this._width) {
    this._width = this._container.clientWidth;
    this._stage.width(this._width);
    this._updateScrollbarWidthAndPosition();
  }
  this._height = this._container.clientHeight;
  this._stage.height(this._height);
};
Scrollbar.prototype.destroy = function () {
  this._layer.destroy();
  this._stage.destroy();
  this._stage = null;
};

/**
 * @file
 *
 * Defines the {@link ViewController} class.
 *
 * @module view-controller
 */

/**
 * Creates an object that allows users to create and manage waveform views.
 *
 * @class
 * @alias ViewController
 *
 * @param {Peaks} peaks
 */

function ViewController(peaks) {
  this._peaks = peaks;
  this._overview = null;
  this._zoomview = null;
  this._scrollbar = null;
}
ViewController.prototype.createOverview = function (container) {
  if (this._overview) {
    return this._overview;
  }
  var waveformData = this._peaks.getWaveformData();
  this._overview = new WaveformOverview(waveformData, container, this._peaks);
  if (this._zoomview) {
    this._overview.showHighlight(this._zoomview.getStartTime(), this._zoomview.getEndTime());
  }
  return this._overview;
};
ViewController.prototype.createZoomview = function (container) {
  if (this._zoomview) {
    return this._zoomview;
  }
  var waveformData = this._peaks.getWaveformData();
  this._zoomview = new WaveformZoomView(waveformData, container, this._peaks);
  if (this._scrollbar) {
    this._scrollbar.setZoomview(this._zoomview);
  }
  return this._zoomview;
};
ViewController.prototype.createScrollbar = function (container) {
  var waveformData = this._peaks.getWaveformData();
  this._scrollbar = new Scrollbar(waveformData, container, this._peaks);
  return this._scrollbar;
};
ViewController.prototype.destroyOverview = function () {
  if (!this._overview) {
    return;
  }
  if (!this._zoomview) {
    return;
  }
  this._overview.destroy();
  this._overview = null;
};
ViewController.prototype.destroyZoomview = function () {
  if (!this._zoomview) {
    return;
  }
  if (!this._overview) {
    return;
  }
  this._zoomview.destroy();
  this._zoomview = null;
  this._overview.removeHighlightRect();
};
ViewController.prototype.destroy = function () {
  if (this._overview) {
    this._overview.destroy();
    this._overview = null;
  }
  if (this._zoomview) {
    this._zoomview.destroy();
    this._zoomview = null;
  }
  if (this._scrollbar) {
    this._scrollbar.destroy();
    this._scrollbar = null;
  }
};
ViewController.prototype.getView = function (name) {
  if (isNullOrUndefined(name)) {
    if (this._overview && this._zoomview) {
      return null;
    } else if (this._overview) {
      return this._overview;
    } else if (this._zoomview) {
      return this._zoomview;
    } else {
      return null;
    }
  } else {
    switch (name) {
      case 'overview':
        return this._overview;
      case 'zoomview':
        return this._zoomview;
      default:
        return null;
    }
  }
};
ViewController.prototype.getScrollbar = function () {
  return this._scrollbar;
};

/**
 * @file
 *
 * Defines the {@link ZoomController} class.
 *
 * @module zoom-controller
 */

/**
 * Creates an object to control zoom levels in a {@link WaveformZoomView}.
 *
 * @class
 * @alias ZoomController
 *
 * @param {Peaks} peaks
 * @param {Array<Integer>} zoomLevels
 */

function ZoomController(peaks, zoomLevels) {
  this._peaks = peaks;
  this._zoomLevels = zoomLevels;
  this._zoomLevelIndex = 0;
}
ZoomController.prototype.setZoomLevels = function (zoomLevels) {
  this._zoomLevels = zoomLevels;
  this.setZoom(0, true);
};

/**
 * Zoom in one level.
 */

ZoomController.prototype.zoomIn = function () {
  this.setZoom(this._zoomLevelIndex - 1);
};

/**
 * Zoom out one level.
 */

ZoomController.prototype.zoomOut = function () {
  this.setZoom(this._zoomLevelIndex + 1);
};

/**
 * Given a particular zoom level, triggers a resampling of the data in the
 * zoomed view.
 *
 * @param {number} zoomLevelIndex An index into the options.zoomLevels array.
 */

ZoomController.prototype.setZoom = function (zoomLevelIndex, forceUpdate) {
  if (zoomLevelIndex >= this._zoomLevels.length) {
    zoomLevelIndex = this._zoomLevels.length - 1;
  }
  if (zoomLevelIndex < 0) {
    zoomLevelIndex = 0;
  }
  if (!forceUpdate && zoomLevelIndex === this._zoomLevelIndex) {
    // Nothing to do.
    return;
  }
  this._zoomLevelIndex = zoomLevelIndex;
  var zoomview = this._peaks.views.getView('zoomview');
  if (!zoomview) {
    return;
  }
  zoomview.setZoom({
    scale: this._zoomLevels[zoomLevelIndex]
  });
};

/**
 * Returns the current zoom level index.
 *
 * @returns {Number}
 */

ZoomController.prototype.getZoom = function () {
  return this._zoomLevelIndex;
};

/**
 * Returns the current zoom level, in samples per pixel.
 *
 * @returns {Number}
 */

ZoomController.prototype.getZoomLevel = function () {
  return this._zoomLevels[this._zoomLevelIndex];
};

/**
 * @file
 *
 * Defines the {@link WaveformBuilder} class.
 *
 * @module waveform-builder
 */
var isXhr2 = ('withCredentials' in new XMLHttpRequest());

/**
 * Creates and returns a WaveformData object, either by requesting the
 * waveform data from the server, or by creating the waveform data using the
 * Web Audio API.
 *
 * @class
 * @alias WaveformBuilder
 *
 * @param {Peaks} peaks
 */

function WaveformBuilder(peaks) {
  this._peaks = peaks;
}

/**
 * Options for requesting remote waveform data.
 *
 * @typedef {Object} RemoteWaveformDataOptions
 * @global
 * @property {String=} arraybuffer
 * @property {String=} json
 */

/**
 * Options for supplying local waveform data.
 *
 * @typedef {Object} LocalWaveformDataOptions
 * @global
 * @property {ArrayBuffer=} arraybuffer
 * @property {Object=} json
 */

/**
 * Options for the Web Audio waveform builder.
 *
 * @typedef {Object} WaveformBuilderWebAudioOptions
 * @global
 * @property {AudioContext} audioContext
 * @property {AudioBuffer=} audioBuffer
 * @property {Number=} scale
 * @property {Boolean=} multiChannel
 */

/**
 * Options for [WaveformBuilder.init]{@link WaveformBuilder#init}.
 *
 * @typedef {Object} WaveformBuilderInitOptions
 * @global
 * @property {RemoteWaveformDataOptions=} dataUri
 * @property {LocalWaveformDataOptions=} waveformData
 * @property {WaveformBuilderWebAudioOptions=} webAudio
 * @property {Boolean=} withCredentials
 * @property {Array<Number>=} zoomLevels
 */

/**
 * Callback for receiving the waveform data.
 *
 * @callback WaveformBuilderInitCallback
 * @global
 * @param {Error} error
 * @param {WaveformData} waveformData
 */

/**
 * Loads or creates the waveform data.
 *
 * @private
 * @param {WaveformBuilderInitOptions} options
 * @param {WaveformBuilderInitCallback} callback
 */

WaveformBuilder.prototype.init = function (options, callback) {
  if (options.dataUri && (options.webAudio || options.audioContext) || options.waveformData && (options.webAudio || options.audioContext) || options.dataUri && options.waveformData) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): You may only pass one source (webAudio, dataUri, or waveformData) to render waveform data.'));
    return;
  }
  if (options.audioContext) {
    // eslint-disable-next-line max-len
    this._peaks._logger('Peaks.init(): The audioContext option is deprecated, please pass a webAudio object instead');
    options.webAudio = {
      audioContext: options.audioContext
    };
  }
  if (options.dataUri) {
    return this._getRemoteWaveformData(options, callback);
  } else if (options.waveformData) {
    return this._buildWaveformFromLocalData(options, callback);
  } else if (options.webAudio) {
    if (options.webAudio.audioBuffer) {
      return this._buildWaveformDataFromAudioBuffer(options, callback);
    } else {
      return this._buildWaveformDataUsingWebAudio(options, callback);
    }
  } else {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): You must pass an audioContext, or dataUri, or waveformData to render waveform data'));
  }
};

/* eslint-disable max-len */

/**
 * Fetches waveform data, based on the given options.
 *
 * @private
 * @param {Object} options
 * @param {String|Object} options.dataUri
 * @param {String} options.dataUri.arraybuffer Waveform data URL
 *   (binary format)
 * @param {String} options.dataUri.json Waveform data URL (JSON format)
 * @param {String} options.defaultUriFormat Either 'arraybuffer' (for binary
 *   data) or 'json'
 * @param {WaveformBuilderInitCallback} callback
 *
 * @see Refer to the <a href="https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md">data format documentation</a>
 *   for details of the binary and JSON waveform data formats.
 */

/* eslint-enable max-len */

WaveformBuilder.prototype._getRemoteWaveformData = function (options, callback) {
  var self = this;
  var dataUri = null;
  var requestType = null;
  var url;
  if (isObject(options.dataUri)) {
    dataUri = options.dataUri;
  } else {
    callback(new TypeError('Peaks.init(): The dataUri option must be an object'));
    return;
  }
  ['ArrayBuffer', 'JSON'].some(function (connector) {
    if (window[connector]) {
      requestType = connector.toLowerCase();
      url = dataUri[requestType];
      return Boolean(url);
    }
  });
  if (!url) {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): Unable to determine a compatible dataUri format for this browser'));
    return;
  }
  self._xhr = self._createXHR(url, requestType, options.withCredentials, function (event) {
    if (this.readyState !== 4) {
      return;
    }
    if (this.status !== 200) {
      callback(new Error('Unable to fetch remote data. HTTP status ' + this.status));
      return;
    }
    self._xhr = null;
    var waveformData = WaveformData.create(event.target.response);
    if (waveformData.channels !== 1 && waveformData.channels !== 2) {
      callback(new Error('Peaks.init(): Only mono or stereo waveforms are currently supported'));
      return;
    } else if (waveformData.bits !== 8) {
      callback(new Error('Peaks.init(): 16-bit waveform data is not supported'));
      return;
    }
    callback(null, waveformData);
  }, function () {
    callback(new Error('XHR failed'));
  }, function () {
    callback(new Error('XHR aborted'));
  });
  self._xhr.send();
};

/* eslint-disable max-len */

/**
 * Creates a waveform from given data, based on the given options.
 *
 * @private
 * @param {Object} options
 * @param {Object} options.waveformData
 * @param {ArrayBuffer} options.waveformData.arraybuffer Waveform data (binary format)
 * @param {Object} options.waveformData.json Waveform data (JSON format)
 * @param {WaveformBuilderInitCallback} callback
 *
 * @see Refer to the <a href="https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md">data format documentation</a>
 *   for details of the binary and JSON waveform data formats.
 */

/* eslint-enable max-len */

WaveformBuilder.prototype._buildWaveformFromLocalData = function (options, callback) {
  var waveformData = null;
  var data = null;
  if (isObject(options.waveformData)) {
    waveformData = options.waveformData;
  } else {
    callback(new Error('Peaks.init(): The waveformData option must be an object'));
    return;
  }
  if (isObject(waveformData.json)) {
    data = waveformData.json;
  } else if (isArrayBuffer(waveformData.arraybuffer)) {
    data = waveformData.arraybuffer;
  }
  if (!data) {
    // eslint-disable-next-line max-len
    callback(new Error('Peaks.init(): Unable to determine a compatible waveformData format'));
    return;
  }
  try {
    var createdWaveformData = WaveformData.create(data);
    if (createdWaveformData.channels !== 1 && createdWaveformData.channels !== 2) {
      callback(new Error('Peaks.init(): Only mono or stereo waveforms are currently supported'));
      return;
    } else if (createdWaveformData.bits !== 8) {
      callback(new Error('Peaks.init(): 16-bit waveform data is not supported'));
      return;
    }
    callback(null, createdWaveformData);
  } catch (err) {
    callback(err);
  }
};

/**
 * Creates waveform data using the Web Audio API.
 *
 * @private
 * @param {Object} options
 * @param {AudioContext} options.audioContext
 * @param {HTMLMediaElement} options.mediaElement
 * @param {WaveformBuilderInitCallback} callback
 */

WaveformBuilder.prototype._buildWaveformDataUsingWebAudio = function (options, callback) {
  var self = this;
  var audioContext = window.AudioContext || window.webkitAudioContext;
  if (!(options.webAudio.audioContext instanceof audioContext)) {
    // eslint-disable-next-line max-len
    callback(new TypeError('Peaks.init(): The webAudio.audioContext option must be a valid AudioContext'));
    return;
  }
  var webAudioOptions = options.webAudio;
  if (webAudioOptions.scale !== options.zoomLevels[0]) {
    webAudioOptions.scale = options.zoomLevels[0];
  }

  // If the media element has already selected which source to play, its
  // currentSrc attribute will contain the source media URL. Otherwise,
  // we wait for a canplay event to tell us when the media is ready.

  var mediaSourceUrl = self._peaks.options.mediaElement.currentSrc;
  if (mediaSourceUrl) {
    self._requestAudioAndBuildWaveformData(mediaSourceUrl, webAudioOptions, options.withCredentials, callback);
  } else {
    self._peaks.once('player.canplay', function () {
      self._requestAudioAndBuildWaveformData(self._peaks.options.mediaElement.currentSrc, webAudioOptions, options.withCredentials, callback);
    });
  }
};
WaveformBuilder.prototype._buildWaveformDataFromAudioBuffer = function (options, callback) {
  var webAudioOptions = options.webAudio;
  if (webAudioOptions.scale !== options.zoomLevels[0]) {
    webAudioOptions.scale = options.zoomLevels[0];
  }
  var webAudioBuilderOptions = {
    audio_buffer: webAudioOptions.audioBuffer,
    split_channels: webAudioOptions.multiChannel,
    scale: webAudioOptions.scale,
    disable_worker: true
  };
  WaveformData.createFromAudio(webAudioBuilderOptions, callback);
};

/**
 * Fetches the audio content, based on the given options, and creates waveform
 * data using the Web Audio API.
 *
 * @private
 * @param {url} The media source URL
 * @param {WaveformBuilderWebAudioOptions} webAudio
 * @param {Boolean} withCredentials
 * @param {WaveformBuilderInitCallback} callback
 */

WaveformBuilder.prototype._requestAudioAndBuildWaveformData = function (url, webAudio, withCredentials, callback) {
  var self = this;
  if (!url) {
    self._peaks._logger('Peaks.init(): The mediaElement src is invalid');
    return;
  }
  self._xhr = self._createXHR(url, 'arraybuffer', withCredentials, function (event) {
    if (this.readyState !== 4) {
      return;
    }
    if (this.status !== 200) {
      callback(new Error('Unable to fetch remote data. HTTP status ' + this.status));
      return;
    }
    self._xhr = null;
    var webAudioBuilderOptions = {
      audio_context: webAudio.audioContext,
      array_buffer: event.target.response,
      split_channels: webAudio.multiChannel,
      scale: webAudio.scale
    };
    WaveformData.createFromAudio(webAudioBuilderOptions, callback);
  }, function () {
    callback(new Error('XHR failed'));
  }, function () {
    callback(new Error('XHR aborted'));
  });
  self._xhr.send();
};
WaveformBuilder.prototype.abort = function () {
  if (this._xhr) {
    this._xhr.abort();
  }
};

/**
 * @private
 * @param {String} url
 * @param {String} requestType
 * @param {Boolean} withCredentials
 * @param {Function} onLoad
 * @param {Function} onError
 *
 * @returns {XMLHttpRequest}
 */

WaveformBuilder.prototype._createXHR = function (url, requestType, withCredentials, onLoad, onError, onAbort) {
  var xhr = new XMLHttpRequest();

  // open an XHR request to the data source file
  xhr.open('GET', url, true);
  if (isXhr2) {
    try {
      xhr.responseType = requestType;
    } catch (e) {
      // Some browsers like Safari 6 do handle XHR2 but not the json
      // response type, doing only a try/catch fails in IE9
    }
  }
  xhr.onload = onLoad;
  xhr.onerror = onError;
  if (isXhr2 && withCredentials) {
    xhr.withCredentials = true;
  }
  xhr.addEventListener('abort', onAbort);
  return xhr;
};

/**
 * @file
 *
 * Defines the {@link Peaks} class.
 *
 * @module main
 */

/**
 * Initialises a new Peaks instance with default option settings.
 *
 * @class
 * @alias Peaks
 *
 * @param {Object} opts Configuration options
 */

function Peaks() {
  EventEmitter.call(this);

  // Set default options
  this.options = {
    zoomLevels: [512, 1024, 2048, 4096],
    waveformCache: true,
    mediaElement: null,
    mediaUrl: null,
    dataUri: null,
    withCredentials: false,
    waveformData: null,
    webAudio: null,
    nudgeIncrement: 1.0,
    pointMarkerColor: '#39cccc',
    createSegmentMarker: createSegmentMarker,
    createSegmentLabel: createSegmentLabel,
    createPointMarker: createPointMarker,
    // eslint-disable-next-line no-console
    logger: console.error.bind(console)
  };
  return this;
}
Peaks.prototype = Object.create(EventEmitter.prototype);
var defaultViewOptions = {
  playheadColor: '#111111',
  playheadTextColor: '#aaaaaa',
  playheadBackgroundColor: 'transparent',
  playheadPadding: 2,
  axisGridlineColor: '#cccccc',
  showAxisLabels: true,
  axisTopMarkerHeight: 10,
  axisBottomMarkerHeight: 10,
  axisLabelColor: '#aaaaaa',
  fontFamily: 'sans-serif',
  fontSize: 11,
  fontStyle: 'normal',
  timeLabelPrecision: 2,
  enablePoints: true,
  enableSegments: true
};
var defaultZoomviewOptions = {
  // showPlayheadTime:    true,
  playheadClickTolerance: 3,
  waveformColor: 'rgba(0, 225, 128, 1)',
  wheelMode: 'none',
  autoScroll: true,
  autoScrollOffset: 100,
  enableEditing: true
};
var defaultOverviewOptions = {
  // showPlayheadTime:    false,
  waveformColor: 'rgba(0, 0, 0, 0.2)',
  highlightColor: '#aaaaaa',
  highlightStrokeColor: 'transparent',
  highlightOpacity: 0.3,
  highlightOffset: 11,
  highlightCornerRadius: 2,
  enableEditing: false
};
var defaultSegmentOptions = {
  overlay: false,
  markers: true,
  startMarkerColor: '#aaaaaa',
  endMarkerColor: '#aaaaaa',
  waveformColor: '#0074d9',
  overlayColor: '#ff0000',
  overlayOpacity: 0.3,
  overlayBorderColor: '#ff0000',
  overlayBorderWidth: 2,
  overlayCornerRadius: 5,
  overlayOffset: 25,
  overlayLabelAlign: 'left',
  overlayLabelVerticalAlign: 'top',
  overlayLabelPadding: 8,
  overlayLabelColor: '#000000',
  overlayFontFamily: 'sans-serif',
  overlayFontSize: 12,
  overlayFontStyle: 'normal'
};
var defaultScrollbarOptions = {
  color: '#888888',
  minWidth: 50
};
function getOverviewOptions(opts) {
  var overviewOptions = {};
  if (opts.overview && opts.overview.showPlayheadTime) {
    overviewOptions.showPlayheadTime = opts.overview.showPlayheadTime;
  }
  var optNames = ['container', 'waveformColor', 'playedWaveformColor', 'playheadColor', 'playheadTextColor', 'playheadBackgroundColor', 'playheadPadding', 'formatPlayheadTime', 'timeLabelPrecision', 'axisGridlineColor', 'showAxisLabels', 'axisTopMarkerHeight', 'axisBottomMarkerHeight', 'axisLabelColor', 'formatAxisTime', 'fontFamily', 'fontSize', 'fontStyle', 'highlightColor', 'highlightStrokeColor', 'highlightOpacity', 'highlightCornerRadius', 'highlightOffset', 'enablePoints', 'enableSegments', 'enableEditing'];
  optNames.forEach(function (optName) {
    if (opts.overview && objectHasProperty(opts.overview, optName)) {
      overviewOptions[optName] = opts.overview[optName];
    } else if (objectHasProperty(opts, optName)) {
      overviewOptions[optName] = opts[optName];
    } else if (!objectHasProperty(overviewOptions, optName)) {
      if (objectHasProperty(defaultOverviewOptions, optName)) {
        overviewOptions[optName] = defaultOverviewOptions[optName];
      } else if (objectHasProperty(defaultViewOptions, optName)) {
        overviewOptions[optName] = defaultViewOptions[optName];
      }
    }
  });
  return overviewOptions;
}
function getZoomviewOptions(opts) {
  var zoomviewOptions = {};
  if (opts.showPlayheadTime) {
    zoomviewOptions.showPlayheadTime = opts.showPlayheadTime;
  } else if (opts.zoomview && opts.zoomview.showPlayheadTime) {
    zoomviewOptions.showPlayheadTime = opts.zoomview.showPlayheadTime;
  }
  var optNames = ['container', 'waveformColor', 'playedWaveformColor', 'playheadColor', 'playheadTextColor', 'playheadBackgroundColor', 'playheadPadding', 'formatPlayheadTime', 'playheadClickTolerance', 'timeLabelPrecision', 'axisGridlineColor', 'showAxisLabels', 'axisTopMarkerHeight', 'axisBottomMarkerHeight', 'axisLabelColor', 'formatAxisTime', 'fontFamily', 'fontSize', 'fontStyle', 'wheelMode', 'autoScroll', 'autoScrollOffset', 'enablePoints', 'enableSegments', 'enableEditing'];
  optNames.forEach(function (optName) {
    if (opts.zoomview && objectHasProperty(opts.zoomview, optName)) {
      zoomviewOptions[optName] = opts.zoomview[optName];
    } else if (objectHasProperty(opts, optName)) {
      zoomviewOptions[optName] = opts[optName];
    } else if (!objectHasProperty(zoomviewOptions, optName)) {
      if (objectHasProperty(defaultZoomviewOptions, optName)) {
        zoomviewOptions[optName] = defaultZoomviewOptions[optName];
      } else if (objectHasProperty(defaultViewOptions, optName)) {
        zoomviewOptions[optName] = defaultViewOptions[optName];
      }
    }
  });
  return zoomviewOptions;
}
function getScrollbarOptions(opts) {
  if (!objectHasProperty(opts, 'scrollbar')) {
    return null;
  }
  var scrollbarOptions = {};
  var optNames = ['container', 'color', 'minWidth'];
  optNames.forEach(function (optName) {
    if (objectHasProperty(opts.scrollbar, optName)) {
      scrollbarOptions[optName] = opts.scrollbar[optName];
    } else {
      scrollbarOptions[optName] = defaultScrollbarOptions[optName];
    }
  });
  return scrollbarOptions;
}
function extendOptions(to, from) {
  for (var key in from) {
    if (objectHasProperty(from, key) && objectHasProperty(to, key)) {
      to[key] = from[key];
    }
  }
  return to;
}
function addSegmentOptions(options, opts) {
  options.segmentOptions = {};
  extend(options.segmentOptions, defaultSegmentOptions);
  if (opts.segmentOptions) {
    extendOptions(options.segmentOptions, opts.segmentOptions);
  }
  options.zoomview.segmentOptions = {};
  extend(options.zoomview.segmentOptions, options.segmentOptions);
  if (opts.zoomview && opts.zoomview.segmentOptions) {
    extendOptions(options.zoomview.segmentOptions, opts.zoomview.segmentOptions);
  }
  options.overview.segmentOptions = {};
  extend(options.overview.segmentOptions, options.segmentOptions);
  if (opts.overview && opts.overview.segmentOptions) {
    extendOptions(options.overview.segmentOptions, opts.overview.segmentOptions);
  }
}
function checkContainerElements(options) {
  var zoomviewContainer = options.zoomview.container;
  var overviewContainer = options.overview.container;
  if (!isHTMLElement(zoomviewContainer) && !isHTMLElement(overviewContainer)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): The zoomview and/or overview container options must be valid HTML elements');
  }
  if (zoomviewContainer && (zoomviewContainer.clientWidth <= 0 || zoomviewContainer.clientHeight <= 0)) {
    // eslint-disable-next-line max-len
    return new Error('Peaks.init(): The zoomview container must be visible and have non-zero width and height');
  }
  if (overviewContainer && (overviewContainer.clientWidth <= 0 || overviewContainer.clientHeight <= 0)) {
    // eslint-disable-next-line max-len
    return new Error('Peaks.init(): The overview container must be visible and have non-zero width and height');
  }
}

/**
 * Creates and initialises a new Peaks instance with the given options.
 *
 * @param {Object} opts Configuration options
 *
 * @return {Peaks}
 */

Peaks.init = function (opts, callback) {
  var instance = new Peaks();
  var err = instance._setOptions(opts);
  if (err) {
    callback(err);
    return;
  }
  err = checkContainerElements(instance.options);
  if (err) {
    callback(err);
    return;
  }
  var scrollbarContainer = null;
  if (instance.options.scrollbar) {
    scrollbarContainer = instance.options.scrollbar.container;
    if (!isHTMLElement(scrollbarContainer)) {
      // eslint-disable-next-line max-len
      callback(new TypeError('Peaks.init(): The scrollbar container option must be a valid HTML element'));
      return;
    }
    if (scrollbarContainer.clientWidth <= 0) {
      // eslint-disable-next-line max-len
      callback(new TypeError('Peaks.init(): The scrollbar container must be visible and have non-zero width'));
      return;
    }
  }
  if (opts.keyboard) {
    instance._keyboardHandler = new KeyboardHandler(instance);
  }
  var player = opts.player ? opts.player : new MediaElementPlayer(instance.options.mediaElement);
  instance.player = new Player(instance, player);
  instance.segments = new WaveformSegments(instance);
  instance.points = new WaveformPoints(instance);
  instance.zoom = new ZoomController(instance, instance.options.zoomLevels);
  instance.views = new ViewController(instance);

  // Setup the UI components
  instance._waveformBuilder = new WaveformBuilder(instance);
  instance.player.init(instance).then(function () {
    instance._waveformBuilder.init(instance.options, function (err, waveformData) {
      if (err) {
        if (callback) {
          callback(err);
        }
        return;
      }
      err = checkContainerElements(instance.options);
      if (err) {
        if (callback) {
          callback(err);
        }
        return;
      }
      instance._waveformBuilder = null;
      instance._waveformData = waveformData;
      var zoomviewContainer = instance.options.zoomview.container;
      var overviewContainer = instance.options.overview.container;
      if (overviewContainer) {
        instance.views.createOverview(overviewContainer);
      }
      if (zoomviewContainer) {
        instance.views.createZoomview(zoomviewContainer);
      }
      if (scrollbarContainer) {
        instance.views.createScrollbar(scrollbarContainer);
      }
      if (opts.segments) {
        instance.segments.add(opts.segments);
      }
      if (opts.points) {
        instance.points.add(opts.points);
      }
      if (opts.emitCueEvents) {
        instance._cueEmitter = new CueEmitter(instance);
      }

      // Allow applications to attach event handlers before emitting events,
      // when initialising with local waveform data.

      setTimeout(function () {
        instance.emit('peaks.ready');
      }, 0);
      callback(null, instance);
    });
  }).catch(function (err) {
    if (callback) {
      callback(err);
    }
  });
  return instance;
};
Peaks.prototype._setOptions = function (opts) {
  if (!isObject(opts)) {
    return new TypeError('Peaks.init(): The options parameter should be an object');
  }
  if (!opts.player) {
    if (!opts.mediaElement) {
      return new Error('Peaks.init(): Missing mediaElement option');
    }
    if (!(opts.mediaElement instanceof HTMLMediaElement)) {
      // eslint-disable-next-line max-len
      return new TypeError('Peaks.init(): The mediaElement option should be an HTMLMediaElement');
    }
  }
  if (opts.logger && !isFunction(opts.logger)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): The logger option should be a function');
  }
  if (opts.segments && !Array.isArray(opts.segments)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): options.segments must be an array of segment objects');
  }
  if (opts.points && !Array.isArray(opts.points)) {
    // eslint-disable-next-line max-len
    return new TypeError('Peaks.init(): options.points must be an array of point objects');
  }
  extendOptions(this.options, opts);
  this.options.overview = getOverviewOptions(opts);
  this.options.zoomview = getZoomviewOptions(opts);
  this.options.scrollbar = getScrollbarOptions(opts);
  addSegmentOptions(this.options, opts);
  if (!Array.isArray(this.options.zoomLevels)) {
    return new TypeError('Peaks.init(): The zoomLevels option should be an array');
  } else if (this.options.zoomLevels.length === 0) {
    return new Error('Peaks.init(): The zoomLevels array must not be empty');
  } else {
    if (!isInAscendingOrder(this.options.zoomLevels)) {
      return new Error('Peaks.init(): The zoomLevels array must be sorted in ascending order');
    }
  }
  this._logger = this.options.logger;
};

/**
 * Remote waveform data options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} RemoteWaveformDataOptions
 * @global
 * @property {String=} arraybuffer
 * @property {String=} json
 */

/**
 * Local waveform data options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} LocalWaveformDataOptions
 * @global
 * @property {ArrayBuffer=} arraybuffer
 * @property {Object=} json
 */

/**
 * Web Audio options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} WebAudioOptions
 * @global
 * @property {AudioContext=} audioContext
 * @property {AudioBuffer=} audioBuffer
 * @property {Number=} scale
 * @property {Boolean=} multiChannel
 */

/**
 * Options for [Peaks.setSource]{@link Peaks#setSource}.
 *
 * @typedef {Object} PeaksSetSourceOptions
 * @global
 * @property {String=} mediaUrl
 * @property {RemoteWaveformDataOptions=} dataUri
 * @property {LocalWaveformDataOptions=} waveformData
 * @property {WebAudioOptions=} webAudio
 * @property {Boolean=} withCredentials
 * @property {Array<Number>=} zoomLevels
 */

/**
 * Changes the audio or video media source associated with the {@link Peaks}
 * instance.
 *
 * @see SetSourceHandler
 *
 * @param {PeaksSetSourceOptions} options
 * @param {Function} callback
 */

Peaks.prototype.setSource = function (options, callback) {
  var self = this;
  self.player._setSource(options).then(function () {
    if (!options.zoomLevels) {
      options.zoomLevels = self.options.zoomLevels;
    }
    self._waveformBuilder = new WaveformBuilder(self);
    self._waveformBuilder.init(options, function (err, waveformData) {
      if (err) {
        callback(err);
        return;
      }
      self._waveformBuilder = null;
      self._waveformData = waveformData;
      ['overview', 'zoomview'].forEach(function (viewName) {
        var view = self.views.getView(viewName);
        if (view) {
          view.setWaveformData(waveformData);
        }
      });
      self.zoom.setZoomLevels(options.zoomLevels);
      callback();
    });
  }).catch(function (err) {
    callback(err);
  });
};
Peaks.prototype.getWaveformData = function () {
  return this._waveformData;
};

/**
 * Cleans up a Peaks instance after use.
 */

Peaks.prototype.destroy = function () {
  if (this._waveformBuilder) {
    this._waveformBuilder.abort();
  }
  if (this._keyboardHandler) {
    this._keyboardHandler.destroy();
  }
  if (this.views) {
    this.views.destroy();
  }
  if (this.player) {
    this.player.destroy();
  }
  if (this._cueEmitter) {
    this._cueEmitter.destroy();
  }
};

export { Peaks as default };
