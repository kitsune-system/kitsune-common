import { Pipe } from './pipe';
import { forEach } from './util';

export const Layers = () => {
  let counter = 0;

  const layers = {};
  const system = {};

  const [fireDefault, onDefault] = Pipe();

  const input = value => {
    let foundHit = false;

    forEach(Object.values(layers), ({ input: layer, onStop, onOutput }) => {
      layer({ input: value, onOutput: hit => {
        if(hit) {
          foundHit = true;
          onStop();
        } else
          onOutput();
      } });
    }, () => {
      if(!foundHit)
        fireDefault(value);
    });
  };

  const open = ({ onOutput }) => {
    const id = ++counter;

    const [layer, onLayer] = Pipe();
    layers[id] = layer;
    system[id] = onLayer;

    onOutput(id);
  };

  system.input = input;
  system.open = open;
  system.onDefault = onDefault;

  return system;
};

export const connect = (layers, fn, onOutput = () => {}) => {
  layers.open({ onOutput: id => {
    layers[id](fn);
    onOutput(id);
  } });
};
