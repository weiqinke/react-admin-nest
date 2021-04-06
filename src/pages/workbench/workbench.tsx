import React, { FC, useEffect, useState } from 'react';
import SystemInfo from './systeminfo/SystemInfo';
import WorkChart from './workchart/WorkChart';
import './workbench.less';
import AccountLog from './accountlog/AccountLog';
import { findalllogs } from 'api/nest-admin/Accountlog';
import moment from 'moment';

interface TimeData {
  count: string;
  year: string;
  value: number;
}
const Workbench: FC = () => {
  const [chartdata, setchartdata] = useState<TimeData[]>([]);
  const findAllLogs = async () => {
    const result = await findalllogs({
      st: moment().subtract(7, 'days'),
      et: moment()
    });
    if (result.data.code === 200) {
      const timedata: TimeData[] = [];
      result.data.data.map((item: any) => {
        return timedata.push({
          count: item.name,
          year: moment(item.created).format('YYYY-MM-DD'),
          value: 1
        });
      });
      setchartdata(timedata);
    }
  };
  useEffect(() => {
    findAllLogs();
  }, []);

  return (
    <div className="workbench panel">
      <SystemInfo />
      <AccountLog />
      <div className="workbench-chart">
        <WorkChart chartdata={chartdata} />
      </div>
    </div>
  );
};

export default Workbench;
