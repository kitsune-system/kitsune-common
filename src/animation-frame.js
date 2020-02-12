import { Pipe } from '@gamedevfox/katana';

export const AnimationFrame = () => {
  const [cancelAnimationFrame, bindCancelAnimationFrame] = Pipe();

  const [onFrameA, onFrame] = Pipe();

  let requestAnimationFrame = null;
  let requestId = null;

  const frameLoop = time => {
    onFrameA(time);

    if(requestAnimationFrame)
      requestId = requestAnimationFrame(frameLoop);
  };

  const bindRequestAnimationFrame = fn => {
    requestAnimationFrame = fn;

    if(requestAnimationFrame)
      requestId = requestAnimationFrame(frameLoop);
    else
      cancelAnimationFrame(requestId);
  };

  return { bindRequestAnimationFrame, bindCancelAnimationFrame, onFrame };
};
