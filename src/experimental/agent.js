import { Pipe, noOp } from '@gamedevfox/katana';

export const Agent = () => {
  const pulls = {};

  const [resolve, onResolve] = Pipe();
  const pull = ({ input: systemId, onOutput, onError }) => {
    if(systemId in pulls)
      onError({ type: 'systemCurrentlyPulled', systemId });

    pulls[systemId] = true;
    resolve({ input: systemId, onOutput, onError });
  };

  const [agentRelease, onRelease] = Pipe();
  onRelease(noOp);

  const release = systemId => {
    agentRelease(systemId);
    delete pulls[systemId];
  };

  return {
    pull, release, onRelease,
    onResolve,
  };
};
