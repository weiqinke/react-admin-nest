import { GithubOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import './FootLinks.less';

const FootLinks: FC = () => {
  const myaddr = () => {
    window.open('https://github.com/weiqinke/react-admin-nest', '_blank');
  };
  return (
    <div className="footline">
      <span className="footline-github" onClick={myaddr}>
        <GithubOutlined />
      </span>
    </div>
  );
};

export default FootLinks;
