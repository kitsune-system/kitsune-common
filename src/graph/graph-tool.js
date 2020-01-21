import { ArgTypeSwitch } from '@gamedevfox/katana';

import { hash } from '../hash';

export const GraphTool = graph => {
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
    return graph.write([
      translateId(head),
      translateId(tail),
    ]);
  });

  const explicitSet = (id, nodes, name) => nameWrap(name, () => {
    id = translateId(id);
    nodes.forEach(node => graph.write([
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
    edgeIds.forEach(edgeId => edge(id, edgeId));
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

  const explicitList = (id, list, name) => nameWrap(name, () => {
    id = translateId(id);

    let container = id;
    list.forEach(item => {
      container = graph.write([
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

  return tool;
};
