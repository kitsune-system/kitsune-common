export const truncateByte = (value, size) => {
  const mask = Math.pow(2, size) - 1;
  return value & mask;
};

export const ensureBit = (value, bit) => {
  const bitMask = Math.pow(2, bit - 1);
  return value | bitMask;
};

export const capByte = (value, size) => {
  const newByte = truncateByte(value, size);
  return ensureBit(newByte, size);
};

export const markSize = (hash, size) => {
  const firstByte = hash[0];

  const markBit = ((size - 1) % 8) + 1;
  hash[0] = capByte(firstByte, markBit);

  return hash;
};

export const measureSize = hash => {
  if(hash.length === 0)
    return 0;

  const firstByte = hash[0];

  let count = 8;
  while(count) {
    const bitMask = Math.pow(2, count - 1);
    if(firstByte & bitMask)
      break;
    count--;
  }

  return ((hash.length - 1) * 8) + count;
};
