import { Pipe } from '../pipe';

export const DuplexPair = () => {
  const [sendA, onMessageB] = Pipe();
  const [sendB, onMessageA] = Pipe();

  const duplexA = { send: sendA, onMessage: onMessageA };
  const duplexB = { send: sendB, onMessage: onMessageB };

  return [duplexA, duplexB];
};
