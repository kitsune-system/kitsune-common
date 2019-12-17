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

export const hashString = string => {
  const stringId = Buffer.from(string, 'utf8').toString('base64');
  return hashList([STRING, stringId]);
};

export const hashEdge = edge => {
  if(edge.length !== 2)
    throw new Error(`\`edge\` must have 2 elements, instead had ${edge.length}: ${JSON.stringify(edge)}`);

  if(!edge.every(node => typeof node === 'string'))
    throw new Error(`Both \`head\` and \`tail\` must be strings: ${JSON.stringify(edge)}`);

  return hashList([EDGE, ...edge]);
};

export const deepHashEdge = (head, tail) => {
  if(Array.isArray(head))
    head = deepHashEdge(...head);
  if(Array.isArray(tail))
    tail = deepHashEdge(...tail);

  return hashEdge([head, tail]);
};

export const pseudoRandom = seed => {
  let hash = seed;
  return () => {
    hash = hashList([hash]);
    return hash;
  };
};
