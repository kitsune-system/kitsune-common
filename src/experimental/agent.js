import { Pipe, noOp } from '@gamedevfox/katana';

export const Agent = () => {
  const [resolve, onResolve] = Pipe();

  const pulls = {};

  const pull = ({ input: systemId, onOutput, onRelease, onError }) => {
    if(typeof onRelease !== 'function')
      onError({ type: 'onReleaseUndefined' });

    if(systemId in pulls)
      onError({ type: 'systemCurrentlyPulled', systemId });

    pulls[systemId] = onRelease;
    resolve({ input: systemId, onOutput, onError });
  };

  const [agentRelease, onRelease] = Pipe();
  onRelease(noOp);
  const release = systemId => {
    agentRelease(systemId);

    const onRelease = pulls[systemId];
    onRelease();

    delete pulls[systemId];
  };

  return {
    pull, release,
    onRelease, onResolve,
  };
};
