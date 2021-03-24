import React, { FC, useEffect } from 'react';
import SystemInfo from './systeminfo/SystemInfo';
import WorkChart from './workchart/WorkChart';
import './workbench.less';
import AccountLog from './accountlog/AccountLog';
const Workbench: FC = () => {
  useEffect(() => {}, []);

  return (
    <div className="workbench panel">
      <SystemInfo />
      <AccountLog />
      <div className="workbench-chart">
        <WorkChart />
      </div>
    </div>
  );
};

export default Workbench;
