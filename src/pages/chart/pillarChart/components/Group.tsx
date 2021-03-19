import React from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';

class Basic extends React.Component {
  public render() {
    const data = [
      {
        company: '服装销售额',
        type: '第一季度',
        value: 120012
      },
      {
        company: '化妆品销售额',
        type: '第一季度',
        value: 21331
      },
      {
        company: '电器销售额',
        type: '第一季度',
        value: 32142
      },
      {
        company: '服装销售额',
        type: '第二季度',
        value: 90012
      },
      {
        company: '化妆品销售额',
        type: '第二季度',
        value: 31331
      },
      {
        company: '电器销售额',
        type: '第二季度',
        value: 25142
      },
      {
        company: '服装销售额',
        type: '第三季度',
        value: 80012
      },
      {
        company: '化妆品销售额',
        type: '第三季度',
        value: 28331
      },
      {
        company: '电器销售额',
        type: '第三季度',
        value: 36142
      },
      {
        company: '服装销售额',
        type: '第四季度',
        value: 150012
      },
      {
        company: '化妆品销售额',
        type: '第四季度',
        value: 41331
      },
      {
        company: '电器销售额',
        type: '第四季度',
        value: 53248
      }
    ];
    const scale = {
      value: {
        alias: '销售额（元）'
      }
    };
    return (
      <div>
        <Chart height={400} padding={[40, 20, 40, 50]} background={{ fill: '#fff' }} data={data} scale={scale} forceFit>
          <Axis
            name="type"
            tickLine={{
              length: 0
            }}
            label={{
              style: {}
            }}
          />
          <Axis
            name="value"
            label={{
              style: {
                formatter: (val: string) => Number(val) / 1000 + 'k'
              }
            }}
          />
          <Legend position="top" />
          <Tooltip />
          <Geom
            type="interval"
            position="type*value"
            color="company"
            adjust={[
              {
                type: 'dodge',
                marginRatio: 0.02
              }
            ]}
          />
        </Chart>
      </div>
    );
  }
}

export default Basic;
