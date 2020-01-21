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

  const result = (...args) => {
    pendingCount++;

    return value => {
      completeCount++;

      if(args.length) {
        const [name] = args;
        values[name] = value;
      }

      checkValues();
    };
  };

  result.done = fn => {
    fns.push(fn);
    checkValues();
  };

  return result;
};
