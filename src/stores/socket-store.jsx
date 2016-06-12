import BaseStore from './base-store';
import { SOCKET_ERROR, SOCKET_CONNECT, SOCKET_DISCONNECT, SOCKET_ADD_USER_TO_ROOM } from '../constants/socket-constants';
import AppDispatcher from '../dispatcher/app-dispatcher';

class SocketStore extends BaseStore {
  constructor() {
    super()
    this.registerActions(() => this._actionsHandler.bind(this));
    this.ws = new WebSocket('ws://localhost:4652');
    this.ws.onmessage = this._message.bind(this);
    this.ws.onopen = this._open.bind(this);
    this.ws.onclose = this._close.bind(this);
    this.isConnected = false;
  }

  addSocketListener(name, callback) {
    this.on(name, callback);
  }

  removeSocketListener(name, callback) {
    this.removeListener(name, callback);
  }

  _actionsHandler(action) {
    /*switch (action.actionType) {
      case
    }*/
  }

  _message(e) {
    try {

    }
    catch (err) {
      this.emit(SOCKET_ERROR, err)
    }
  }

  _open() {
    console.log('Socket open');
    this.isConnected = true;
    this.emit(SOCKET_CONNECT);
  }

  _close() {
    console.log('Socket close');
    this.isConnected = false;
    this.emit(SOCKET_DISCONNECT);
  }

  _addUserToRoom(userName, roomName) {
    console.log('Sending addUserToRoom: ' + userName + ' ' + roomName);
    let message = {
      name: 'room add',
      data: {
        user: userName,
        room: roomName,
      }
    };
    try {
      this.ws.send(JSON.stringify(message));
    }
    catch(err) {
      console.log(err);
    }
  }

  get isSocketConnected() {
    return this.isConnected;
  }
}

const socketStore = new SocketStore();

socketStore._dispatchToken = AppDispatcher.register((action) => {
  if (action.actionType === SOCKET_ADD_USER_TO_ROOM) {
    if (action.data && action.data.userName && action.data.roomName) {
      socketStore._addUserToRoom(action.data.userName, action.data.roomName);
    }
  }
});
