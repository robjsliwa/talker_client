import React from 'react';
import moment from 'moment';
import SocketActions from '../actions/socket-actions';
import SocketStore from '../stores/socket-store';
import SocketConstants from '../constants/socket-constants';
import UserNameDialog from './username-dialog';

export default class Chat extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      chatBox: "",
      userName: "",
      userID: "",
      roomName: "",
      messages: [],
    }
  }

  componentDidMount() {
    let currentUserName = localStorage.getItem('userName');
    if (currentUserName === null || SocketStore.isRoomReady === false) {
      //SocketStore.addSocketListener(SocketConstants.SOCKET_CONNECT, this._onSocketOpen.bind(this));
    } else {
      this._onRoomReady()
    }
    SocketStore.addSocketListener(SocketConstants.SOCKET_CONNECT, this._onSocketOpen.bind(this));
    SocketStore.addSocketListener(SocketConstants.SOCKET_DISCONNECT, this._onSocketDisconnet.bind(this));
  }

  componentWillUnmount() {
    SocketStore.removeSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketStore.removeSocketListener(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, this._onReceivedMessage.bind(this));
    SocketStore.removeSocketListener(SocketConstants.SOCKET_CONNECT, this._onSocketOpen.bind(this));
    SocketStore.removeSocketListener(SocketConstants.SOCKET_DISCONNECT, this._onSocketDisconnet.bind(this));
  }

  _onSocketOpen() {
    let currentUserName = localStorage.getItem('userName');
    let currentUserID = localStorage.getItem('userID');

    console.log('currentUserName: ' + currentUserName + ' currentUserID: ' + currentUserID);

    if (currentUserName === null || currentUserID === null) {
      // Display modal dialog to ask for user name

      // TEST TEST TEST
      currentUserName = 'Slinky';
    }

    SocketStore.addSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketActions.joinUserToRoom(currentUserName, currentUserID, this.props.params.roomname);
  }

  _onSocketDisconnet() {
    console.log('In _onSocketDisconnet');
    SocketStore.removeAllSocketListeners(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE);
    SocketStore.removeAllSocketListeners(SocketConstants.SOCKET_ROOM_READY);
  }

  _onRoomReady() {
    //let currentUserName = localStorage.getItem('userName')
    //let currentUserID = localStorage.getItem('userID')
    this.setState({
      userName: SocketStore.userName,
      userID: SocketStore.userID,
      roomName: this.props.params.roomname,
      messages: [],
    });
    SocketStore.addSocketListener(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, this._onReceivedMessage.bind(this));
  }

  _onReceivedMessage(message) {
    this.state.messages.push({
      from: message.from,
      fromID: message.fromID,
      text: message.text,
      textID: message.textID,
      timestamp: message.timestamp,
    });
    console.log(message);
    this.forceUpdate();
    let element = document.getElementById("message-scroll");
    element.scrollTop = element.scrollHeight;
  }

  _onChatBox(e) {
    this.setState({
      chatBox: e.target.value,
    });
  }

  _onKeyPress(e) {
    if (e.key === 'Enter') {
      this._onSendMessage();
    }
  }

  _onSendMessage(e) {
    SocketActions.sendMessage(this.state.userName, this.state.userID, this.state.roomName, this.state.chatBox)
    this.setState({
      chatBox: "",
    });
  }

  render() {
    return <div className="container-fluid">
      <div className="row">
        <div className="col-xs-6 col-md-4">
          <section className="module">
            <ol id="message-scroll" className="text-conversation">
              {this.state.messages.map((message) => {
                return <li className={this.state.userID === message.fromID ? "self" : "other"} key={message.textID}>
                  <div className="avatar">
                  </div>
                  <div className="messages">
                    <p>{message.text}</p>
                    <time dateTime="2009-11-13T20:00">{message.from} • {moment(message.timestamp).fromNow()}</time>
                  </div>
                </li>
              })}
            </ol>
            <div className="footer">
              <div id="message-selection">
                <div>
                  <div id="room-id-input-div">
                    <input
                      type="text"
                      id="room-id-input"
                      autofocus
                      value={this.state.chatBox}
                      onChange={this._onChatBox.bind(this)}
                      onKeyPress={this._onKeyPress.bind(this)}
                    />
                  </div>
                </div>
                <div id="room-id-input-buttons">
                  <button id="join-button" onClick={this._onSendMessage.bind(this)}>SEND</button>
                </div>
              </div>
            </div>
          </section>
        </div>
        <div id="room-selection" className="col-xs-12 col-md-8">
          <h1>TODO: Video Area</h1>
          <UserNameDialog />
        </div>
      </div>
    </div>
  }
}
