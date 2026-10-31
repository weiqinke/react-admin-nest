import React, { FC, useEffect, useRef } from "react";
import echarts from "./setup";

const PieBorderRadius: FC = () => {
  const ref = useRef();
  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      title: {
        text: "UserAgent",
        left: 12,
        top: 12
      },
      tooltip: {
        trigger: "item"
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: ["0%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 100,
            borderColor: "#fff",
            borderWidth: 2
          },
          data: [
            { value: 200, name: "Edge" },
            { value: 200, name: "Safari" },
            { value: 200, name: "Firefox" },
            { value: 200, name: "Other" },
            { value: 200, name: "Chrome" }
          ],
          label: {
            show: true,
            formatter: function (params) {
              const name = params.name;
              const percent = params.percent;
              return name + "\n" + percent;
            }
          }
        }
      ]
    });
    const onResize = () => myChart.resize();
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      myChart.dispose && myChart.dispose();
    };
  }, []);

  return <div ref={ref} style={{ width: "100%", height: "100%", minHeight: 320, margin: 0 }}></div>;
};

export default PieBorderRadius;
