import { io } from "socket.io-client";
import { tupleStr } from "./core";
const DEV_REACT_APP_SOCKET_URL = "http://localhost:8066/websocket";
const PRO_REACT_APP_SOCKET_URL = "https://nest-admin.com/websocket";
// 项目中所有websocket事件名称
const eventName = tupleStr(
  "paySignMoney",
  "loginMessage",
  "NestAdminCar",
  "NewPlacard",
  "QKSTART_REC",
  "MESSAGE",
  "OsStatus",
  "WEBSOCKET_CHAT_SERVER_TO_CLIENT",
  "WEBSOCKET_CHAT_SENDER_TO_RECEIVER",
  "WEBSOCKET_CHAT_SERVER_ONLINE",
  "WEBSOCKET_CHAT_GET_HISTORY"
);

interface SocketEvent {
  name: EventName;
  type: any;
  data?: any;
  func?: string;
}
type EventName = (typeof eventName)[number];
type websocketEventFn = (e: SocketEvent) => void;

function WebsocketManager() {
  this.socket;
  this.activeRoom;
  this.ConnectNum = 0;
  this.SokcetUrl = "";
  this.MySocketID;
  this.publicEventName = "NestAdminCar";
  // 监听事件池
  this.websocketListeners = new Set<websocketEventFn>();
}

export const webSocketManager = new WebsocketManager();

WebsocketManager.prototype.create = function () {
  if (this.socket) return null;
  if (process.env.NODE_ENV === "production") {
    this.SokcetUrl = PRO_REACT_APP_SOCKET_URL;
  } else if (process.env.NODE_ENV === "development") {
    this.SokcetUrl = DEV_REACT_APP_SOCKET_URL;
  } else {
    // 本地代理地址
    this.SokcetUrl = DEV_REACT_APP_SOCKET_URL;
  }

  this.socket = io(this.SokcetUrl, { transports: ["websocket"] }).connect();
  this.StartBindEventHandler();
  this.activeRoom = this.selected;
  this.tellServerOnline();
  this.checkID();
};
WebsocketManager.prototype.Test = function () {};

WebsocketManager.prototype.postMessage = function (payload: SocketEvent) {
  if (this?.socket?.connected) {
    this.socket.emit(this.publicEventName, {
      ...payload,
      id: this.MySocketID
    });
  } else {
    console.error("===发送数据失败===");
    this.checkID();
  }
};

WebsocketManager.prototype.addEventHandler = function (fn: websocketEventFn) {
  this?.websocketListeners?.add(fn);
  return () => this.websocketListeners.delete(fn);
};

WebsocketManager.prototype.removeEventHandler = function (fn: websocketEventFn) {
  this.websocketListeners.delete(fn);
};

WebsocketManager.prototype.dispatchEventHandle = function (e: SocketEvent) {
  this.websocketListeners.forEach(fn => fn(e));
};

WebsocketManager.prototype.close = function () {
  if (this.socket) {
    const token = sessionStorage.getItem("token");
    if (token) {
      this.socket.emit("client_take_disconnect", {
        id: this.MySocketID,
        token
      });
    }
    this.socket.disconnect();
  }
};

WebsocketManager.prototype.checkID = function () {
  this.ConnectNum++;
  if (this.ConnectNum >= 10) {
    this.ConnectNum = 0;
    if (this.socket && !this.socket.connected) {
      this.socket.disconnect();
      return;
    }
  }
  if (this.socket && this.socket.id) {
    this.MySocketID = this.socket.id;
    const token = localStorage.getItem("token");
    if (token) {
      webSocketManager.postMessage({
        type: "UserReconnect",
        data: { token }
      });
      return;
    }
  }
  setTimeout(() => this.checkID(), 1000);
};

WebsocketManager.prototype.tellServerOnline = function () {
  if (!this.socket) return;
  setTimeout(async () => {
    this.socket.emit("meOnLine", "我在线呢");
    this.tellServerOnline();
  }, 60000);
};

WebsocketManager.prototype.StartBindEventHandler = function () {
  this.socket.on("msgToClient", (message: any) => {});
  this.socket.on("joinedRoom", (room: any) => (this.rooms[room] = true));
  this.socket.on("leftRoom", (room: any) => (this.rooms[room] = false));
  this.socket.on("msgToClient", (room: any) => {});
  //主线事件包
  this.socket.on(this.publicEventName, (payload: any) => {
    // 汇总事件来了，可能需要解析具体包
    this.dispatchEventHandle(payload);
  });
};
