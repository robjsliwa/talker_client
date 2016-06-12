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

  sendMessage(userName, roomName, chatBox) {
    console.log('sendMessage: ' + userName + ' ' + roomName + ' ' + chatBox);
    AppDispatcher.dispatch({
      actionType: SocketConstants.SOCKET_SEND_TEXT_MESSAGE,
      data: {
        userName: userName,
        roomName: roomName,
        chatText: chatBox,
      }
    });
  }
}

export default new SocketActions();
