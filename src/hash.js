import sha3 from 'js-sha3';
import { EDGE, STRING } from './index';

const sha256 = sha3.sha3_256;

export const hashList = list => {
  const hash = sha256.create();
  list.forEach(item => {
    const buffer = Buffer.from(item, 'base64');
    hash.update(buffer);
  });
  return Buffer.from(hash.buffer()).toString('base64');
};

// =============================================================================

export const hashString = string => hashList([STRING, Buffer.from(string, 'utf8').toString('base64')]);

const headTailCheck = fn => (...args) => {
  if(args.length !== 2)
    throw new Error('HashEdge must take 2 arguments');

  const [head, tail] = args;

  if(!(head && tail)) {
    throw new Error(
      `\`head\` and \`tail\` must be set: { head: ${head}, tail: ${tail} }`
    );
  }

  return fn(head, tail);
};

export const edgeMap = {};
export const hashEdge = headTailCheck((head, tail) => {
  const edge = hashList([EDGE, head, tail]);
  edgeMap[edge] = [head, tail];
  return edge;
});

export const deepHashEdge = headTailCheck((head, tail) => {
  if(Array.isArray(head))
    head = deepHashEdge(...head);
  if(Array.isArray(tail))
    tail = deepHashEdge(...tail);

  return hashEdge(head, tail);
});

export const pseudoRandom = seed => {
  let hash = seed;
  return () => {
    hash = hashList([hash]);
    return hash;
  };
};
