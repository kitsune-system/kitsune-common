import { Pipe } from '@gamedevfox/katana';

export const PartialCollector = () => {
  const [collect, onCollect] = Pipe();
  const [getValue, onGetValue] = Pipe();

  let fns = [];
  let pendingCount = 0;
  let completeCount = 0;

  const checkValues = () => {
    if(fns.length !== 0 && pendingCount !== 0 && completeCount === pendingCount) {
      fns.forEach(fn => fn(getValue()));
      fns = [];
    }
  };

  const result = earlyName => {
    pendingCount++;

    return (...args) => {
      completeCount++;

      let name, value;
      if(args.length === 2)
        [name, value] = args;
      else if(args.length === 1)
        [value] = args;

      if(name === undefined)
        name = earlyName;

      collect(name, value);

      checkValues();
    };
  };

  result.done = fn => {
    fns.push(fn);
    checkValues();
  };

  result.onCollect = onCollect;
  result.onGetValue = onGetValue;

  return result;
};

export const Collector = () => {
  const values = {};

  const result = PartialCollector();
  result.onCollect((name, value) => {
    if(name !== undefined)
      values[name] = value;
  });
  result.onGetValue(() => values);

  return result;
};

export const ListCollector = () => {
  const values = [];

  const result = PartialCollector();
  result.onCollect((_, value) => {
    values.push(value);
  });
  result.onGetValue(() => values);

  return result;
};
