import { Bucket } from './bucket';
import { ListCollector } from './collector';
import { Switch } from './switch';

const predicates = {
  even: ({ input, onOutput }) => onOutput(input !== null && input % 2 === 0),
  negative: ({ input, onOutput }) => onOutput(input < 0),
  small: ({ input, onOutput }) => onOutput(input > 0 && input < 10),
  large: ({ input, onOutput }) => onOutput(input >= 10),
  positive: ({ input, onOutput }) => onOutput(input > 0),
};

describe('Switch', () => {
  it('should work', done => {
    const sw = Switch();

    const open = ({ onOutput }) => {
      sw.open({ onOutput: id => {
        sw.getConditionId({ input: id, onOutput: conditionId => {
          const output = sw[id];
          const condition = sw[conditionId];

          onOutput({ onOutput: output, onCondition: condition });
        } });
      } });
    };

    const buckets = { default: Bucket() };
    const collect = ListCollector();

    const predicateNames = Object.keys(predicates);
    predicateNames.forEach(name => {
      const openC = collect();

      open({ onOutput: ({ onOutput, onCondition }) => {
        const predicate = predicates[name];

        const bucket = Bucket();
        buckets[name] = bucket;

        onOutput(bucket);
        onCondition(predicate);

        openC();
      } });
    });

    collect.done(() => {
      // FIXME: Implement this
      sw.onDefault(buckets.default);

      sw.input('missing');

      for(let i = -5; i < 15; i++)
        sw.input(i);

      sw.input('another one');

      buckets.even.empty().should.deep.equal([-4, -2, 0, 2, 4, 6, 8, 10, 12, 14]);
      buckets.negative.empty().should.deep.equal([-5, -4, -3, -2, -1]);
      buckets.small.empty().should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      buckets.large.empty().should.deep.equal([10, 11, 12, 13, 14]);
      buckets.positive.empty().should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
      buckets.default.empty().should.deep.equal(['missing', 'another one']);

      done();
    });
  });
});
