import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
import axios from "axios";

const DataFlowChart: FC = () => {
  const ref = useRef();

  const chinaGeoCoordMap = {
    聊城市: [115.99159, 36.46276],
    德州市: [116.36555, 37.44131],
    滨州市: [117.9774, 37.3882],
    东营市: [118.58846, 37.45485],
    潍坊市: [119.16837, 36.71265],
    青岛市: [120.38946, 36.07223],
    烟台市: [121.45442, 37.47004],
    威海市: [122.12754, 37.51643],
    日照市: [119.53342, 35.42284],
    临沂市: [118.36354, 35.11067],
    淄博市: [118.06145, 36.81908],
    济南市: [117.1264, 36.65655],
    泰安市: [117.09449, 36.20586],
    枣庄市: [117.33054, 34.81599],
    济宁市: [116.59361, 35.42018],
    菏泽市: [115.48755, 35.23941]
  };
  const Data = [
    {
      name: "聊城市",
      value: [115.99159, 36.46276]
    },
    {
      name: "德州市",
      value: [116.36555, 37.44131]
    },
    {
      name: "滨州市",
      value: [117.9774, 37.3882]
    },
    {
      name: "东营市",
      value: [118.58846, 37.45485]
    },
    {
      name: "潍坊市",
      value: [119.16837, 36.71265]
    },
    {
      name: "青岛市",
      value: [120.38946, 36.07223]
    },
    {
      name: "烟台市",
      value: [121.45442, 37.47004]
    },
    {
      name: "威海市",
      value: [122.12754, 37.51643]
    },
    {
      name: "日照市",
      value: [119.53342, 35.42284]
    },
    {
      name: "临沂市",
      value: [118.36354, 35.11067]
    },
    {
      name: "淄博市",
      value: [118.06145, 36.81908]
    },
    {
      name: "济南市",
      value: [117.1264, 36.65655]
    },
    {
      name: "泰安市",
      value: [117.09449, 36.20586]
    },
    {
      name: "枣庄市",
      value: [117.33054, 34.81599]
    },
    {
      name: "济宁市",
      value: [116.59361, 35.42018]
    },
    {
      name: "菏泽市",
      value: [115.48755, 35.23941]
    }
  ];
  const chinaDatas = [
    [
      {
        name: "聊城市",
        value: 0
      }
    ],
    [
      {
        name: "德州市",
        value: 0
      }
    ],
    [
      {
        name: "滨州市",
        value: 0
      }
    ],
    [
      {
        name: "东营市",
        value: 0
      }
    ],
    [
      {
        name: "潍坊市",
        value: 0
      }
    ],
    [
      {
        name: "青岛市",
        value: 0
      }
    ],
    [
      {
        name: "烟台市",
        value: 0
      }
    ],
    [
      {
        name: "威海市",
        value: 0
      }
    ],
    [
      {
        name: "临沂市",
        value: 0
      }
    ],
    [
      {
        name: "淄博市",
        value: 0
      }
    ],
    [
      {
        name: "济南市",
        value: 0
      }
    ],
    [
      {
        name: "泰安市",
        value: 0
      }
    ],
    [
      {
        name: "枣庄市",
        value: 0
      }
    ],
    [
      {
        name: "济宁市",
        value: 0
      }
    ],
    [
      {
        name: "菏泽市",
        value: 0
      }
    ]
  ];
  const convertData = function (data) {
    const res = [];
    for (let i = 0; i < data.length; i++) {
      const dataItem = data[i];
      const toCoord = chinaGeoCoordMap[dataItem[0].name];
      const fromCoord = [117.1264, 36.65655];
      if (fromCoord && toCoord) {
        res.push([
          {
            coord: toCoord
          },
          {
            coord: fromCoord,
            value: dataItem[0].value
          }
        ]);
      }
    }
    return res;
  };
  const series = [
    {
      type: "map",
      mapType: "jinan",
      aspectScale: 0.95,
      layoutCenter: ["50%", "50%"], // 地图位置
      layoutSize: "108%",
      selectedMode: "single", // 设置为单选模式
      zoom: 1, // 当前视角的缩放比例
      // roam: true, //是否开启平游或缩放
      scaleLimit: {
        // 滚轮缩放的极限控制
        min: 1,
        max: 2
      },
      label: {
        normal: {
          show: true,
          textStyle: {
            color: "#fff"
          }
        },
        emphasis: {
          textStyle: {
            color: "#fff"
          }
        }
      },
      // data: datamap,
      itemStyle: {
        normal: {
          areaColor: {
            type: "radial",
            x: 0.5,
            y: 0.5,
            r: 0.9,
            colorStops: [
              {
                offset: 0,
                color: "RGBA(40, 99, 113, 1)" // 0% 处的颜色
              },
              {
                offset: 1,
                color: "RGBA(28, 79, 105, 0.6)" // 100% 处的颜色
              }
            ]
          },
          borderColor: "RGBA(52, 140, 250, 1)",
          borderWidth: 1,
          shadowColor: "#092f8f", // 外发光
          shadowBlur: 20
        },
        emphasis: {
          areaColor: "#0c274b"
        }
      }
    },
    {
      type: "effectScatter",
      coordinateSystem: "geo",
      rippleEffect: {
        // 坐标点动画
        period: 3,
        scale: 5,
        brushType: "stroke"
      },
      data: Data,
      symbolSize: 6,
      showEffectOn: "render",
      hoverAnimation: true,
      zlevel: 1
    }
  ];
  [["济南市", chinaDatas]].forEach(function (item) {
    series.push(
      {
        type: "lines",
        zlevel: 2,
        effect: {
          show: true,
          period: 4, // 箭头指向速度，值越小速度越快
          trailLength: 0.02, // 特效尾迹长度[0,1]值越大，尾迹越长重
          symbol: "arrow", // 箭头图标
          symbolSize: 5 // 图标大小
        },
        lineStyle: {
          normal: {
            width: 1, // 尾迹线条宽度
            opacity: 1, // 尾迹线条透明度
            curveness: 0.3, // 尾迹线条曲直度
            color: "yellow"
          }
        },
        data: convertData(item[1])
      },
      {
        type: "scatter",
        coordinateSystem: "geo",
        zlevel: 2,
        rippleEffect: {
          // 涟漪特效
          period: 4, // 动画时间，值越小速度越快
          brushType: "stroke", // 波纹绘制方式 stroke, fill
          scale: 4 // 波纹圆环最大限制，值越大波纹越大
        },
        symbol: "circle",
        symbolSize: 5
      }
    );
  });

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    axios.get("https://nest-admin.com/jinan.json").then(res => {
      echarts.registerMap("jinan", res.data);
      myChart.setOption({
        backgroundColor: "rgba(124,193,173,0.5)",
        tooltip: {
          trigger: "item"
        },
        grid: {
          left: "0", // 与容器左侧的距离
          right: "0", // 与容器右侧的距离
          top: "0", // 与容器顶部的距离
          bottom: "0" // 与容器底部的距离
        },
        geo: {
          map: "jinan",
          zoom: 1,
          aspectScale: 0.95,
          layoutCenter: ["50%", "50%"], // 地图位置
          layoutSize: "108%",
          itemStyle: {
            normal: {
              shadowColor: "#276fce",
              shadowOffsetX: 0,
              shadowOffsetY: 15,
              opacity: 0.3
            }
          }
        },
        series: series
      });
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

export default DataFlowChart;
