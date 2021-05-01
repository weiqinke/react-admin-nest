import { findalllogs } from 'api/nest-admin/Accountlog';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import './Workplace.less';
import { bd_encrypt } from 'utils/core';
const BaiduMap: FC = () => {
  const BMap = (window as any).BMap;
  const [, setMapdiv] = useState(null);
  const mapHandle: any = useRef();
  const [, setLabels] = useState([]);
  const getAllPointer = async () => {
    const result = await findalllogs({
      st: moment().subtract(15, 'days'),
      et: moment()
    });
    if (result.data.code === 200) {
      setLabels(result.data.data || []);
      setTimeout(() => {
        DrawPointer(result.data.data);
      }, 100);
    }
  };
  const initCallback = () => {
    const map = new BMap.Map('MapNodeDiv'); //创建地图示例，选择显示地图的容器，里面是id值
    setMapdiv(map);
    mapHandle.current = map;
    var point = new BMap.Point(116.404269, 39.913828); //创建点坐标（经度，纬度）
    map.centerAndZoom(point, 12); //初始化地图，设置中心点坐标和地图级别
    map.enableScrollWheelZoom(); // 启用滚轮放大缩小
    getAllPointer();
  };

  const [hovering, setHovering] = useState(false);
  const DrawPointer = (result: []) => {
    if (mapHandle.current) {
      result.map((item: any) => {
        const [lat, lon] = (item.location || '').split(',');
        const { bd_lat, bd_lng } = bd_encrypt(lat, lon);
        const point = new BMap.Point(bd_lng, bd_lat);
        var marker = new BMap.Marker(point);
        marker.Iteminfo = item;
        marker.mouseoverMaker = initOneLabel(item, point);
        var icon = marker.getIcon();
        marker.setShadow(icon);
        // var myIcon = new BMap.Icon(pointImg, new BMap.Size(35, 40), {
        //   anchor: new BMap.Size(0, 0)
        // });
        // marker.setIcon(myIcon); //设置标签的图标为自定义图标
        const textLabel = new BMap.Label('<div class="">' + item.name + '</div>', {
          position: point, // 指定文本标注所在的地理位置
          offset: new BMap.Size(18, 8) //设置文本偏移量 页面上蓝色角标的文字
        }); // 创建文本标注对象

        textLabel.setStyle({
          fontFamily: '微软雅黑',
          maxWidth: 'none',
          padding: '3px 5px',
          borderColor: '#000',
          backgroundColor: '#fff',
          margin: '0px',
          textAlign: 'center'
        });
        marker.setLabel(textLabel);

        marker.addEventListener('mouseover', () => {
          //移入，加上一个气泡图 覆盖物（marker） 可以添加多个
          if (hovering) {
            return;
          }
          setHovering(true);
          mapHandle.current.addOverlay(marker.mouseoverMaker);
        });

        marker.addEventListener('mouseout', () => {
          setHovering(false);
          mapHandle.current.removeOverlay(marker.mouseoverMaker);
        });

        mapHandle.current.addOverlay(marker);
        return true;
      });
    }
  };

  const initOneLabel = (item: any, point: any) => {
    var opts = {
      position: point, // 指定文本标注所在的地理位置
      offset: new BMap.Size(10, -20) //设置文本偏移量 鼠标移入弹出层的偏移量
    };
    var label = new BMap.Label(
      `<div>
        <div>用户名:${item.name}</div>
        <div>IP:${item.ip}</div>
        <div>省份:${item.province}</div>
        <div>城市:${item.city}</div>
    </div>`,
      opts
    ); // 创建文本标注对象
    label.setStyle({
      fontSize: '12px',
      maxWidth: 'none',
      fontFamily: '微软雅黑',
      padding: '10px',
      borderColor: '#ccc',
      backgroundColor: '#ffffff',
      borderRadius: '4px',
      color: '#000',
      textAlign: 'left'
    });
    return label;
  };

  useEffect(() => {
    initCallback();
    return () => {
      mapHandle.current.clearHotspots();
      mapHandle.current.clearOverlays();
      mapHandle.current.removeOverlay();
      mapHandle.current.closeInfoWindow();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="BaiduMap">
      <div className="MapNodeDiv" id="MapNodeDiv"></div>
    </div>
  );
};

export default BaiduMap;
