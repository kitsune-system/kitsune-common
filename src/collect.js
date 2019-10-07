export const Collect = () => {
  const values = {};

  let fns = [];
  let valueCount = 0;

  const checkValues = () => {
    if(Object.keys(values).length === valueCount) {
      fns.forEach(fn => fn(values));
      fns = [];
    }
  };

  const result = arg => {
    if(typeof arg === 'function') {
      fns.push(arg);
      checkValues();
    } else {
      valueCount++;
      return value => {
        values[arg] = value;
        checkValues();
      };
    }
  };

  return result;
};
