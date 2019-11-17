import { expect } from 'chai';

import { Callback } from './callback';

describe('Callback', () => {
  it('should work if value is set first', done => {
    const cb = Callback();

    cb(123);

    cb.done(x => {
      x.should.equal(123);
      done();
    });
  });

  it('should work if callback is set first', done => {
    const cb = Callback();

    cb.done(x => {
      x.should.equal(123);
      done();
    });

    cb(123);
  });

  it('should only trigger the callback once', () => {
    const cb = Callback();

    cb.done(x => {
      x.should.equal(123);
    });

    cb(123);

    expect(() => {
      cb(456);
    }).to.throw('Callback was called multiple times: 456');

    expect(() => {
      cb.done(() => {});
    }).to.throw('Cannot set callback multiple times');
  });
});
