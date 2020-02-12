import { GraphTool } from '../graph/graph-tool';
import { MemoryGraph } from '../graph/memory-graph';
import { hash } from '../hash';

export const INTERFACE = 'mwTlNjBVHNbJZBEv5W46RE4XiCYrlvLV1fkKPpSOlDM=';

export const INPUT = 'zRntVU/vv1V90xAJBmoDy5kqCCvPlzdaZ/Z+65VH2GE=';
export const OUTPUT = 'G9gvueADRa9PgSm4avhCPc+3Cb6GBj0FWkSkC+LCRLc=';
export const OUTER_MAP = 'VGmjra2v5atnQXwf+fh/OEuwrYiRbRw8jP9mNC7sOYM=';
export const INNER_MAP = 'b8cAgELAEuEEFGGe7TdGARrzmhP4IaPpJF1fsxqNYk8=';

export const ACTIVE = 'KWuKFXytbSVS2AZNDphFSHsJmZH6RNt6TaZaxf3b3B4=';
export const PASSIVE = 'GY6BQYK/kR8v6npfq3jisq6k/0QfXhUw67ngdGgd7m8=';

export const ACTIVE_INTERFACE_MAP = 'cOwnqlore+ShUtltSutETLqAJfu00mMgCAA1AwLOqeo=';
export const INVERSE_INTERFACE_MAP = 'KF2Sqz6ndcje9nPXsMFceCzkgovHHIrbkQ/CAKS2IgE=';

export const interfaceGraph = MemoryGraph();
interfaceGraph.onHashEdge(hash.edge);

const tool = GraphTool();
tool.bindWriteEdge(interfaceGraph.write);

tool(INTERFACE, [
  INPUT,
  OUTPUT,
  OUTER_MAP,
  INNER_MAP,
]);

tool.map.key(ACTIVE_INTERFACE_MAP, {
  [INPUT]: PASSIVE,
  [OUTPUT]: ACTIVE,
  [OUTER_MAP]: ACTIVE,
  [INNER_MAP]: PASSIVE,
});

tool.map.key(INVERSE_INTERFACE_MAP, {
  [INPUT]: OUTPUT,
  [OUTPUT]: INPUT,
  [OUTER_MAP]: INNER_MAP,
  [INNER_MAP]: OUTER_MAP,
});
