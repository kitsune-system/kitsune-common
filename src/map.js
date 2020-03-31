export const Map = () => {
  const values = {};

  const set = ({ id, value }) => (values[id] = value);

  const get = ({ input: id, onOutput }) => {
    const value = values[id];
    onOutput(value);
  };

  return { set, get };
};
