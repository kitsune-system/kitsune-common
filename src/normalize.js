export const returnValue = fn => {
  return ({ input, onOutput }) => {
    const result = fn(input);
    onOutput(result);
  };
};

export const fromCallbacks = fn => {
  return ({ input, onOutput, onError }) => {
    if(onError)
      fn(input, onOutput, onError);
    else
      fn(input, onOutput);
  };
};

export const toCallbacks = fn => {
  return (input, onOutput, onError) => {
    const params = { input };
    if(onOutput)
      params.onOutput = onOutput;
    if(onError)
      params.onError = onError;

    fn(params);
  };
};
