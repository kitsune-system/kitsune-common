import { loop } from './util';

export const chain = (...args) => {
  let input = null;
  if(typeof args[0] !== 'function')
    input = args.shift();

  const fns = args;
  if(fns.length < 2)
    throw new Error(`Must provide 2 or more functions in chain, only provided ${fns.length}`);

  let index = 0;
  let nextInput = input;
  loop(({ onOutput, onStop }) => {
    if(index >= fns.length) {
      onStop();
      return;
    }

    const fn = fns[index];
    fn({ input: nextInput, onOutput: lastInput => {
      nextInput = lastInput;
      index++;

      onOutput();
    } });
  });
};
