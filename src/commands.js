import { Map } from '@gamedevfox/katana';

import { SUPPORTS_COMMAND } from './index';

export const Commands = () => {
  const commands = Map();

  commands(SUPPORTS_COMMAND, ({ system }) => (commandId, output) => {
    const command = system(commandId);
    output(command !== undefined);
  });

  return commands;
};

export const bindCommands = (commands, deps) => {
  const built = Map();

  Object.entries(commands()).forEach(([id, build]) => built(id, build(deps)));

  return built;
};
