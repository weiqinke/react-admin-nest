/// <reference types="react-scripts" />

declare interface Window {
  document:any,
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: Function;
}

declare module '*.module.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module 'captcha-mini'{
  const captcha: any;
  export default captcha;
}