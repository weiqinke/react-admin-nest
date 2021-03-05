import React, { FC, useEffect } from 'react';
import { Chart, LineAdvance } from 'bizcharts';
const Dashboard: FC = () => {
  useEffect(() => {}, []);

  const data = [
    {
      month: 'Jan',
      city: 'Tokyo',
      temperature: 7
    },
    {
      month: 'Jan',
      city: 'London',
      temperature: 3.9
    },
    {
      month: 'Feb',
      city: 'Tokyo',
      temperature: 13
    },
    {
      month: 'Feb',
      city: 'London',
      temperature: 4.2
    },
    {
      month: 'Mar',
      city: 'Tokyo',
      temperature: 16.5
    },
    {
      month: 'Mar',
      city: 'London',
      temperature: 5.7
    },
    {
      month: 'Apr',
      city: 'Tokyo',
      temperature: 14.5
    },
    {
      month: 'Apr',
      city: 'London',
      temperature: 8.5
    },
    {
      month: 'May',
      city: 'Tokyo',
      temperature: 10
    },
    {
      month: 'May',
      city: 'London',
      temperature: 11.9
    },
    {
      month: 'Jun',
      city: 'Tokyo',
      temperature: 7.5
    },
    {
      month: 'Jun',
      city: 'London',
      temperature: 15.2
    },
    {
      month: 'Jul',
      city: 'Tokyo',
      temperature: 9.2
    },
    {
      month: 'Jul',
      city: 'London',
      temperature: 17
    },
    {
      month: 'Aug',
      city: 'Tokyo',
      temperature: 14.5
    },
    {
      month: 'Aug',
      city: 'London',
      temperature: 16.6
    },
    {
      month: 'Sep',
      city: 'Tokyo',
      temperature: 9.3
    },
    {
      month: 'Sep',
      city: 'London',
      temperature: 14.2
    },
    {
      month: 'Oct',
      city: 'Tokyo',
      temperature: 8.3
    },
    {
      month: 'Oct',
      city: 'London',
      temperature: 10.3
    },
    {
      month: 'Nov',
      city: 'Tokyo',
      temperature: 8.9
    },
    {
      month: 'Nov',
      city: 'London',
      temperature: 5.6
    },
    {
      month: 'Dec',
      city: 'Tokyo',
      temperature: 5.6
    },
    {
      month: 'Dec',
      city: 'London',
      temperature: 9.8
    }
  ];
  return (
    <div>
      <Chart padding={[10, 20, 150, 40]} autoFit height={600} data={data}>
        <LineAdvance shape="smooth" point area position="month*temperature" color="city" />
      </Chart>
    </div>
  );
};

export default Dashboard;
