const Builder = config => {
  const cache = {};

  const resolver = name => {
    // Check cache
    if(name in cache)
      return cache[name];

    if(!(name in config))
      throw new Error(`No name in builder config for: ${name}`);

    let value = config[name];

    let afterFn = null;
    if(typeof value === 'function') {
      const after = fn => (afterFn = fn);
      value = value(resolver, after);
    }

    cache[name] = value;

    // Run afterFn is it's been set
    if(typeof afterFn === 'function')
      afterFn(resolver);

    return value;
  };

  return resolver;
};

export default Builder;
