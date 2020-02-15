export const connect = (duplexA, duplexB) => {
  duplexA.onMessage(duplexB.send);
  duplexB.onMessage(duplexA.send);
};

export const connectWithLogs = (duplexAName, duplexA, duplexBName, duplexB) => {
  duplexA.onMessage(msg => {
    console.log(`${duplexAName} >>> ${duplexBName}`, msg);
    duplexB.send(msg);
  });
  duplexB.onMessage(msg => {
    console.log(`${duplexAName} <<< ${duplexBName}`, msg);
    duplexA.send(msg);
  });
};

export const connectAsync = (duplexA, duplexB) => {
  duplexA.onMessage(msg => {
    setTimeout(() => duplexB.send(msg), 0);
  });
  duplexB.onMessage(msg => {
    setTimeout(() => duplexA.send(msg), 0);
  });
};
