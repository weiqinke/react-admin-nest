import { List } from 'antd';
import React, { useState } from 'react';

const OnlineList: React.FC = () => {
  const [initLoading] = useState(true);
  const [datalist] = useState<any>([]);
  return (
    <div>
      <p>OnlineList</p>
      <List className="demo-loadmore-list" loading={initLoading} itemLayout="horizontal" dataSource={datalist} />
    </div>
  );
};

export default OnlineList;
