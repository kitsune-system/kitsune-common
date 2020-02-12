export const Bucket = () => {
  const contents = [];

  const result = (...args) => contents.push(args);

  result.empty = () => contents.splice(0, contents.length).map(value => value[0]);
  result.wideEmpty = () => contents.splice(0, contents.length);

  return result;
};
