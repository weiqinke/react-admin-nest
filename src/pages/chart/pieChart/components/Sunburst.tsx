import React from 'react';
import { Chart, Geom, Tooltip, Coord, Label } from 'bizcharts';
import DataSet from '@antv/data-set';

class Sunburst extends React.Component {
  public render() {
    const data = [
      {
        value: 251,
        type: '大事例一',
        name: '子事例一'
      },
      {
        value: 1048,
        type: '大事例一',
        name: '子事例二'
      },
      {
        value: 610,
        type: '大事例二',
        name: '子事例三'
      },
      {
        value: 434,
        type: '大事例二',
        name: '子事例四'
      },
      {
        value: 335,
        type: '大事例三',
        name: '子事例五'
      },
      {
        value: 250,
        type: '大事例三',
        name: '子事例六'
      }
    ];
    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(data).transform({
      type: 'percent',
      field: 'value',
      dimension: 'type',
      as: 'percent'
    });
    const scale = {
      percent: { formatter: (val: number) => `${(val * 100).toFixed(2)}%` }
    };

    const dv1 = new DataView();
    dv1.source(data).transform({
      type: 'percent',
      field: 'value',
      dimension: 'name',
      as: 'percent'
    });

    return (
      <div>
        <Chart
          height={400}
          width={400}
          padding={[40, 0, 40, 0]}
          background={{ fill: '#fff' }}
          data={dv}
          scale={scale}
          forceFit
        >
          <Coord type="theta" radius={0.7} />
          <Tooltip
            showTitle={false}
            itemTpl='<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
          />
          <Geom
            type="interval"
            position="percent"
            color="type"
            tooltip={[
              'type*percent',
              (type, percent) => ({
                name: type,
                value: `${(percent * 100).toFixed(2)}%`
              })
            ]}
            style={{
              lineWidth: 1,
              stroke: '#fff'
            }}
            select={false}
          >
            <Label content="type" offset={-30} />
          </Geom>
        </Chart>
      </div>
    );
  }
}
export default Sunburst;
