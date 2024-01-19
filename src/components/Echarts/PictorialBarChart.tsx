import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
import "echarts-wordcloud";

const data = [
  {
    name: "java",
    value: 1
  },
  {
    name: "C",
    value: 11
  },
  {
    name: "C++",
    value: 12
  },
  {
    name: "PASCAL",
    value: 12
  },
  {
    name: "LISP",
    value: 18
  },
  {
    name: "Prolog",
    value: 13
  },
  {
    name: "CLIPS",
    value: 14
  },
  {
    name: "OpenCyc",
    value: 21
  },
  {
    name: "Fazzy",
    value: 18
  },
  {
    name: "Python",
    value: 22
  },
  {
    name: "PHP",
    value: 26
  },
  {
    name: "Ruby",
    value: 24
  },
  {
    name: "Lua",
    value: 15
  },
  {
    name: "True basic",
    value: 18
  },
  {
    name: "Qbasic",
    value: 18
  },
  {
    name: "Virtual Basic",
    value: 22
  },
  {
    name: "Objective-C",
    value: 26
  },
  {
    name: "Go",
    value: 24
  },
  {
    name: "JavaScript",
    value: 115
  },
  {
    name: "Swift",
    value: 18
  },
  {
    name: "Visual Basic",
    value: 15
  },
  {
    name: "Modula2",
    value: 10
  },
  {
    name: "MATLAB",
    value: 17
  },
  {
    name: "RPG",
    value: 15
  },
  {
    name: "AppleScript",
    value: 16
  },
  {
    name: "BeanShell",
    value: 1
  },
  {
    name: "FScript",
    value: 6
  },
  {
    name: "VBScript",
    value: 7
  },
  {
    name: "PowerShell",
    value: 15
  },
  {
    name: "HTML",
    value: 10
  },
  {
    name: "CSS",
    value: 17
  },
  {
    name: "XML",
    value: 15
  },
  {
    name: "IO",
    value: 16
  },
  {
    name: "Slate",
    value: 1
  },
  {
    name: "Scala",
    value: 6
  },
  {
    name: "SQL",
    value: 7
  }
];
const PictorialBarChart: FC = () => {
  const ref = useRef();
  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      backgroundColor: "rgba(115,225,12,0.5)",
      tooltip: {
        show: true,
        position: "top",
        textStyle: {
          fontSize: 12
        }
      },
      series: [
        {
          type: "wordCloud",
          // 网格大小，各项之间间距 网格尺寸越大，单词之间的间距越大
          gridSize: 0,
          // 形状有(circle)圆形(默认)、(cardioid)心形，(diamond)菱形，
          // (triangle-forward)三角形向前，(triangle)三角形，(pentagon)五边形和(star)星形。*/
          shape: "star",
          // 字体大小范围
          sizeRange: [16, 40],
          // 文字旋转角度范围
          rotationRange: [-60, 60],
          rotationStep: 5,
          // 自定义图形
          // maskImage: maskImage,
          //设置显示区域的位置以及大小
          left: "center",
          top: "center",
          right: null,
          bottom: null,
          width: "70%",
          height: "80%",
          // 是否渲染超出画布的文字
          drawOutOfBound: false,
          //如果字体太大而无法显示文本，
          //是否收缩文本。如果将其设置为false，则文本将不渲染。如果设置为true，则文本将被缩小。
          shrinkToFit: false,
          textStyle: {
            color: function () {
              return "rgb(" + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(",") + ")";
            }
          },
          emphasis: {
            textStyle: {
              fontWeight: "bold",
              color: "#53F6FF"
            }
          },
          data: data
        }
      ]
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

export default PictorialBarChart;
