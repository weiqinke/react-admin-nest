import dayjs from "dayjs";
import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";

const LoginFrequencyChart = ({ dataSource = [] }) => {
  const ref = useRef();

  useEffect(() => {
    const payload = {};
    const userData = {};
    const newData = [...dataSource].reverse();
    newData.map((v) => {
      const time = dayjs(v.created).format("MM-DD");
      if (!payload[time]) payload[time] = {};
      if (!payload[time][v.name]) payload[time][v.name] = 1;
      else payload[time][v.name] += 1;

      if (!userData[v.name]) userData[v.name] = {};
      if (!userData[v.name][time]) userData[v.name][time] = 1;
      else userData[v.name][time] += 1;
    });
    const xAxisData = Object.keys(payload);
    const nameData = Object.keys(userData);
    const seriesData = [];
    nameData.map((name) => {
      const data = [];
      xAxisData.filter((time) => data.push(userData[name][time] || 0));
      seriesData.push({
        name,
        type: "bar",
        stack: "login",
        emphasis: { focus: "series" },
        data: data,
      });
    });

    const option = {
      title: {
        text: "最近15天登录趋势图",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      legend: {
        data: nameData,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xAxisData,
      },
      yAxis: { type: "value" },
      series: seriesData,
    };

    const myChart = echarts.init(ref.current);
    myChart.setOption(option);
    window.addEventListener("resize", function () {
      myChart.resize();
    });
    return () => {
      myChart.dispose && myChart.dispose();
    };
  }, [dataSource]);

  return <div ref={ref} style={{ height: 400, margin: 12 }}></div>;
};

export default LoginFrequencyChart;
