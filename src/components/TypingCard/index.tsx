import { useRef, useEffect } from "react";
import { Card } from "antd";
import Typing from "./Typing";

const TypingCard = (props: any) => {
  const { title, source } = props;
  const sourceEl: any = useRef();
  const outputEl: any = useRef();

  useEffect(() => {
    const typing: any = new Typing({
      source: sourceEl,
      output: outputEl,
      delay: 30,
      stopFlag: false,
    });
    typing.start();
    return () => {
      typing.opts.done();
    };
  }, []);

  return (
    <Card bordered={false} className="card-item" title={title}>
      <div
        ref={sourceEl}
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{ __html: source }}
      />
      <div ref={outputEl} style={{ fontSize: "1.5rem" }} />
    </Card>
  );
};

export default TypingCard;
