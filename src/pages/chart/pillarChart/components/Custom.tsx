import React from 'react';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';

class Basic extends React.Component {
  public render() {
    const data = [
      {
        name: '张三',
        vote: 35654
      },
      {
        name: '李四',
        vote: 65456
      },
      {
        name: '王五',
        vote: 45724
      },
      {
        name: '赵六',
        vote: 13654
      }
    ];
    const scale = {
      name: {
        alias: '姓名'
      },
      vote: {
        min: 0,
        alias: '票数',
        formatter: (val: any) => Number(val) / 1000 + 'k'
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
          />
          <Tooltip showTitle={false} />
          <Geom
            type="interval"
            position="name*vote"
            color={['name', ['#7f8da9', '#fec514', '#db4c3c', '#daf0fd']]}
            tooltip="name*vote"
          />
        </Chart>
      </div>
    );
  }
}

export default Basic;
