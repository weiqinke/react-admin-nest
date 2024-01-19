import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";
const AreaStackChart = () => {
  const ref = useRef();

  useEffect(() => {
    const option = {
      color: ["#80FFA5", "#00DDFF", "#37A2FF", "#FF0087", "#FFBF00"],
      title: {
        text: "梯度叠加面积图"
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985"
          }
        }
      },
      legend: {
        data: ["梯度1", "梯度2", "梯度3", "梯度4", "梯度5"]
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        }
      ],
      yAxis: [
        {
          type: "value"
        }
      ],
      series: [
        {
          name: "梯度1",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(128, 255, 165)"
              },
              {
                offset: 1,
                color: "rgb(1, 191, 236)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [140, 232, 101, 264, 90, 340, 250]
        },
        {
          name: "梯度2",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(0, 221, 255)"
              },
              {
                offset: 1,
                color: "rgb(77, 119, 255)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [120, 282, 111, 234, 220, 340, 310]
        },
        {
          name: "梯度3",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(55, 162, 255)"
              },
              {
                offset: 1,
                color: "rgb(116, 21, 219)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [320, 132, 201, 334, 190, 130, 220]
        },
        {
          name: "梯度4",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(255, 0, 135)"
              },
              {
                offset: 1,
                color: "rgb(135, 0, 157)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [220, 402, 231, 134, 190, 230, 120]
        },
        {
          name: "梯度5",
          type: "line",
          stack: "Total",
          smooth: true,
          lineStyle: {
            width: 0
          },
          showSymbol: false,
          label: {
            show: true,
            position: "top"
          },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgb(255, 191, 0)"
              },
              {
                offset: 1,
                color: "rgb(224, 62, 76)"
              }
            ])
          },
          emphasis: {
            focus: "series"
          },
          data: [220, 302, 181, 234, 210, 290, 150]
        }
      ]
    };
    const myChart = echarts.init(ref.current);
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

export default AreaStackChart;
