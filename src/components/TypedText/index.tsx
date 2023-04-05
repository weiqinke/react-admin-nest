import React, { useState, useEffect, useRef } from "react";

const TypedText = ({ text = "", delay = 110 }) => {
  const [index, setIndex] = useState(0);
  const timer = useRef(null);

  const updateText = () => {
    if (index === text.length) {
      clearTimeout(timer.current);
      timer.current = null;
      return;
    }
    setIndex(v => v + 1);
    timer.current = setTimeout(updateText, delay);
  };

  useEffect(() => {
    updateText;
    return () => clearTimeout(timer.current);
  }, [text, delay]);

  return <>{text.substring(0, index)}</>;
};

export default TypedText;
