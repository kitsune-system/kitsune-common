import { expect } from 'chai';
import { fake } from 'sinon';

import { Pipe } from './pipe';

describe('Pipe', () => {
  it('should work', () => {
    const fakeA = fake();
    const fakeB = fake();

    const [input, output] = Pipe();

    expect(() => {
      input(1);
    }).to.throw('No target to call for this pipe');

    output(fakeA);
    input(2);

    output(fakeB);
    input(3);

    output(null);

    expect(() => {
      input(4);
    }).to.throw('No target to call for this pipe');

    fakeA.args.should.deep.equal([[2]]);
    fakeB.args.should.deep.equal([[3]]);
  });

  it('should work the other way too', () => {
    const fakeA = fake();
    const fakeB = fake();
    const fakeC = fake();

    const [output, input] = Pipe();

    expect(() => {
      output(fakeA);
    }).to.throw('No target to call for this pipe');

    let count = 10;
    input(fn => fn(count--));

    for(let i = 0; i < 5; i++)
      output(fakeB);

    input((value, fn) => fn(value * value));

    for(let i = 0; i < 5; i++)
      output(i, fakeC);

    fakeA.args.should.deep.equal([]);
    fakeB.args.should.deep.equal([[10], [9], [8], [7], [6]]);
    fakeC.args.should.deep.equal([[0], [1], [4], [9], [16]]);
  });

  it('output pattern', () => {
    const [outputA, output] = Pipe();

    // External
    let x;
    output(value => (x = value * 2));

    // Internal
    outputA(50);

    // Validation
    x.should.equal(100);
  });

  it('input push pattern', () => {
    const [input, inputP] = Pipe();

    // Internal
    let num;
    inputP(value => (num = value + 456));

    // External
    input(123);

    // Validation
    num.should.equal(579);
  });

  it('input pull pattern', () => {
    const [inputA, input] = Pipe();

    const MAP = {
      a: 'apple',
      b: 'banana',
      c: 'coconut',
    };

    // External
    input((id, output) => output(MAP[id]));

    // Internal
    let fruit;
    inputA('b', value => (fruit = value));

    // Validation
    fruit.should.equal('banana');
  });
});
