/** 项目的入口文件 **/
import Root from "@/pages/Root";
import React from "react";
import ReactDOM from "react-dom";
import { HashRouter } from "react-router-dom";
/** 公共样式 **/
import "./styles/css.css";
import "./styles/index.styl";
import "./styles/less.less";
import "./styles/scrollbar.scss";
import "./styles/scss.scss";

const CARAVAN_ROOT = document.getElementById("caravan-root");

if (!CARAVAN_ROOT) {
  throw new Error(`当前页面不存在 <div id="caravan-root"></div> 节点`);
}

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Root />
    </HashRouter>
  </React.StrictMode>,
  CARAVAN_ROOT
);

if (module["hot"]) {
  module["hot"].accept();
}
