import { noOp } from '@gamedevfox/katana';

import { SUPPORTS_COMMAND } from '../index';

export const MemoizedSystem = source => {
  const systems = {
    [SUPPORTS_COMMAND]: (systemId, output) => {
      if(systemId in systems)
        output(true);
      else {
        core.source(SUPPORTS_COMMAND, supportsCommand => {
          supportsCommand(systemId, output);
        });
      }
    },
  };

  const core = (systemId, output = noOp) => {
    if(systemId in systems)
      output(systems[systemId]);
    else {
      core.source(systemId, system => {
        systems[systemId] = system;
        output(system);
      });
    }
  };

  core.source = source || (() => {
    throw new Error('Source has not been set for MemoizedSystem');
  });

  return core;
};
