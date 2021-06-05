import React from 'react';
import { Chart, Geom, Axis, Tooltip, Coord, Label, Legend, Guide } from 'bizcharts';
import DataSet from '@antv/data-set';

class Donut extends React.Component {
  public render() {
    const { DataView } = DataSet;
    const { Text } = Guide;
    const data = [
      {
        item: '事例一',
        count: 40
      },
      {
        item: '事例二',
        count: 21
      },
      {
        item: '事例三',
        count: 17
      },
      {
        item: '事例四',
        count: 13
      },
      {
        item: '事例五',
        count: 9
      }
    ];
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
          padding={[40, 0, 60, 0]}
          background={{ fill: '#fff' }}
          data={dv}
          scale={scale}
          forceFit
        >
          <Coord type={'theta'} radius={1} innerRadius={0.6} />
          <Axis name="percent" />
          <Legend position="bottom-left" />
          <Tooltip
            showTitle={false}
            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
          />
          <Guide>
            <Text
              position={['50%', '50%']}
              html='<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">主机<br><span style="color:#8c8c8c;font-size:20px">200</span>台</div>'
              alignX="middle"
              alignY="middle"
            />
          </Guide>
          <Geom
            type="interval"
            position="percent"
            color="item"
            tooltip={[
              'item*percent',
              (item, percent) => ({
                name: item,
                value: percent * 100 + '%'
              })
            ]}
            style={{
              lineWidth: 1,
              stroke: '#fff'
            }}
          >
            <Label content="percent" formatter={(val: any, item: any) => item.point.item + ': ' + val} />
          </Geom>
        </Chart>
      </div>
    );
  }
}
export default Donut;
