import React from 'react';
import { Chart, Tooltip, Interval, Annotation } from 'bizcharts';
import DataSet from '@antv/data-set';
interface IProps {
  chartdata: TimeData | any;
}
interface TimeData {
  count: string;
  year: string;
  value: number;
}

const WorkChart: React.FC<IProps> = (props: any) => {
  const { chartdata } = props;
  const ds = new DataSet();
  const dv = ds.createView().source(chartdata);
  dv.transform({
    type: 'percent',
    field: 'value', // 统计销量
    dimension: 'count', // 每年的占比
    groupBy: ['year'] // 以不同产品类别为分组
  });

  return (
    <Chart
      height={600}
      padding="auto"
      scale={{
        percent: {
          min: 0
        }
      }}
      data={dv.rows}
      autoFit
    >
      <Interval adjust="stack" color="count" position="year*value" />
      <Annotation.Text
        position={['min', 'max']}
        content="最近7天活跃频率"
        offsetX={-140}
        offsetY={10}
        style={{
          fontSize: 14
        }}
      />
      <Tooltip shared />
    </Chart>
  );
};

export default WorkChart;
