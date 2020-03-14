import { hashEdge } from '../hash';

import { MemoryGraph } from './memory-graph';
import { ListCollector } from '../collector';

export const GraphOverlay = baseGraph => {
  const writeGraph = MemoryGraph();
  writeGraph.onHashEdge(hashEdge);
  const eraseGraph = MemoryGraph();
  eraseGraph.onHashEdge(hashEdge);

  const graph = {};

  graph.write = ({ input: edge, onOutput }) => {
    const id = hashEdge(edge);

    const collect = ListCollector();
    eraseGraph.erase({ input: id, onOutput: collect() });
    writeGraph.write({ input: edge, onOutput: collect() });

    collect.done(() => onOutput(id));
  };

  graph.erase = ({ input: id, onOutput }) => {
    graph.read({ input: id, onOutput: edge => {
      const collect = ListCollector();
      writeGraph.erase({ input: id, onOutput: collect() });
      eraseGraph.write({ input: edge, onOutput: collect() });

      collect.done(() => onOutput(edge));
    } });
  };

  graph.read = ({ input: id, onOutput }) => {
    writeGraph.read({ input: id, onOutput: edge => {
      if(edge) {
        onOutput(edge);
        return;
      }

      eraseGraph.read({ input: id, onOutput: edge => {
        if(edge) {
          onOutput(undefined);
          return;
        }

        baseGraph.read({ input: id, onOutput });
      } });
    } });
  };

  const metaOp = opName => ({ input: id, onOutput }) => {
    baseGraph[opName]({ input: id, onOutput: nodeList => {
      const nodeSet = new Set(nodeList);

      const collect = ListCollector();

      const eraseC = collect();
      eraseGraph[opName]({ input: id, onOutput: result => {
        result.forEach(n => nodeSet.delete(n));
        eraseC();
      } });

      const writeC = collect();
      writeGraph[opName]({ input: id, onOutput: result => {
        result.forEach(n => nodeSet.add(n));
        writeC();
      } });

      collect.done(() => onOutput(Array.from(nodeSet)));
    } });
  };

  graph.heads = metaOp('heads');
  graph.tails = metaOp('tails');

  return graph;
};
