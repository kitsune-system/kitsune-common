import {
  deepHashEdge, hashEdge, hashList, hashString, pseudoRandom,
} from './hash';
import { RANDOM, READ, WRITE } from './index';

describe('hash', () => {
  describe('hash(string)', () => {
    it('should convert strings to 256-bit base64 hash', () => {
      hashString('').should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
      hashString('Hello World').should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
      hashString('こんにちは').should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');

      hashString(Buffer.from('')).should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
      hashString(Buffer.from('Hello World')).should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
      hashString(Buffer.from('こんにちは')).should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');

      hashString(Buffer.from('', 'utf8')).should.equal('gRB6Zjl2BgkHSbynpo4AH4MEBlCFGdQbaXKrUsNyRQs=');
      hashString(Buffer.from('Hello World', 'utf8')).should.equal('mHjKZqSLLbx1kM953E3UyNW/5oWNOBhNPbNtD9dTJXk=');
      hashString(Buffer.from('こんにちは', 'utf8')).should.equal('2vG7X2iRbp+0/ff82VOXOD2ZzvShhR+wSkxTiJk+eSA=');
    });
  });

  describe('deepHashEdge', () => {
    it('should edge hash a nested array of nodes', () => {
      const normal = hashEdge(RANDOM, hashEdge(READ, WRITE));
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

  /* eslint-disable */
  it('hashList', () => {
    hashList([
      'AIijUH1v1Jxo6gBDm5rwI4Or80AwPum9At1AWbzw5Lw=',
      'PFdJkeCnbCZzBF+bLC0Fb7vCRwbFKfv8hBwz6wH7yjk='
    ]).should.equal('fN/7GeSZDoqSPpyB7Ma9qGfq2fLdZs714JLUlm2HI3I=');
  });
});
