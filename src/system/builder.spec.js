import { Radix, alphaLower, namedCopies } from '@gamedevfox/katana';

import { Callback } from '../callback';
import { newHashEdge } from '../hash';
import { MemoryGraph } from '../graph/memory-graph';
import { toAsync } from '../util';

import { Builder } from './builder';

const MY_COUNTER_OUT = 'bonMFnCr5fa7Yhi7/cMIfu4QDLT88Wx0e5iMbbAHYpI=';

const buildFns = {
  COUNTER: () => {
    let count = 0;
    const tick = () => {
      return count++;
    };

    return { COUNTER_OUT: tick };
  },
};

const tests = () => {
  describe('Builder', () => {
    it('should work', done => {
      const cb = namedCopies(3, Radix(alphaLower), () => Callback());

      const graph = getGraph();
      const builder = getBuilder(graph);

      builder.build(MY_COUNTER_OUT, cb.a, e => {
        throw e;
      });

      cb.a.done(tick => {
        tick().should.equal(0);
        tick().should.equal(1);
        tick().should.equal(2);

        builder.build(MY_COUNTER_OUT, cb.b, e => {
          throw e;
        });
      });

      cb.b.done(tick => {
        tick().should.equal(3);
        tick().should.equal(4);
        tick().should.equal(5);

        builder.destroy(MY_COUNTER_OUT);

        setTimeout(() => {
          // eslint-disable-next-line max-nested-callbacks
          builder.build(MY_COUNTER_OUT, cb.c, e => {
            throw e;
          });
        }, 0);
      });

      cb.c.done(tick => {
        tick().should.equal(0);
        tick().should.equal(1);
        tick().should.equal(2);

        done();
      });
    });
  });
};

const getGraph = () => {
  const graph = MemoryGraph();
  graph.hashEdge(newHashEdge);

  [
    // SYSTEM_FAMILY >> SYSTEM
    ['COUNTER', 'COUNTER_OUT'],
    ['COUNTER', 'COUNTER_IN'],

    // SYSTEM_FAMILY_INST >> SYSTEM_FAMILY
    ['MY_COUNTER', 'COUNTER'],

    // SYSTEM >> SYSTEM_FAMILY_INST
    // -or-
    // SYSTEM_INST
    ['COUNTER_OUT', 'MY_COUNTER'],
  ].map(graph.write);

  return graph;
};

const getBuilder = graph => {
  const builder = Builder();

  builder.readBuildFn((id, output) => {
    const buildFn = buildFns[id];
    output(buildFn);
  });
  builder.readEdge(toAsync(graph.read));
  builder.readSystemFamilyId((systemFamilyInstId, output) => {
    const nodes = Array.from(graph.tails(systemFamilyInstId));
    output(nodes[0]);
  });
  builder.writeEdge(toAsync(graph.write));

  return builder;
};

tests();
