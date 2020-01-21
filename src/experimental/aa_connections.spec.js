import { noOp } from '@gamedevfox/katana';
import WebSocket from 'ws';

import { Collector } from '../collector';

import { Client } from './client';
import { Server } from './server';
import { DuplexChannels } from './duplex-channels';
import { WebSocketDuplex } from './web-socket-duplex';
import { DuplexBroker } from './duplex-broker';
import { activeInterfaceMap } from './active-interface-map';

export const interfaceMap = {
  // SERVER
  BIND_MAP_FN: 'OUTER_MAP',
  GET_NAME: 'INNER_MAP',
  ON_ALPHA: 'OUTPUT',
  SEND_CHAT: 'INPUT',

  // CLIENT
  BIND_GET_REMOTE_NAME: 'OUTER_MAP',
  LOG_MESSAGE: 'INPUT',
  MAP_VALUE: 'INNER_MAP',
  ON_CHAT: 'OUTPUT',
  GET_CLIENT_NAME: 'INNER_MAP',
  C2C: 'INPUT',
  C2C_ALPHA: 'INPUT',
  C2C_BETA: 'INPUT',
  BIND_C2C: 'OUTPUT',
};

const buildConnectById = (broker, duplexBroker) => {
  return (remoteSystemId, localSystemId, cb = noOp) => {
    const systemC = Collector();

    duplexBroker.pull(remoteSystemId, systemC('remoteSystem'));
    broker.pull(localSystemId, systemC('localSystem'));

    systemC.done(({ remoteSystem, localSystem }) => {
      const face = interfaceMap[remoteSystemId];
      const isActive = activeInterfaceMap[face];

      const [activeSystem, passiveSystem] = isActive ?
        [remoteSystem, localSystem] : [localSystem, remoteSystem];

      activeSystem(passiveSystem);
      cb();
    });
  };
};

describe.skip('WebSocket', () => {
  let wss;

  before(done => {
    wss = new WebSocket.Server({ port: 1234 });
    wss.on('listening', done);
  });

  after(done => wss.close(done));

  it('should work', done => {
    // Server
    const server = Server('test');

    wss.on('connection', ws => {
      const duplex = WebSocketDuplex.NodeJS(ws);
      const channels = DuplexChannels(duplex);

      const duplexBroker = DuplexBroker({ channels });
      duplexBroker.bindBrokerPull(server.pull);
      duplexBroker.bindGetInterface(systemId => interfaceMap[systemId]);

      const connectById = buildConnectById(server, duplexBroker);
      connectById('MAP_VALUE', 'BIND_MAP_FN');
      connectById('LOG_MESSAGE', 'ON_ALPHA');

      server.addClientBroker(duplexBroker);

      // connectById('ON_CHAT', 'SEND_CHAT');
      // connectById('BIND_GET_REMOTE_NAME', 'GET_NAME', () => {
      //   client.test(7890);
      //   console.log('DONE');
      // });
    });

    const buildClient = (name, cb = noOp) => {
      const client = Client('test', name);

      const ws = new WebSocket('ws://localhost:1234');
      ws.on('open', () => {
        const duplex = WebSocketDuplex.NodeJS(ws);
        const channels = DuplexChannels(duplex);

        const duplexBroker = DuplexBroker({ channels });
        duplexBroker.bindBrokerPull(client.pull);
        duplexBroker.bindGetInterface(systemId => interfaceMap[systemId]);

        const connectById = buildConnectById(client, duplexBroker);
        cb(client, connectById);
      });
    };

    // Client Alpha
    buildClient('alpha', (client, connectById) => {
      // connectById('BIND_MAP_FN', 'MAP_VALUE');
      // connectById('ON_ALPHA', 'LOG_MESSAGE');

      connectById('SEND_CHAT', 'ON_CHAT');
      connectById('GET_NAME', 'BIND_GET_REMOTE_NAME', () => {
        client.test(1234);
        console.log('DONE A');
      });
    });

    // Client Beta
    buildClient('beta', (client, connectById) => {
      // connectById('BIND_MAP_FN', 'MAP_VALUE');
      // connectById('ON_ALPHA', 'LOG_MESSAGE');

      connectById('SEND_CHAT', 'ON_CHAT');
      connectById('GET_NAME', 'BIND_GET_REMOTE_NAME', () => {
        client.test(7890);
        console.log('DONE B');
      });

      setTimeout(() => {
        connectById('C2C_ALPHA', 'BIND_C2C', () => {
          client.c2cOut('Why hello there...');
        });
      }, 200);
    });

    setTimeout(done, 1500);
  });
});
