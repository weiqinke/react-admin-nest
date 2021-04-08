import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

export const onearticle = (payload: any) => {
  return request(`${BASE_URL}articles/onearticle`, 'post', payload);
};
