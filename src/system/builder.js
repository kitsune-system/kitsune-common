import { Pipe, noOp } from '@gamedevfox/katana';

import { chain } from '../chain';
import { Collector } from '../collector';

export const Builder = () => {
  const [readBuildFn, setReadBuildFn] = Pipe();
  const [readEdge, setReadEdge] = Pipe();
  const [readSystemFamilyId, setReadSystemFamilyId] = Pipe();
  const [writeEdge, setWriteEdge] = Pipe();

  const systemInstMap = {};

  const build = (systemInstId, output = noOp, error = noOp) => {
    if(systemInstId in systemInstMap) {
      const instance = systemInstMap[systemInstId];
      output(instance);
      return;
    }

    let systemId;
    let systemFamilyInstId;
    chain(
      ({ onOutput }) => readEdge(systemInstId, onOutput),
      ({ input: edge, onOutput }) => {
        if(!edge) {
          error(new Error(`Could not find edge for systemInstId: ${systemInstId}`));
          return;
        }

        [systemId, systemFamilyInstId] = edge;
        readSystemFamilyId(systemFamilyInstId, onOutput);
      },
      ({ input: systemFamilyId, onOutput }) => {
        // FIX: Put errors here

        // Get build function
        readBuildFn(systemFamilyId, onOutput);
      },
      ({ input: buildFn }) => {
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
        const collector = Collector();
        Object.entries(systemFamily).forEach(([systemId, system]) => {
          const collect = collector();

          const edge = [systemId, systemFamilyInstId];
          writeEdge(edge, systemInstId => {
            systemInstMap[systemInstId] = system;
            collect();
          });
        });

        collector.done(() => {
          const result = systemInstMap[systemInstId];
          output(result);
        });
      },
    );
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
