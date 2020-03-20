import { Pipe } from './pipe';

export const Valve = () => {
  const [output, onOutput] = Pipe();

  let isOpen = false;

  const result = value => {
    if(isOpen)
      output(value);
  };

  result.open = value => (isOpen = value);

  result.onOutput = onOutput;
  return result;
};
