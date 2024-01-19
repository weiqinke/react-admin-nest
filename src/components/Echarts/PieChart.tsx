import React, { FC, useEffect, useRef } from "react";
import * as echarts from "echarts";
const PieChart: FC = () => {
  const ref = useRef();

  const datas = [
    { value: 40, value1: 188.82, name: "对外收入", rate: "94.41%" },
    { value: 24, value1: 33.45, name: "对内收入", rate: "66.9%" },
    { value: 32, value1: 228.1, name: "回款金额", rate: "87.06%" }
  ];

  let datap = [];
  const colorList = ["#3399ff", "#85c285", "#ffc266", "#ff8585", "#c299ff"];
  const color = colorList.splice(0, datas.length);
  for (let i = 0; i < datas.length; i++) {
    datap.push({
      value: datas[i].value,
      name: "rosetemp" + i
    });
    color.push("#FFFFFF");
  }
  datap = datas.concat(datap);

  useEffect(() => {
    const myChart: any = echarts.init(ref.current);
    myChart.setOption({
      backgroundColor: "#fff",
      legend: {
        bottom: "1%",
        left: "center",
        orient: "vertical",
        data: datas,
        icon: "circle",
        itemWith: 8,
        itemHeight: 8,
        itemGap: 10,
        // padding: [5, 10, 5, 0],
        formatter(name) {
          const item = datas.filter(item => item.name === name)[0];
          return `{name|${name}}{value1| ${item.value1 + "（万元）}"}{name2|${item.rate}}`;
        },
        textStyle: {
          rich: {
            name: {
              color: "#595959",
              fontSize: 14,
              width: 150,
              fontWeight: 600
            },
            name2: {
              color: "#595959",
              fontSize: 14,
              width: 200,
              fontWeight: 600
            },
            value1: {
              color: "#595959",
              fontSize: 14,
              width: 170,
              fontWeight: 600
            }
          }
        }
      },
      title: {
        text: "2023年收入实际完成率",
        top: "10%",
        textAlign: "center",
        left: "49.5%",
        textStyle: {
          color: "#262626",
          fontSize: 18,
          fontWeight: "600"
        }
        // subtext:'2022年收入实际完成情况',
        // subtextStyle:{
        //   color: '#262626',
        //   fontSize: 14,
        //   fontWeight: '600',
        //   margin:[100,0,100,0]
        // }
      },
      color: color,
      series: [
        {
          name: "Nightingale Chart",
          type: "pie",
          radius: [40, 200],
          center: ["50%", "70%"],
          roseType: "radius",
          silent: true,
          startAngle: 180,
          legendHoverLink: false,
          itemStyle: {
            borderRadius: 0
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: false
            }
          },
          color: ["#f6f8fe", "#ffffff"],
          data: [
            { value: 10, name: "r" },
            { value: 10, name: "ro" }
          ]
        },
        {
          name: "Nightingale Chart",
          type: "pie",
          radius: [40, 190],
          center: ["50%", "70%"],
          roseType: "radius",
          startAngle: 180,
          legendHoverLink: false,
          itemStyle: {
            borderRadius: 0,
            borderColor: "#fff",
            borderWidth: 1
          },
          label: {
            show: true,
            position: "inside",
            color: "#fff",
            formatter(params) {
              return params.data.rate;
            }
          },
          emphasis: {
            label: {
              show: true
            }
          },
          data: datap
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

export default PieChart;
