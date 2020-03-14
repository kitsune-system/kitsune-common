import { expect } from 'chai';

import { hash } from '../hash';

import { GraphAndTool } from './graph-tool';

describe.skip('GraphTool [BROKEN]', () => {
  it('edge', () => {
    const [graph, tool] = GraphAndTool();

    tool('ALPHA', 'ONE');

    graph.list().should.deep.equal([
      ['ALPHA', 'ONE'],
    ]);
  });

  it('edge with name', () => {
    const [graph, tool] = GraphAndTool();

    tool('ALPHA', 'ONE', 'myEdge');

    const ALPHA_ONE = hash.edge(['ALPHA', 'ONE']);
    tool('myEdge').should.equal(ALPHA_ONE);

    expect(() => {
      tool('BETA', 'TWO', 'myEdge');
    }).to.throw('Name `myEdge` already used');

    tool(ALPHA_ONE, 'DUMMY', 'alpha');
    tool('myEdge', 'DUMMY', 'beta');

    const ALPHA_ONE_DUMMY = hash.edge([ALPHA_ONE, 'DUMMY']);
    tool('alpha').should.equal(ALPHA_ONE_DUMMY);
    tool('beta').should.equal(ALPHA_ONE_DUMMY);

    graph.list().should.deep.equal([
      ['ALPHA', 'ONE'],
      [ALPHA_ONE, 'DUMMY'],
    ]);
  });

  it('set', () => {
    const [graph, tool] = GraphAndTool();

    const set = ['ALPHA', 'BETA', 'OMEGA'];
    tool(set);

    const SET_ID = hash.set(set);
    graph.list().should.deep.equal([
      [SET_ID, 'ALPHA'],
      [SET_ID, 'BETA'],
      [SET_ID, 'OMEGA'],
    ]);

    // Order doesn't matter
    tool(['BETA', 'OMEGA', 'ALPHA']);
    graph.list().should.deep.equal([
      [SET_ID, 'ALPHA'],
      [SET_ID, 'BETA'],
      [SET_ID, 'OMEGA'],
    ]);
  });

  it('set with name', () => {
    const [graph, tool] = GraphAndTool();

    tool(['OMEGA', 'BETA', 'ALPHA'], 'mySet');

    const SET_ID = '9hli1ScInk7BUr4+p0KO7O0HsEOV2u6HTtJaAjEEW1I=';
    tool('mySet').should.equal(SET_ID);
    graph.list().should.deep.equal([
      [SET_ID, 'ALPHA'],
      [SET_ID, 'BETA'],
      [SET_ID, 'OMEGA'],
    ]);
  });

  it('explicit set', () => {
    const [graph, tool] = GraphAndTool();

    const set = ['ALPHA', 'BETA', 'OMEGA'];
    tool('MY_SET', set);

    graph.list().should.deep.equal([
      ['MY_SET', 'ALPHA'],
      ['MY_SET', 'BETA'],
      ['MY_SET', 'OMEGA'],
    ]);
  });

  it('map', () => {
    const [graph, tool] = GraphAndTool();

    const map = {
      ALPHA: 'ONE',
      BETA: 'TWO',
      OMEGA: 'FINAL',
    };
    tool(map);

    const MAP_ID = hash.map(map);
    const EDGE_1 = hash.edge(['ALPHA', 'ONE']);
    const EDGE_2 = hash.edge(['BETA', 'TWO']);
    const EDGE_3 = hash.edge(['OMEGA', 'FINAL']);

    graph.list().should.deep.equal([
      ['ALPHA', 'ONE'],
      ['BETA', 'TWO'],
      ['OMEGA', 'FINAL'],
      [MAP_ID, EDGE_1],
      [MAP_ID, EDGE_2],
      [MAP_ID, EDGE_3],
    ]);
  });

  it('explicit map', () => {
    const [graph, tool] = GraphAndTool();

    const map = {
      ALPHA: 'ONE',
      BETA: 'TWO',
      OMEGA: 'FINAL',
    };
    tool('MY_MAP', map);

    const EDGE_1 = hash.edge(['ALPHA', 'ONE']);
    const EDGE_2 = hash.edge(['BETA', 'TWO']);
    const EDGE_3 = hash.edge(['OMEGA', 'FINAL']);

    graph.list().should.deep.equal([
      ['ALPHA', 'ONE'],
      ['BETA', 'TWO'],
      ['OMEGA', 'FINAL'],
      ['MY_MAP', EDGE_1],
      ['MY_MAP', EDGE_2],
      ['MY_MAP', EDGE_3],
    ]);
  });

  it('key map', () => {
    const [graph, tool] = GraphAndTool();

    const map = {
      ALPHA: 'ONE',
      BETA: 'TWO',
      OMEGA: 'FINAL',
    };
    tool.map.key('KEY_MAP', map);

    const EDGE_1 = hash.edge(['KEY_MAP', 'ALPHA']);
    const EDGE_2 = hash.edge(['KEY_MAP', 'BETA']);
    const EDGE_3 = hash.edge(['KEY_MAP', 'OMEGA']);

    graph.list().should.deep.equal([
      ['KEY_MAP', 'ALPHA'],
      [EDGE_1, 'ONE'],
      ['KEY_MAP', 'BETA'],
      [EDGE_2, 'TWO'],
      ['KEY_MAP', 'OMEGA'],
      [EDGE_3, 'FINAL'],
    ]);
  });

  it('list', () => {
    const [graph, tool] = GraphAndTool();

    const list = ['ALPHA', 'BETA', 'OMEGA'];
    tool.list(list);

    const CONTAINER_1 = hash.list(list);
    const CONTAINER_2 = hash.edge([CONTAINER_1, 'ALPHA']);
    const CONTAINER_3 = hash.edge([CONTAINER_2, 'BETA']);
    graph.list().should.deep.equal([
      [CONTAINER_1, 'ALPHA'],
      [CONTAINER_2, 'BETA'],
      [CONTAINER_3, 'OMEGA'],
    ]);

    // Order matters
    const listB = ['BETA', 'OMEGA', 'ALPHA'];
    tool.list(listB);

    const CONTAINER_4 = hash.list(listB);
    const CONTAINER_5 = hash.edge([CONTAINER_4, 'BETA']);
    const CONTAINER_6 = hash.edge([CONTAINER_5, 'OMEGA']);
    graph.list().should.deep.equal([
      [CONTAINER_1, 'ALPHA'],
      [CONTAINER_2, 'BETA'],
      [CONTAINER_3, 'OMEGA'],

      [CONTAINER_4, 'BETA'],
      [CONTAINER_5, 'OMEGA'],
      [CONTAINER_6, 'ALPHA'],
    ]);
  });

  it('labeled set', () => {
    const [graph, tool] = GraphAndTool();

    const labeledSet = {
      first: 'ALPHA',
      second: 'BETA',
      last: 'OMEGA',
    };
    tool.set('MY_LABELED_SET', labeledSet, 'frank');

    tool('frank').should.equal('MY_LABELED_SET');
    tool('first').should.equal(hash.edge(['MY_LABELED_SET', 'ALPHA']));
    tool('second').should.equal(hash.edge(['MY_LABELED_SET', 'BETA']));
    tool('last').should.equal(hash.edge(['MY_LABELED_SET', 'OMEGA']));

    graph.list().should.deep.equal([
      ['MY_LABELED_SET', 'ALPHA'],
      ['MY_LABELED_SET', 'BETA'],
      ['MY_LABELED_SET', 'OMEGA'],
    ]);
  });

  it('mix it up', () => {
    const [graph, tool] = GraphAndTool();

    const edge = tool('READ', 'WRITE', 'myEdge');

    const set = ['ALPHA', 'BETA', 'OMEGA'];
    tool('myEdge', set, 'mySet');

    tool('mySet').should.equal(edge);

    graph.list().should.deep.equal([
      ['READ', 'WRITE'],
      [edge, 'ALPHA'],
      [edge, 'BETA'],
      [edge, 'OMEGA'],
    ]);
  });
});
