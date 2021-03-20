import React, { useRef, useEffect } from 'react';
import { Card } from 'antd';
import Typing from 'utils/typing';
import './index.less';

const TypingCard = (props: any) => {
  const { title, source } = props;
  const sourceEl: any = useRef();
  const outputEl: any = useRef();

  useEffect(() => {
    const typing: any = new Typing({
      source: sourceEl,
      output: outputEl,
      delay: 30
    });
    typing.stopFlag = false;
    typing.start();
    return () => {
      typing.opts.done();
    };
  }, []);
  return (
    <Card bordered={false} className="card-item" title={title}>
      <div
        style={{ display: 'none', fontSize: '1.5rem' }}
        ref={sourceEl}
        dangerouslySetInnerHTML={{ __html: source }}
      />
      <div ref={outputEl} style={{ fontSize: '1.5rem' }} />
    </Card>
  );
};

TypingCard.prototype = {
  title: '',
  source: ''
};

export default TypingCard;
