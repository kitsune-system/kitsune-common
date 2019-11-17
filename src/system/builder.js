import { Pipe, copies, noOp } from '@gamedevfox/katana';

import { Callback } from '../callback';
import { Collector } from '../collector';

export const Builder = () => {
  const [readBuildFn, setReadBuildFn] = Pipe();
  const [readEdge, setReadEdge] = Pipe();
  const [readSystemFamilyId, setReadSystemFamilyId] = Pipe();
  const [writeEdge, setWriteEdge] = Pipe();

  const systemInstMap = {};

  const build = (systemInstId, output = noOp, error = noOp) => {
    const [edgeC, sysFamIdC, buildFnC] = copies(3, () => Callback());

    if(systemInstId in systemInstMap) {
      const instance = systemInstMap[systemInstId];
      output(instance);
      return;
    }

    readEdge(systemInstId, edgeC);

    let systemId;
    let systemFamilyInstId;
    edgeC.done(edge => {
      if(!edge) {
        error(new Error(`Could not find edge for systemInstId: ${systemInstId}`));
        return;
      }

      [systemId, systemFamilyInstId] = edge;
      readSystemFamilyId(systemFamilyInstId, sysFamIdC);
    });

    sysFamIdC.done(systemFamilyId => {
      // FIX: Put errors here

      // Get build function
      readBuildFn(systemFamilyId, buildFnC);
    });

    const collector = Collector();
    buildFnC.done(buildFn => {
      if(!buildFn) {
        error(new Error(`Could not find function for id: ${systemId}`));
        return;
      }

      // Run build function
      const systemFamily = buildFn();

      // FIX: Run modules to get everything
      // const modules = readModules();
      // modules.forEach(module => {
      //   systemFamily = module(systemFamily);
      // });

      // Cache systems
      Object.entries(systemFamily).forEach(([systemId, system]) => {
        const edge = [systemId, systemFamilyInstId];
        const collect = collector();
        writeEdge(edge, systemInstId => {
          systemInstMap[systemInstId] = system;
          collect();
        });
      });
    });

    collector.done(() => {
      const result = systemInstMap[systemInstId];
      output(result);
    });
  };

  const destroy = (systemInstId, output = noOp) => {
    delete systemInstMap[systemInstId];
    output();
  };

  return {
    readEdge: setReadEdge, writeEdge: setWriteEdge,
    readSystemFamilyId: setReadSystemFamilyId, readBuildFn: setReadBuildFn,
    build, destroy,
  };
};
