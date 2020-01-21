import { expect } from 'chai';

import { deepHashEdge, hash, hashList, pseudoRandom } from './hash';
import { RANDOM, READ, WRITE } from './index';

describe('hash', () => {
  it('hashList', () => {
    hashList([
      'AIijUH1v1Jxo6gBDm5rwI4Or80AwPum9At1AWbzw5Lw=',
      'PFdJkeCnbCZzBF+bLC0Fb7vCRwbFKfv8hBwz6wH7yjk=',
    ]).should.equal('fN/7GeSZDoqSPpyB7Ma9qGfq2fLdZs714JLUlm2HI3I=');
  });

  it('hash.string', () => {
    hash.string('').should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
    hash.string('Hello World').should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
    hash.string('こんにちは').should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');

    hash.string(Buffer.from('')).should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
    hash.string(Buffer.from('Hello World')).should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
    hash.string(Buffer.from('こんにちは')).should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');

    hash.string(Buffer.from('', 'utf8')).should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
    hash.string(Buffer.from('Hello World', 'utf8')).should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
    hash.string(Buffer.from('こんにちは', 'utf8')).should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');
  });

  it('hash.edge', () => {
    hash.edge(['first', 'second'])
      .should.equal('uBihcDF5ROpBoGKiRDufReu4HINwSRGjYtfOv/bi9JA=');

    expect(() => {
      hash.edge(['hello']);
    }).to.throw('`edge` must have 2 elements, instead had 1');

    expect(() => {
      hash.edge(['hello', 'one', 'more']);
    }).to.throw('`edge` must have 2 elements, instead had 3');

    expect(() => {
      hash.edge([123, null]);
    }).to.throw('Both `head` and `tail` must be strings: [123,null]');
  });

  it('hash.set', () => {
    hash.set([]).should.equal('HVUB/D3kwRxj6o/5d6PKrYOKhzYeC/jMj1GPpln6IPs=');
    hash.set(['SINGLE']).should.equal('M6cXjndhhgeJehVswLPjH7TNUNboa1mJ5xxGRd/vh6k=');
    hash.set(['ALPHA', 'BETA', 'OMEGA']).should.equal('9hli1ScInk7BUr4+p0KO7O0HsEOV2u6HTtJaAjEEW1I=');
    hash.set(['OMEGA', 'BETA', 'ALPHA']).should.equal('9hli1ScInk7BUr4+p0KO7O0HsEOV2u6HTtJaAjEEW1I=');
  });

  it('hash.list', () => {
    hash.list([]).should.equal('NZn+DEupxPkW+ajihacCWsU7dC4YNbQl1Rs2NsCR6DU=');
    hash.list(['SINGLE']).should.equal('gisDLFchSv5qxEk9LUGhkJP3RAuC+/eEO0IOakT8jII=');
    hash.list(['ALPHA', 'BETA', 'OMEGA']).should.equal('xbiDjY7X6eDzDZNFtY2F93cUhbkOKrxLdvR62QSzCcA=');
    hash.list(['OMEGA', 'BETA', 'ALPHA']).should.equal('YtW8/3qtU6qAmsFj97QmFXaP48MtDaSSzGymX1ijgcc=');
  });

  it('hash.map', () => {
    hash.map({}).should.equal('HVUB/D3kwRxj6o/5d6PKrYOKhzYeC/jMj1GPpln6IPs=');
    hash.map({
      ALPHA: 'ONE',
      BETA: 'TWO',
      OMEGA: 'LAST',
    }).should.equal('R3ljC5HMy3na3LkSPZzI7gB/c9tvg5jWRA4bQQ8o/uA=');
    hash.map({
      OMEGA: 'LAST',
      BETA: 'TWO',
      ALPHA: 'ONE',
    }).should.equal('R3ljC5HMy3na3LkSPZzI7gB/c9tvg5jWRA4bQQ8o/uA=');
  });

  describe('deepHashEdge', () => {
    it('should edge hash a nested array of nodes', () => {
      const normal = hash.edge([RANDOM, hash.edge([READ, WRITE])]);
      const deep = deepHashEdge(RANDOM, [READ, WRITE]);

      deep.should.equal(normal);
    });
  });

  it('pseudoRandom', () => {
    const random = pseudoRandom(RANDOM);

    random().should.equal('MF7Yc6gRuVWrfWR0Cs9VKAoqTcVsMfdWeXmcjAE3goU=');
    random().should.equal('ZE5nfIvBE892Mh0ZiMAF6bYN13Ec8xovE2S15y9XrjU=');
    random().should.equal('PFdJkeCnbCZzBF+bLC0Fb7vCRwbFKfv8hBwz6wH7yjk=');
    random().should.equal('j36ZUZQjVbthdwf3jL5eubGhZTYY/93+AbGyTivU2TY=');
    random().should.equal('uo587Bpkiy1hLGJ+JIwO4QZxrHKrdcVA3gY1FyWyb/c=');
  });
});
