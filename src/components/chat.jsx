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
      xrtcSDK: null,
      userConfig: null,
      notificationReceived: false,
    }

    this.localTracks = [];
    this.remoteTracks = [];
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

    if (this.state.xrtcSDK != null) {
      //this.state.xrtcSDK.endSession();
    }
  }

  _onSocketOpen() {
    let currentUserName = localStorage.getItem('userName');
    let currentUserID = localStorage.getItem('userID');

    console.log('currentUserName: ' + currentUserName + ' currentUserID: ' + currentUserID);

    if (currentUserName === null || currentUserID === null) {
      // Display modal dialog to ask for user name
      console.log('Asking for user name');
      this.refs.usernamemodal.showModal(this._receiveUserName.bind(this));
      return;
    }

    SocketStore.addSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketActions.joinUserToRoom(currentUserName, currentUserID, this.props.params.roomname);
  }

  _receiveUserName(userName) {
    console.log('Received userName: ' + userName);
    SocketStore.addSocketListener(SocketConstants.SOCKET_ROOM_READY, this._onRoomReady.bind(this));
    SocketActions.joinUserToRoom(userName, '', this.props.params.roomname);
  }

  _onSocketDisconnet() {
    console.log('In _onSocketDisconnet');
    SocketStore.removeAllSocketListeners(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE);
    SocketStore.removeAllSocketListeners(SocketConstants.SOCKET_ROOM_READY);
  }

  _onRoomReady() {
    this.setState({
      userName: SocketStore.userName,
      userID: SocketStore.userID,
      roomName: this.props.params.roomname,
      //messages: [],
    });
    SocketStore.addSocketListener(SocketConstants.SOCKET_RECEIVE_TEXT_MESSAGE, this._onReceivedMessage.bind(this));
    this._initializeWebRTC();
  }

  _onReceivedMessage(message) {
    const fromTag = this.state.userID === message.fromID ? 'self' : 'other';
    console.log('fromTag: ' + fromTag);
    this.state.messages.push({
      from: message.from,
      fromID: message.fromID,
      text: message.text,
      textID: message.textID,
      timestamp: message.timestamp,
      fromTag: fromTag,
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

  _initializeWebRTC() {
    let userConfig = {
      jid: this.state.userName + '@share.comcast.net',
      password: '',
      roomName: this.state.roomName + '@share.comcast.net',
      traceId: "5993E6CC-6D6D-4C9B-BC48-C0B1F29FC234",
      useEventManager: true,
      call_type: "VIDEO_CALL",
    }
    let serverConfig = userConfig;
    console.log("init SDK");
    let xrtcSDK = new window.xrtcSDK(serverConfig);
    this.setState({
      xrtcSDK: xrtcSDK,
      userConfig: userConfig,
    });

    console.log(userConfig);

    xrtcSDK.createReceiver(userConfig.jid);
    xrtcSDK.create(userConfig, (result) => {
      if (result) {
        console.log(result);
      }
      console.log("SDK create complete");
    });
    xrtcSDK.createSession([], userConfig, this._onWebRTCConnect);

    if (xrtcSDK != null) {
      xrtcSDK.onLocalAudio = this._onLocalAudio.bind(this);
      xrtcSDK.onLocalVideo = this._onLocalVideo.bind(this);
      xrtcSDK.onSessionCreated = this._onSessionCreated.bind(this);
      xrtcSDK.onRemoteParticipantJoined = this._onRemoteParticipantJoined.bind(this);
      xrtcSDK.onSessionConnected = this._onSessionConnected.bind(this);
      xrtcSDK.onRemoteVideo = this._onRemoteVideo.bind(this);
      xrtcSDK.onRemoteParticipantLeft = this._onRemoteParticipantLeft.bind(this);
      xrtcSDK.onSessionEnded = this._onSessionEnded.bind(this);
      xrtcSDK.onConnectionError = this._onConnectionError.bind(this);
      xrtcSDK.onNotificationReceived = this._onNotificationReceived.bind(this);
    }
  }

  _onWebRTCConnect(response) {
    console.log('createSession callback');
    console.log(response);
  }

  _onLocalAudio() {
    console.log('onLocalAudio');
  }

  _onLocalVideo(sessionId, tracks) {
    console.log('onLocalVideo');
    console.log(sessionId);
    console.log(tracks);

    this.localTracks = tracks;

    for (let i = 0; i < this.localTracks.length; i++) {
        if (this.localTracks[i].getType() == "video") {
            $("#localvideo").append(
                "<video autoplay='1' id='localVideo" + i + "' />");
            this.localTracks[i].attach($("#localVideo" + i)[0]);
        } else {
            $("#localvideo").append(
                "<audio autoplay='1' muted='true' id='localAudio" + i +
                "' />");
            this.localTracks[i].attach($("#localAudio" + i)[0]);
        }
        this.state.xrtcSDK.addTrack(this.localTracks[i]);
      }
  }

  _onSessionCreated(sessionId, roomName) {
    console.log('onSessionCreated - session created with ' + sessionId + ' and user joined in ' + roomName);
  }

  _onRemoteParticipantJoined() {
    console.log('onRemoteParticipantJoined');
  }

  _onSessionConnected() {
    console.log('onSessionConnected');
  }

  _onRemoteVideo(sessionId, track) {
    console.log('onRemoteVideo ' + sessionId + ' track ' + track);

    var participant = track.getParticipantId();
    if (!this.remoteTracks[participant])
        this.remoteTracks[participant] = [];
    var idx = this.remoteTracks[participant].push(track);
    var id = participant.replace(/(-.*$)|(@.*$)/,'') + track.getType();

    console.log('onRemoteVideo before check');
    if (track.getType() == "video") {
      console.log('in video');
        $("#remotevideo").append(
            "<video autoplay='1' id='" + id +  "' />");
    } else {
      console.log('in video 2');
        $("#remotevideo").append(
            "<audio autoplay='1' id='" + id +  "' />");
    }

    track.attach($("#" + id)[0]);
    //this._updateCssOnRemoteVideo();

    if(Object.keys(remoteTracks).length > 1)
    {
        this._updateCssOnRemoteVideo1(Object.keys(remoteTracks).length);
    }
  }

  _updateCssOnRemoteVideo()
  {
      var localVideo = document.getElementById("localvideo")
      localVideo.style.height="25%";
      localVideo.style.width="25%"
      localVideo.style.position="fixed";
      localVideo.style.marginTop="2%";
      localVideo.style.marginLeft="3%";
      localVideo.style.zIndex="2";

  }

  _updateCssOnRemoteVideo1(length)
  {
      var remoteVideo1 = document.getElementById("remotevideo");
      //remoteVideo1.style.height="50%";
      //remoteVideo1.style.width="50%";
      remoteVideo1.style.height=remoteVideo1.style.height/length;
      remoteVideo1.style.width=remoteVideo1.style.width/length;
      remoteVideo1.style.marginTop="2%";
      remoteVideo1.style.marginLeft="10%";
  }

  _onRemoteParticipantLeft() {
    console.log('onRemoteParticipantLeft');
  }

  _onSessionEnded() {
    console.log('onSessionEnded');
  }

  _onConnectionError() {
    console.log('onConnectionError');
  }

  _onNotificationReceived() {
    console.log('onNotificationReceived');
  }

  _onMicrophoneMute() {

  }

  _onVideoMute() {

  }

  _onStopCall() {

  }

  render() {
    return <div className="container-fluid">
      <div className="row">
        <div className="col-xs-6 col-md-4">
          <section className="module">
            <ol id="message-scroll" className="text-conversation">
              {this.state.messages.map((message) => {
                return <li className={message.fromTag === 'self' ? "self" : "other"} key={message.textID}>
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
        <div className="col-xs-12 col-md-8">
          <div id="room-id-input-buttons">
            <button id="join-button" onClick={this._onMicrophoneMute.bind(this)}><i className="fa fa-microphone fa-2x" aria-hidden="true"></i></button>
            <button id="join-button" onClick={this._onVideoMute.bind(this)}><i className="fa fa-video-camera fa-2x" aria-hidden="true"></i></button>
            <button id="join-button" onClick={this._onStopCall.bind(this)}><i className="fa fa-stop-circle fa-2x" aria-hidden="true"></i></button>
          </div>
          <div id="localvideo"></div>
          <div id="remotevideo"></div>
          <UserNameDialog ref="usernamemodal" />
        </div>
      </div>
    </div>
  }
}
