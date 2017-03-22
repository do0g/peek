import chai       from 'chai';
import sinon      from 'sinon';
import sinonChai  from 'sinon-chai';
import chaiThings from 'chai-things';

global.chai   = chai;
global.sinon  = sinon;
global.expect = chai.expect;

global.chai.use(sinonChai);
global.chai.use(chaiThings);

beforeEach(function() {
  global.sandbox               = sinon.sandbox.create();
  global.stub                  = sandbox.stub.bind(sandbox);
  global.spy                   = sandbox.spy.bind(sandbox);
  global.mock                  = sandbox.mock.bind(sandbox);
  global.useFakeTimers         = sandbox.useFakeTimers.bind(sandbox);
  global.useFakeXMLHttpRequest = sandbox.useFakeXMLHttpRequest.bind(sandbox);
  global.useFakeServer         = sandbox.useFakeServer.bind(sandbox);
});

afterEach(function() {
  delete global.stub;
  delete global.spy;
  global.sandbox.restore();
});
