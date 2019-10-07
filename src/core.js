import { noOp } from '@gamedevfox/katana';

import { Collect } from './collect';
import { CORE, SUPPORTS_COMMAND } from './index';

export const value = v => ({ fn: () => (_, output) => output(v) });

export const Core = (config, output) => {
  const systems = {};
  const values = {};

  const getOrBuildSystem = (systemId, output = noOp) => {
    if(systemId in systems) {
      output(systems[systemId]);
      return;
    }

    if(!(systemId in config))
      throw new Error(`No core config found for id: ${systemId}`);

    const { fn, bind = {}, inject = {} } = config[systemId];
    if(!fn)
      throw new Error(`\`fn\` is not defined for system: ${systemId}`);

    const collectDeps = Collect();

    // Bind
    Object.entries(bind).forEach(([name, id]) => {
      getOrBuildSystem(id, collectDeps(name));
    });

    // Inject
    Object.entries(inject).forEach(([name, id]) => {
      const collect = collectDeps(name);

      if(name in values)
        collect(values[name]);
      else {
        getOrBuildSystem(id, system => system(null, value => {
          values[name] = value;
          collect(value);
        }));
      }
    });

    collectDeps(deps => {
      const system = fn(deps);
      systems[systemId] = system;

      output(system);
    });
  };

  getOrBuildSystem.isCore = true;

  systems[CORE] = getOrBuildSystem;
  systems[SUPPORTS_COMMAND] = (systemId, output) => output(systemId in systems || systemId in config);

  output(getOrBuildSystem);
};
