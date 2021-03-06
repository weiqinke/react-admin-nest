import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SystemInfo from './systeminfo/SystemInfo';
import WorkChart from './workchart/WorkChart';
import './workbench.less';
import AccountLog from './accountlog/AccountLog';
import { findalllogs } from 'api/nest-admin/Accountlog';
import moment from 'moment';
import { webSocketManager } from 'utils/websocket';

interface TimeData {
  count: string;
  year: string;
  value: number;
}
const Workbench: FC = () => {
  const [chartdata, setchartdata] = useState<TimeData[]>([]);
  const intervalHandle: any = useRef(null);
  const [OsInfo, setOsInfo] = useState<any>({
    freemem: 0,
    totalmem: 0
  });
  const [Tabledata, setTabledata] = useState<TimeData[]>([]);
  const findAllLogs = async () => {
    const result = await findalllogs({
      st: moment().subtract(15, 'days'),
      et: moment()
    });
    if (result.data.code === 200) {
      const timedata: TimeData[] = [];
      setTabledata(result.data.data || []);
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
  const getSystemInfo = useCallback(() => {
    webSocketManager.postMessage({
      name: 'qkstartCar',
      type: 'OSSTATUS',
      message: '查看内存使用情况',
      data: {}
    });
    clearTimeout(intervalHandle.current);
    intervalHandle.current = setTimeout(() => {
      getSystemInfo();
    }, 1000 * 20);
  }, []);

  useEffect(() => {
    findAllLogs();
    getSystemInfo();
    return () => {
      clearTimeout(intervalHandle.current);
    };
  }, [getSystemInfo]);
  useEffect(() => {
    const removeHandler = webSocketManager.addEventHandler(payload => {
      const { name, data } = payload;
      if (name === 'OSSTATUS') {
        setOsInfo(data);
      }
    });
    return removeHandler;
  }, []);

  //使用memo优化图形组件。
  const Memo = useMemo(() => {
    return <WorkChart chartdata={chartdata} />;
  }, [chartdata]);

  return (
    <div className="workbench panel">
      <SystemInfo OsInfo={OsInfo} />
      <AccountLog Tableata={Tabledata} />
      <div className="workbench-chart">{Memo}</div>
    </div>
  );
};

export default Workbench;
