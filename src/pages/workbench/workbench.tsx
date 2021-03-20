import React, { FC, useEffect } from 'react';
import SystemInfo from './systeminfo/SystemInfo';
import WorkChart from './workchart/WorkChart';
import './workbench.less';
const Workbench: FC = () => {
  useEffect(() => {}, []);

  return (
    <div className="workbench panel">
      <SystemInfo />
      <div className="workbench-chart">
        <WorkChart />
      </div>
    </div>
  );
};

export default Workbench;
