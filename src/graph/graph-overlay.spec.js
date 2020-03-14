import { chain } from '../chain';
import { ListCollector } from '../collector';
import { hashEdge, pseudoRandom } from '../hash';
import { RANDOM } from '../index';

import { GraphOverlay } from './graph-overlay';
import { MemoryGraph } from './memory-graph';

describe('GraphOverlay', () => {
  it('should work', done => {
    const random = pseudoRandom(RANDOM);
    const nodes = [];
    for(let i = 0; i < 10; i++)
      nodes.push(random());

    const baseGraph = MemoryGraph();
    baseGraph.onHashEdge(hashEdge);

    const graph = GraphOverlay(baseGraph);

    const baseEdgesC = ListCollector();
    baseGraph.write({ input: [nodes[1], nodes[2]], onOutput: baseEdgesC() });
    baseGraph.write({ input: [nodes[1], nodes[3]], onOutput: baseEdgesC() });
    baseGraph.write({ input: [nodes[4], nodes[5]], onOutput: baseEdgesC() });
    baseGraph.write({ input: [nodes[6], nodes[7]], onOutput: baseEdgesC() });

    chain(
      ({ onOutput }) => baseEdgesC.done(onOutput),
      ({ onOutput }) => {
        const resultC = ListCollector();
        baseGraph.heads({ input: nodes[5], onOutput: resultC() });
        baseGraph.tails({ input: nodes[1], onOutput: resultC() });

        graph.heads({ input: nodes[5], onOutput: resultC() });
        graph.tails({ input: nodes[1], onOutput: resultC() });

        resultC.done(onOutput);
      },
      ({ input: [a, b, c, d], onOutput }) => {
        a.should.deep.equal([nodes[4]]);
        b.should.deep.equal([nodes[2], nodes[3]]);

        c.should.deep.equal([nodes[4]]);
        d.should.deep.equal([nodes[2], nodes[3]]);

        graph.write({ input: [nodes[1], nodes[9]], onOutput });
      },
      ({ onOutput }) => {
        const collect = ListCollector();

        baseGraph.tails({ input: nodes[1], onOutput: collect() });
        graph.tails({ input: nodes[1], onOutput: collect() });

        collect.done(onOutput);
      },
      ({ input: [a, b], onOutput }) => {
        a.should.have.members([nodes[2], nodes[3]]);
        b.should.have.members([nodes[2], nodes[3], nodes[9]]);

        const idToErase = hashEdge([nodes[1], nodes[2]]);
        graph.erase({ input: idToErase, onOutput });
      },
      ({ onOutput }) => {
        const collect = ListCollector();

        baseGraph.tails({ input: nodes[1], onOutput: collect() });
        graph.tails({ input: nodes[1], onOutput: collect() });

        collect.done(onOutput);
      },
      ({ input: [a, b] }) => {
        a.should.have.members([nodes[2], nodes[3]]);
        b.should.have.members([nodes[3], nodes[9]]);

        done();
      },
    );
  });
});
