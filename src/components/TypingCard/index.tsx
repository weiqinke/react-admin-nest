import { useRef, useEffect } from "react";
import { Card } from "antd";
import Typing from "./Typing";

const TypingCard = (props: any) => {
  const outputEl: any = useRef();

  useEffect(() => {
    const typing: any = new Typing({
      data: props.source,
      output: outputEl,
      delay: 50
    });
    typing.start();
    return () => {
      typing.done();
    };
  }, [props]);

  return (
    <Card bordered={false} className="card-item" title={props.title}>
      <div ref={outputEl} style={{ fontSize: "1.5rem" }} />
    </Card>
  );
};

export default TypingCard;
