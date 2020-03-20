import { Map } from '@gamedevfox/katana';

import { Pipe } from '../pipe';

const Broker = () => {};

export const Client = (serverId, clientId) => {
  const [getRemoteName, bindGetRemoteName] = Pipe();

  const getName = () => `client:${serverId}:${clientId}`;

  const logMessage = msg => console.log(`>>> ${msg} <<<`);

  const fruits = Map({
    alpha: 'Apple',
    beta: 'Banana',
    delta: 'Orange',
    omega: 'Strawberry',
  });
  const mapValue = (key, cb) => cb(fruits(key));

  const [fireChat, onChat] = Pipe();
  onChat(() => {});

  const chats = `Hello! I am client ${getName()}.`.split(' ');
  setInterval(() => {
    const msg = chats.shift();
    if(msg)
      fireChat(msg);
  }, 200);

  const [c2cOut, bindC2COut] = Pipe();

  const systemMap = Map({
    BIND_GET_REMOTE_NAME: bindGetRemoteName,
    GET_NAME: getName,
    GET_CLIENT_NAME: (_, cb) => cb(clientId),
    LOG_MESSAGE: logMessage,
    MAP_VALUE: mapValue,
    ON_CHAT: onChat,

    C2C: msg => {
      console.log(`>>>> C2C [${clientId}] >>>> ${msg}`);
    },
    BIND_C2C: bindC2COut,
  });

  const broker = Broker();
  broker.bindGetSystem((systemId, cb) => cb(systemMap(systemId)));

  const test = number => {
    getRemoteName(null, name => {
      console.log('The name is:', name, number);
    });
  };

  return { ...broker, c2cOut, test };
};
