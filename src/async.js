import { Pipe } from './pipe';

export const Async = () => {
  const [output, onOutput] = Pipe();

  const input = (...args) => {
    setTimeout(() => {
      output(...args);
    }, 0);
  };

  return { input, onOutput };
};
