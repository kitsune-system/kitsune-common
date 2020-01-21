import { Pipe, identity } from '@gamedevfox/katana';

export const WatchAndWait = (fn = identity) => {
  let waits = [];

  const [watch, onWatch] = Pipe();
  onWatch(value => {
    const meta = fn(value);

    const hitWaits = [];
    const missedWaits = [];
    waits.forEach(wait => {
      const isHit = wait[0] === meta;
      const list = isHit ? hitWaits : missedWaits;
      list.push(wait);
    });

    hitWaits.map(wait => wait[1]).forEach(callback => callback(value));
    waits = missedWaits;
  });

  const waitFor = (value, cb) => waits.push([value, cb]);

  return [watch, waitFor];
};
