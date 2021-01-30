import React, { FC, useState, useEffect } from 'react';
import './index.less';
import Overview from './overview';

const DashBoardPage: FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(undefined as any);
    }, 2000);
    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
    <div>
      <Overview loading={loading} />
    </div>
  );
};

export default DashBoardPage;
