import React, { FC, useEffect, useState } from 'react';
import * as d3 from 'd3';
import './index.less';
const D3line: FC = () => {
  const [svg, setSvg] = useState<any>(null);
  useEffect(() => {
    return () => {};
  }, []);
  const draw = async () => {
    const width = 800;
    const height = 500;
    const marginTop = 30;
    const marginRight = 30;
    const marginBottom = 30;
    const marginLeft = 50;
    const title = '登录日志显示';
    d3.select('#chart-line')
      .select('svg')
      .remove(); //清空上次缓存。重新绘制svg
    const svg: any = d3
      .select('#chart-line')
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#D3D3D3')
      .style('position', 'relative');
    setSvg(svg);
    var tooltip = svg
      .append('rect')
      .attr('x', 10)
      .attr('y', 10)
      .attr('width', 100)
      .attr('height', 80)
      .attr('fill', '#f74355')
      .attr('opacity', 0);

    svg
      .append('text')
      .attr('x', (marginLeft + width + marginRight) / 2)
      .attr('y', marginTop / 2)
      .attr('dy', '0.33em')
      .text(title)
      .attr('text-anchor', 'end');

    const dawData = [
      {
        date: '2020-04-11',
        location: '北京',
        new_deaths: 123
      },
      {
        date: '2020-04-12',
        location: '上海',
        new_deaths: 1232
      },
      {
        date: '2020-04-13',
        location: '天津',
        new_deaths: 1233
      },
      {
        date: '2020-04-14',
        location: '广州',
        new_deaths: 1234
      },
      {
        date: '2020-04-15',
        location: '深圳',
        new_deaths: 1253
      },
      {
        date: '2020-04-16',
        location: '四川',
        new_deaths: 6123
      },
      {
        date: '2020-04-17',
        location: '杭州',
        new_deaths: 1237
      }
    ];
    const data = dawData
      .sort((a: any, b: any) => b.new_deaths - a.new_deaths)
      .map((d: any) => ({ date: d.date, location: d.location, new_deaths: +d.new_deaths }));
    const xScale: any = d3
      .scaleBand()
      .domain(data.map((d: any) => d.location))
      .range([marginLeft, width - marginRight])
      .padding(0.3);
    const axisBottomScale: any = 1;
    const xAxis = d3.axisBottom(axisBottomScale).scale(xScale);
    svg
      .append('g')
      .attr('transform', 'translate(0,' + (height - marginBottom) + ')')
      .call(xAxis);

    const yScale: any = d3
      .scaleLinear()
      .domain([0, 10000])
      .range([height - marginBottom, marginTop]);

    const yAxis = d3.axisLeft(axisBottomScale).scale(yScale);

    svg
      .append('g')
      .attr('transform', 'translate(' + marginLeft + ', 0)')
      .call(yAxis);

    svg
      .selectAll('rect.datarect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => xScale(d.location))
      .attr('y', (d: any) => yScale(d.new_deaths))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - marginBottom - yScale(d.new_deaths))
      .attr('fill', '#0f78ff')
      .attr('class', 'datarect')
      .on('mouseover', (item: any) => {
        d3.select(item.target)
          .transition()
          .duration(250)
          .attr('fill', 'orange');
        tooltip
          .attr('x', parseInt(item.target.getAttribute('x')))
          .attr('y', height - item.target.getAttribute('height') - 150)
          .attr('opacity', 1);
      })
      .on('mouseout', (item: any) => {
        d3.select(item.target)
          .transition()
          .duration(250)
          .attr('fill', '#0f78ff');
        tooltip.attr('opacity', 0);
      });
  };

  useEffect(() => {
    draw();
    return () => {
      if (svg) {
        svg.remove();
      }
    };
  }, []);
  return (
    <div className="D3line">
      <h1>D3 Simple Bar Chart</h1>
      <div id="chart-line"></div>
    </div>
  );
};

export default D3line;
