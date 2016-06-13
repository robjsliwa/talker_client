import React from 'react';
import SocketActions from '../actions/socket-actions';
import SocketStore from '../stores/socket-store';
import SocketConstants from '../constants/socket-constants';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chatBox: "",
      userName: "",
      roomName: "",
      messages: [],
    }
  }

  componentDidMount() {
    let currentUserName = localStorage.getItem('userName');
    if (currentUserName === null || SocketStore.isRoomReady === false) {
      SocketStore.addSocketListener(SocketConstants.SOCKET_CONNECT, this._onSocketOpen.bind(this));
    } else {
      this._onRoomReady()
    }
  }

  componentWillUnmount() {
    SocketStore.removeSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketStore.removeSocketListener(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, this._onReceivedMessage.bind(this));
  }

  _onSocketOpen() {
    let currentUserName = 'Slinky';
    SocketStore.addSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketActions.joinUserToRoom(currentUserName, this.props.params.roomname)
  }

  _onRoomReady() {
    let currentUserName = localStorage.getItem('userName')
    this.setState({
      userName: currentUserName,
      roomName: this.props.params.roomname,
    });
    SocketStore.addSocketListener(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, this._onReceivedMessage.bind(this));
  }

  _onReceivedMessage(message) {
    this.state.messages.push('(' + message.from + ') ' + message.text);
    this.forceUpdate();
  }

  _onChatBox(e) {
    this.setState({
      chatBox: e.target.value,
    })
  }

  _onSendMessage(e) {
    SocketActions.sendMessage(this.state.userName, this.state.roomName, this.state.chatBox)
    this.setState({
      chatBox: "",
    });
  }

  render() {
    return <div>
      <div id="room-selection" className="">
        <h1>chat</h1>
        <div id="recent-rooms">
          <p>Messages:</p>
        {this.state.messages.map((message) => {
          return <ul id="recent-rooms-list">{message}</ul>
        })}
        </div>
        <p id="instructions">Enter message</p>
        <div>
          <div id="room-id-input-div">
            <input
              type="text"
              id="room-id-input"
              autofocus
              value={this.state.chatBox}
              onChange={this._onChatBox.bind(this)}
            />
          </div>
        </div>
        <div id="room-id-input-buttons">
          <button id="join-button" onClick={this._onSendMessage.bind(this)}>SEND</button>
        </div>
      </div>
    </div>
  }
}
