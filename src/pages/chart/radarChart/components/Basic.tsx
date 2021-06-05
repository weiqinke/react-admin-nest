import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord } from 'bizcharts';
import DataSet from '@antv/data-set';

// CDN START

class Basic extends React.Component {
  public render() {
    const data = [
      {
        item: 'Design',
        a: 100,
        b: 30
      },
      {
        item: 'Development',
        a: 70,
        b: 70
      },
      {
        item: 'Marketing',
        a: 60,
        b: 40
      },
      {
        item: 'Users',
        a: 40,
        b: 50
      },
      {
        item: 'Test',
        a: 60,
        b: 70
      }
    ];
    const { DataView } = DataSet;
    const dv = new DataView().source(data);
    dv.transform({
      type: 'fold',
      fields: ['a', 'b'], // 展开字段集
      key: 'user', // key字段
      value: 'score' // value字段
    });
    const scale = {
      score: {
        min: 0,
        max: 100
      }
    };
    return (
      <div>
        <Chart
          height={400}
          width={400}
          padding={[40, 0, 50, 0]}
          background={{ fill: '#fff' }}
          data={dv}
          scale={scale}
          forceFit
        >
          <Coord type="polar" radius={1} />
          <Axis name="item" />
          <Tooltip />
          <Axis name="score" />
          <Geom type="line" position="item*score" color="user" size={1} />
          <Geom type="point" position="item*score" color="user" shape="circle" size={3} />
        </Chart>
      </div>
    );
  }
}

// CDN END

export default Basic;
