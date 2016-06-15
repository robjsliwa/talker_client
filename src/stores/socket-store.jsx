import BaseStore from './base-store';
import SocketConstants from '../constants/socket-constants';
import AppDispatcher from '../dispatcher/app-dispatcher';

class SocketStore extends BaseStore {
  constructor() {
    super()
    this.registerActions(() => this._actionsHandler.bind(this));
    this._createWebSocket();
    this.reconnectAttempts = 0;
    this.userName = "";
    this.userID = "";
    this.roomName = "";
  }

  addSocketListener(name, callback) {
    this.addListener(name, callback);
  }

  removeSocketListener(name, callback) {
    this.removeListener(name, callback);
  }

  removeAllSocketListeners(name) {
    this.removeAllListeners(name);
  }

  _createWebSocket() {
    this.ws = new WebSocket('ws://localhost:4652');
    this.ws.onmessage = this._message.bind(this);
    this.ws.onopen = this._open.bind(this);
    this.ws.onclose = this._close.bind(this);
    this.isConnected = false;
    this.isRoomReady = false;
  }

  _actionsHandler(action) {
    switch (action.actionType) {
      case SocketConstants.SOCKET_ADD_USER_TO_ROOM:
        if (action.data && action.data.userName && action.data.roomName) {
          this._addUserToRoom(action.data.userName, action.data.roomName);
        }
        break;

      case SocketConstants.SOCKET_JOIN_USER_TO_ROOM:
        if (action.data && action.data.userName && action.data.roomName) {
          this._joinUserToRoom(action.data.userName, action.data.userID, action.data.roomName);
        }

      case SocketConstants.SOCKET_SEND_TEXT_MESSAGE:
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
      let payload = JSON.parse(e.data);
      if (payload.name === 'chat message') {
        console.log('Message Text');
        console.log(payload.data);
        this.emit(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, {
          from: payload.data.user,
          fromID: payload.data.userID,
          text: payload.data.text,
          textID: payload.data.textID,
          timestamp: payload.data.timestamp,
        });
      }

      if (payload.name === 'room add') {
        if (payload && payload.data) {
          console.log(payload.data);
          this.userName = payload.data.user.name;
          this.userID = payload.data.user.id;
          this.roomName = payload.data.room.name;
          localStorage.setItem('userID', payload.data.user.id);
          localStorage.setItem('userName', payload.data.user.name);
          localStorage.setItem('roomName', payload.data.room.name);
          this.isRoomReady = true;
          this.emit(SocketConstants.SOCKET_ROOM_READY);
        }
      }
    }
    catch (err) {
      this.emit(SocketConstants.SOCKET_ERROR, err)
    }
  }

  _open() {
    console.log('Socket open');
    this.reconnectAttempts = 1;
    this.isConnected = true;
    this.emit(SocketConstants.SOCKET_CONNECT);
  }

  _close() {
    console.log('Socket close');
    this.isConnected = false;
    this.emit(SocketConstants.SOCKET_DISCONNECT);

    let interval = this._getReconnectInterval(this.reconnectAttempts);

    console.log('Will reconnect in ' + interval / 1000 + ' seconds...');

    setTimeout(() => {
      this.reconnectAttempts++;
      this._createWebSocket();
    }, interval);
  }

  _getReconnectInterval(interval) {
    return Math.min(15, (Math.pow(2, interval) - 1)) * 1000;
  }

  _addUserToRoom(userName, roomName) {
    let message = {
      name: 'room add',
      data: {
        user: userName,
        room: roomName,
      }
    };
    try {
      this.ws.send(JSON.stringify(message));
      this.isConnected = true;
    }
    catch(err) {
      console.log(err);
    }
  }

  _joinUserToRoom(userName, userID, roomName) {
    let message = {
      name: 'room add',
      data: {
        user: userName,
        userID: userID,
        room: roomName,
      }
    };
    try {
      this.ws.send(JSON.stringify(message));
      this.isConnected = true;
    }
    catch(err) {
      console.log(err);
    }
  }

  _sendTextMessage(data) {
    let messageText = {
      name: 'chat message',
      data: {
        user: data.userName,
        userID: data.userID,
        room: data.roomName,
        text: data.chatText,
        timestamp: Date.now(),
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
