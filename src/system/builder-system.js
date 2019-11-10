import { noOp } from '@gamedevfox/katana';

import { Collector } from '../collector';
import { SUPPORTS_COMMAND } from '../index';

export const value = v => ({ fn: () => (_, output) => output(v) });

export const BuilderSystem = config => {
  let building = [];
  const values = {};

  const isBuilding = systemId => building.some(id => id === systemId);

  const supportsCommand = (systemId, output = noOp) => {
    output(systemId === SUPPORTS_COMMAND || systemId in config);
  };

  const builderSystem = (systemId, output = noOp) => {
    if(systemId === SUPPORTS_COMMAND) {
      output(supportsCommand);
      return;
    }

    if(!(systemId in config))
      throw new Error(`No BuilderSystem config found for id: ${systemId}`);

    const { fn, bind = {}, inject = {} } = config[systemId];
    if(!fn)
      throw new Error(`\`fn\` is not defined for system: ${systemId}`);

    if(isBuilding(systemId)) {
      building.push(systemId);
      const errorMsg = 'Circular dependancy detected. To resolve this, wait ' +
        'to call the dependant system after parent function is built: ' +
        building.join(' -> ');
      building = [];
      throw new Error(errorMsg);
    }

    building.push(systemId);
    const collectDeps = Collector();

    // Collector from bind
    Object.entries(bind).forEach(([name, depSystemId]) => {
      const collect = collectDeps(name);

      if(isBuilding(depSystemId)) {
        // Handle circular dependancies
        let deferredSystem = false;
        collect((input, output = noOp) => {
          if(deferredSystem)
            deferredSystem(input, output);
          else {
            builderSystem.source(depSystemId, system => {
              deferredSystem = system;
              deferredSystem(input, output);
            });
          }
        });
      } else
        builderSystem.source(depSystemId, collect);
    });

    // Collector from inject
    Object.entries(inject).forEach(([name, systemId]) => {
      const collect = collectDeps(name);

      if(systemId in values)
        collect(values[systemId]);
      else {
        builderSystem.source(systemId, system => system(null, value => {
          values[systemId] = value;
          collect(value);
        }));
      }
    });

    // Build
    collectDeps(deps => {
      const system = fn(deps);
      building.pop();

      output(system);
    });
  };

  builderSystem.source = builderSystem;

  return builderSystem;
};
