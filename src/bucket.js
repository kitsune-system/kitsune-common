export const Bucket = () => {
  const contents = [];

  const result = value => contents.push(value);
  result.empty = () => contents.splice(0, contents.length);

  return result;
};
