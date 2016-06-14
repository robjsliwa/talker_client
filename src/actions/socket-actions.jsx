import AppDispatcher from '../dispatcher/app-dispatcher';
import SocketConstants from '../constants/socket-constants';

class SocketActions {
  addUserToRoom(userName, roomName) {
    AppDispatcher.dispatch({
      actionType: SocketConstants.SOCKET_ADD_USER_TO_ROOM,
      data: {
        userName: userName,
        roomName: roomName,
      }
    });
  }

  joinUserToRoom(userName, userID, roomName) {
    AppDispatcher.dispatch({
      actionType: SocketConstants.SOCKET_JOIN_USER_TO_ROOM,
      data: {
        userName: userName,
        userID: userID,
        roomName: roomName,
      }
    });
  }

  sendMessage(userName, userID, roomName, chatBox) {
    console.log('in actions: sendMessage: ' + userName + ' ' + userID + ' ' + roomName + ' ' + chatBox);
    AppDispatcher.dispatch({
      actionType: SocketConstants.SOCKET_SEND_TEXT_MESSAGE,
      data: {
        userName: userName,
        userID: userID,
        roomName: roomName,
        chatText: chatBox,
      }
    });
  }
}

export default new SocketActions();
