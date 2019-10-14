import { noOp } from '@gamedevfox/katana';

export const WebSocketSystem = ({ core, socket }) => {
  let outputIdCounter = 0;
  const outputFns = {};

  const handleRequest = msg => {
    const { systemId, input, outputId } = msg;

    let outputFn = noOp;
    if(outputId)
      outputFn = value => socket({ outputId, output: value });

    core(systemId, system => system(input, outputFn));
  };

  const handleResponse = msg => {
    const { outputId, output } = msg;
    if(!outputId)
      return;

    const outputFn = outputFns[outputId];
    delete outputFns[outputId];

    outputFn(output);
  };

  socket.output(msg => {
    if('input' in msg)
      handleRequest(msg);
    else if('output' in msg)
      handleResponse(msg);
    else
      console.log('Can\'t handle message:', msg);
  });

  return (systemId, systemOut = noOp) => {
    const system = (input, output) => {
      const msg = { systemId, input };

      if(output) {
        const outputId = ++outputIdCounter;
        outputFns[outputId] = output;

        msg.outputId = outputId;
      }

      socket(msg);
    };

    systemOut(system);
  };
};
