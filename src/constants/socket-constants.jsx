import KeyMirror from 'keymirror'

const SocketConstants = {
  SOCKET_ERROR: null,
  SOCKET_CONNECT: null,
  SOCKET_DISCONNECT: null,
  SOCKET_ADD_USER_TO_ROOM: null,
}

export default KeyMirror(SocketConstants)
