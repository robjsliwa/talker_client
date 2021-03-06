import KeyMirror from 'keymirror'

const SocketConstants = {
  SOCKET_ERROR: null,
  SOCKET_CONNECT: null,
  SOCKET_DISCONNECT: null,
  SOCKET_ADD_USER_TO_ROOM: null,
  SOCKET_ROOM_READY: null,
  SOCKET_SEND_TEXT_MESSAGE: null,
  SOCKET_RECEIVE_TEXT_MESSAGE: null,
  SOCKET_JOIN_USER_TO_ROOM: null,
}

export default KeyMirror(SocketConstants)
