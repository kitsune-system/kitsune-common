import { Pipe } from '@gamedevfox/katana';

import { GRAPH_AND_TOOL, GRAPH_TOOL, GraphAndTool, GraphTool } from './graph/graph-tool';
import { MEMORY_GRAPH, MemoryGraph } from './graph/memory-graph';

import { Builder } from './builder';
import { HASH_EDGE, hashEdge } from './hash';
import { returnValue } from './normalize';

const LOGGER = '1HJjZJ5qlWx1uz4tjNwBHhntI2qeKF/FuYn4lFaBw88=';
export const Logger = () => {
  const [output, onOutput] = Pipe();

  const input = value => {
    console.log('>>', value);
    return output(value);
  };

  return { input, onOutput };
};

const systemFunctionMap = {
  [HASH_EDGE]: () => ({ hashEdge }),
  [MEMORY_GRAPH]: MemoryGraph,
  [LOGGER]: Logger,
  [GRAPH_TOOL]: GraphTool,
};

describe.skip('Builder [WIP]', () => {
  it('should work', done => {
    const [graph, tool] = GraphAndTool();
    const GRAPH_AND_TOOL_BUILD = tool('BUILD', GRAPH_AND_TOOL);

    const GRAPH_AND_TOOL_INSTANCES = tool(GRAPH_AND_TOOL_BUILD, 'INSTANCES');
    const GRAPH_AND_TOOL_CONNECTIONS = tool(GRAPH_AND_TOOL_BUILD, 'CONNECTIONS');

    tool.map.key(GRAPH_AND_TOOL_INSTANCES, {
      graph: MEMORY_GRAPH,
      hashEdge: HASH_EDGE,
      tool: GRAPH_TOOL,
    });

    tool(GRAPH_AND_TOOL_CONNECTIONS, {
      [tool('graph', 'onHashEdge')]: tool('hashEdge', 'hashEdge'),
      [tool('tool', 'bindWriteEdge')]: tool('graph', 'write'),
    });

    const builder = Builder();
    builder.onHashEdge(returnValue(hashEdge));
    builder.onReadFunction(returnValue(systemId => systemFunctionMap[systemId]));
    builder.onReadKeyMap(returnValue(mapId => {
      const result = {};

      const tails = graph.tails(mapId);

      tails.forEach(key => {
        const edgeId = hashEdge([mapId, key]);
        const [value] = graph.tails(edgeId);
        result[key] = value;
      });

      return result;
    }));
    builder.onReadMap(returnValue(mapId => graph.tails(mapId).map(edgeId => graph.read(edgeId))));

    builder.build({
      input: GRAPH_AND_TOOL_BUILD,
      onOutput: result => {
        console.log('RESULT', result);
        const { connections, systemPorts } = result;

        connections.forEach(([outputPortId, inputPortId]) => {
          delete systemPorts[outputPortId];
          delete systemPorts[inputPortId];
        });
        console.log('Remaining', systemPorts);

        done();
      },
      error: error => {
        console.log(`Build failed: ${error}`);
      },
    });
  });
});
