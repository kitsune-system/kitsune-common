import { Map } from './map';

describe('Map', () => {
  it('should work', done => {
    const map = Map();

    map.set({ id: 'ALPHA', value: 'BETA' });
    map.get({ input: 'ALPHA', onOutput: value => {
      value.should.equal('BETA');
      done();
    } });
  });
});
