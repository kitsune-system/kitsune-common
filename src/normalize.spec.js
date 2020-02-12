import { expect } from 'chai';

import { fromCallbacks, returnValue, toCallbacks } from './normalize';

describe('normalize', () => {
  it('returnValue', () => {
    const original = input => {
      return (input * 10) + input;
    };

    const newFn = returnValue(original);
    newFn({
      input: 123,
      onOutput: value => {
        value.should.equal(1353);
      },
    });
  });

  it('fromCallbacks', () => {
    const original = (input, onOutput) => {
      const result = (input * 10) + input;
      onOutput(result);
    };

    const newFn = fromCallbacks(original);
    newFn({
      input: 123,
      onOutput: value => {
        value.should.equal(1353);
      },
    });
  });

  it('fromCallbacks with onError', () => {
    const original = (input, onOutput, onError) => {
      if(input < 10)
        onError({ tooSmall: true, input });
      else if(input > 1000)
        onError({ tooLarge: true, input });
      else {
        const result = (input * 10) + input;
        onOutput(result);
      }
    };

    const newFn = fromCallbacks(original);
    newFn({
      input: 5,
      onOutput: () => {
        throw new Error('Shouldn\'t succeed');
      },
      onError: error => {
        error.should.deep.equal({ tooSmall: true, input: 5 });
      },
    });

    newFn({
      input: 123,
      onOutput: value => {
        value.should.equal(1353);
      },
      onError: () => {
        throw new Error('Shouldn\'t throw');
      },
    });

    newFn({
      input: 1005,
      onOutput: () => {
        throw new Error('Shouldn\'t succeed');
      },
      onError: error => {
        error.should.deep.equal({ tooLarge: true, input: 1005 });
      },
    });
  });

  it('toCallbacks', () => {
    const fn = ({ input, onOutput, onError }) => {
      if(input > 100)
        onError({ tooLarge: true, input });
      else
        onOutput((input * 1000) + 123);
    };

    const newFn = toCallbacks(fn);

    newFn(45,
      value => {
        value.should.equal(45123);
      },
      () => {
        throw new Error('Shouldn\'t throw');
      },
    );

    newFn(456,
      () => {
        throw new Error('Shouldn\'t succeed');
      },
      error => {
        error.should.deep.equal({ tooLarge: true, input: 456 });
      },
    );

    expect(() => {
      newFn(12);
    }).to.throw('onOutput is not a function');

    expect(() => {
      newFn(123, () => {});
    }).to.throw('onError is not a function');
  });
});
