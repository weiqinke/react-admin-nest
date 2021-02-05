import { tupleStr } from './core';

// 项目中所有自定义事件名称
const eventName = tupleStr('over');

type EventName = typeof eventName[number];

class Event {
  public eventName: EventName;
  public handler: (...args: any[]) => void;

  constructor(eventName: EventName, handler: (...args: any[]) => void) {
    this.eventName = eventName;
    this.handler = handler;
  }
}

class EventBus {
  private events: Event[] = [];

  public on(eventName: EventName, handler: (...args: any[]) => void) {
    const event = new Event(eventName, handler);
    this.events.push(event);
    const eventIndex = this.events.length - 1;
    return () => {
      this.events.splice(eventIndex, 1);
    };
  }

  public off(eventName: EventName) {
    const eventIndex = this.events.findIndex(item => item.eventName === eventName);
    this.events.splice(eventIndex, 1);
  }

  public emit(eventName: EventName, ...args: any[]) {
    const event = this.events.find(item => item.eventName === eventName)!;
    event.handler(...args);
  }
}

const eventBus = new EventBus();

export default eventBus;
