import { noOp } from '@gamedevfox/katana';
import axios from 'axios';

export const HttpSystem = systemURL => {
  const httpClient = axios.create({
    baseURL: systemURL,
    headers: { 'Content-Type': 'application/json' },
  });
  httpClient.interceptors.response.use(res => res.data);

  return (systemId, systemOut = noOp) => {
    const path = encodeURIComponent(systemId);

    systemOut((input, output = noOp) => {
      const json = JSON.stringify(input);
      httpClient.post(path, json).then(output);
    });
  };
};
