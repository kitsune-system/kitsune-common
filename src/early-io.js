export const early = output => {
  let isEarly = true;
  const earlyValues = [];

  output(value => earlyValues.push(value));

  const newOutput = fn => {
    output(fn);

    if(isEarly) {
      // Repeat early values
      earlyValues.forEach(fn);
      isEarly = false;
    }
  };

  return newOutput;
};
