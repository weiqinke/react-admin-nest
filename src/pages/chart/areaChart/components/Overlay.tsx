import React from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from 'bizcharts';

class Overlay extends React.Component {
  public render() {
    const data = [
      {
        country: 'Asia',
        year: '1750',
        value: 502
      },
      {
        country: 'Asia',
        year: '1800',
        value: 635
      },
      {
        country: 'Asia',
        year: '1850',
        value: 809
      },
      {
        country: 'Asia',
        year: '1900',
        value: 5268
      },
      {
        country: 'Asia',
        year: '1950',
        value: 4400
      },
      {
        country: 'Asia',
        year: '1999',
        value: 3634
      },
      {
        country: 'Asia',
        year: '2050',
        value: 947
      },
      {
        country: 'Africa',
        year: '1750',
        value: 106
      },
      {
        country: 'Africa',
        year: '1800',
        value: 107
      },
      {
        country: 'Africa',
        year: '1850',
        value: 111
      },
      {
        country: 'Africa',
        year: '1900',
        value: 1766
      },
      {
        country: 'Africa',
        year: '1950',
        value: 221
      },
      {
        country: 'Africa',
        year: '1999',
        value: 767
      },
      {
        country: 'Africa',
        year: '2050',
        value: 133
      },
      {
        country: 'Europe',
        year: '1750',
        value: 163
      },
      {
        country: 'Europe',
        year: '1800',
        value: 203
      },
      {
        country: 'Europe',
        year: '1850',
        value: 276
      },
      {
        country: 'Europe',
        year: '1900',
        value: 628
      },
      {
        country: 'Europe',
        year: '1950',
        value: 547
      },
      {
        country: 'Europe',
        year: '1999',
        value: 729
      },
      {
        country: 'Europe',
        year: '2050',
        value: 408
      },
      {
        country: 'Oceania',
        year: '1750',
        value: 200
      },
      {
        country: 'Oceania',
        year: '1800',
        value: 200
      },
      {
        country: 'Oceania',
        year: '1850',
        value: 200
      },
      {
        country: 'Oceania',
        year: '1900',
        value: 460
      },
      {
        country: 'Oceania',
        year: '1950',
        value: 230
      },
      {
        country: 'Oceania',
        year: '1999',
        value: 300
      },
      {
        country: 'Oceania',
        year: '2050',
        value: 300
      }
    ];

    const scale = {
      year: {
        type: 'linear',
        tickInterval: 50
      }
    };
    return (
      <Chart
        height={400}
        width={400}
        padding={[30, 30, 80, 60]}
        background={{ fill: '#fff' }}
        data={data}
        scale={scale}
        forceFit
      >
        <Axis
          name="year"
          label={{
            formatter: (val: string) => val + '年'
          }}
        />
        <Axis name="value" />
        <Legend />
        <Tooltip
          crosshairs={{
            type: 'y'
          }}
        />
        <Geom type="area" position="year*value" color="country" />
        <Geom type="line" position="year*value" size={2} color="country" />
      </Chart>
    );
  }
}

export default Overlay;
