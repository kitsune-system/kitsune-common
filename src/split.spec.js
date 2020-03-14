import { expect } from 'chai';

import { Bucket } from './bucket';
import { Split } from './split';

describe('Split', () => {
  it('should work', () => {
    const ids = [];
    const buckets = {};

    const split = Split();

    const open = () => {
      split.open({ onOutput: id => {
        ids.push(id);

        const bucket = Bucket();
        buckets[id] = bucket;

        const output = split[id];
        output(bucket);
      } });
    };

    expect(() => {
      split.input(1);
    }).to.throw('No outputs on this split');

    open();

    split.input(2);
    split.input(3);
    split.input(4);

    open();
    open();

    split.input(5);
    split.input(6);
    split.input(7);

    split.close(ids[1]);

    split.input(8);
    split.input(9);
    split.input(10);

    split.close(ids[0]);
    split.close(ids[2]);

    expect(() => {
      split.input(100);
    }).to.throw('No outputs on this split');

    const values = {};
    Object.entries(buckets).forEach(([key, value]) => {
      values[key] = value.empty();
    });

    values.should.deep.equal({
      [ids[0]]: [2, 3, 4, 5, 6, 7, 8, 9, 10],
      [ids[1]]: [5, 6, 7],
      [ids[2]]: [5, 6, 7, 8, 9, 10],
    });
  });
});
