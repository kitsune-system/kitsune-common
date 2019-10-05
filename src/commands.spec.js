import { List, Map } from '@gamedevfox/katana';
import { expect } from 'chai';

import { Commands, bindCommands } from './commands';
import { SUPPORTS_COMMAND } from './index';

const TEST = 'ttO24JdxtHKmBsGBiV2k3jMAt1s55iALo6AJNp+hL1E=';
const MISSING = 'RUTAG5IRGgP3KI0g0HXDXiBlRP9YA34lrzSXoKGIxck=';

describe('Commands', () => {
  it('should work', () => {
    const commands = Commands();

    const system = Map();
    const bound = bindCommands(commands, { system });

    // Copy bound funcitons to system
    bound.each(system);

    system(TEST, (input, output) => output(`Welcome, ${input}!`));

    const list = List();
    system(SUPPORTS_COMMAND)(TEST, list);
    system(TEST)('Frank', list);
    system(SUPPORTS_COMMAND)(MISSING, list);
    expect(system(MISSING)).to.be.undefined;

    list().should.deep.equal([true, 'Welcome, Frank!', false]);
  });
});
