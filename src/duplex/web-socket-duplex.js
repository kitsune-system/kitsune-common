import { early } from '../early-io';
import { Pipe } from '../pipe';

const buildDuplex = onMessageFn => webSocket => {
  const send = msg => {
    const msgStr = JSON.stringify(msg);
    webSocket.send(msgStr);
  };

  const [fireMessage, onMessage] = Pipe();
  onMessageFn(webSocket, msgStr => {
    const msg = JSON.parse(msgStr);
    fireMessage(msg);
  });

  return { send, onMessage: early(onMessage) };
};

export const WebSocketDuplex = {
  Browser: buildDuplex((webSocket, onMessageFn) => {
    webSocket.addEventListener('message', onMessageFn);
  }),
  NodeJS: buildDuplex((webSocket, onMessageFn) => {
    webSocket.on('message', onMessageFn);
  }),
};
