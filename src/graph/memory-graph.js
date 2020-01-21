import { Pipe } from '@gamedevfox/katana';

export const MemoryGraph = () => {
  const [hashEdge, bindHashEdge] = Pipe();

  let count = 0;

  const edgeMap = {};
  const headMap = {};
  const tailMap = {};

  const write = edge => {
    const [head, tail] = edge;

    const id = hashEdge([head, tail]);
    if(edgeMap[id])
      return id;

    edgeMap[id] = edge;

    const headIdx = headMap[head] || new Set();
    headIdx.add(tail);
    headMap[head] = headIdx;

    const tailIdx = tailMap[tail] || new Set();
    tailIdx.add(head);
    tailMap[tail] = tailIdx;

    count++;

    return id;
  };

  const read = id => edgeMap[id];

  const erase = id => {
    if(!edgeMap[id])
      return undefined;

    const [head, tail] = edgeMap[id];
    delete edgeMap[id];

    delete headMap[head][tail];
    delete tailMap[tail][head];

    count--;

    return [head, tail];
  };

  const heads = tail => {
    const set = tailMap[tail];
    return set ? new Set(set) : new Set();
  };

  const tails = head => {
    const set = headMap[head];
    return set ? new Set(set) : new Set();
  };

  const countFn = () => count;
  const list = () => Object.values(edgeMap);

  return {
    bindHashEdge, // Inputs
    read, write, erase, heads, tails, count: countFn, list, // Outputs
  };
};
