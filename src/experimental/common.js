export const GenericCutoff = ({ fn, cutOffFn }) => {
  let cutOff = false;

  const result = (...args) => {
    if(cutOff)
      return cutOffFn(fn, args);

    return fn(...args);
  };

  result.cutOff = () => (cutOff = true);

  return result;
};

export const NoOpCutoff = fn => GenericCutoff({ fn, cutOffFn: (fn, args) => {
  console.log('CUT OFF', fn, args);
} });

export const ExceptionCutoff = fn => GenericCutoff({ fn, cutOffFn: (fn, args) => {
  const error = new Error('Calling system that was cut off');
  error.fn = fn;
  error.args = args;

  throw error;
} });
