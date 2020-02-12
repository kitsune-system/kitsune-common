import { hash, pseudoRandom } from '../hash';
import { RANDOM } from '../index';

import { GraphUnion } from './graph-union';
import { MemoryGraph } from './memory-graph';

it('GraphUnion', () => {
  const random = pseudoRandom(RANDOM);
  const nodes = [];
  for(let i = 0; i < 7; i++)
    nodes.push(random());

  const graphA = MemoryGraph();
  graphA.onHashEdge(hash.edge);

  graphA.write([nodes[1], nodes[2]]);
  graphA.write([nodes[3], nodes[4]]);
  graphA.write([nodes[5], nodes[6]]);

  const graphB = MemoryGraph();
  graphB.onHashEdge(hash.edge);

  graphB.write([nodes[1], nodes[3]]);
  graphB.write([nodes[5], nodes[6]]);

  const graphC = MemoryGraph();
  graphC.onHashEdge(hash.edge);

  graphC.write([nodes[1], nodes[4]]);

  const union = GraphUnion([graphA, graphB, graphC]);

  const id = hash.edge([nodes[1], nodes[4]]);
  union.read(id).should.deep.equal([nodes[1], nodes[4]]);

  Array.from(union.heads(nodes[4]))
    .should.have.members([nodes[1], nodes[3]]);
  Array.from(union.tails(nodes[1]))
    .should.have.members([nodes[2], nodes[3], nodes[4]]);
});
