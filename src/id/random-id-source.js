import crypto from 'crypto';

export const RandomIdSource = () => {
  const get = ({ onOutput }) => {
    const id = crypto.randomBytes(256 / 8).toString('base64');
    onOutput(id);
  };

  return { get };
};
