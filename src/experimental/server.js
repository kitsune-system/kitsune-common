import { Map, Pipe, noOp, split } from '@gamedevfox/katana';

const Broker = () => {};

export const Server = serverId => {
  // BIND_MAP_FN
  const [mapFn, bindMapFn] = Pipe();
  bindMapFn(noOp);

  setTimeout(() => {
    mapFn('omega', result => console.log(`[[OMEGA: ${result}]]`));
    mapFn('beta', result => console.log(`[[BETA: ${result}]]`));
    mapFn('alpha', result => console.log(`[[ALPHA: ${result}]]`));
  }, 1000);

  // GET_NAME
  const getName = (blank, cb) => {
    const name = `server:${serverId}`;

    cb(name);
    return name;
  };

  // ALPHA
  const [fireAlpha, onAlpha] = Pipe();
  onAlpha(noOp);

  let counter = 0;
  setInterval(() => {
    counter += 2;
    fireAlpha(counter);
  }, 300);

  // SEND_CHAT
  const sendChat = msg => console.log('Chat:', msg);

  const systemMap = Map({
    BIND_MAP_FN: split(bindMapFn),
    GET_NAME: getName,
    ON_ALPHA: split(onAlpha),
    SEND_CHAT: sendChat,
  });

  const unsplits = {};
  const clientBrokers = {};

  const broker = Broker();
  broker.bindGetSystemWithPullId(([systemId, pullId], cb) => {
    if(systemId.startsWith('C2C_')) {
      const clientName = systemId.substring(4).toLowerCase();
      console.log('CN', clientName);
      const clientBroker = clientBrokers[clientName];
      clientBroker.pull('C2C', getClientName => {
        cb(getClientName);
      });
      return;
    }

    let system = systemMap(systemId);

    if(systemId === 'ON_ALPHA') {
      const [pipeA, pipeP] = Pipe();

      unsplits[pullId] = system(pipeA);

      system = pipeP;
    }

    cb(system);
  });

  broker.onRelease(pullId => {
    const unsplit = unsplits[pullId];
    unsplit();
  });

  const addClientBroker = broker => {
    broker.pull('GET_CLIENT_NAME', getClientName => {
      getClientName(null, name => {
        console.log(`== SERVER == Adding client ${name}`);
        clientBrokers[name] = broker;
      });
    });
  };

  return { ...broker, getName, addClientBroker };
};
