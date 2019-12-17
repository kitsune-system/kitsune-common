import { Pipe } from '@gamedevfox/katana';

export const AnimationFrame = () => {
  const [caf, cancelAnimationFrame] = Pipe();

  const [onFrameA, onFrame] = Pipe();

  let raf = null;
  let rafId = null;

  const frameLoop = time => {
    onFrameA(time);

    if(raf)
      rafId = raf(frameLoop);
  };

  const requestAnimationFrame = fn => {
    raf = fn;

    if(raf)
      rafId = raf(frameLoop);
    else
      caf(rafId);
  };

  return { requestAnimationFrame, cancelAnimationFrame, onFrame };
};
