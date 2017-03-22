import peek from '../../src/peek';
import { identity } from 'ramda';

/* eslint-disable no-console */

describe('peek', () => {
  beforeEach(() => {
    spy(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('reveals a function\'s secrets', () => {
    const _identity = peek(identity, 'identity');
    _identity(1, 2, 3);
    expect(console.log).to.have.been.calledWith('identity(1, 2, 3)');
    expect(console.log).to.have.been.calledWith(' -> 1');
  });

});
