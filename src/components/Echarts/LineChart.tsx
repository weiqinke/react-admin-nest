import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
const LineChart: FC = () => {
  const ref = useRef();

  const data = [1700, 2800, 3700, 3600, 4800, 5700];
  const barWidth = 40;

  const offsetX = 20;
  const offsetY = 10;
  // 绘制左侧面
  const CubeLeft = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      // 会canvas的应该都能看得懂，shape是从custom传入的
      const xAxisPoint = shape.xAxisPoint;
      // console.log(shape);
      const c0 = [shape.x, shape.y];
      const c1 = [shape.x - offsetX, shape.y - offsetY];
      const c2 = [xAxisPoint[0] - offsetX, xAxisPoint[1] - offsetY];
      const c3 = [xAxisPoint[0], xAxisPoint[1]];
      ctx
        .moveTo(c0[0], c0[1])
        .lineTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .closePath();
    },
  });
  // 绘制右侧面
  const CubeRight = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      const xAxisPoint = shape.xAxisPoint;
      const c1 = [shape.x, shape.y];
      const c2 = [xAxisPoint[0], xAxisPoint[1]];
      const c3 = [xAxisPoint[0] + offsetX, xAxisPoint[1] - offsetY];
      const c4 = [shape.x + offsetX, shape.y - offsetY];
      ctx
        .moveTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .lineTo(c4[0], c4[1])
        .closePath();
    },
  });
  // 绘制顶面
  const CubeTop = echarts.graphic.extendShape({
    shape: {
      x: 0,
      y: 0,
    },
    buildPath: function (ctx, shape) {
      const c1 = [shape.x, shape.y];
      const c2 = [shape.x + offsetX, shape.y - offsetY]; //右点
      const c3 = [shape.x, shape.y - offsetX];
      const c4 = [shape.x - offsetX, shape.y - offsetY];
      ctx
        .moveTo(c1[0], c1[1])
        .lineTo(c2[0], c2[1])
        .lineTo(c3[0], c3[1])
        .lineTo(c4[0], c4[1])
        .closePath();
    },
  });
  // 注册三个面图形
  echarts.graphic.registerShape("CubeLeft", CubeLeft);
  echarts.graphic.registerShape("CubeRight", CubeRight);
  echarts.graphic.registerShape("CubeTop", CubeTop);

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      backgroundColor: "#012366",
      tooltip: {
        trigger: "axis",
        formatter: (params) => params[0].name + ":" + params[0].value,
      },
      legend: {
        show: true,
        bottom: "0",
        itemWidth: 30,
        itemHeight: 11,
        itemStyle: {
          color: "rgb(12,160,254)",
        },
        textStyle: {
          fontSize: 22,
          color: "rgb(233,240,255)",
        },
        data: ["进港货量"],
        right: "center", //组件离容器左侧的距离，可以是left,center,right，也可以是像素px和百分比10%
      },
      //图表大小位置限制
      grid: {
        x: "13%",
        x2: "14%",
        y: "20%",
        y2: "20%",
      },
      xAxis: {
        data: ["欧洲", "日韩", "中东", "南美", "东南亚", "西南太平洋"],
        //坐标轴
        axisLine: {
          show: false,
          lineStyle: {
            width: 1,
            color: "#214776",
          },
          textStyle: {
            color: "#fff",
            fontSize: 20,
          },
        },
        type: "category",
        axisLabel: {
          textStyle: {
            color: "rgba(233, 240, 255, 1)",
            fontWeight: 500,
            fontSize: "20",
          },
        },
        axisTick: {
          textStyle: {
            color: "#fff",
            fontSize: "16",
          },
          show: false,
        },
      },
      yAxis: [
        {
          name: "%",
          nameTextStyle: {
            color: "rgb(233,240,255)",
            fontSize: 22,
            padding: 10,
          },
          min: 0, //最小
          max: 30, //最大
          interval: 5, //相差
          type: "value",
          splitLine: {
            show: false,
          },
          axisTick: {
            show: true,
            inside: true,
            length: 7,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgb(195,213,248)",
            },
          },
          //坐标值标注
          axisLabel: {
            show: true,
            textStyle: {
              color: "rgba(195, 213, 248, 1)",
              fontSize: 22,
            },
          },
        },
        {
          name: "吨",
          nameTextStyle: {
            color: "rgb(233,240,255)",
            fontSize: 22,
            padding: 10,
          },
          min: 0, //最小
          max: 6000, //最大
          interval: 1000, //相差
          type: "value",
          splitLine: {
            show: false,
          },
          axisTick: {
            show: true,
            inside: true,
            length: 7,
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: "rgb(195,213,248)",
            },
          },
          //坐标值标注
          axisLabel: {
            show: true,
            textStyle: {
              color: "rgba(195, 213, 248, 1)",
              fontSize: 22,
            },
          },
        },
      ],
      series: [
        {
          name: "",
          type: "line",
          showAllSymbol: true,
          lineStyle: {
            color: "#00D8FF",
          },
          showSymbol: true,
          symbol: "circle",
          symbolSize: 20,
          itemStyle: {
            normal: {
              color: "#121E43",
              borderColor: "#00D8FF",
              borderWidth: 3,
            },
          },
          data: ["20", "25", "24", "27", "14", "18"],
          yAxisIndex: 0,
        },
        {
          yAxisIndex: 1,
          type: "custom",
          renderItem: (params, api) => {
            const location = api.coord([api.value(0), api.value(1)]);
            return {
              type: "group",
              children: [
                {
                  type: "CubeLeft",
                  shape: {
                    api,
                    xValue: api.value(0),
                    yValue: api.value(1),
                    x: location[0],
                    y: location[1],
                    xAxisPoint: api.coord([api.value(0), 0]),
                  },
                  style: {
                    fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      {
                        offset: 0,
                        color: "rgba(60, 122, 185, 1)",
                      },
                      {
                        offset: 1,
                        color: "rgba(51, 152, 188, 1)",
                      },
                    ]),
                  },
                },
                {
                  type: "CubeRight",

                  shape: {
                    api,
                    xValue: api.value(0),
                    yValue: api.value(1),
                    x: location[0],
                    y: location[1],
                    xAxisPoint: api.coord([api.value(0), 0]),
                  },
                  style: {
                    fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      {
                        offset: 0,
                        color: "rgba(77, 172, 255, 1)",
                      },
                      {
                        offset: 1,
                        color: "rgba(68, 217, 252, 1)",
                      },
                    ]),
                  },
                },
                {
                  type: "CubeTop",
                  shape: {
                    api,
                    xValue: api.value(0),
                    yValue: api.value(1),
                    x: location[0],
                    y: location[1],
                    xAxisPoint: api.coord([api.value(0), 0]),
                  },
                  style: {
                    fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      {
                        offset: 0,
                        color: "rgba(56, 227, 255, 1)",
                      },
                      {
                        offset: 1,
                        color: "rgba(56, 227, 255, 1)",
                      },
                    ]),
                  },
                },
              ],
            };
          },
          data: data,
        },
        {
          type: "bar",
          yAxisIndex: 1,
          itemStyle: {
            color: "transparent",
          },
          tooltip: {},
          data: data,
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

export default LineChart;
