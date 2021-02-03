interface headers {
  'content-length': string;
  'content-type': string;
}
interface data {
  code: number;
  message: string;
  data: any;
}
export interface HttpSuccess {
  config: any;
  data: data;
  headers: headers;
  request: any;
  status: number;
  statusText: string;
}
