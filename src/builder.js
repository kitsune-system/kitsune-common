import { Pipe } from '@gamedevfox/katana';

import { chain } from './chain';
import { Collector } from './collector';
import { fromCallbacks } from './normalize';

export const BUILDER = 'jnjSYzAj+E7ZI2EguwP7gzloP54baupA4zOwnDKySas=';
export const Builder = () => {
  const [hashEdge, onHashEdge] = Pipe();
  const [readFunction, onReadFunction] = Pipe();
  const [readKeyMap, onReadKeyMap] = Pipe();
  const [readMap, onReadMap] = Pipe();

  const build = fromCallbacks((systemId, buildOut, error) => {
    chain(
      ({ onOutput }) => readFunction({ input: systemId, onOutput }),
      ({ input: fn }) => {
        if(fn) {
          const system = fn();
          buildOut(system);
          return;
        }

        const collect = Collector();
        const [systemsC, systemPortsC, connectionsC] = ['systems', 'systemPorts', 'connections'].map(collect);

        // Instances Chain
        chain(
          ({ onOutput }) => hashEdge({ input: [systemId, 'INSTANCES'], onOutput }),
          ({ input: instancesId, onOutput }) => readKeyMap({ input: instancesId, onOutput }),
          ({ input: edgeSet, onOutput }) => {
            if(edgeSet === null) {
              error({ type: 'systemNotFound', systemId });
              return;
            }

            const collect = Collector();
            Object.entries(edgeSet).forEach(([name, buildId]) => {
              build({ input: buildId, onOutput: collect(name) });
            });

            collect.done(systems => {
              systemsC(systems);
              onOutput(systems);
            });
          },
          ({ input: systems }) => {
            const portC = Collector();
            Object.entries(systems).forEach(([systemName, system]) => {
              Object.entries(system).forEach(([portName, port]) => { // eslint-disable-line max-nested-callbacks
                if(typeof port !== 'function')
                  return;

                const collect = portC();
                hashEdge({
                  input: [systemName, portName],
                  onOutput: id => collect(id, port), // eslint-disable-line max-nested-callbacks
                });
              });
            });

            portC.done(systemPortsC);
          },
        );

        // Connections Chain
        chain(
          ({ onOutput }) => hashEdge({ input: [systemId, 'CONNECTIONS'], onOutput }),
          ({ input: connectionsId }) => readMap({ input: connectionsId, onOutput: connectionsC }),
        );

        collect.done(({ systems, systemPorts, connections }) => {
          connections.forEach(connection => {
            const [outputPortId, inputPortId] = connection;

            const outputPort = systemPorts[outputPortId];
            const inputPort = systemPorts[inputPortId];

            outputPort(inputPort);
          });

          buildOut({ systems, systemPorts, connections });
        });
      },
    );
  });

  return {
    build,
    onHashEdge, onReadFunction, onReadKeyMap, onReadMap,
  };
};
