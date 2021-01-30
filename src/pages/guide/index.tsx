import React, { FC } from 'react';
import { Button } from 'antd';
import { useLocale } from 'locales';
import useGuide from './useGuide';

const GuidePage: FC = () => {
  const { formatMessage } = useLocale();
  const { driverStart } = useGuide();

  return (
    <div className="guide-page ">
      <div className="innerText">
        <p className="guide-intro">{formatMessage({ id: 'app.guide.guideIntro' })}.</p>
        <Button type="primary" onClick={driverStart}>
          {formatMessage({ id: 'app.guide.showGuide' })}
        </Button>
      </div>
    </div>
  );
};

export default GuidePage;
