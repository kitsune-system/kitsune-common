import { Pipe, noOpWithCB, split } from '@gamedevfox/katana';

import { ExceptionCutoff } from './common';

// FIXME: Other names - Agent
export const Broker = () => {
  const [getSystem, bindGetSystem] = Pipe();
  const [getSystemWithPullId, bindGetSystemWithPullId] = Pipe();
  const [fireRelease, onReleaseBase] = Pipe();

  bindGetSystem(noOpWithCB);
  bindGetSystemWithPullId(noOpWithCB);

  const onRelease = split(onReleaseBase);

  let pullCount = 0;
  const pulls = {};

  const pullWithId = (systemId, cb) => {
    const pullId = ++pullCount;

    const complete = system => {
      const cutOffSystem = ExceptionCutoff(system);
      pulls[pullId] = cutOffSystem;

      cutOffSystem.id = systemId;
      cutOffSystem.pullId = pullId;

      cb([cutOffSystem, pullId]);
    };

    getSystemWithPullId([systemId, pullId], system => {
      if(system)
        complete(system);
      else
        getSystem(systemId, complete);
    });
  };

  const pull = (systemId, cb) => pullWithId(systemId, ([system]) => cb(system));

  const release = pullId => {
    fireRelease(pullId);

    const system = pulls[pullId];
    system.cutOff();
  };

  return {
    pull, pullWithId, release, // input
    onRelease, // output
    bindGetSystem, bindGetSystemWithPullId, // bind
  };
};
