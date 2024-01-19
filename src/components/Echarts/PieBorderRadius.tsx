import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";

const PieBorderRadius: FC = () => {
  const ref = useRef();
  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      title: {
        text: "UserAgent",
      },
      tooltip: {
        trigger: "item",
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
            borderWidth: 2,
          },
          data: [
            { value: 200, name: "Edge" },
            { value: 200, name: "Safari" },
            { value: 200, name: "Firefox" },
            { value: 200, name: "Other" },
            { value: 200, name: "Chrome" },
          ],
          label: {
            show: true,
            formatter: function (params) {
              const name = params.name;
              const percent = params.percent;
              return name + "\n" + percent;
            },
          },
        },
      ],
    });
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    return () => {
      myChart.dispose && myChart.dispose();
    };
  }, []);

  return <div ref={ref} style={{ height: 400, margin: 0 }}></div>;
};

export default PieBorderRadius;
