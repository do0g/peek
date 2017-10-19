import { concat, join, is, always, curry, anyPass, isNil, complement, prop, isEmpty, head, tail, cond, pipe, map, T } from 'ramda';

const typeOf = obj => (
  {}.toString.call(obj)
    .split(' ')[1]
    .slice(0, -1)
    .toLowerCase()
);
const isFunction = fn => typeOf(fn) === 'function';
const isPlaceHolder = fn => fn && fn['@@functional/placeholder'];
const identity = id => id;

const tweak = (options = {}) => {
  const { formatters = [] } = options;
  const peekedFunctions = [];
  const registerPeeked = curry(fn => {
    peekedFunctions.push(fn);
    return fn;
  });

  const _isPeeked = fn => peekedFunctions.indexOf(fn) !== -1;

  const functionNames = new Map();
  const _setFunctionName = curry((fn, name) => {
    functionNames.set(fn, name);
    return fn;
  });

  const _getFunctionName = fn => functionNames.get(fn);

  const isNilOrEmpty = anyPass([isNil, isEmpty]);
  const notNilOrEmpty = complement(isNilOrEmpty);

  const first = (list, pred = notNilOrEmpty) => (...args) => {
    if (isNilOrEmpty(list)) return;
    const fn = head(list);
    const res = fn(...args);
    return pred(res) ? res : first(tail(list), pred)(...args);
  };

  const getFunctionName = first([
    _getFunctionName,
    prop('name'),
    always('anonymous')
  ], notNilOrEmpty);

  const defaultFormatters = [
    [isPlaceHolder, () => '__'],
    [isFunction, getFunctionName],
    [is(Array), pipe(map(formatArg), vals => `[${join(', ', vals)}]`)],
    [anyPass([isNil, is(Object)]), typeOf],
    [is(String), val => `'${val}'`],
    [T, identity]
  ];

  //const logVal = f => tap(v => console.log(`${f}${typeOf(v)} ${v}`));
  const formatArg = cond(concat(formatters, defaultFormatters));
  const formatReturnValue = val => val ? `${formatArg(val)}` : '';
  const formatFunction = (fn, args, result) => `${getFunctionName(fn)}(${pipe(map(formatArg), join(', '))(args)})${formatReturnValue(result)}`;

  //const logIndent = curry((indent, val) => log(`${indent}${val}`));
  const log = (...args) => console.log(...args); // eslint-disable-line no-console
  //const error = (...args) => console.error(...args); // eslint-disable-line no-console

  const maybePeek = cond([
    [isPlaceHolder, identity],
    [isFunction, fn => peek(fn)],
    [is(Array), list => map(maybePeek, list)],
    [T, identity]
  ]);

  const maybeName = (name, maybeFn) => typeOf(maybeFn) === 'function' ? _setFunctionName(maybeFn, name) : maybeFn;

  let indent = -2;
  const peek = (fn, name) => {
    if (typeOf(fn) !== 'function') {
      throw new Error('What choo talkin\' \'bout, Willis?');
    }
    if (_isPeeked(fn)) {
      return fn;
    }
    if (name) {
      _setFunctionName(fn, name);
    }

    const f = (...args) => {
      try {
        indent += 2;
        const peekedArgs = maybePeek(args);
        //console.log(`peekedArgs: ${JSON.stringify(peekedArgs)}`);
        const formattedFunction = formatFunction(fn, args);
        log(' '.repeat(indent) + formattedFunction);
        const result = fn.apply(fn, peekedArgs);
        //const result = fn(...peekedArgs);
        //console.log(`result: ${result}`);
        const maybePeeked = maybePeek(maybeName(formattedFunction, result));
        log(`${' '.repeat(indent)} -> ${formatArg(maybePeeked)}`);
        return maybePeeked;
      } catch (err) {
        log(`${' '.repeat(indent)} (ノಠ益ಠ)ノ彡${err}`);
        throw err;
      } finally {
        indent -= 2;
      }
    };
    _setFunctionName(f, _getFunctionName(fn));
    registerPeeked(f);
    return f;
  };
  return peek;
};

const peek = tweak();

export default peek;
export {tweak};
