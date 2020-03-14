import { expect } from 'chai';

import { chain } from '../chain';
import { ListCollector } from '../collector';
import { hashEdge, pseudoRandom } from '../hash';
import { RANDOM } from '../index';

import { MemoryGraph } from './memory-graph';

describe('MemoryGraph', () => {
  it('should work', done => {
    const random = pseudoRandom(RANDOM);
    const nodes = [];
    for(let i = 0; i < 5; i++)
      nodes.push(random());

    const graph = MemoryGraph();
    graph.onHashEdge(hashEdge);

    const collect = ListCollector();

    for(let i = 0; i < 20; i++) {
      const head = nodes[i % 5];
      const tail = nodes[Math.floor(i * 13 / 7) % 5];

      const edge = [head, tail];
      graph.write({ input: edge, onOutput: collect() });
    }

    chain(
      ({ onOutput }) => collect.done(onOutput),
      ({ onOutput }) => graph.count({ onOutput }),
      ({ input: count, onOutput }) => {
        count.should.equal(16);

        graph.heads({ input: nodes[0], onOutput });
      },
      ({ input: heads, onOutput }) => {
        heads.should.have.members([nodes[0], nodes[3], nodes[1], nodes[4]]);

        graph.heads({ input: nodes[1], onOutput });
      },
      ({ input: tails, onOutput }) => {
        tails.should.have.members([nodes[1], nodes[4], nodes[2]]);

        const edgeId = hashEdge([nodes[2], nodes[3]]);
        graph.erase({ input: edgeId, onOutput });
      },
      ({ input: erasedEdge, onOutput }) => {
        erasedEdge.should.deep.equal([nodes[2], nodes[3]]);

        graph.count({ onOutput });
      },
      ({ input: count, onOutput }) => {
        count.should.equal(15);

        graph.read({ input: RANDOM, onOutput });
      },
      ({ input: missingEdge }) => {
        expect(missingEdge).to.be.undefined;
        done();
      },
    );
  });
});
