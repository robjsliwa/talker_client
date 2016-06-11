import React from 'react';

export default class RegisterScreen extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userName: '',
      roomName: '',
      isError: false,
    };
  }

  onUserName(e) {
    this.setState({
      userName: e.target.value,
      isError: false,
    })
  }

  onRoomName(e) {
    this.setState({
      roomName: e.target.value,
      isError: false,
    })
  }

  register() {
    console.log(this.state);
    if (!this.validateRegistrationInput()) {
      return
    }
  }

  validateRegistrationInput() {
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
              onChange={this.onUserName.bind(this)}
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
              onChange={this.onRoomName.bind(this)}
            />
          <label className={!this.state.isError ? "error-label hidden" : "error-label"}  id="room-id-input-label">Type in room name or press Random to auto generate random room name.</label>
          </div>
          <div id="room-id-input-buttons">
            <button id="join-button" onClick={this.register.bind(this)}>JOIN</button>
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
}
