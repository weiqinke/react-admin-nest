import { tupleStr } from 'utils/core';
const config: any = {};
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

  //  建立连接
  public create() {
    if (!window.WebSocket) return;
    let url = '';
    if (process.env.NODE_ENV === 'production') {
      url = config.domain.replace('https', 'wss');
    } else if (process.env.NODE_ENV === 'test') {
      url = config.domain.replace('http', 'ws');
    } else {
      // 本地代理地址
      const proxyAddress = 'http://proxy';
      url = proxyAddress.replace('http', 'ws');
    }
    this.websocket = new WebSocket(url);
    this.websocket.onopen = this.onOpen;
    this.websocket.onclose = this.onClose;
    this.websocket.onerror = this.onError;
    this.websocket.onmessage = this.onMessage;
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
