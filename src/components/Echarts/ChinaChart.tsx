import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";
import axios from "axios";

const ChinaChart = () => {
  const ref = useRef();

  useEffect(() => {
    const myChart = echarts.init(ref.current);
    axios.get("https://nest-admin.com/china.json").then((res) => {
      echarts.registerMap("china", res.data);
      myChart.setOption({
        backgroundColor: "rgba(124,193,173,0.5)",
        // 进行相关配置
        tooltip: {
          borderColor: "#7cc1ad", //边框颜色
          borderWidth: 1,
        }, // 鼠标移到图里面的浮动提示框
        dataRange: {
          show: false,
          min: 10000000,
          max: 200000000,
          text: ["High", "Low"],
          realtime: true,
          calculable: true,
          // color: ["#52dbdf", "#FF9B52", "#FFD068"],
        },
        geo: {
          // 这个是重点配置区
          map: "china", // 表示中国地图
          roam: false, // 是否允许缩放
          zoom: 1,
          label: {
            show: true, // 是否显示对应地名
            color: "#000",
            fontSize: 11,
          },
          itemStyle: {
            areaColor: null,
            shadowOffsetX: 0,
            shadowOffsetY: 0,
            shadowBlur: 1,
            borderWidth: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        series: [
          {
            type: "scatter",
            coordinateSystem: "geo", // 对应上方配置
          },
          {
            name: "访问次数", // 浮动框的标题
            type: "map",
            geoIndex: 0,
            data: [
              { name: "北京", value: 21893095 },
              { name: "天津", value: 13866009 },
              { name: "河北", value: 74610235 },
              { name: "山西", value: 34915616 },
              { name: "内蒙古", value: 24049155 },
              { name: "辽宁", value: 42591407 },
              { name: "吉林", value: 24073453 },
              { name: "黑龙江", value: 31850088 },
              { name: "上海", value: 24870895 },
              { name: "江苏", value: 84748016 },
              { name: "浙江", value: 64567588 },
              { name: "安徽", value: 61027171 },
              { name: "福建", value: 41540086 },
              { name: "江西", value: 45188635 },
              { name: "山东", value: 101527453 },
              { name: "河南", value: 99365519 },
              { name: "湖北", value: 57752557 },
              { name: "湖南", value: 66444864 },
              { name: "广东", value: 126012510 },
              { name: "广西", value: 50126804 },
              { name: "海南", value: 10081232 },
              { name: "重庆", value: 32054159 },
              { name: "四川", value: 83674866 },
              { name: "贵州", value: 38562148 },
              { name: "云南", value: 47209277 },
              { name: "西藏", value: 3648100 },
              { name: "陕西", value: 39528999 },
              { name: "甘肃", value: 25019831 },
              { name: "青海", value: 5923957 },
              { name: "宁夏", value: 7202654 },
              { name: "新疆", value: 25852345 },
              { name: "香港", value: 7508112 },
              { name: "澳门", value: 683567 },
              { name: "台湾", value: 23420442 },
            ],
          },
        ],
      });
    });
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    return () => {
      myChart.dispose && myChart.dispose();
    };
  }, []);

  return <div ref={ref} style={{ height: 800, margin: 0 }}></div>;
};

export default ChinaChart;
