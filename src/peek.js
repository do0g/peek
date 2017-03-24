import { concat, flip, when, join, is, always, curry, anyPass, isNil, complement, prop, isEmpty, head, tail, cond, pipe, map, identity, T } from 'ramda';

const tweak = (options = {}) => {
  const { serialisers = [] } = options;
  const functionNames = new Map();
  const _setFunctionName = curry((fn, name) => {
    functionNames.set(fn, name);
    return fn;
  });

  const _getFunctionName = fn => functionNames.get(fn);

  const isNilOrEmpty = anyPass([isNil, isEmpty]);
  const typeOf = obj => (
    {}.toString.call(obj)
      .split(' ')[1]
      .slice(0, -1)
      .toLowerCase()
  );
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

  //const logVal = f => tap(v => console.log(`${f}${typeOf(v)} ${v}`));
  const formatArg = cond(concat(serialisers, [
    [is(Function), pipe(getFunctionName, name => `${name}`)],
    [is(Array), pipe(map(v => formatArg(v)), vals => `[${join(', ', vals)}]`)],
    [anyPass([isNil, is(Object)]), typeOf],
    [is(String), val => `'${val}'`],
    [T, identity]
  ]));
  const formatReturnValue = val => val ? `${formatArg(val)}` : '';
  const formatFunction = (fn, args, result) => `${getFunctionName(fn)}(${pipe(map(formatArg), join(', '))(args)})${formatReturnValue(result)}`;

  //const logIndent = curry((indent, val) => log(`${indent}${val}`));
  const log = (...args) => console.log(...args); // eslint-disable-line no-console
  //const error = (...args) => console.error(...args); // eslint-disable-line no-console

  const maybePeek = cond([
    [is(Function), fn => peek(fn)],
    [is(Array), map(fn => maybePeek(fn))],
    [T, identity]
  ]);

  const maybeName = name => when(is(Function), flip(_setFunctionName)(name));

  let indent = -2;
  const peek = (fn, name) => {
    if (fn._tapped) {
      return fn;
    }
    if (name) {
      _setFunctionName(fn, name);
    }

    const f = (...args) => {
      try {
        indent += 2;
        const tappedArgs = maybePeek(args);
        log(' '.repeat(indent) + formatFunction(fn, args));
        const result = fn(...tappedArgs);
        const maybeNamed = maybeName(formatFunction(fn, args))(result);
        const maybePeeked = maybePeek(maybeNamed);
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
    f._tapped = true;
    return f;
  };
  return peek;
};

const peek = tweak();

export default peek;
export {tweak};
