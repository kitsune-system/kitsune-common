import { Pipe } from './pipe';

export const Split = () => {
  let count = 0;
  const outputs = new Map();

  const system = {};

  const input = value => {
    if(outputs.size === 0)
      throw new Error('No outputs on this split');

    outputs.forEach(output => output(value));
  };

  const open = ({ onOutput }) => {
    const id = `onOutput${++count}`;
    const [fireOutput, output] = Pipe();

    outputs.set(id, fireOutput);
    system[id] = output;

    onOutput(id);
  };

  const close = id => {
    outputs.delete(id);
    delete system[id];
  };

  system.input = input;
  system.open = open;
  system.close = close;

  return system;
};
