import { ArgTypeSwitch } from '@gamedevfox/katana';

import { hash } from '../hash';
import { Pipe } from '../pipe';

import { MemoryGraph } from './memory-graph';

export const GRAPH_TOOL = 'Ez4OasJaagBUDqSUBqpOuZSXaz8/K+Ai1/jRCHnE7oo=';
export const GraphTool = () => {
  const [writeEdge, bindWriteEdge] = Pipe();

  const namedNodes = {};

  const translateId = name => name in namedNodes ? namedNodes[name] : name;

  const checkName = name => {
    if(name in namedNodes)
      throw new Error(`Name \`${name}\` already used`);
  };

  const saveName = (name, id) => {
    namedNodes[name] = id;
  };

  const nameWrap = (name, fn) => {
    if(name)
      checkName(name);

    const id = fn();

    if(name)
      saveName(name, id);

    return id;
  };

  const get = name => namedNodes[name];

  const edge = (head, tail, name) => nameWrap(name, () => {
    return writeEdge([
      translateId(head),
      translateId(tail),
    ]);
  });

  const explicitSet = (id, nodes, name) => nameWrap(name, () => {
    id = translateId(id);

    nodes.forEach(node => writeEdge([
      id,
      translateId(node),
    ]));

    return id;
  });

  const set = (nodes, name) => {
    const id = hash.set(nodes);
    return explicitSet(id, nodes, name);
  };

  const explicitMap = (id, mapObj, name) => nameWrap(name, () => {
    id = translateId(id);

    const edgeIds = Object.entries(mapObj)
      .map(([name, value]) => edge(name, value));
    edgeIds.forEach(edgeId => writeEdge([id, edgeId]));

    return id;
  });

  const map = (mapObj, name) => {
    const id = hash.map(mapObj);
    return explicitMap(id, mapObj, name);
  };

  const tool = ArgTypeSwitch({
    // Get
    str: get,
    // Edge
    'str:str': edge,
    'str:str:str': edge,
    // Set
    arr: set,
    'arr:str': set,
    'str:arr': explicitSet,
    'str:arr:str': explicitSet,
    // Map
    obj: map,
    'obj:str': map,
    'str:obj': explicitMap,
    'str:obj:str': explicitMap,
  });

  const explicitLabeledSet = (id, setObj, name) => nameWrap(name, () => {
    id = translateId(id);

    Object.entries(setObj).forEach(([label, element]) => {
      edge(id, translateId(element), label);
    });

    return id;
  });

  const labeledSet = (setObj, name) => {
    const set = Object.values(setObj);
    const id = hash.set(set);
    return explicitLabeledSet(id, setObj, name);
  };

  tool.set = ArgTypeSwitch({
    obj: labeledSet,
    'obj:str': labeledSet,
    'str:obj': explicitLabeledSet,
    'str:obj:str': explicitLabeledSet,
  });

  const explicitList = (id, list, name) => nameWrap(name, () => {
    id = translateId(id);

    let container = id;
    list.forEach(item => {
      container = writeEdge([
        container,
        translateId(item),
      ]);
    });

    return id;
  });

  const list = (listArray, name) => {
    const id = hash.list(listArray);
    return explicitList(id, listArray, name);
  };

  tool.list = ArgTypeSwitch({
    arr: list,
    'arr:str': list,
    'str:arr': explicitList,
    'str:arr:str': explicitList,
  });

  const explicitKeyMap = (id, mapObj, name) => nameWrap(name, () => {
    id = translateId(id);

    Object.entries(mapObj).forEach(([name, value]) => {
      const edgeId = writeEdge([id, translateId(name)]);
      writeEdge([edgeId, translateId(value)]);
    });

    return id;
  });

  const keyMap = (mapObj, name) => {
    const id = hash.map(mapObj);
    return explicitKeyMap(id, mapObj, name);
  };

  tool.map = {
    key: ArgTypeSwitch({
      obj: keyMap,
      'obj:str': keyMap,
      'str:obj': explicitKeyMap,
      'str:obj:str': explicitKeyMap,
    }),
  };

  tool.bindWriteEdge = bindWriteEdge;

  return tool;
};

export const GRAPH_AND_TOOL = '2xFHJHqk/K/6Qealo4DC/+WUjFXksouLjN3IB51u2nA=';
export const GraphAndTool = () => {
  const graph = MemoryGraph();
  const tool = GraphTool();
  const hashEdge = { hashEdge: hash.edge };

  graph.onHashEdge(hashEdge.hashEdge);
  tool.bindWriteEdge(graph.write);

  return [graph, tool];
};
