import { Pipe } from '@gamedevfox/katana';

export const AnimationFrame = () => {
  const [cancelAnimationFrame, onCancelAnimationFrame] = Pipe();

  const [frame, onFrame] = Pipe();

  let requestAnimationFrame = null;
  let requestId = null;

  const frameLoop = time => {
    frame(time);

    if(requestAnimationFrame)
      requestId = requestAnimationFrame(frameLoop);
  };

  const onRequestAnimationFrame = fn => {
    requestAnimationFrame = fn;

    if(requestAnimationFrame)
      requestId = requestAnimationFrame(frameLoop);
    else
      cancelAnimationFrame(requestId);
  };

  return { onRequestAnimationFrame, onCancelAnimationFrame, onFrame };
};
