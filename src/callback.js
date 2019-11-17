export const Callback = () => {
  let value;
  let fn;

  let hasValue = false;

  const check = () => {
    if(!(hasValue && fn))
      return;

    const callback = fn;
    fn = null;

    callback(value);
  };

  const result = arg => {
    if(hasValue)
      throw new Error(`Callback was called multiple times: ${arg}`);

    value = arg;
    hasValue = true;
    check();
  };

  result.done = doneFn => {
    result.done = () => {
      throw new Error('Cannot set callback multiple times');
    };

    fn = doneFn;
    check();
  };

  return result;
};
