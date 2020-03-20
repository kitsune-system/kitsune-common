import { Layers, connect } from './layers';

describe('Layers', () => {
  it('should work', () => {
    const resultA = [];
    const resultB = [];
    const defaultResults = [];

    const layers = Layers();
    layers.onDefault(value => defaultResults.push(value));

    connect(layers, ({ input, onOutput }) => {
      // Only handle even numbers
      if(input % 2 === 0) {
        resultA.push(input + 100);
        onOutput(true);
      } else
        onOutput(false);
    });

    connect(layers, ({ input, onOutput }) => {
      // Only handle even numbers
      if(input % 2 === 1) {
        resultB.push(input * 5);
        onOutput(true);
      } else
        onOutput(false);
    });

    for(let i = 0; i < 5; i += 0.5)
      layers.input(i);

    resultA.should.deep.equal([100, 102, 104]);
    resultB.should.deep.equal([5, 15]);
    defaultResults.should.deep.equal([0.5, 1.5, 2.5, 3.5, 4.5]);
  });
});
