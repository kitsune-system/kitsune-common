import { deepHashEdge as E } from './hash';
import {
  ERASE, EDGE, LIST_N, MAP_N, PIPE, RANDOM, READ,
  STRING, VARIABLE_GET, VARIABLE_SET, WRITE,
} from './index';

export const KitsuneClient = request => {
  const client = (command, input) => {
    if(typeof input !== 'object')
      input = JSON.stringify(input);

    return request.post(command, input).then(response => response);
  };

  client.wrap = (command, input, before = [], after = []) => {
    const commandList = [...before, command, ...after];
    const args = { commandList };

    if(input)
      args.input = input;

    return client(PIPE, args);
  };

  client.random = () => client(RANDOM);

  // Edge
  client.writeEdge = (head, tail) => client(E(WRITE, EDGE), [head, tail]);
  client.readEdge = edgeNode => client(E(READ, EDGE), edgeNode);
  client.destroyEdge = edgeNode => client(E(ERASE, EDGE), edgeNode);

  // List
  client.writeList = list => client(E(WRITE, LIST_N), list);
  client.readList = listNode => client(E(READ, LIST_N), listNode);

  // Map
  client.writeMap = map => client(E(WRITE, MAP_N), map);
  client.readMap = mapNode => client(E(READ, MAP_N), mapNode);

  // String
  client.writeString = string => client(E(WRITE, STRING), string);

  // Variable
  client.setVar = (varNode, valNode) => client(VARIABLE_SET, [varNode, valNode]);
  client.getVar = varNode => client(VARIABLE_GET, varNode);

  return client;
};

export default KitsuneClient;
