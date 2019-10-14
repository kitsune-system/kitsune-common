import { noOp } from '@gamedevfox/katana';

import { CORE, CORE_SUBSYSTEMS, SUPPORTS_COMMAND } from './index';
import { BuilderSystem } from './system/builder-system';
import { MemoizedSystem } from './system/memoized-system';

export const value = v => ({ fn: () => (_, output) => output(v) });

export const Core = (config, output = noOp) => {
  const root = MemoizedSystem();

  const builderSystem = BuilderSystem(config);
  const coreSubsystems = [builderSystem];

  const systemRouter = (systemId, output = noOp) => {
    // TODO: Refactor the SHIZ out of this
    if(systemId === SUPPORTS_COMMAND) {
      output((systemId, output) => {
        let subsystemIndex = 0;

        const trySubsystem = (systemId, output) => {
          const subsystem = coreSubsystems[subsystemIndex++];

          if(subsystem === undefined) {
            output(false);
            return;
          }

          subsystem(SUPPORTS_COMMAND, supportsCommand => {
            supportsCommand(systemId, isSupported => {
              if(isSupported)
                output(true);
              else
                trySubsystem(systemId, output);
            });
          });
        };

        trySubsystem(systemId, output);
      });
      return;
    }

    let subsystemIndex = 0;

    const trySubsystem = (systemId, output) => {
      const subsystem = coreSubsystems[subsystemIndex++];

      if(subsystem === undefined)
        throw new Error(`System is not supported: ${systemId}`);

      subsystem(SUPPORTS_COMMAND, supportsCommand => {
        supportsCommand(systemId, isSupported => {
          if(isSupported)
            subsystem(systemId, output);
          else
            trySubsystem(systemId, output);
        });
      });
    };

    trySubsystem(systemId, output);
  };

  root.source = systemRouter;

  const coreSystems = {
    [SUPPORTS_COMMAND]: (systemId, output) => {
      if(systemId in coreSystems)
        output(true);
      else {
        root(SUPPORTS_COMMAND, supportsCommand => {
          supportsCommand(systemId, output);
        });
      }
    },
  };

  const core = (systemId, output = noOp) => {
    if(systemId in coreSystems)
      output(coreSystems[systemId]);
    else
      root(systemId, output);
  };

  builderSystem.source = core;

  coreSystems[CORE] = core;

  core(SUPPORTS_COMMAND, supportsCommand => {
    supportsCommand(CORE_SUBSYSTEMS, isSupported => {
      if(!isSupported) {
        output(core);
        return;
      }

      core(CORE_SUBSYSTEMS, subsystemsFn => subsystemsFn(null, subsystems => {
        subsystems.forEach(subsystem => coreSubsystems.push(subsystem));
        output(core);
      }));
    });
  });
};
