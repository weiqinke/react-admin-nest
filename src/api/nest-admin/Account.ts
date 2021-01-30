import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;

export const GetAllMenu = (payload: any) => {
  return request(`${BASE_URL}Account/GetAllMenu`, 'GET', payload);
};
