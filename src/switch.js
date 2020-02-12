import { Pipe, noOp } from '@gamedevfox/katana';

export const Switch = () => {
  const [callDefault, onDefault] = Pipe();

  const paths = [];
  let switchValue = null;
  let targets = [callDefault];

  const input = value => targets.forEach(target => {
    target(value);
  });

  const updateTargets = () => {
    const newTargets = paths
      .filter(([fn]) => fn(switchValue))
      .map(([_, input]) => input);

    if(newTargets.length)
      targets = newTargets;
    else
      targets = [callDefault];
  };

  const value = v => {
    switchValue = v;
    updateTargets();
  };

  const path = (fn, out = noOp) => {
    const [input, output] = Pipe();
    paths.push([fn, input]);

    updateTargets();

    out(output);
  };

  return { input, path, value, onDefault };
};
