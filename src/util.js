// FIXME: Test me
export const splice = (output, spliceInput, spliceOutput) => {
  const input = output();
  spliceOutput(input);
  output(spliceInput);
};

export const toAsync = fn => (input, output = () => {}) => output(fn(input));

export const loop = (fn, onOutput) => {
  const run = () => {
    while(true) { // eslint-disable-line no-constant-condition
      let syncComplete = false;
      let asyncComplete = false;
      let stopFlag = false;

      let result = [];
      fn({
        onOutput: () => {
          asyncComplete = true;

          if(syncComplete)
            run();
        },
        onStop: (...args) => {
          result = args;
          stopFlag = true;
        },
      });
      syncComplete = true;

      if(stopFlag) {
        onOutput(...result);
        return;
      }

      if(!asyncComplete)
        return;
    }
  };

  run();
};

export const forEach = (input, fn, onOutput) => {
  let index = 0;
  loop(({ onOutput, onStop }) => {
    if(index >= input.length) {
      onStop();
      return;
    }

    const item = input[index];
    fn({
      input: item,
      onOutput: () => {
        index++;
        onOutput();
      },
      onStop,
    });
  }, onOutput);
};
