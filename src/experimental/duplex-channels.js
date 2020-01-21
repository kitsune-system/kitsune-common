import { Pipe } from '@gamedevfox/katana';

import { early } from '../early-io';

export const DuplexChannels = duplex => {
  const [fireOpen, onOpen] = Pipe();
  const [fireClose, onClose] = Pipe();

  const channels = {};

  const openChannel = channelId => {
    const send = msg => {
      duplex.send({ type: 'CHANNEL_MESSAGE', channelId, msg });
    };

    const [fireMessage, onMessage] = Pipe();
    channels[channelId] = fireMessage;

    return { id: channelId, send, onMessage: early(onMessage) };
  };

  const open = (channelId, cb) => {
    duplex.send({ type: 'OPEN_CHANNEL', channelId });

    const channel = openChannel(channelId);
    cb(channel);
  };

  const close = channelId => {
    duplex.send({ type: 'CLOSE_CHANNEL', channelId });
    delete channels[channelId];
  };

  const handlers = {
    OPEN_CHANNEL: message => {
      const { channelId } = message;

      const channel = openChannel(channelId);
      fireOpen(channel);
    },
    CHANNEL_MESSAGE: message => {
      const { channelId, msg } = message;
      channels[channelId](msg);
    },
    CLOSE_CHANNEL: message => {
      const { channelId } = message;

      delete channels[channelId];
      fireClose(channelId);
    },
  };

  duplex.onMessage(message => {
    const { type } = message;
    const handler = handlers[type];

    if(!handler)
      throw new Error(`Invalid channel message type: ${type}`);

    handler(message);
  });

  return { open, close, onOpen, onClose };
};
