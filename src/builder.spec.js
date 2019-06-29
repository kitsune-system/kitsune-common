import { expect } from 'chai';

import Builder from './builder';

describe('Builder', () => {
  it('should build', () => {
    const build = Builder({
      hello: 'world',
      test: () => 10 + 20,
      msg: build => `The ${build('hello')} has ${build('test')} people... that's ${build('test')}!!!`,
      random: () => Math.random(),
    });

    expect(build('hello')).to.equal('world');
    expect(build('test')).to.equal(30);
    expect(build('msg')).to.equal('The world has 30 people... that\'s 30!!!');
    expect(build('random')).to.equal(build('random'));

    (() => {
      build('not-found');
    }).should.throw();
  });

  it('should support circular dependencies via after function', () => {
    const build = Builder({
      adam: (build, after) => {
        const adam = {};
        after(build => (adam.spouse = build('eve')));
        return adam;
      },
      eve: (build, after) => {
        const eve = {};
        after(build => (eve.spouse = build('adam')));
        return eve;
      },
    });

    const [adam, eve] = ['adam', 'eve'].map(build);
    adam.spouse.should.equal(eve);
    eve.spouse.should.equal(adam);
  });
});
