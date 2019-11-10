export const IndentLogger = () => {
  let indent = '';

  const result = (...args) => {
    args[0] = indent + args[0].toString();
    console.log(...args);
  };

  result.indent = fn => {
    const oldIndent = indent;
    indent = `${indent}  `;
    fn();
    indent = oldIndent;
  };

  return result;
};
