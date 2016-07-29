import { EventEmitter } from 'events';

export class WebRTCEvents extends EventEmitter {
  constructor(props) {
    super(props);
  }

  emitWebRTCEvent(eventType) {
    this.emit(eventType);
  }

  addWebRTCListener(eventType, callback) {
    this.on(eventType, callback);
  }

  removeWebRTCListener(eventType, callback) {
    this.removeListener(eventType, callback);
  }
}
