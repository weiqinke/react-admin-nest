import snowflake_png from "@/assets/snowflake.png";
import sakura_png from "@/assets/sakura.png";
import { useEffect, useRef } from "react";
import { getRandom } from "@/utils/core";
import { Sakura, SakuraList } from "@/utils/Sakura";
let stopFun: any;
const Snowflake = ({ rdm }) => {
  const ref: any = useRef();

  useEffect(() => {
    const onresize = () => {
      const dom = ref.current;
      if (dom) {
        const clientHeight = document.body.clientHeight;
        const clientWidth = document.body.clientWidth;
        const canvasSnow: any = ref.current?.firstChild;
        canvasSnow.width = clientWidth;
        canvasSnow.height = clientHeight;
      }
    };
    //樱花
    const img = new Image();
    img.src = rdm < 0.45 ? sakura_png : snowflake_png;

    function startSakura() {
      if (ref.current?.firstChild) {
        ref.current?.removeChild(ref.current?.firstChild);
      }
      const canvas = document.createElement("canvas");
      canvas.height = document.body.clientHeight;
      canvas.width = document.body.clientWidth;
      canvas.setAttribute("style", "position: absolute;left: 0;top: 0;pointer-events: none;object-fit:cover;");
      ref.current!.appendChild(canvas);
      const cxt = canvas.getContext("2d");
      const sakuraList = new SakuraList();
      for (let i = 0; i < 100; i++) {
        const randomX = getRandom("x");
        const randomY = getRandom("y");
        const randomR = getRandom("r");
        const randomS = getRandom("s");
        const randomFnx = getRandom("fnx");
        const randomFny = getRandom("fny");
        const randomFnR = getRandom("fnr");
        const sakura = new Sakura(img, randomX, randomY, randomS, randomR, {
          x: randomFnx,
          y: randomFny,
          r: randomFnR
        });
        sakura.draw(cxt);
        sakuraList.push(sakura);
      }

      stopFun = function () {
        cxt.clearRect(0, 0, canvas.width, canvas.height);
        sakuraList.update();
        sakuraList.draw(cxt);
        requestAnimationFrame(stopFun);
      };

      requestAnimationFrame(stopFun);
    }

    img.onload = function () {
      startSakura();
    };

    window.addEventListener("resize", onresize);
    return () => {
      window.removeEventListener("resize", onresize);
      window.cancelAnimationFrame(stopFun);
      const child = ref.current?.firstChild;
      child?.parentNode?.removeChild(child);
    };
  }, [rdm]);

  return <div ref={ref}></div>;
};

export default Snowflake;
