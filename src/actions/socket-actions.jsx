import AppDispatcher from '../dispatcher/app-dispatcher';
import { SOCKET_ADD_USER_TO_ROOM } from '../constants/socket-constants';

class SocketActions {
  addUserToRoom(userName, roomName) {
    AppDispatcher.dispatch({
      actionType: SOCKET_ADD_USER_TO_ROOM,
      data: {
        userName: userName,
        roomName: roomName,
      }
    });
  }
}

export default new SocketActions();
