import React from 'react';
import { withRouter } from 'react-router';
import SocketActions from '../actions/socket-actions';
import SocketStore from '../stores/socket-store';
import SocketConstants from '../constants/socket-constants';

export default withRouter(class RegisterScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userName: '',
      roomName: '',
      isError: false,
    };
  }

  componentDidMount() {
    // TEST TEST TEST
    //localStorage.removeItem('userName');
    //localStorage.removeItem('roomName');
    SocketStore.addSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
  }

  componentWillUnmount() {
    SocketStore.removeSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
  }

  _onRoomReady() {
    if (SocketStore.isRoomReady === true) {
      this.props.router.push('/chat/' + this.state.roomName);
    }
  }

  _onUserName(e) {
    this.setState({
      userName: e.target.value,
      isError: false,
    })
  }

  _onRoomName(e) {
    this.setState({
      roomName: e.target.value,
      isError: false,
    })
  }

  _register() {
    if (!this._validateRegistrationInput()) {
      return
    }
    SocketActions.addUserToRoom(this.state.userName, this.state.roomName);
  }

  _validateRegistrationInput() {
    if (this.state.userName === "" || this.state.roomName === "") {
      this.setState({
        isError: true,
      })

      return false
    }

    return true
  }

  render() {
    return <div>
      <div id="room-selection" className="">
        <h1>talker</h1>
        <p id="instructions">Please enter display name</p>
        <div>
          <div id="room-id-input-div">
            <input
              type="text"
              id="room-id-input"
              autofocus
              value={this.props.userName}
              onChange={this._onUserName.bind(this)}
            />
          </div>
        </div>
        <p id="instructions">Please enter room name</p>
        <div>
          <div id="room-id-input-div">
            <input
              type="text"
              id="room-id-input"
              autofocus
              value={this.props.roomName}
              onChange={this._onRoomName.bind(this)}
            />
          <label className={!this.state.isError ? "error-label hidden" : "error-label"}  id="room-id-input-label">Type in room name or press Random to auto generate random room name.</label>
          </div>
          <div id="room-id-input-buttons">
            <button id="join-button" onClick={this._register.bind(this)}>JOIN</button>
          <button id="random-button">RANDOM</button>
          </div>
        </div>
        <div id="recent-rooms">
          <p>Recently used rooms:</p>
          <ul id="recent-rooms-list"></ul>
        </div>
      </div>

      <div id="confirm-join-div" className="hidden">
        <div>Ready to join<span id="confirm-join-room-span"></span>?</div>
        <button id="confirm-join-button">JOIN</button>
      </div>
    </div>
  }
});
