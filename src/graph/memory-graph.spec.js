import { expect } from 'chai';

import { RANDOM } from '../index';
import { hashEdge, pseudoRandom } from '../hash';

import { MemoryGraph } from './memory-graph';

it('MemoryGraph', () => {
  const random = pseudoRandom(RANDOM);
  const nodes = [];
  for(let i = 0; i < 5; i++)
    nodes.push(random());

  const graph = MemoryGraph();
  graph.bindHashEdge(hashEdge);

  for(let i = 0; i < 20; i++) {
    const head = nodes[i % 5];
    const tail = nodes[Math.floor(i * 13 / 7) % 5];

    const edge = [head, tail];
    graph.write(edge);
  }

  graph.count().should.equal(16);

  const edge = graph.list()[2];
  edge.should.deep.equal([nodes[2], nodes[3]]);

  const id = hashEdge(edge);
  graph.read(id).should.deep.equal(edge);

  Array.from(graph.heads(nodes[0]))
    .should.have.members([nodes[0], nodes[3], nodes[1], nodes[4]]);
  Array.from(graph.heads(nodes[1]))
    .should.have.members([nodes[1], nodes[4], nodes[2]]);

  const removedEdge = graph.erase(id);
  removedEdge.should.deep.equal([nodes[2], nodes[3]]);

  graph.count().should.equal(15);

  expect(graph.read(RANDOM)).to.be.undefined;
});
