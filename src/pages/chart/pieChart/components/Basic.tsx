import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend } from 'bizcharts';

class Basic extends React.Component {
  public render() {
    const data = [
      {
        item: '事例一',
        percent: 0.4
      },
      {
        item: '事例二',
        percent: 0.21
      },
      {
        item: '事例三',
        percent: 0.17
      },
      {
        item: '事例四',
        percent: 0.13
      },
      {
        item: '事例五',
        percent: 0.09
      }
    ];

    const scale = {
      percent: { formatter: (val: number) => val * 100 + '%' }
    };
    return (
      <div>
        <Chart
          height={400}
          width={400}
          padding={[40, 0, 60, 0]}
          background={{ fill: '#fff' }}
          data={data}
          scale={scale}
          forceFit
        >
          <Coord type="theta" radius={1} />
          <Axis name="percent" />
          <Legend position="bottom-left" />
          <Tooltip
            showTitle={false}
            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
          />
          <Geom
            type="interval"
            position="percent"
            color="item"
            style={{
              lineWidth: 1,
              stroke: '#fff'
            }}
          >
            <Label content="percent" formatter={(text: string, item: any) => `${item.point.item}:${text}`} />
          </Geom>
        </Chart>
      </div>
    );
  }
}

export default Basic;
