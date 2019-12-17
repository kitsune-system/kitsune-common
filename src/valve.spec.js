import { Bucket } from './bucket';
import { Valve } from './valve';

describe('Valve', () => {
  it('should work', () => {
    const bucket = Bucket();

    const valve = Valve();
    valve.onOutput(bucket);

    bucket.empty().should.deep.equal([]);

    valve(100);
    valve(200);

    bucket.empty().should.deep.equal([]);

    valve.open(true);
    valve(300);
    valve(400);

    bucket.empty().should.deep.equal([300, 400]);

    valve.open(false);
    valve(500);
    valve(600);

    bucket.empty().should.deep.equal([]);
  });
});
