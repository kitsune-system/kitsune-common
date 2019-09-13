import {
  truncateByte, ensureBit, capByte, markSize, measureSize,
} from './sized-hash';

describe('sized-hash', () => {
  describe('truncateByte', () => {
    it('should work', () => {
      truncateByte(255, 1).should.equal(1);
      truncateByte(255, 2).should.equal(3);
      truncateByte(255, 3).should.equal(7);
      truncateByte(255, 4).should.equal(15);
      truncateByte(255, 5).should.equal(31);
      truncateByte(255, 6).should.equal(63);
      truncateByte(255, 7).should.equal(127);
      truncateByte(255, 8).should.equal(255);

      truncateByte(100, 3).should.equal(4);
      truncateByte(123, 4).should.equal(11);
      truncateByte(234, 5).should.equal(10);
    });
  });

  describe('ensureBit', () => {
    it('should work', () => {
      ensureBit(0, 1).should.equal(1);
      ensureBit(0, 2).should.equal(2);
      ensureBit(0, 3).should.equal(4);
      ensureBit(0, 4).should.equal(8);
      ensureBit(0, 5).should.equal(16);
      ensureBit(0, 6).should.equal(32);
      ensureBit(0, 7).should.equal(64);
      ensureBit(0, 8).should.equal(128);

      ensureBit(100, 5).should.equal(116);
      ensureBit(123, 3).should.equal(127);
      ensureBit(234, 4).should.equal(234);
    });
  });

  describe('capByte', () => {
    it('should work', () => {
      capByte(85, 1).should.equal(1);
      capByte(85, 2).should.equal(3);
      capByte(85, 3).should.equal(5);
      capByte(85, 4).should.equal(13);
      capByte(85, 5).should.equal(21);
      capByte(85, 6).should.equal(53);
      capByte(85, 7).should.equal(85);
      capByte(85, 8).should.equal(213);

      capByte(100, 5).should.equal(20);
      capByte(123, 6).should.equal(59);
      capByte(234, 7).should.equal(106);
    });
  });

  describe('markSize', () => {
    it('should work', () => {
      const example = () => Buffer.from('55ffffff', 'hex');
      markSize(example(), 1).toString('hex').should.equal('01ffffff');
      markSize(example(), 2).toString('hex').should.equal('03ffffff');
      markSize(example(), 3).toString('hex').should.equal('05ffffff');
      markSize(example(), 4).toString('hex').should.equal('0dffffff');
      markSize(example(), 5).toString('hex').should.equal('15ffffff');
      markSize(example(), 6).toString('hex').should.equal('35ffffff');
      markSize(example(), 7).toString('hex').should.equal('55ffffff');
      markSize(example(), 8).toString('hex').should.equal('d5ffffff');

      const example2 = () => Buffer.from('89abcdef', 'hex');
      markSize(example2(), 28).toString('hex').should.equal('09abcdef');
      markSize(example2(), 29).toString('hex').should.equal('19abcdef');
      markSize(example2(), 31).toString('hex').should.equal('49abcdef');
    });
  });

  describe('measureSize', () => {
    it('should work', () => {
      const hexHash = hex => Buffer.from(hex, 'hex');
      measureSize(hexHash('01ffffff')).should.equal(25);
      measureSize(hexHash('03ffffff')).should.equal(26);
      measureSize(hexHash('05ffffff')).should.equal(27);
      measureSize(hexHash('0dffffff')).should.equal(28);
      measureSize(hexHash('15ffffff')).should.equal(29);
      measureSize(hexHash('35ffffff')).should.equal(30);
      measureSize(hexHash('55ffffff')).should.equal(31);
      measureSize(hexHash('d5ffffff')).should.equal(32);

      measureSize(hexHash('09abcdef')).should.equal(28);
      measureSize(hexHash('19abcdef')).should.equal(29);
      measureSize(hexHash('49abcdef')).should.equal(31);
    });
  });
});
