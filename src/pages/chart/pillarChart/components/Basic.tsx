import React from 'react';
import { Chart, Geom, Axis, Tooltip, Label } from 'bizcharts';

class Basic extends React.Component {
  public render() {
    const data = [
      {
        type: '类型1',
        value: 45
      },
      {
        type: '类型2',
        value: 52
      },
      {
        type: '类型3',
        value: 89
      },
      {
        type: '类型4',
        value: 145
      },
      {
        type: '类型5',
        value: 29
      },
      {
        type: '类型6',
        value: 102
      }
    ];
    const scale = {
      value: {
        min: 0,
        alias: '数量'
      }
    };
    return (
      <div>
        <Chart
          height={400}
          width={400}
          padding={[40, 20, 40, 50]}
          background={{ fill: '#fff' }}
          data={data}
          scale={scale}
          forceFit
        >
          <Axis
            name="type"
            tickLine={{
              length: 0
            }}
          />
          <Axis
            name="value"
            line={{
              style: {
                lineWidth: 1,
                stroke: 'rgb(202,202,202)'
              }
            }}
          />
          <Tooltip />
          <Geom type="interval" position="type*value" color="value">
            <Label content="value" />
          </Geom>
        </Chart>
      </div>
    );
  }
}

export default Basic;
