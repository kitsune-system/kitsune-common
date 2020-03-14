import crypto from 'crypto';

const random = () => crypto.randomBytes(256 / 8).toString('base64');

describe('RANDOM IDs', () => {
  it('should work', () => {
    console.log(random());
    // console.log(random());
    // console.log(random());
    // console.log();
    // console.log(random());
    // console.log(random());
    // console.log(random());
  });
});
