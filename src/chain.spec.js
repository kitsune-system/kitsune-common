import { chain } from './chain';

const double = ({ input, onOutput }) => {
  onOutput(input * 2);
};

const over9000 = ({ number, result }) => {
  result(Math.abs(number) + 9001);
};

const increment = ({ input, onOutput }) => {
  onOutput(input + 1);
};

describe('chain', () => {
  it('should work', () => {
    chain(
      ({ onOutput }) => double({ input: 123, onOutput }),
      ({ input, onOutput }) => {
        input.should.equal(246);
        over9000({ number: input, result: onOutput });
      },
      ({ input, onOutput }) => {
        input.should.equal(9247);
        increment({ input, onOutput });
      },
      ({ input }) => {
        input.should.equal(9248);
      },
    );
  });

  it('should work with initial input', () => {
    chain(987,
      ({ input, onOutput }) => {
        input.should.equal(987);
        double({ input, onOutput });
      },
      ({ input, onOutput }) => {
        input.should.equal(1974);
        over9000({ number: input, result: onOutput });
      },
      ({ input, onOutput }) => {
        input.should.equal(10975);
        increment({ input, onOutput });
      },
      ({ input }) => {
        input.should.equal(10976);
      },
    );
  });
});
