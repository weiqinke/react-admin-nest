import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
const BarChart: FC = () => {
  const ref = useRef();

  /* { name:标题 , radius:[内圆直径,外圆直径] ,
    startAngle:圆心角  value:数据 , 
    color1: 颜色, color2: 颜色 } */
  function getItem(data) {
    return {
      name: "景区资源",
      type: "pie",
      center: ["50%", "60%"],
      radius: data.radius,
      startAngle: data.startAngle,
      avoidLabelOverlap: false,
      label: {
        show: true,
        color: "#2196b0",
        // position: 'center'
      },
      // 鼠标移入时文本状态
      emphasis: {
        label: {
          show: true,
          fontSize: 40,
          fontWeight: "bold",
        },
      },
      labelLine: {
        show: true,
        length: 60,
        length2: 20,
      },
      data: [
        {
          value: data.value,
          name: data.name,
          itemStyle: {
            // 渐变颜色
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: data.color1,
              },
              {
                offset: 1,
                color: data.color2,
              },
            ]),
          },
        },
        {
          value: 100 - data.value,
          name: data.name, //设置name防止legend错位
          itemStyle: {
            // 颜色设置为none,则该片段不渲染
            color: "none",
          },
          label: { show: false },
        },
      ],
    };
  }

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      backgroundColor: "rgba(124,193,173,0.5)",
      // 1.鼠标移入提示
      tooltip: {
        trigger: "item",
      },
      // 2.图例组件
      legend: {
        top: "5%",
        left: "center",
        // 文本样式
        textStyle: {
          color: "#1c91f5",
        },
      },
      // 3.图表内容
      series: [
        getItem({
          name: "AAAA景区",
          radius: ["30%", "35%"],
          startAngle: -10,
          value: 70,
          color1: "#8915f9",
          color2: "#3d13fd",
        }),
        getItem({
          name: "免费景区",
          radius: ["40%", "45%"],
          startAngle: 50,
          value: 50,
          color1: "#f72f48",
          color2: "#f44179",
        }),
        getItem({
          name: "度假村",
          radius: ["50%", "55%"],
          startAngle: 260,
          value: 50,
          color1: "#1686f3",
          color2: "#32b8fc",
        }),
        getItem({
          name: "文化古城",
          radius: ["60%", "65%"],
          startAngle: 150,
          value: 60,
          color1: "#2648f7",
          color2: "#2d8af9",
        }),
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

export default BarChart;
