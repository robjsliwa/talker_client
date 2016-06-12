import BaseStore from './base-store';
import SocketConstants from '../constants/socket-constants';
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
    this.isRoomReady = false;
    this.userName = "";
    this.roomName = "";
  }

  addSocketListener(name, callback) {
    this.on(name, callback);
  }

  removeSocketListener(name, callback) {
    this.removeListener(name, callback);
  }

  _actionsHandler(action) {
    console.log(action);
    console.log('actionsHandler: ' + JSON.stringify(action));
    console.log('actionType: ' + action.actionType);
    switch (action.actionType) {
      case SocketConstants.SOCKET_ADD_USER_TO_ROOM:
        console.log('ADD_USER in store');
        if (action.data && action.data.userName && action.data.roomName) {
          this._addUserToRoom(action.data.userName, action.data.roomName);
        }
        break;

      case SocketConstants.SOCKET_SEND_TEXT_MESSAGE:
        console.log('SEND_TEXT in store');
        if (action.data &&
            action.data.userName &&
            action.data.roomName &&
            action.data.chatText
        ) {
          this._sendTextMessage(action.data);
        }
        break;

      default:
          console.log('unknown socket action');
    }
  }

  _message(e) {
    try {
      console.log(e);
      let payload = JSON.parse(e.data);
      console.log(payload);
      console.log('Payload name: ' + payload.name);
      if (payload.name === 'chat message') {
        console.log('From: ' + payload.data.user + ' => ' + payload.data.text);
        this.emit(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, {
          from: payload.data.user,
          text: payload.data.text,
        });
      }
    }
    catch (err) {
      this.emit(SocketConstants.SOCKET_ERROR, err)
    }
  }

  _open() {
    console.log('Socket open');
    this.isConnected = true;
    this.emit(SocketConstants.SOCKET_CONNECT);
  }

  _close() {
    console.log('Socket close');
    this.isConnected = false;
    this.emit(SocketConstants.SOCKET_DISCONNECT);
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
      this.userName = userName;
      this.roomName = roomName;
      this.isConnected = true;
      this.isRoomReady = true;
      localStorage.setItem('userName', userName);
      localStorage.setItem('roomName', roomName);
      this.emit(SocketConstants.SOCKEY_ROOM_READY);
    }
    catch(err) {
      console.log(err);
    }
  }

  _sendTextMessage(data) {
    console.log('in sendTextMessage: ' + data);
    let messageText = {
      name: 'chat message',
      data: {
        user: data.userName,
        room: data.roomName,
        text: data.chatText,
      }
    };
    try {
      this.ws.send(JSON.stringify(messageText))
    }
    catch(err) {
      console.log(err);
    }
  }

  get isSocketConnected() {
    return this.isConnected;
  }
}

export default new SocketStore();
