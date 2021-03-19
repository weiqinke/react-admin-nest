[English](./README.md) | 简体中文

<h1 align="center">Nest Admin</h1>

- 预览: https://qkstart.com

## 📦 下载

```bash
$ git clone https://gitee.com/weiqinke/nest-admin.git
$ cd nest-admin
$ npm install
$ npm start
```

## 🔨 构建

```bash
yarn install
yarn run build
```

- :white_check_mark:**通用登录**：完成
- :white_check_mark:**路由使用浏览器模式**使用 browserHistory
- :white_check_mark:没有登录时，默认跳转到首页
- [x] 完善 axios 拦截器
- [x] 通用切换菜单，右键菜单在点击别的元素时，能自动隐藏
- [ ] 菜单支持 layoutfix 布局
- [ ] 展开菜单仅支持展开两个大类或者仅展开一类菜单
- [ ] 将国际化组件换成 I18N
- [ ] 在 nginx 上适配 browserHistory
- [ ] 持续开发

## 项目结构
react-admin-nest  
├── config-overrides.js  
├── LICENSE  
├── public  
│   ├── favicon.ico  
│   ├── index.html  
│   ├── logo192.png  
│   ├── logo512.png  
│   ├── manifest.json  
│   └── robots.txt  
├── README.md  
├── src  
│   ├── api  
│   │   ├── axios-interceptors.js  
│   │   ├── nest-admin  
│   │   ├── request.ts  
│   │   └── request_old.ts  
│   ├── App.test.tsx  
│   ├── App.tsx  
│   ├── assets  
│   │   ├── header  
│   ├── config  
│   │   └── defaultMenuConfig.ts  
│   ├── hooks  
│   │   ├── useAsyncEffect.ts  
│   │   ├── usePrevious.ts  
│   │   ├── useProjectConfig.ts  
│   │   └── useSystemInfo.ts  
│   ├── index.tsx  
│   ├── interface  
│   │   ├── http  
│   │   ├── index.ts  
│   │   ├── layout  
│   │   ├── permission  
│   │   └── user  
│   ├── locales  
│   │   ├── en-US  
│   │   ├── index.tsx  
│   │   └── zh-CN  
│   ├── pages  
│   │   ├── 403.tsx  
│   │   ├── 404.tsx  
│   │   ├── account  
│   │   ├── article  
│   │   ├── chart  
│   │   ├── commponents  
│   │   ├── dashboard  
│   │   ├── documentation  
│   │   ├── form  
│   │   ├── guide  
│   │   ├── layout  
│   │   ├── list  
│   │   ├── login  
│   │   ├── notauth  
│   │   ├── permission  
│   │   ├── system  
│   │   ├── tarceindex  
│   │   └── workbench  
│   ├── react-app-env.d.ts  
│   ├── reportWebVitals.ts  
│   ├── routes  
│   │   ├── config.tsx  
│   │   ├── index.tsx  
│   │   └── pravateRoute.tsx  
│   ├── server  
│   │   └── system.login.ts  
│   ├── setupProxy.js  
│   ├── setupTests.ts  
│   ├── stores  
│   │   ├── index.ts  
│   │   ├── menu.store.ts  
│   │   ├── rootReducer.tsx  
│   │   ├── tags-view.store.ts  
│   │   └── user.store.ts  
│   ├── styles  
│   │   ├── antd.reset.less  
│   │   ├── App.scss  
│   │   ├── base.scss  
│   │   ├── index.less  
│   │   ├── layout.scss  
│   │   ├── main.less  
│   │   └── view-style  
│   └── utils  
│       ├── constant-mng.ts  
│       ├── core.ts  
│       ├── event-bus.ts  
│       ├── file.ts  
│       ├── getGloabal.ts  
│       ├── menuUtil.ts  
│       ├── render-routes  
│       ├── scrollTo.ts  
│       ├── typing.js  
│       ├── validate.ts  
│       └── websocket.ts  
├── tsconfig.json  
└── yarn.lock  