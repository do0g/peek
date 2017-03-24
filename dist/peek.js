'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tweak = undefined;

var _ramda = require('ramda');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var tweak = function tweak() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$serialisers = options.serialisers,
      serialisers = _options$serialisers === undefined ? [] : _options$serialisers;

  var functionNames = new Map();
  var _setFunctionName = (0, _ramda.curry)(function (fn, name) {
    functionNames.set(fn, name);
    return fn;
  });

  var _getFunctionName = function _getFunctionName(fn) {
    return functionNames.get(fn);
  };

  var isNilOrEmpty = (0, _ramda.anyPass)([_ramda.isNil, _ramda.isEmpty]);
  var typeOf = function typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  };
  var notNilOrEmpty = (0, _ramda.complement)(isNilOrEmpty);

  var first = function first(list) {
    var pred = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : notNilOrEmpty;
    return function () {
      if (isNilOrEmpty(list)) return;
      var fn = (0, _ramda.head)(list);
      var res = fn.apply(undefined, arguments);
      return pred(res) ? res : first((0, _ramda.tail)(list), pred).apply(undefined, arguments);
    };
  };

  var getFunctionName = first([_getFunctionName, (0, _ramda.prop)('name'), (0, _ramda.always)('anonymous')], notNilOrEmpty);

  //const logVal = f => tap(v => console.log(`${f}${typeOf(v)} ${v}`));
  var formatArg = (0, _ramda.cond)((0, _ramda.concat)(serialisers, [[(0, _ramda.is)(Function), (0, _ramda.pipe)(getFunctionName, function (name) {
    return '' + name;
  })], [(0, _ramda.is)(Array), (0, _ramda.pipe)((0, _ramda.map)(function (v) {
    return formatArg(v);
  }), function (vals) {
    return '[' + (0, _ramda.join)(', ', vals) + ']';
  })], [(0, _ramda.anyPass)([_ramda.isNil, (0, _ramda.is)(Object)]), typeOf], [(0, _ramda.is)(String), function (val) {
    return '\'' + val + '\'';
  }], [_ramda.T, _ramda.identity]]));
  var formatReturnValue = function formatReturnValue(val) {
    return val ? '' + formatArg(val) : '';
  };
  var formatFunction = function formatFunction(fn, args, result) {
    return getFunctionName(fn) + '(' + (0, _ramda.pipe)((0, _ramda.map)(formatArg), (0, _ramda.join)(', '))(args) + ')' + formatReturnValue(result);
  };

  //const logIndent = curry((indent, val) => log(`${indent}${val}`));
  var log = function log() {
    var _console;

    return (_console = console).log.apply(_console, arguments);
  }; // eslint-disable-line no-console
  //const error = (...args) => console.error(...args); // eslint-disable-line no-console

  var maybePeek = (0, _ramda.cond)([[(0, _ramda.is)(Function), function (fn) {
    return peek(fn);
  }], [(0, _ramda.is)(Array), (0, _ramda.map)(function (fn) {
    return maybePeek(fn);
  })], [_ramda.T, _ramda.identity]]);

  var maybeName = function maybeName(name) {
    return (0, _ramda.when)((0, _ramda.is)(Function), (0, _ramda.flip)(_setFunctionName)(name));
  };

  var indent = -2;
  var peek = function peek(fn, name) {
    if (fn._tapped) {
      return fn;
    }
    if (name) {
      _setFunctionName(fn, name);
    }

    var f = function f() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      try {
        indent += 2;
        var tappedArgs = maybePeek(args);
        log(' '.repeat(indent) + formatFunction(fn, args));
        var result = fn.apply(undefined, _toConsumableArray(tappedArgs));
        var maybeNamed = maybeName(formatFunction(fn, args))(result);
        var maybePeeked = maybePeek(maybeNamed);
        log(' '.repeat(indent) + ' -> ' + formatArg(maybePeeked));
        return maybePeeked;
      } catch (err) {
        log(' '.repeat(indent) + ' (\u30CE\u0CA0\u76CA\u0CA0)\u30CE\u5F61' + err);
        throw err;
      } finally {
        indent -= 2;
      }
    };
    _setFunctionName(f, _getFunctionName(fn));
    f._tapped = true;
    return f;
  };
  return peek;
};

var peek = tweak();

exports.default = peek;
exports.tweak = tweak;
//# sourceMappingURL=peek.js.map