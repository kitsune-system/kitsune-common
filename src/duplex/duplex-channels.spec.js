import { copies } from '@gamedevfox/katana';

import { Collector } from '../collector';

import { DuplexChannels, connect } from './duplex-channels';
import { DuplexPair } from './duplex-pair';

describe('DuplexChannels', () => {
  it('should work', done => {
    const [duplexA, duplexB] = DuplexPair();
    const [channelsA, channelsB] = copies(2, () => DuplexChannels());

    connect({ duplex: duplexA, channels: channelsA });
    connect({ duplex: duplexB, channels: channelsB });

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

    channelsA.open('ALPHA', channel => {
      // Send a message...
      channel.send('My Message');
    });

    collect.done(values => {
      values.should.deep.equal({ 0: 'ALPHA', 1: 'ALPHA' });
      done();
    });
  });
});
