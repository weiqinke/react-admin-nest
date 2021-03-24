import { tupleStr } from 'utils/core';
import io from 'socket.io-client';
const config: any = {
  domain: 'ws://localhost:3021/'
};
// 项目中所有websocket事件名称
const eventName = tupleStr('paySignMoney');

interface SocketEvent {
  name: EventName;
  message: string;
  data: any;
}

type EventName = typeof eventName[number];
type websocketEventFn = (e: SocketEvent) => void;

const MAX_RETRY_TIMES = 5; // 最大重试次数

class WebsocketManager {
  private websocket!: WebSocket;
  private retryTimes: number = 0;
  private errorConnectInterval!: NodeJS.Timeout;
  private serverTimeoutInterval!: NodeJS.Timeout;
  private websocketListeners = new Set<websocketEventFn>();
  private rooms: any = {
    general: false,
    roomA: false,
    roomB: false,
    roomC: false,
    roomD: false
  };
  private listRooms: any = ['loginTongzhi', 'mess', 'roomB', 'roomC', 'roomD'];
  private title: any = 'NestJS Chat Real Time';
  private name: any = '';
  private text: any = '';
  private selected: any = 'general';
  private messages: any = [];
  private socket: any = null;
  private activeRoom: any = '';
  //  建立连接
  public create() {
    const socket = io('ws://localhost:3011/chat')
    this.socket = socket;
    this.activeRoom = this.selected;
    this.socket.on('msgToClient', (message: any) => {
      console.log(message);
      this.receivedMessage(message);
    });

    this.socket.on('connect', () => {
      this.check();
    });

    this.socket.on('joinedRoom', (room: any) => {
      this.rooms[room] = true;
    });

    this.socket.on('leftRoom', (room: any) => {
      this.rooms[room] = false;
    });
    this.socket.connect();
    this.socket.emit('msgToServer', 'message');
  }

  // 关闭连接
  public close = () => {
    if (this.websocket) {
      this.websocket.close();
    }
    this.retryTimes = 0;
    clearInterval(this.errorConnectInterval);
    this.heartCheck.reset();
  };
  private onChange = (event: any) => {
    this.socket.emit('leaveRoom', this.activeRoom);
    this.activeRoom = event.target.value;
    this.socket.emit('joinRoom', this.activeRoom);
    
  };

  private sendMessage = (event: any) => {
    if (this.validateInput()) {
      const message = {
        name: this.name,
        text: this.text,
        room: this.activeRoom
      };
      this.socket.emit('msgToServer', message);
      this.text = '';
    }
  };
  private receivedMessage = (message: any) => {
    this.messages.push(message);
  };
  private validateInput = () => {
    return this.name.length > 0 && this.text.length > 0;
  };
  private check = () => {
    if (this.isMemberOfActiveRoom()) {
      this.socket.emit('leaveRoom', this.activeRoom);
    } else {
      this.socket.emit('joinRoom', this.activeRoom);
      setInterval(()=>{
        console.log('加入房间: ', this.activeRoom);
        this.socket.emit('joinRoom', this.activeRoom);
      },2000)
      
    }
  };
  private isMemberOfActiveRoom = () => {
    return this.rooms[this.activeRoom];
  };

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

  private dispatchEventHandle = (e: SocketEvent) => {
    this.websocketListeners.forEach(fn => fn(e));
  };

  // 连接成功
  private onOpen = () => {
    this.retryTimes = 0;
    clearInterval(this.errorConnectInterval);
    window.removeEventListener('online', this.create);
    this.heartCheck.reset();
    this.heartCheck.start();
    console.log('成功建立连接');
  };

  // 收到消息
  private onMessage = (e: MessageEvent) => {
    const data = JSON.parse(e.data);
    this.heartCheck.reset();
    this.heartCheck.start();
    this.dispatchEventHandle(data);
  };

  // 连接断开
  private onClose = (e: Event) => {
    console.log('断开连接' + e);
  };

  // 连接发生错误
  private onError = (e: Event) => {
    clearInterval(this.errorConnectInterval);
    if (this.retryTimes > MAX_RETRY_TIMES) {
      window.addEventListener('online', this.create);
      console.log('停止连接');
    } else {
      this.retryTimes++;
      this.errorConnectInterval = setInterval(() => {
        this.create();
      }, this.retryTimes * 3000);
    }
    console.log('连接发生错误' + e);
  };

  // 心跳检测
  private heartCheck = {
    timeout: 10000,
    reset: () => {
      clearInterval(this.serverTimeoutInterval);
    },
    start: () => {
      this.serverTimeoutInterval = setInterval(() => {
        if (this.websocket.readyState === WebSocket.OPEN) {
          this.websocket.send('ping');
        } else {
          clearInterval(this.serverTimeoutInterval);
          if (this.retryTimes <= MAX_RETRY_TIMES) {
            this.create();
          }
        }
      }, this.heartCheck.timeout);
    }
  };
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
