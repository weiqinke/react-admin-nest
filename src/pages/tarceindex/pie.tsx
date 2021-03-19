import React, { FC, useEffect } from 'react';
import * as echarts from 'echarts';
const EchartsPie: FC = () => {
  useEffect(() => {
    const dom: any = document.getElementById('pie');
    let myChart: any = echarts.init(dom);
    myChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']
      },
      series: [
        {
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 335, name: '直接访问' },
            { value: 310, name: '邮件营销' },
            { value: 234, name: '联盟广告' },
            { value: 135, name: '视频广告' },
            { value: 1548, name: '搜索引擎' }
          ],
          itemStyle: {}
        }
      ]
    });
    window.addEventListener('resize', function() {
      myChart.resize();
    });
    return () => {
      myChart.dispose && myChart.dispose();
    };
  }, []);

  return <div id="pie" style={{ height: 300, background: '#fff' }}></div>;
};

export default EchartsPie;
