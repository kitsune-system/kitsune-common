import { ListCollector } from '../collector';

const mergeCall = (graphs, fnName) => ({ input: id, onOutput }) => {
  const result = new Set();

  const collect = ListCollector();
  graphs.forEach(graph => {
    graph[fnName]({ input: id, onOutput: collect() });
  });

  collect.done(graphResults => {
    graphResults.forEach(nodes => {
      nodes.forEach(node => result.add(node));
    });

    onOutput(Array.from(result));
  });
};

export const GraphUnion = graphs => {
  const union = {};

  union.read = ({ input: id, onOutput }) => {
    let edge;
    const find = value => {
      if(edge)
        return;

      if(value) {
        edge = value;
        onOutput(edge);
      }
    };

    graphs.forEach(graph => graph.read({ input: id, onOutput: find }));
  };

  union.heads = mergeCall(graphs, 'heads');
  union.tails = mergeCall(graphs, 'tails');

  return union;
};
