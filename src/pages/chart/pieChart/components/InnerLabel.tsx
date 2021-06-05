import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';

class InnerLabel extends React.Component {
  public render() {
    const data = [
      {
        item: '本科',
        count: 40
      },
      {
        item: '硕士',
        count: 21
      },
      {
        item: '博士',
        count: 9
      },
      {
        item: '初中',
        count: 13
      },
      {
        item: '专科',
        count: 9
      },
      {
        item: '未知',
        count: 8
      }
    ];
    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'count',
      dimension: 'item',
      as: 'percent'
    });
    const scale = {
      percent: { formatter: (val: number) => val * 100 + '%' }
    };
    return (
      <div>
        <Chart
          height={400}
          width={400}
          padding={[20, 0, 20, 0]}
          background={{ fill: '#fff' }}
          data={dv}
          scale={scale}
          forceFit
        >
          <Coord type="theta" radius={1} />
          <Axis name="percent" />
          <Legend position="right" offsetY={-200} offsetX={-60} />
          <Tooltip showTitle={false} />
          <Geom
            type="interval"
            position="percent"
            color={['item', ['#2593fc', '#38c060', '#27c1c1', '#705dc8', '#3b4771', '#f9cb34']]}
          >
            <Label content="percent" offset={-40} />
          </Geom>
        </Chart>
      </div>
    );
  }
}

export default InnerLabel;
