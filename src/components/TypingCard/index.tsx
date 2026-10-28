import { useEffect, useRef } from "react";
import Typing from "./Typing";

const TypingCard = (props: { source?: string; fontSize?: string; delay?: number; title?: string }) => {
  const outputEl = useRef<HTMLDivElement>(null);
  const lastSourceRef = useRef<string | null>(null);
  const source = props.source ?? "";

  useEffect(() => {
    const el = outputEl.current;
    if (!el) return;

    // 文案没变时不重播（弹窗开关引起的父级重渲染会走到这里）
    if (lastSourceRef.current === source && el.textContent) return;

    lastSourceRef.current = source;
    const typing = new Typing({
      data: source,
      output: outputEl,
      delay: props.delay ?? 50
    });
    typing.start();
    return () => {
      typing.done();
    };
  }, [source, props.delay]);

  return (
    <div>
      <div ref={outputEl} style={{ fontSize: props.fontSize || "1.5rem" }} />
    </div>
  );
};

export default TypingCard;
