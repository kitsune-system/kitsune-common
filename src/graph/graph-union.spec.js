import { chain } from '../chain';
import { ListCollector } from '../collector';
import { hashEdge, pseudoRandom } from '../hash';
import { RANDOM } from '../index';

import { GraphUnion } from './graph-union';
import { MemoryGraph } from './memory-graph';

describe('GraphUnion', () => {
  it('should work', () => {
    const random = pseudoRandom(RANDOM);
    const nodes = [];
    for(let i = 0; i < 7; i++)
      nodes.push(random());

    const graphA = MemoryGraph();
    graphA.onHashEdge(hashEdge);

    const graphB = MemoryGraph();
    graphB.onHashEdge(hashEdge);

    const graphC = MemoryGraph();
    graphC.onHashEdge(hashEdge);

    const union = GraphUnion([graphA, graphB, graphC]);

    const collect = ListCollector();
    graphA.write({ input: [nodes[1], nodes[2]], onOutput: collect() });
    graphA.write({ input: [nodes[3], nodes[4]], onOutput: collect() });
    graphA.write({ input: [nodes[5], nodes[6]], onOutput: collect() });

    graphB.write({ input: [nodes[1], nodes[3]], onOutput: collect() });
    graphB.write({ input: [nodes[5], nodes[6]], onOutput: collect() });

    graphC.write({ input: [nodes[1], nodes[4]], onOutput: collect() });

    chain(
      ({ onOutput }) => collect.done(onOutput),
      ({ onOutput }) => {
        const id = hashEdge([nodes[1], nodes[4]]);

        const collect = ListCollector();
        union.read({ input: id, onOutput: collect() });

        union.heads({ input: nodes[4], onOutput: collect() });
        union.tails({ input: nodes[1], onOutput: collect() });

        collect.done(onOutput);
      },
      ({ input: [a, b, c] }) => {
        a.should.have.members([nodes[1], nodes[4]]);

        b.should.have.members([nodes[1], nodes[3]]);
        c.should.have.members([nodes[2], nodes[3], nodes[4]]);
      },
    );
  });
});
