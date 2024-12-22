import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";

const Round: FC = () => {
  const ref = useRef();

  const bgPatternImg = new Image();
  bgPatternImg.src = "https://www.freeimg.cn/i/2024/12/19/676423a20a391.webp";
  const chartData = [
    {
      value: 520
    },
    {
      value: 280
    },
    {
      value: 100
    },
    {
      value: 100
    }
  ];
  const colorList = [
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#CA8CCA"
      },
      {
        offset: 1,
        color: "#EFA5BB"
      }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#BFA4E4"
      },
      {
        offset: 1,
        color: "#E29CE2"
      }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#A8AAE5"
      },
      {
        offset: 1,
        color: "#BEA3E3"
      }
    ]),
    new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      {
        offset: 0,
        color: "#A4D37D"
      },
      {
        offset: 1,
        color: "#E5F2A7"
      }
    ])
  ];
  const sum = chartData.reduce((per, cur) => per + cur.value, 0);
  const gap = (1 * sum) / 100;
  const pieData1 = [];
  const pieData2 = [];
  const gapData = {
    name: "",
    value: gap,
    itemStyle: {
      color: "transparent"
    }
  };
  for (let i = 0; i < chartData.length; i++) {
    pieData1.push({
      ...chartData[i],
      itemStyle: {
        borderRadius: 100,
        shadowColor: "#2a2a34",
        shadowBlur: 5,
        shadowOffsetY: 0,
        shadowOffsetX: 0,
        borderColor: "#2a2a34",
        borderWidth: 2
      }
    });
    pieData1.push(gapData);

    pieData2.push({
      ...chartData[i],
      itemStyle: {
        borderRadius: 10,
        color: colorList[i],
        opacity: 0.1,
        shadowColor: "#000",
        shadowBlur: 1,
        shadowOffsetY: 5,
        shadowOffsetX: 0
      }
    });
    pieData2.push(gapData);
  }

  const option = {
    backgroundColor: {
      image: bgPatternImg,
      repeat: "repeat"
    },

    color: colorList,

    series: [
      {
        type: "pie",
        z: 3,
        radius: ["44%", "51%"],
        center: ["50%", "50%"],
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        data: pieData1
      }
    ]
  };

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    return () => {
      myChart.dispose && myChart.dispose();
    };
  }, []);

  return <div ref={ref} style={{ height: 400, margin: 0 }}></div>;
};

export default Round;
