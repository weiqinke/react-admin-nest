import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";
import axios from "axios";

const HomeSenseChart = () => {
  const ref = useRef();

  const geoGpsMap = {
    1: [116.415, 39.915],
    2: [116.448, 39.935],
    3: [116.455, 39.915],
    4: [116.435, 39.925],
    基站1: [116.415, 39.915],
    基站2: [116.448, 39.935],
    基站3: [116.455, 39.915],
    控制中心: [116.435, 39.925],
  };
  const l1 = {
    主卧: [116.409, 39.928],
  };
  const l2 = {
    书房控制: [116.428, 39.939],
  };

  const l3 = {
    卫生间控制: [116.448, 39.939],
  };
  const l4 = {
    客厅控制: [116.426, 39.918],
  };
  const l5 = {
    次卧控制: [116.448, 39.92],
  };
  const l6 = {
    楼梯控制: [116.443, 39.911],
  };
  const l7 = {
    厨房控制: [116.448, 39.905],
  };
  const zhuwo = {
    主卧控制: [116.409, 39.928],
  };

  //geoCoordMap把所有可能出现的传感器加到数组里面
  const geoCoordMap = {
    客厅1: [116.41, 39.9036],
    客厅2: [116.43, 39.918],
    主卧1: [116.409, 39.921],
    主卧2: [116.409, 39.935],
    书房: [116.432, 39.939],
    卫生间: [116.4516, 39.939],
    客厅3: [116.4516, 39.9306],
    次卧: [116.4516, 39.92],
    楼梯: [116.447, 39.911],
    厨房: [116.4516, 39.905],
  };
  const geoCoordMap001 = {
    客厅1: [116.41, 39.9036],
    客厅2: [116.43, 39.918],
    主卧1: [116.409, 39.921],
    主卧2: [116.409, 39.935],
  };
  const geoCoordMap002 = {
    书房: [116.432, 39.939],
    卫生间: [116.4516, 39.939],
    客厅3: [116.4516, 39.9306],
  };
  const geoCoordMap003 = {
    次卧: [116.4516, 39.92],
    楼梯: [116.447, 39.911],
    厨房: [116.4516, 39.905],
  };
  const geoCoordMap004 = {
    基站1: [116.415, 39.915],
    基站2: [116.448, 39.935],
    基站3: [116.455, 39.915],
  };
  //温度
  const d1 = {
    客厅1: 20,
    客厅2: 25,
    主卧1: 17,
    主卧2: 19,
    书房: 13,
    卫生间: 22,
    客厅3: 11,
    次卧: 9,
    楼梯: 29,
    厨房: 38,
    基站1: 40,
    基站2: 45,
    基站3: 37,
  };

  //湿度
  const d2 = {
    客厅1: 40,
    客厅2: 45,
    主卧1: 37,
    主卧2: 39,
    书房: 23,
    卫生间: 80,
    客厅3: 56,
    次卧: 39,
    楼梯: 29,
    厨房: 68,
  };
  //振动
  const d3 = {
    //"客厅1": 4,
    客厅2: 5,
    //'主卧1': 3,
    主卧2: 3,
    书房: 2,
    卫生间: 0,
    客厅3: 0,
    次卧: 3,
    楼梯: 2,
    厨房: 0,
  };
  //烟雾
  const d4 = {
    客厅1: 40,
    客厅2: 45,
    主卧1: 37,
    主卧2: 39,
    书房: 53,
    卫生间: 60,
    客厅3: 56,
    次卧: 39,
    楼梯: 29,
    厨房: 68,
  };
  //光线
  const d5 = {
    客厅1: 40,
    客厅2: 45,
    主卧1: 37,
    主卧2: 39,
    书房: 23,
    卫生间: 80,
    客厅3: 56,
    次卧: 39,
    楼梯: 29,
    厨房: 68,
  };
  //
  // var d6 = {
  //   "客厅1": 40,
  //     "客厅2": 45,
  //     '主卧1': 37,
  //     "主卧2": 39,
  //     '书房': 23,
  //     "卫生间": 80,
  //     "客厅3": 56,
  //     '次卧': 39,
  //     "楼梯": 29,
  //     "厨房": 68,

  // };
  //
  // var d7 = {
  //     "客厅1": 40,
  //     "客厅2": 45,
  //     '主卧1': 37,
  //     "主卧2": 39,
  //     '书房': 23,
  //     "卫生间": 80,
  //     "客厅3": 56,
  //     '次卧': 39,
  //     "楼梯": 29,
  //     "厨房": 68,
  // };

  const database = [
    {
      name: "基站1",
      value: 0,
    },
    {
      name: "基站2",
      value: 0,
    },
    {
      name: "基站3",
      value: 0,
    },
    {
      name: "控制中心",
      value: 0,
    },
  ];
  const da1 = [
    {
      name: "主卧",
      value: 0,
    },
  ];
  const da2 = [
    {
      name: "书房控制",
      value: 0,
    },
  ];
  const da3 = [
    {
      name: "卫生间控制",
      value: 0,
    },
  ];
  const da4 = [
    {
      name: "客厅控制",
      value: 0,
    },
  ];
  const da5 = [
    {
      name: "次卧控制",
      value: 0,
    },
  ];
  const da6 = [
    {
      name: "楼梯控制",
      value: 0,
    },
  ];
  const da7 = [
    {
      name: "厨房控制",
      value: 0,
    },
  ];

  const colors = [
    [
      "#1DE9B6",
      "#F46E36",
      "#04B9FF",
      "#5DBD32",
      "#FFC809",
      "#FB95D5",
      "#BDA29A",
      "#6E7074",
      "#546570",
      "#C4CCD3",
    ],
    [
      "#37A2DA",
      "#67E0E3",
      "#32C5E9",
      "#9FE6B8",
      "#FFDB5C",
      "#FF9F7F",
      "#FB7293",
      "#E062AE",
      "#E690D1",
      "#E7BCF3",
      "#9D96F5",
      "#8378EA",
      "#8378EA",
    ],
    [
      "#DD6B66",
      "#759AA0",
      "#E69D87",
      "#8DC1A9",
      "#EA7E53",
      "#EEDD78",
      "#73A373",
      "#73B9BC",
      "#7289AB",
      "#91CA8C",
      "#F49F42",
    ],
  ];
  const colorIndex = 0;

  const year = [
    "温度（℃）",
    "湿度（%）",
    "振动(g)",
    "烟雾（百ppm）",
    "光线（百lx）",
  ];
  const year1 = [
    "空调调温",
    "加湿器/窗户协调",
    "门锁锁定",
    "紧急消防",
    "照明系统",
  ];

  const mapData = [[], [], [], [], []];

  /*柱子Y名称*/
  const categoryData = [];
  const fei = [];
  const rong = [];
  const barData = [];
  const lineData1 = [
    [
      10, 12, 13, 12, 14, 14, 16, 17, 18, 20, 22, 26, 27, 26, 23, 20, 18, 18,
      16, 16, 14, 13, 12, 10,
    ],
    [
      68, 67, 66, 63, 61, 55, 53, 48, 46, 44, 42, 42, 36, 34, 36, 37, 38, 42,
      46, 44, 58, 62, 66, 68,
    ],
    [1, 1, 1, 1, 1, 1, 1, 2, 3, 2, 1, 1, 1, 1, 1, 1, 3, 3, 1, 3, 3, 1, 1, 1],
    [
      56, 59, 60, 62, 56, 50, 40, 42, 38, 38, 39, 38, 40, 42, 38, 37, 34, 35,
      38, 44, 46, 50, 54, 56,
    ],
    [
      1, 1, 2, 1, 5, 10, 20, 24, 30, 32, 32, 34, 38, 40, 40, 38, 32, 25, 32, 32,
      5, 1, 1, 1,
    ],
  ];
  const lineData2 = [
    [
      11, 12, 14, 12, 15, 13, 16, 16, 16, 21, 22, 24, 22, 24, 23, 21, 19, 18,
      15, 14, 15, 13, 12, 11,
    ],
    [
      62, 64, 66, 65, 62, 58, 54, 49, 45, 44, 41, 40, 32, 36, 36, 39, 38, 40,
      46, 48, 52, 60, 63, 61,
    ],
    [1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 3, 1, 1, 1, 3, 2, 1, 1, 3, 1, 2, 1],
    [
      58, 59, 62, 62, 54, 50, 44, 42, 34, 33, 35, 38, 40, 44, 38, 35, 32, 35,
      33, 40, 46, 53, 56, 54,
    ],
    [
      1, 1, 1, 1, 6, 12, 20, 22, 30, 33, 32, 35, 38, 42, 40, 37, 34, 28, 32, 33,
      10, 1, 1, 1,
    ],
  ];

  const tian = [[], [], [], [], []];

  const line1 = [];
  const line2 = [];
  const line3 = [];
  const line4 = [];
  for (var key in geoCoordMap001) {
    line1.push({
      year: "温度",
      name: key,
      value: d1[key],
    });
  }
  for (var key in geoCoordMap002) {
    line2.push({
      year: "温度",
      name: key,
      value: d1[key],
    });
  }
  for (var key in geoCoordMap003) {
    line3.push({
      year: "温度",
      name: key,
      value: d1[key],
    });
  }
  for (var key in geoCoordMap004) {
    line4.push({
      year: "温度",
      name: key,
      value: d1[key],
    });
  }

  for (var key in geoCoordMap) {
    mapData[0].push({
      year: "温度",
      name: key,
      value: d1[key],
    });
    mapData[1].push({
      year: "湿度",
      name: key,
      value: d2[key],
    });
    mapData[2].push({
      year: "振动",
      name: key,
      value: d3[key],
    });
    mapData[3].push({
      year: "烟雾",
      name: key,
      value: d4[key],
    });
    mapData[4].push({
      year: "光线",
      name: key,
      value: d5[key],
    });
  }
  const jian = [];
  const count = [];
  const datamax = [];
  const datamin = [];
  //visualMap的max正常值设定
  const zhu = [45, 80, 10, 80, 50];
  //visualMap的min正常值设定
  const li = [-5, 15, 0, 20, 0];
  //var count2=[];
  const count3 = [];
  for (let i = 0; i < mapData.length; i++) {
    mapData[i].sort(function sortNumber(a, b) {
      return a.value - b.value;
    });
    barData.push([]);
    categoryData.push([]);
    fei.push([]);
    rong.push([]);
    tian.push([]);
    jian[i] = 0;
    count[i] = 0;
    count3[i] = 0;
    datamax[i] = 0;
    datamin[i] = 1000;
    for (let j = 0; j < mapData[i].length; j++) {
      if (mapData[i][j].name == "主卧1") {
        tian[i][0] = mapData[i][j].value;
      } else if (mapData[i][j].name == "主卧2") {
        tian[i][1] = mapData[i][j].value;
      } else if (mapData[i][j].name == "书房") {
        tian[i][2] = mapData[i][j].value;
      } else if (mapData[i][j].name == "卫生间") {
        tian[i][3] = mapData[i][j].value;
      } else if (mapData[i][j].name == "客厅1") {
        tian[i][4] = mapData[i][j].value;
      } else if (mapData[i][j].name == "客厅2") {
        tian[i][5] = mapData[i][j].value;
      } else if (mapData[i][j].name == "客厅3") {
        tian[i][6] = mapData[i][j].value;
      } else if (mapData[i][j].name == "次卧") {
        tian[i][7] = mapData[i][j].value;
      } else if (mapData[i][j].name == "楼梯") {
        tian[i][8] = mapData[i][j].value;
      } else if (mapData[i][j].name == "厨房") {
        tian[i][9] = mapData[i][j].value;
      }

      if (mapData[i][j].value >= -100) {
        jian[i] += mapData[i][j].value;
        count[i]++; //平均计数
      } else {
        fei[i].push(mapData[i][j].name);
      }

      if (mapData[i][j].value >= datamax[i]) {
        datamax[i] = mapData[i][j].value;
      }
      if (mapData[i][j].value <= datamin[i]) {
        datamin[i] = mapData[i][j].value;
      }
      //count2[i]=mapData[i].length-count[i];
      if (mapData[i][j].value < li[i] || mapData[i][j].value > zhu[i]) {
        count3[i]++;
        rong[i].push(mapData[i][j].name);
      }
      barData[i].push(mapData[i][j].value);
      categoryData[i].push(mapData[i][j].name);
    }
  }

  useEffect(() => {
    const myChart = echarts.init(ref.current);

    const convertData = function (data) {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        const geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value),
          });
        }
      }
      return res;
    };
    const convertData1 = function (database) {
      const res = [];
      for (let i = 0; i < database.length; i++) {
        const geoCoord1 = geoGpsMap[database[i].name];
        if (geoCoord1) {
          res.push({
            name: database[i].name,
            value: geoCoord1.concat(database[i].value),
          });
        }
      }
      return res;
    };

    //主卧控制开关legend
    const c1 = function (da1) {
      const res = [];
      for (let i = 0; i < da1.length; i++) {
        const g1 = l1[da1[i].name];
        if (g1) {
          res.push({
            name: da1[i].name,
            value: g1.concat(da1[i].value),
          });
        }
      }
      return res;
    };

    //书房控制开关legend
    const c2 = function (da2) {
      const res = [];
      for (let i = 0; i < da2.length; i++) {
        const g2 = l2[da2[i].name];
        if (g2) {
          res.push({
            name: da2[i].name,
            value: g2.concat(da2[i].value),
          });
        }
      }
      return res;
    };

    //卫生间控制开关legend
    const c3 = function (da3) {
      const res = [];
      for (let i = 0; i < da3.length; i++) {
        const g3 = l3[da3[i].name];
        if (g3) {
          res.push({
            name: da3[i].name,
            value: g3.concat(da3[i].value),
          });
        }
      }
      return res;
    };

    //客厅控制开关legend
    const c4 = function (da4) {
      const res = [];
      for (let i = 0; i < da4.length; i++) {
        const g4 = l4[da4[i].name];
        if (g4) {
          res.push({
            name: da4[i].name,
            value: g4.concat(da4[i].value),
          });
        }
      }
      return res;
    };

    //次卧控制开关legend
    const c5 = function (da5) {
      const res = [];
      for (let i = 0; i < da5.length; i++) {
        const g5 = l5[da5[i].name];
        if (g5) {
          res.push({
            name: da5[i].name,
            value: g5.concat(da5[i].value),
          });
        }
      }
      return res;
    };

    //楼梯控制开关legend
    const c6 = function (da6) {
      const res = [];
      for (let i = 0; i < da6.length; i++) {
        const g6 = l6[da6[i].name];
        if (g6) {
          res.push({
            name: da6[i].name,
            value: g6.concat(da6[i].value),
          });
        }
      }
      return res;
    };

    //厨房控制开关legend
    const c7 = function (da7) {
      const res = [];
      for (let i = 0; i < da7.length; i++) {
        const g7 = l7[da7[i].name];
        if (g7) {
          res.push({
            name: da7[i].name,
            value: g7.concat(da7[i].value),
          });
        }
      }
      return res;
    };

    //聚点随机程序
    const convertToLineData = function (data, gps) {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        const dataItem = data[i];
        const fromCoord = geoCoordMap[dataItem.name];
        const toCoord = gps; //郑州
        // var toCoord = geoGps[Math.random()*3];
        if (fromCoord && toCoord) {
          res.push([
            {
              coord: fromCoord,
              value: dataItem.value,
            },
            {
              coord: toCoord,
            },
          ]);
        }
      }
      return res;
    };

    const convertToLineData001 = function (data, gps) {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        const dataItem = data[i];
        const fromCoord = geoCoordMap004[dataItem.name];
        const toCoord = gps; //郑州
        // var toCoord = geoGps[Math.random()*3];
        if (fromCoord && toCoord) {
          res.push([
            {
              coord: fromCoord,
              value: dataItem.value,
            },
            {
              coord: toCoord,
            },
          ]);
        }
      }
      return res;
    };

    const optionXyMap01 = {
      //底部滚动栏
      timeline: {
        data: year,
        axisType: "category",
        autoPlay: true,
        playInterval: 3000,
        left: "10%",
        right: "10%",
        bottom: "3%",
        width: "80%",
        label: {
          normal: {
            textStyle: {
              color: "#ddd",
            },
          },
          emphasis: {
            textStyle: {
              color: "#fff",
            },
          },
        },
        symbolSize: 10,
        lineStyle: {
          color: "#555",
        },
        checkpointStyle: {
          borderColor: "#87CEEB",
          borderWidth: 2,
        },
        controlStyle: {
          showNextBtn: true,
          showPrevBtn: true,
          normal: {
            color: "#666",
            borderColor: "#666",
          },
          emphasis: {
            color: "#aaa",
            borderColor: "#aaa",
          },
        },
      },
      baseOption: {
        animation: true,
        animationDuration: 1000,
        animationEasing: "cubicInOut",
        animationDurationUpdate: 1000,
        animationEasingUpdate: "cubicInOut",
        //柱状图样式
        grid: [
          {
            left: "65%",
            top: "34.5%",
            bottom: "44.5%",
            width: "20%",
          },
          {
            gridindex: 1,
            left: "65%",
            right: "3%",
            top: "65%",
            bottom: "10%",
            containLabel: true,
          },
        ],
        tooltip: {
          trigger: "axis", // hover触发器
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow", // 默认为直线，可选为：'line' | 'shadow'
            shadowStyle: {
              color: "#aaa", //hover颜色
            },
          },
        },
        toolbox: {
          show: true,
          feature: {
            mark: {
              show: true,
            },
            dataView: {
              show: true,
              readOnly: false,
            },
            magicType: {
              show: true,
              type: ["bar", "line"],
            },
            restore: {
              show: true,
            },
            saveAsImage: {
              show: true,
            },
          },
        },
        legend: [
          {
            data: ["历史平均数据1", "历史平均数据2"],
            x: "75%",
            y: "60%",
            textStyle: {
              color: "#fff",
            },
          },
          {
            data: ["基站", "传感器", "传输路线"],
            top: "10%",
            left: "35%",
            textStyle: {
              color: "#fff",
            },
          },

          {
            icon: "roundRect",
            orient: "vertical",
            top: "7%",
            left: "5%",

            data: [
              {
                name: "主卧",
              },
              {
                name: "书房控制",
              },
              {
                name: "卫生间控制",
              },
              {
                name: "客厅控制",
              },
              {
                name: "次卧控制",
              },

              {
                name: "楼梯控制",
              },
              {
                name: "厨房控制",
              },
            ],
            selected: {
              主卧: false,
              书房控制: false,
              客厅控制: false,
              次卧控制: false,
              楼梯控制: false,
              厨房控制: false,
              卫生间控制: false,
              // 	'': false
            },

            textStyle: {
              color: "#fff",
            },
          },
        ],

        //地图样式
        geo: {
          show: true,
          map: "home",
          roam: true,
          zoom: 0.8,
          center: [116.453, 39.92],
          label: {
            emphasis: {
              show: false,
            },
          },
          itemStyle: {
            normal: {
              borderColor: "rgba(147, 235, 248, 1)",
              borderWidth: 1,
              areaColor: {
                type: "radial",
                x: 0.5,
                y: 0.5,
                r: 0.8,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(147, 235, 248, 0)", // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(147, 235, 248, .2)", // 100% 处的颜色
                  },
                ],
                globalCoord: false, // 缺省为 false
              },
              shadowColor: "rgba(128, 217, 248, 1)",
              // shadowColor: 'rgba(255, 255, 255, 1)',
              shadowOffsetX: -2,
              shadowOffsetY: 2,
              shadowBlur: 10,
            },
            emphasis: {
              areaColor: "#389BB7",
              borderWidth: 0,
            },
          },
        },
      },

      options: [],
    };

    for (let n = 0; n < year.length; n++) {
      optionXyMap01.options.push({
        //背景色
        backgroundColor: "#013954",

        //标题
        title: [
          {
            text: "传感器布设平面图",
            left: "16%",
            top: "5%",
            textStyle: {
              color: "#fff",
              fontSize: 25,
            },
          },
          {
            id: "statistic",
            text: year[n] + "数据统计情况",
            left: "60%",
            top: "5%",
            textStyle: {
              color: "#fff",
              fontSize: 25,
            },
          },
          {
            text: "平均值：" + jian[n] / count[n],
            left: "60%",
            top: "14.5%",
            textStyle: {
              color: "#90ee90",
              fontSize: 15,
            },
          },
          {
            text: "最大值：" + datamax[n],
            left: "72%",
            top: "14.5%",
            textStyle: {
              color: "#FF4500",
              fontSize: 15,
            },
          },
          {
            text: "最小值：" + datamin[n],
            left: "84%",
            top: "14.5%",
            textStyle: {
              color: "#87CEFF",
              fontSize: 15,
            },
          },
          {
            text: "未使用的传感器：" + (mapData[n].length - count[n]), //+'\n'+fei[n],
            left: "60%",
            top: "17.5%",
            textStyle: {
              color: "#FF7F00",
              fontSize: 15,
            },

            extraCssText: "width:120px; white-space:pre-wrap", //额外样式使\n生效
          },
          {
            text: "数据异常传感器：" + count3[n],
            left: "76%",
            top: "17.5%",
            textStyle: {
              color: "#9370DB",
              fontSize: 15,
            },

            extraCssText: "width:120px; white-space:pre-wrap", //额外样式使\n生效
          },
          {
            text: "(数据正常范围：" + li[n] + "~" + zhu[n] + ")",
            left: "60%",
            top: "20.5%",
            textStyle: {
              color: "#FFA54F",
              fontSize: 15,
            },

            extraCssText: "width:120px; white-space:pre-wrap", //额外样式使\n生效
          },
          {
            text: "未使用的传感器：" + fei[n], //+'\n'+fei[n],
            left: "60%",
            top: "23.5%",
            textStyle: {
              color: "#FF7F00",
              fontSize: 15,
            },

            extraCssText: "width:120px; white-space:pre-wrap", //额外样式使\n生效
          },
          {
            text: "数据异常传感器：" + rong[n],
            left: "60%",
            top: "26.5%",
            textStyle: {
              color: "#9370DB",
              fontSize: 15,
            },

            extraCssText: "width:120px; white-space:pre-wrap", //额外样式使\n生效
          },
        ],
        visualMap: {
          min: li[n],
          max: zhu[n],
          calculable: true,
          text: ["High", "Low"],
          inRange: {
            color: ["#50a3ba", "#eac736", "#d94e5d"],
          },
          padding: 5,
          right: "5%",
          bottom: "40%",
          textStyle: {
            color: "#fff",
          },
        },
        //             brush: {
        //     outOfBrush: {
        //         color: '#abc'
        //     },
        //     brushStyle: {
        //         borderWidth: 2,
        //         color: 'rgba(0,0,0,0.2)',
        //         borderColor: 'rgba(0,0,0,0.5)',
        //     },
        //     seriesIndex: [0, 1],
        //     throttleType: 'debounce',
        //     throttleDelay: 300,
        //     geoIndex: 0
        // },
        xAxis: [
          {
            type: "value",
            scale: true,
            position: "top",
            min: 0,
            boundaryGap: false,
            splitLine: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLabel: {
              margin: 2,
              textStyle: {
                color: "#fff",
              },
            },
          },
          {
            gridIndex: 1,
            type: "category",
            boundaryGap: false,
            axisLabel: {
              margin: 2,
              textStyle: {
                color: "#fff",
              },
            },
            data: [
              "0时",
              "1时",
              "2时",
              "3时",
              "4时",
              "5时",
              "6时",
              "7时",
              "8时",
              "9时",
              "10时",
              "11时",
              "12时",
              "13时",
              "14时",
              "15时",
              "16时",
              "17时",
              "18时",
              "19时",
              "20时",
              "21时",
              "22时",
              "23时",
            ],
          },
        ],
        yAxis: [
          {
            type: "category",
            //  name: 'TOP 20',
            nameGap: 16,
            axisLine: {
              show: true,
              lineStyle: {
                color: "#ddd",
              },
            },
            axisTick: {
              show: false,
              lineStyle: {
                color: "#ddd",
              },
            },
            axisLabel: {
              interval: 0,
              textStyle: {
                color: "#ddd",
              },
            },
            data: categoryData[n],
          },
          {
            gridIndex: 1,
            type: "value",
            axisLabel: {
              formatter: "{value} ",
              textStyle: {
                color: "#ddd",
              },
            },
          },
        ],

        series: [
          //地图
          {
            type: "map",
            map: "home",

            geoIndex: 0,
            aspectScale: 0.75, //长宽比
            showLegendSymbol: true, // 存在legend时显示
            label: {
              normal: {
                show: false,
              },
              emphasis: {
                show: false,
                textStyle: {
                  color: "#fff",
                },
              },
            },
            roam: true,
            itemStyle: {
              normal: {
                areaColor: "#031525",
                borderColor: "#FFFFFF",
              },
              emphasis: {
                areaColor: "#2B91B7",
              },
            },
            animation: false,
            data: mapData,
          },
          //地图中闪烁的点
          {
            name: "传感器",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: convertData(
              mapData[n]
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ), //大小差异显示
            symbolSize: function (val) {
              return (val[2] * 40 + 1200) / 180;
            },
            showEffectOn: "render",
            rippleEffect: {
              brushType: "stroke",
            },
            hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}",
                position: "right",
                show: true,
              },
            },
            itemStyle: {
              normal: {
                color: colors[colorIndex][n],
                shadowBlur: 10,
                shadowColor: colors[colorIndex][n],
              },
            },
            zlevel: 1,
          },
          {
            //基站点显示
            name: "基站",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: convertData1(
              database
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "arrow",
            symbolSize: 10,
            showEffectOn: "render",
            rippleEffect: {
              brushType: "stroke",
            },
            hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}",
                position: "right",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: colors[colorIndex][n],
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#fff",
                shadowBlur: 10,
                shadowColor: "#cfff",
              },
            },
            zlevel: 1,
          },
          {
            name: "主卧",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c1(
              da1
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "书房控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c2(
              da2
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][2],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "卫生间控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c3(
              da3
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "客厅控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c4(
              da4
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "次卧控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c5(
              da5
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "楼梯控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c6(
              da6
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          {
            name: "厨房控制",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: c7(
              da7
                .sort(function (a, b) {
                  return b.value - a.value;
                })
                .slice(0, 20)
            ),
            symbol: "roundRect", //气泡
            symbolSize: 10,
            // showEffectOn: 'render',
            // rippleEffect: {
            //     brushType: 'stroke'
            // },
            // hoverAnimation: true,
            label: {
              normal: {
                formatter: "{b}" + year1[n] + "：开",
                position: "bottom",
                show: true,
              },
              emphasis: {
                formatter: "{b}" + year[n] + "：" + tian[n][0],
                position: "bottom",
                show: true,
              },
            },

            itemStyle: {
              normal: {
                color: "#2f4554",
                shadowBlur: 10,
                shadowColor: "#2f4554",
              },
              emphasis: {
                color: "#c23531",
                shadowBlur: 10,
                shadowColor: "#c23531",
              },
            },
            zlevel: 1,
          },
          //线条聚点
          {
            name: "传输路线",
            type: "lines",
            zlevel: 2,
            effect: {
              show: true,
              period: 4, //箭头指向速度，值越小速度越快
              trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: "arrow", //箭头图标
              symbolSize: 3, //图标大小
            },
            lineStyle: {
              normal: {
                color: colors[colorIndex][n],
                width: 0.1, //尾迹线条宽度
                opacity: 0.5, //尾迹线条透明度
                curveness: 0.3, //尾迹线条曲直度
              },
            },
            //调用聚点随机
            data: convertToLineData(line1, geoGpsMap[Math.ceil(1)]),
          },
          {
            name: "传输路线",
            type: "lines",
            zlevel: 2,
            effect: {
              show: true,
              period: 4, //箭头指向速度，值越小速度越快
              trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: "arrow", //箭头图标
              symbolSize: 3, //图标大小
            },
            lineStyle: {
              normal: {
                color: colors[colorIndex][n],
                width: 0.1, //尾迹线条宽度
                opacity: 0.5, //尾迹线条透明度
                curveness: 0.3, //尾迹线条曲直度
              },
            },
            //调用聚点随机
            data: convertToLineData(line2, geoGpsMap[Math.ceil(2)]),
          },
          {
            name: "传输路线",
            type: "lines",
            zlevel: 2,
            effect: {
              show: true,
              period: 4, //箭头指向速度，值越小速度越快
              trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: "arrow", //箭头图标
              symbolSize: 3, //图标大小
            },
            lineStyle: {
              normal: {
                color: colors[colorIndex][n],
                width: 0.1, //尾迹线条宽度
                opacity: 0.5, //尾迹线条透明度
                curveness: 0.3, //尾迹线条曲直度
              },
            },
            //调用聚点随机
            data: convertToLineData(line3, geoGpsMap[Math.ceil(3)]),
          },
          {
            name: "传输路线",
            type: "lines",
            zlevel: 2,
            effect: {
              show: true,
              period: 4, //箭头指向速度，值越小速度越快
              trailLength: 0.02, //特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: "arrow", //箭头图标
              symbolSize: 3, //图标大小
            },
            lineStyle: {
              normal: {
                color: colors[colorIndex][n],
                width: 0.1, //尾迹线条宽度
                opacity: 0.5, //尾迹线条透明度
                curveness: 0.3, //尾迹线条曲直度
              },
            },
            //调用聚点随机
            data: convertToLineData001(line4, geoGpsMap[Math.ceil(4)]),
          },
          //柱状图
          {
            zlevel: 1.5,
            type: "bar",
            symbol: "none",
            itemStyle: {
              normal: {
                color: colors[colorIndex][n],
              },
            },
            data: barData[n],
          },
          {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: "历史平均数据1",

            type: "line",
            lineStyle: {
              normal: {
                color: "#4ea397",
              },
            },
            data: lineData1[n],
            markPoint: {
              data: [
                {
                  type: "max",
                  name: "最大值",
                  symbolSize: 40,
                },
                {
                  type: "min",
                  name: "最小值",
                  symbolSize: 20,
                },
              ],
              itemStyle: {
                normal: {
                  color: "#d0648a",
                },
              },
            },
            markLine: {
              data: [
                {
                  type: "average",
                  name: "平均值",
                },
              ],
            },
          },
          {
            xAxisIndex: 1,
            yAxisIndex: 1,
            name: "历史平均数据2",

            type: "line",
            lineStyle: {
              normal: {
                color: "#4ea397",
              },
            },
            data: lineData2[n],
            markPoint: {
              data: [
                {
                  type: "max",
                  name: "最大值",
                  symbolSize: 40,
                },
                {
                  type: "min",
                  name: "最小值",
                  symbolSize: 20,
                },
              ],
              itemStyle: {
                normal: {
                  color: "#d0648a",
                },
              },
            },
            markLine: {
              data: [
                {
                  type: "average",
                  name: "平均值",
                },
              ],
            },
          },
        ],
      });
    }
    axios.get("https://nest-admin.com/home.json").then((res) => {
      echarts.registerMap("home", res.data);
      myChart.setOption(optionXyMap01);
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

export default HomeSenseChart;
