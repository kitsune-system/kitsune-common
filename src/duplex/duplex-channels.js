import { Pipe } from '@gamedevfox/katana';

import { early } from '../early-io';

export const DuplexChannels = () => {
  const [sendMessage, onMessage] = Pipe();
  const [send, recvMessage] = Pipe();

  const [fireOpen, onOpen] = Pipe();
  const [fireClose, onClose] = Pipe();

  const channels = {};

  const openChannel = channelId => {
    const send = msg => sendMessage({ type: 'CHANNEL_MESSAGE', channelId, msg });

    const [fireMessage, onMessage] = Pipe();
    channels[channelId] = fireMessage;

    return { id: channelId, send, onMessage: early(onMessage) };
  };

  const open = (channelId, cb) => {
    sendMessage({ type: 'OPEN_CHANNEL', channelId });

    const channel = openChannel(channelId);

    fireOpen(channel);
    cb(channel);
  };

  const close = channelId => {
    sendMessage({ type: 'CLOSE_CHANNEL', channelId });

    delete channels[channelId];
    fireClose(channelId);
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

  recvMessage(message => {
    const { type } = message;
    const handler = handlers[type];

    if(!handler)
      throw new Error(`Invalid channel message type: ${type}`);

    handler(message);
  });

  return {
    open, close, onOpen, onClose,
    send, onMessage,
  };
};

export const connect = ({ duplex, channels }) => {
  duplex.onMessage(channels.send);
  channels.onMessage(duplex.send);
};
