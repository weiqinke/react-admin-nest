import { Button, Result } from "antd";
import React from "react";

const NotFoundPage = () => <Result status="404" title="404" subTitle="此页面丢失了。" extra={<Button type="primary">返回主页</Button>} />;

export default NotFoundPage;
