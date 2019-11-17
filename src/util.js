import { noOp } from '@gamedevfox/katana';

export const toAsync = fn => (input, output = noOp) => output(fn(input));
