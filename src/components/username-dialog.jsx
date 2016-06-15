import React from 'react';
import Modal from 'boron/DropModal';

const styles = {
  btn: {
      margin: '1em auto',
      //padding: '1em 2em',
      outline: 'none',
      fontSize: '0.8em',
      fontWeight: '600',
      background: '#4285F4',
      color: '#FFFFFF',
      border: 'none'
  },
  container: {
      padding: '2em',
      textAlign: 'center'
  },
  title: {
    margin: 0,
    color: '#4285F4',
    fontWeight: 400
  }
}

export default class UserNameDialog extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      userName: '',
    }
  }
  showModal() {
    this.refs.modal.show();
  }

  hideModal() {
    this.refs.modal.hide();
  }

  _onUserNameChange(e) {
    this.setState({
      userName: e.target.value,
    });
  }

  render() {
    return <div>
        <button onClick={this.showModal.bind(this)}>Open</button>
        <Modal ref="modal">
          <div style={styles.container}>
            <h2 style={styles.title}>Enter your name</h2>
            <input
              type="username"
              id="room-id-input"
              autofocus
              value={this.state.userName}
              onChange={this._onUserNameChange.bind(this)}
            />
          <button style={styles.btn} onClick={this.hideModal.bind(this)}>Accept</button>
          </div>
        </Modal>
    </div>
  }
}
