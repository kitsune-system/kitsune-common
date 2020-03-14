import { forEach, loop } from './util';

describe('loop', () => {
  it('should work', done => {
    let count = 0;
    const result = [];
    const myFn = ({ onOutput, onStop }) => {
      count += 2;
      result.push(count);

      count < 10 ? onOutput() : onStop();
    };

    loop(myFn, () => {
      result.should.deep.equal([2, 4, 6, 8, 10]);
      done();
    });
  });
});

describe('forEach', () => {
  it('should work', done => {
    const list = [0, 1, 2, 10, 128, 1024];

    const result = [];
    const myFn = ({ input, onOutput }) => {
      result.push(input * 2);

      if(input % 2 === 0) {
        // Sync Complete
        onOutput();
      } else {
        // Async Complete
        setTimeout(() => onOutput(), 0);
      }
    };

    forEach(list, myFn, () => {
      result.should.deep.equal([0, 2, 4, 20, 256, 2048]);
      done();
    });
  });

  it('should work with onStop', done => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const result = [];
    const myFn = ({ input, onOutput, onStop }) => {
      result.push(input * input);

      if(input < 5)
        onOutput();
      else
        onStop();
    };

    forEach(list, myFn, () => {
      result.should.deep.equal([1, 4, 9, 16, 25]);
      done();
    });
  });
});
