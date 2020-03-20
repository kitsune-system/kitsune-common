import { Pipe } from '../pipe';

export const DuplexRequest = () => {
  const [sendMessage, onMessage] = Pipe();
  const [send, onReceiveMessage] = Pipe();

  let callCount = 0;
  const calls = {};

  const result = input => {
    const values = {};
    const fnNames = [];

    const call = {};
    Object.entries(input).forEach(([key, value]) => {
      if(typeof value === 'function') {
        fnNames.push(key);
        call[key] = value;
      } else
        values[key] = value;
    });

    const callId = ++callCount;
    calls[callId] = call;

    sendMessage({ callId, fnNames, values });
  };

  onReceiveMessage(message => {
    const { callId, fnName, response } = message;

    const call = calls[callId];
    delete calls[callId];

    const fn = call[fnName];
    fn(response);
  });

  result.send = send;
  result.onMessage = onMessage;

  return result;
};

export const DuplexResponse = () => {
  const [send, onReceiveMessage] = Pipe();
  const [sendMessage, onMessage] = Pipe();

  let fn;
  const result = target => (fn = target);

  onReceiveMessage(message => {
    const { callId, fnNames, values } = message;

    const input = { ...values };
    fnNames.forEach(fnName => {
      const fn = response => sendMessage({ callId, fnName, response });
      input[fnName] = fn;
    });

    fn(input);
  });

  result.send = send;
  result.onMessage = onMessage;

  return result;
};
