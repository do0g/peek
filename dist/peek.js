'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tweak = undefined;

var _ramda = require('ramda');

var isFunction = function isFunction(fn) {
  return typeof fn === 'function';
};
var isPlaceHolder = function isPlaceHolder(fn) {
  return !!fn['@@functional/placeholder'];
};

var tweak = function tweak() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var _options$formatters = options.formatters,
      formatters = _options$formatters === undefined ? [] : _options$formatters;

  var tappedFunctions = [];
  var _tap = (0, _ramda.curry)(function (fn) {
    tappedFunctions.push(fn);
    return fn;
  });

  var _isTapped = function _isTapped(fn) {
    return tappedFunctions.indexOf(fn) !== -1;
  };

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

  var getFunctionName = first([function (fn) {
    return isPlaceHolder(fn) ? '__' : undefined;
  }, _getFunctionName, (0, _ramda.prop)('name'), (0, _ramda.always)('anonymous')], notNilOrEmpty);

  //const logVal = f => tap(v => console.log(`${f}${typeOf(v)} ${v}`));
  var formatArg = (0, _ramda.cond)((0, _ramda.concat)(formatters, [[isPlaceHolder, (0, _ramda.always)('__')], [isFunction, (0, _ramda.pipe)(getFunctionName, function (name) {
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

  // for some reason map is dropping placeholders from the argument list,
  // so this ensures they're preserved
  var mapUnless = function mapUnless(unlessFn, fn, list) {
    var length = list.length;
    var results = [];
    for (var idx = 0; idx < length; idx++) {
      results[idx] = unlessFn(list[idx]) ? list[idx] : fn(list[idx]);
    }
    return results;
  };

  var maybePeek = (0, _ramda.cond)([[isPlaceHolder, _ramda.identity], [isFunction, function (fn) {
    return peek(fn);
  }], [(0, _ramda.is)(Array), function (list) {
    return mapUnless(isPlaceHolder, maybePeek, list);
  }], [_ramda.T, _ramda.identity]]);

  var maybeName = function maybeName(name, maybeFn) {
    return typeof maybeFn === 'function' ? _setFunctionName(maybeFn, name) : maybeFn;
  };

  var indent = -2;
  var peek = function peek(fn, name) {
    if (typeof fn !== 'function') {
      throw new Error('What choo talkin\' \'bout, Willis?');
    }
    if (_isTapped(fn)) {
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
        //console.log(`tappedArgs: ${JSON.stringify(tappedArgs)}`);
        var formattedFunction = formatFunction(fn, args);
        log(' '.repeat(indent) + formattedFunction);
        var result = fn.apply(fn, tappedArgs);
        //const result = fn(...tappedArgs);
        //console.log(`result: ${result}`);
        var maybePeeked = maybePeek(maybeName(formattedFunction, result));
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
    _tap(f);
    return f;
  };
  return peek;
};

var peek = tweak();

exports.default = peek;
exports.tweak = tweak;
//# sourceMappingURL=peek.js.map