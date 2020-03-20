export const Pipe = () => {
  let target = null;

  const active = (...args) => {
    if(!target)
      throw new Error('No target to call for this pipe');

    return target(...args);
  };

  const passive = (...args) => {
    const argCount = args.length;
    if(argCount > 1)
      throw new Error(`Too many arguments, expected 0 or 1, got: ${argCount}`);

    // Get target
    if(argCount === 0)
      return target;

    // Set target
    const [fn] = args;
    const type = typeof fn;
    if(fn && type !== 'function')
      throw new Error(`Target must be a function or falsey, instead was: ${type}`);

    target = fn;
  };

  return [active, passive];
};
