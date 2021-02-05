import React from 'react';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';

class BaseChart extends React.Component {
  public render() {
    const data = [
      {
        year: '1991',
        value: 3
      },
      {
        year: '1992',
        value: 4
      },
      {
        year: '1993',
        value: 3.5
      },
      {
        year: '1994',
        value: 5
      },
      {
        year: '1995',
        value: 4.9
      },
      {
        year: '1996',
        value: 6
      },
      {
        year: '1997',
        value: 7
      },
      {
        year: '1998',
        value: 9
      },
      {
        year: '1999',
        value: 13
      }
    ];
    const scale = {
      year: {
        range: [0, 1],
        alias: '年份'
      },
      value: {
        min: 0,
        alias: '数量(千万)'
      }
    };
    return (
      <div>
        <Chart
          height={400}
          padding={[30, 40, 50, 65]}
          forceFit={true}
          background={{ fill: '#fff' }}
          data={data}
          scale={scale}
        >
          <Axis
            name="year"
            tickLine={{
              length: -3
            }}
          />
          <Axis
            name="value"
            title
            line={{
              style: {
                lineWidth: 1,
                stroke: 'rgb(202,202,202)'
              }
            }}
          />
          <Tooltip
            crosshairs={{
              type: 'y'
            }}
          />
          <Geom type="line" position="year*value" />
          <Geom
            type="point"
            position="year*value"
            size={4}
            shape="circle"
            style={{
              stroke: '#fff',
              lineWidth: 1
            }}
          />
        </Chart>
      </div>
    );
  }
}

export default BaseChart;
