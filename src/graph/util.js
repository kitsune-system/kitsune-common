import { hashEdge } from '../hash';

export const SetEdges = (id, nodes) => nodes.map(node => [id, node]);

export const MapEdges = (id, values) => {
  const edges = [];
  Object.entries(values).forEach(([key, value]) => {
    edges.push([id, key]);

    const keyEdge = hashEdge([id, key]);
    edges.push([keyEdge, value]);
  });
  return edges;
};

export const NamedEdges = (namedEdgeMap, rawEdges = []) => {
  const nameHashMap = {};
  const edgeMap = {};

  const translateEdge = edge => {
    let [head, tail] = edge;

    if(head in namedEdgeMap)
      head = translateId(head);

    if(tail in namedEdgeMap)
      tail = translateId(tail);

    const newEdge = [head, tail];
    const id = hashEdge(newEdge);
    edgeMap[id] = newEdge;

    return id;
  };

  const translateId = id => {
    let result;
    if(id in nameHashMap)
      result = nameHashMap[id];
    else if(id in namedEdgeMap) {
      const edge = namedEdgeMap[id];
      const hash = translateEdge(edge);
      nameHashMap[id] = hash;

      result = hash;
    } else
      result = id;

    return result;
  };

  rawEdges.forEach(translateEdge);
  Object.values(namedEdgeMap).forEach(translateEdge);

  const result = Object.values(edgeMap);
  return result;
};
