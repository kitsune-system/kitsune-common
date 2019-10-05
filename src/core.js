import { noOp } from '@gamedevfox/katana';

export const Core = config => {
  const systems = {};

  const getOrBuildSystem = systemId => {
    if(systemId in systems)
      return systems[systemId];

    if(!(systemId in config))
      throw new Error(`No core config found for id: ${systemId}`);

    const { fn, bind = {} } = config[systemId];

    const deps = {};
    Object.entries(bind).forEach(([name, id]) => {
      const dep = getOrBuildSystem(id);
      deps[name] = dep;
    });

    const system = fn(deps);
    systems[systemId] = system;

    return system;
  };

  return (systemId, output = noOp) => {
    const system = getOrBuildSystem(systemId);
    output(system);
  };
};
