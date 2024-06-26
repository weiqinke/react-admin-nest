import { useRef, useEffect } from "react";
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
    <div>
      <div ref={outputEl} style={{ fontSize: props.fontSize || "1.5rem" }} />
    </div>
  );
};

export default TypingCard;
