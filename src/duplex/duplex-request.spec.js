import { connect } from './duplex';
import { DuplexPair } from './duplex-pair';
import { DuplexRequest, DuplexResponse } from './duplex-request';

const buildRequest = () => {
  const [duplexA, duplexB] = DuplexPair();

  const request = DuplexRequest();
  const response = DuplexResponse();

  connect(request, duplexA);
  connect(duplexB, response);

  response(({ input, onOutput, onError }) => {
    if(input > 1000) {
      onError({ type: 'tooBig', input });
      return;
    }

    onOutput((input * 2) + 456);
  });

  return request;
};

describe('DuplexRequest', () => {
  it('should work', done => {
    const request = buildRequest();

    request({
      input: 123,
      onOutput: response => {
        response.should.equal(702);
        done();
      },
      onError: () => {
        throw new Error('Should not fail');
      },
    });
  });

  it('should work with errors', done => {
    const request = buildRequest();

    request({
      input: 1234,
      onOutput: () => {
        throw new Error('Should not succeed');
      },
      onError: error => {
        error.should.deep.equal({ type: 'tooBig', input: 1234 });
        done();
      },
    });
  });
});
