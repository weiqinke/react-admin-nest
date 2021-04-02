import { tupleStr } from 'utils/core';
import io from 'socket.io-client';
import { createBodyImg } from './file';
import SocketDispatch from './socketDispatch';

// 项目中所有websocket事件名称
const eventName = tupleStr('paySignMoney', 'loginMessage', 'qkstartCar', 'QKSTART_REC');

interface SocketEvent {
  name: EventName;
  message: any;
  data: any;
  type?: any;
  func?: string;
}

type EventName = typeof eventName[number];
type websocketEventFn = (e: SocketEvent) => void;

class WebsocketManager {
  private websocketListeners = new Set<websocketEventFn>();
  public MySocketID: any = '';
  private rooms: any = {
    general: false,
    roomA: false,
    roomB: false,
    roomC: false,
    roomD: false
  };
  private selected: any = 'general';
  private socket: any = null;
  private activeRoom: any = '';
  private ConnectNum: any = 0;
  private SokcetUrl: any = 'http://localhost:3011';
  private AfterUrl: any = '/chat';
  //  建立连接
  public create() {
    // const BASE_URL: string = process.env.REACT_APP_SOCKET_URL || '';
    if (process.env.NODE_ENV === 'production') {
      this.SokcetUrl = process.env.REACT_APP_SOCKET_URL;
    } else if (process.env.NODE_ENV === 'development') {
      this.SokcetUrl = process.env.REACT_APP_SOCKET_URL;
    } else {
      // 本地代理地址
      this.SokcetUrl = process.env.REACT_APP_SOCKET_URL;
    }
    const socket = io(this.SokcetUrl);
    this.socket = socket;
    this.StartBindEventHandler();
    this.activeRoom = this.selected;
    this.socket.connect();

    this.tellServerOnline();
    this.checkID();
  }

  // 添加事件监听
  public addEventHandler = (fn: websocketEventFn) => {
    this.websocketListeners.add(fn);
    return () => {
      this.websocketListeners.delete(fn);
    };
  };

  public removeEventHandler = (fn: websocketEventFn) => {
    this.websocketListeners.delete(fn);
  };
  public close = () => {
    if (this.socket) {
      const token = sessionStorage.getItem('token');
      if (token) {
        this.socket.emit('client_take_disconnect', {
          id: this.MySocketID,
          token
        });
      }

      this.socket.disconnect();
    }
  };

  //主动发起消息
  public postMessage(payload: SocketEvent) {
    if (payload.name && this.socket && this.socket.connected) {
      const { name, message, data, type } = payload;
      this.socket.emit(name, {
        message,
        data,
        id: this.MySocketID,
        type
      });
    }
  }

  private tellServerOnline() {
    if (!this.socket) {
      return;
    }
    setTimeout(async () => {
      const imgdata = await createBodyImg();
      this.socket.emit('SYSTEM', {
        data: imgdata,
        message: '',
        id: this.MySocketID,
        type: 'html2canvas'
      });
      this.socket.emit('meOnLine', '我在线呢');
      this.tellServerOnline();
    }, 60000);
  }
  private checkID() {
    this.ConnectNum++;
    if (this.ConnectNum >= 10) {
      this.ConnectNum = 0;
      if (this.socket) {
        this.create();
        return;
      }
    }
    if (this.socket && this.socket.id) {
      this.MySocketID = this.socket.id;
      const token = sessionStorage.getItem('token');
      if (token) {
        this.postMessage({
          name: 'QKSTART_REC',
          message: '重新连接',
          data: {
            token
          }
        });
        this.postMessage({
          name: 'qkstartCar',
          message: '看下在线人数',
          data: {
            token,
            func: 'getOnlineUser'
          },
          type: 'MESSAGE'
        });
        return;
      }
    }
    setTimeout(() => {
      this.checkID();
    }, 1000);
  }

  private StartBindEventHandler() {
    this.socket.on('msgToClient', (message: any) => {});
    this.socket.on('joinedRoom', (room: any) => {
      this.rooms[room] = true;
    });

    this.socket.on('leftRoom', (room: any) => {
      this.rooms[room] = false;
    });
    this.socket.on('msgToClient', (room: any) => {});
    this.socket.on('qkstartCar', (payload: any) => {
      // 汇总事件来了，可能需要解析具体包
      SocketDispatch(payload, this.MySocketID);
    });
  }
}

const webSocketManager = new WebsocketManager();

/**
 * @example
 ```
 // 根组件建立连接
useEffect(() => {
		webSocketManager.create()
		return webSocketManager.close
}, [])
 ```

```
// 具体地方使用
useEffect(() => {
  const removeHandler = webSocketManager.addEventHandler(socketEvent => {
		const { name, data } = socketEvent
	})
	return removeHandler
}, [])
```
 */

export { webSocketManager, WebsocketManager };
