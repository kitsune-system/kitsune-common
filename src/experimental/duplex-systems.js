import { DuplexCallback } from './duplex-callback';

// bindOuterMap(innerMap);
// input > map > output
// OUTER_MAP | INNER_MAP
// (ACTIVE)    (PASSIVE)

// output(input);
// (ACTIVE) (PASSIVE)

export const duplexSystemMap = {
  INPUT: channel => channel.send, // ACTIVE
  OUTPUT: channel => channel.onMessage, // PASSIVE
  INNER_MAP: channel => DuplexCallback(channel).send, // ACTIVE
  OUTER_MAP: channel => DuplexCallback(channel).onMessage, // PASSIVE
};
