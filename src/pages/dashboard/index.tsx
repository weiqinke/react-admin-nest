import React, { FC, useEffect } from 'react';
import './index.less';
import Overview from './overview';
const DashBoardPage: FC = () => {
  useEffect(() => {}, []);
  return (
    <div>
      <Overview />
    </div>
  );
};

export default DashBoardPage;
