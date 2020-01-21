const mergeCall = (graphs, fnName) => id => {
  const result = new Set();
  graphs.forEach(graph => {
    graph[fnName](id).forEach(node => result.add(node));
  });
  return result;
};

export const GraphUnion = graphs => {
  const union = {};

  union.read = id => {
    let result;

    for(const graph of graphs) {
      const edge = graph.read(id);
      if(edge) {
        result = edge;
        break;
      }
    }

    return result;
  };

  union.heads = mergeCall(graphs, 'heads');
  union.tails = mergeCall(graphs, 'tails');

  return union;
};
