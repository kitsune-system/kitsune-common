import { copies } from '@gamedevfox/katana';

import { Collector } from '../collector';

import { connect } from './duplex';
import { DuplexChannels } from './duplex-channels';
import { DuplexPair } from './duplex-pair';

describe('DuplexChannels', () => {
  it('should work', done => {
    const [duplexA, duplexB] = DuplexPair();
    const [channelsA, channelsB] = copies(2, () => DuplexChannels());

    connect(channelsA, duplexA);
    connect(duplexB, channelsB);

    const collect = Collector();
    const [collectA, collectB] = copies(2, collect);
    channelsA.onClose(id => collectA(id));
    channelsB.onClose(id => collectB(id));

    channelsA.onOpen(channel => {
      channel.id.should.equal('ALPHA');
      channel.onMessage(msg => {
        msg.should.equal('Your Message');
        channelsB.close('ALPHA');
      });
    });

    channelsB.onOpen(channel => {
      channel.id.should.equal('ALPHA');
      channel.onMessage(msg => {
        msg.should.equal('My Message');

        // Send a message back...
        channel.send('Your Message');
      });
    });

    channelsA.open({ input: 'ALPHA', onOutput: channel => {
      // Send a message...
      channel.send('My Message');
    } });

    collect.done(values => {
      values.should.deep.equal({ 0: 'ALPHA', 1: 'ALPHA' });
      done();
    });
  });
});
