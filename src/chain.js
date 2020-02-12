import { noOp } from '@gamedevfox/katana';

export const chain = (...args) => {
  let input = null;
  if(typeof args[0] !== 'function')
    input = args.shift();

  const fns = args;
  if(fns.length < 2)
    throw new Error(`Must provide 2 or more functions in chain, only provided ${fns.length}`);

  const runFn = (index, input) => {
    const fn = fns[index];

    let onOutput = noOp;
    if(index !== fns.length)
      onOutput = nextInput => runFn(index + 1, nextInput);

    fn({ input, onOutput });
  };

  runFn(0, input);
};
