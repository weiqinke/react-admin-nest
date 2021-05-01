import { findalllogs } from 'api/nest-admin/Accountlog';
import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import './Workplace.less';
import { bd_encrypt } from 'utils/core';
import ReactDOM from 'react-dom';
import usePrevious from 'hooks/usePrevious';
import { sendToOne } from 'api/nest-admin/Notice';
import { message } from 'antd';
var lastid: string = '';
var receiverid: string = '';
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
        //这里注意下。因为目前使用的数据量比较小，暂时生成保存。
        //如果量比较大的情况下，需要先生成marker点，然后在点击事件中。再次生成window点
        marker.infoWindow = createInfoWindow(item);
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
        marker.addEventListener('click', () => {
          if (mapHandle.current.getInfoWindow() === null) {
            lastid = '';
          } else {
            if (item.id === lastid) {
              return;
            }
          }
          lastid = item.id;
          receiverid = item.uid || '';
          mapHandle.current.openInfoWindow(marker.infoWindow, point); // 打开信息窗口
          setTimeout(() => {
            var dom = document.getElementById(`InfoWindowContent_${item.id}`);
            if (dom) {
              ReactDOM.render(infowindowJsx(item), dom);
            }
          }, 20);
        });
        mapHandle.current.addOverlay(marker);
        return true;
      });
    }
  };
  const sendata = () => {
    const payload = {
      description: textareavalue,
      type: 'message',
      receiverid: receiverid
    };
    sendToOne(payload).then(result => {
      if (result.data.code === 200) {
        message.info('发送成功');
        textRef.current.value = '';
      }
    });
  };
  var textareavalue: any = usePrevious('');
  const changeTextareaValue = (event: any) => {
    textareavalue = event.target.value;
  };
  var textRef: any = useRef(null);

  const infowindowJsx = (item: any) => {
    return (
      <div className={''}>
        <div className="inputtext">
          <textarea className="textarea" name="" id="" rows={5} onChange={changeTextareaValue} ref={textRef}></textarea>
        </div>
        <div
          className="sendtext"
          onClick={() => {
            sendata();
          }}
        >
          发送文字
        </div>
      </div>
    );
  };

  const createInfoWindow = (iteminfo: any) => {
    var opts = {
      width: 690, // 信息窗口宽度
      height: 200, // 信息窗口高度
      title: `<div class="infowindowtitle "><span class="title" data-id="${iteminfo.id}">${iteminfo.name}</span></div>`, // 信息窗口标题
      offset: 0,
      enableCloseOnClick: false
    };
    var infoWindow = new BMap.InfoWindow(
      `<div class="InfoWindowContent InfoWindowContent_${iteminfo.id}" id="InfoWindowContent_${iteminfo.id}" ></div>`,
      opts
    ); // 创建信息窗口对象
    infoWindow.Snowflake = iteminfo.id;
    infoWindow.enableAutoPan();
    return infoWindow;
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

    //需要添加一次事件委托，保证地图中的事件能正常触发

    // eslint-disable-next-line
  }, []);

  return (
    <div className="BaiduMap">
      <div className="MapNodeDiv" id="MapNodeDiv"></div>
    </div>
  );
};

export default BaiduMap;
