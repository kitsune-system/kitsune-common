export const CounterIdSource = () => {
  let counter = 0;

  const get = ({ onOutput }) => {
    const id = `${++counter}`;
    onOutput(id);
  };

  return { get };
};
