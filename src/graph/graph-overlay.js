import { hash } from '../hash';

import { MemoryGraph } from './memory-graph';

export const GraphOverlay = baseGraph => {
  const writeGraph = MemoryGraph();
  writeGraph.bindHashEdge(hash.edge);
  const eraseGraph = MemoryGraph();
  eraseGraph.bindHashEdge(hash.edge);

  const graph = {};

  graph.write = edge => {
    const id = hash.edge(edge);

    eraseGraph.erase(id);
    writeGraph.write(edge);

    return id;
  };

  graph.erase = id => {
    const edge = graph.read(id);

    writeGraph.erase(id);
    eraseGraph.write(edge);

    return edge;
  };

  graph.read = id => {
    let edge = writeGraph.read(id);
    if(!edge) {
      if(eraseGraph.read(id))
        return undefined;

      edge = baseGraph.read(id);
    }

    return edge;
  };

  const metaOp = opName => node => {
    const nodes = baseGraph[opName](node);
    eraseGraph[opName](node).forEach(n => nodes.delete(n));
    writeGraph[opName](node).forEach(n => nodes.add(n));
    return nodes;
  };

  graph.heads = metaOp('heads');
  graph.tails = metaOp('tails');

  return graph;
};
