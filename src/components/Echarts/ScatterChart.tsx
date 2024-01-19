import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";

const ScatterChart: FC = () => {
  const ref = useRef();

  const dataList = [
    { name: "系列一", value: 73, max: 100 },
    { name: "系列二", value: 68, max: 100 },
    { name: "系列三", value: 43, max: 100 },
    { name: "系列四", value: 28, max: 100 },
    { name: "系列五", value: 56, max: 100 },
  ];
  // 头部数据
  const topData = dataList.map((item) => {
    return { name: "", value: item.max, symbolPosition: "end" };
  });
  // 底部立体柱子
  const bottomBar = dataList.map((item) => {
    return {
      value: item.value,
    };
  });
  // 底下圆片
  const bottomCircle = dataList.map((item) => {
    return { name: "", value: item.max };
  });
  // 中间圆片
  const middleCircle = dataList.map((item) => {
    return { name: "", value: item.value, symbolPosition: "end" };
  });
  // 上边的柱子
  const upBar = dataList.map((item) => {
    return { name: item.name, value: item.max - item.value };
  });

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      backgroundColor: "#333333",
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0,0,0,0.5)",
        borderColor: "rgba(89,211,255,1)",
        borderWidth: 2,
        padding: 5,
        textStyle: {
          color: "rgba(89,211,255,1)",
          fontSize: 18,
          width: 300,
          height: 40,
        },
        formatter: "{c}" + "%",
        extraCssText: "box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);",
        // 自定义的 CSS 样式
      },
      grid: {
        bottom: "15%",
        top: "25%",
        right: "0%",
        left: "0%",
      },
      xAxis: {
        data: ["系列一", "系列二", "系列三", "系列四", "系列五"],
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: "#fff",
          },
          margin: 30, //刻度标签与轴线之间的距离。
        },
      },
      yAxis: {
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
      },
      series: [
        // 头
        {
          name: "",
          type: "pictorialBar",
          symbolSize: [50, 30],
          symbolOffset: [0, -15],
          z: -22,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "rgba(54,127,223,1)",
                  },
                  {
                    offset: 1,
                    color: "rgba(94,162,254,1)",
                  },
                ],
                false
              ),
            },
          },
          data: topData,
        },
        //底部立体柱
        {
          stack: "1",
          type: "bar",
          silent: true,
          barWidth: 50,
          data: bottomBar,
          itemStyle: {
            normal: {
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                type: "linear",
                global: false,
                colorStops: [
                  {
                    //第一节下面
                    offset: 0,
                    color: "rgba(0,255,245,0.5)",
                  },
                  {
                    offset: 1,
                    color: "#43bafe",
                  },
                ],
              },
            },
          },
        },
        //最底下的圆片
        {
          name: "",
          type: "pictorialBar",
          symbolSize: [50, 30],
          symbolOffset: [0, 15],
          z: 5,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(89,211,255,1)",
                },
                {
                  offset: 1,
                  color: "rgba(23,237,194,1)",
                },
              ]),
            },
          },
          data: bottomCircle,
        },
        // 中间圆片
        {
          name: "",
          type: "pictorialBar",
          symbolSize: [50, 30],
          symbolOffset: [0, -20],
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(
                0,
                0,
                0,
                1,
                [
                  {
                    offset: 0,
                    color: "rgba(89,211,255,1)",
                  },
                  {
                    offset: 1,
                    color: "rgba(23,237,194,1)",
                  },
                ],
                false
              ),
            },
          },
          z: 112,
          data: middleCircle,
        },
        //上部立体柱
        {
          //上部立体柱
          stack: "1",
          type: "bar",
          itemStyle: {
            normal: {
              color: "#3E8BE6",
              opacity: 0.7,
            },
          },
          label: {
            show: true,
            position: "top",
            distance: 20,
            color: "#FFFE00",
            fontSize: 30,
            formatter: function (item) {
              const a = 100;
              return a - item.value + "%";
            },
          },
          silent: true,
          barWidth: 50,
          data: upBar,
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

export default ScatterChart;
