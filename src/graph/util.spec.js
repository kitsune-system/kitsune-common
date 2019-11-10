import { NamedEdges } from './util';

describe('NamedEdges', () => {
  it('should work', () => {
    const edges = NamedEdges({
      a: ['HELLO', 'WORLD'],
      b: ['GOODBYE', 'MOON'],
      c: ['a', 'b'],
      d: ['NEVER', 'USED'],
    }, [
      ['a', 'c'],
      ['b', 'c'],
    ]);

    edges.should.deep.equal([
      ['HELLO', 'WORLD'],
      ['GOODBYE', 'MOON'],
      [
        'OuJYVSRdq3VnzeU8LUl14EV+pjMfAwQBRwjB0Ws2MMg=',
        'qxeidYtJ9KNkLE/HSJDZs2FPFa8XS0+ygO8IE4ekiSE=',
      ],
      [
        'OuJYVSRdq3VnzeU8LUl14EV+pjMfAwQBRwjB0Ws2MMg=',
        'gY+JNgCFaHBnaPtkMzfZZqQAm0GrDrW4a14GzoOBgZw=',
      ],
      [
        'qxeidYtJ9KNkLE/HSJDZs2FPFa8XS0+ygO8IE4ekiSE=',
        'gY+JNgCFaHBnaPtkMzfZZqQAm0GrDrW4a14GzoOBgZw=',
      ],
      ['NEVER', 'USED'],
    ]);
  });
});
