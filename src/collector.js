export const Collector = () => {
  const values = {};

  let fns = [];
  let pendingCount = 0;
  let completeCount = 0;

  const checkValues = () => {
    if(fns.length !== 0 && pendingCount !== 0 && completeCount === pendingCount) {
      fns.forEach(fn => fn(values));
      fns = [];
    }
  };

  const result = arg => {
    pendingCount++;
    return value => {
      completeCount++;

      if(arg)
        values[arg] = value;

      checkValues();
    };
  };

  result.done = fn => {
    fns.push(fn);
    checkValues();
  };

  return result;
};
