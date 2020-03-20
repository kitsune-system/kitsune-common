import { Pipe } from '../pipe';

export const MEMORY_GRAPH = 'Znsysq0ax3+FSmgiIQtRd8xb+wVQGBv24bv1U2dXyXs=';
export const MemoryGraph = () => {
  const [hashEdge, onHashEdge] = Pipe();

  let count = 0;

  const edgeMap = {};
  const headMap = {};
  const tailMap = {};

  const write = ({ input: edge, onOutput }) => {
    const [head, tail] = edge;

    const id = hashEdge([head, tail]);
    if(edgeMap[id]) {
      onOutput(id);
      return;
    }

    edgeMap[id] = edge;

    const headIdx = headMap[head] || new Set();
    headIdx.add(tail);
    headMap[head] = headIdx;

    const tailIdx = tailMap[tail] || new Set();
    tailIdx.add(head);
    tailMap[tail] = tailIdx;

    count++;

    onOutput(id);
  };

  const read = ({ input: id, onOutput }) => onOutput(edgeMap[id]);

  const erase = ({ input: id, onOutput }) => {
    if(!edgeMap[id]) {
      onOutput(undefined);
      return;
    }

    const [head, tail] = edgeMap[id];
    delete edgeMap[id];

    headMap[head].delete(tail);
    tailMap[tail].delete(head);

    count--;

    onOutput([head, tail]);
  };

  const heads = ({ input: tail, onOutput }) => {
    const set = tailMap[tail];
    const result = set ? Array.from(set) : [];
    onOutput(result);
  };

  const tails = ({ input: head, onOutput }) => {
    const set = headMap[head];
    const result = set ? Array.from(set) : [];
    onOutput(result);
  };

  const countFn = ({ onOutput }) => onOutput(count);
  const list = ({ onOutput }) => onOutput(Object.values(edgeMap));

  return {
    read, write, erase, heads, tails, count: countFn, list,
    onHashEdge,
  };
};
