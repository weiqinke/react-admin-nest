import { animated, useSpring } from "@react-spring/web";
import React, { useEffect } from "react";

const Translatex = props => {
  const [animate, setAnimate] = React.useState(false);
  const {
    children,
    direction = "left",
    delay = 3000,
    run = false,
    config = {
      tension: 100,
      friction: 26
    }
  } = props;

  const animateStyles = useSpring({
    opacity: animate ? 1 : 0,
    transform: animate
      ? `${direction === "left" ? "translateX(0px) scale(1) rotateY(0deg)" : "translateY(0px) scale(1) rotateY(0deg)"}`
      : `${direction === "left" ? "translateX(80px) scale(1) rotateY(10deg)" : "translateY(80px) scale(0.9) rotateY(10deg)"}`,
    delay,
    config: { ...config },
    onRest: () => {}
  });

  useEffect(() => {
    setAnimate(run);
  }, [run]);

  return (
    <animated.div className={props.className} style={{ ...animateStyles }}>
      {run && children}
    </animated.div>
  );
};

export default Translatex;
