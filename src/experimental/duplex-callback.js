import { Pipe } from '@gamedevfox/katana';

export const DuplexCallback = duplex => {
  const [fireMessage, onMessage] = Pipe();

  let callbackCounter = 0;
  const callbacks = {};

  const send = (msg, cb) => {
    const callbackId = ++callbackCounter;
    callbacks[callbackId] = cb;

    duplex.send({ type: 'CALLBACK_REQUEST', callbackId, msg });
  };

  const handlers = {
    CALLBACK_REQUEST: message => {
      const { callbackId, msg } = message;

      fireMessage(msg, responseMsg => {
        duplex.send({
          type: 'CALLBACK_RESPONSE', callbackId, msg: responseMsg,
        });
      });
    },
    CALLBACK_RESPONSE: message => {
      const { callbackId, msg } = message;

      const callback = callbacks[callbackId];
      callback(msg);
    },
  };

  duplex.onMessage(message => {
    const { type } = message;
    const handler = handlers[type];

    if(!handler)
      throw new Error(`Invalid callback message type: ${type}`);

    handler(message);
  });

  return { send, onMessage };
};
