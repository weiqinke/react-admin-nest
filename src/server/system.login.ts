import { request } from 'api/request';
const BASE_URL = process.env.REACT_APP_API_URL;
export function loginInProject(payload: unknown) {
  return request(`${BASE_URL}Account/Login`, 'post', payload);
}

export function GetMenu(payload: unknown) {
  return request(`${BASE_URL}Account/GetMenu`, 'get', payload);
}
