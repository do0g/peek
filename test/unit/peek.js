import peek, {tweak} from '../../src/peek';
import { is, identity, curry } from 'ramda';

/* eslint-disable no-console */

const swapProp = curry((obj, prop, swapWithThis, thenFn) => {
  const wasFn = obj[prop];
  obj[prop] = swapWithThis;
  try {
    thenFn();
  } catch (err) {
    throw err;
  } finally {
    obj[prop] = wasFn;
  }
});

describe('peek', () => {
  let consoleLogSpy;
  let suppressConsoleLog;
  beforeEach(() => {
    consoleLogSpy = spy();
    suppressConsoleLog = swapProp(console, 'log', consoleLogSpy);
  });

  it('reveals a function\'s secrets', () => {
    const _identity = peek(identity, 'identity');
    suppressConsoleLog(() => _identity(1, 2, 3));
    expect(consoleLogSpy).to.have.been.calledWith('identity(1, 2, 3)');
    expect(consoleLogSpy).to.have.been.calledWith(' -> 1');
  });

  it('flips out', () => {
    const throwsFoo = peek(() => { throw new Error('foo'); }, 'throwsFoo');
    expect(() => suppressConsoleLog(() => throwsFoo())).to.throw(Error);
    expect(consoleLogSpy).to.have.been.calledWith('throwsFoo()');
    expect(consoleLogSpy).to.have.been.calledWith(' (ノಠ益ಠ)ノ彡Error: foo');
  });

  it('is tasty with curry', () => {
    const add = peek(lhs => rhs => lhs + rhs, 'add');
    suppressConsoleLog(() => {
      const addOne = add(1);
      addOne(2);
    });
    expect(consoleLogSpy).to.have.been.calledWith('add(1)');
    expect(consoleLogSpy).to.have.been.calledWith(' -> add(1)');
    expect(consoleLogSpy).to.have.been.calledWith('add(1)(2)');
    expect(consoleLogSpy).to.have.been.calledWith(' -> 3');
  });

  it('can override formatters', () => {
    const strinigfyPeek = tweak({
      formatters: [[is(Object), JSON.stringify.bind(JSON)]]
    });
    const _identity = strinigfyPeek(identity, 'identity');
    suppressConsoleLog(() => _identity({ foo: 'bar' }));
    expect(consoleLogSpy).to.have.been.calledWith('identity({"foo":"bar"})');
    expect(consoleLogSpy).to.have.been.calledWith(' -> {"foo":"bar"}');
  });
});
