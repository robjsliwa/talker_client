import React from 'react';
import _ from 'underscore';
import { WebRTCEvents } from './webrtc-events';
import WebRTCConstants from '../constants/webrtc-constants';

export default (ComposedComponent) => {
  return class WebRTCBase extends React.Component {
    constructor(props) {
      super(props);

      this.state = {
        xrtcSDK: null,
        userConfig: null,
        isAudioMuted: false,
        isVideoMuted: false,
        localConnectionList: [],
        remoteConnectionList: [],
      }

      this.localTracks = [];
      this.remoteTracks = [];
      this.eventEmitter = new WebRTCEvents();
    }

    _initializeWebRTC(userName, roomName, domain, token) {
      console.log('CHECK: ' + userName);
      let userConfig = {
        jid: userName + domain,
        password: '',
        roomName: roomName + domain,
        domain: domain,
        token: token,
        traceId: "5993E6CC-6D6D-4C9B-BC48-C0B1F29FC234",
        useEventManager: true,
        callType: "videocall",
        loginType: "connect",
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

    _sessionEnd() {
      if (this.state.xrtcSDK) {
        this.state.xrtcSDK.endSession();
      }
    }

    _onWebRTCConnect(response) {
      console.log('createSession callback');
      console.log(response);
    }

    _onLocalAudio() {
      console.log('onLocalAudio');
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_LOCAL_AUDIO);
    }

    _onLocalVideo(sessionId, tracks) {
      console.log('onLocalVideo');
      console.log(sessionId);
      console.log(tracks);

      this.localTracks = tracks;
      let localConnectionList = this.state.localConnectionList;
      let audioConnection = null;
      let videoConnection = null;

      for (let i = 0; i < this.localTracks.length; i++) {
        if (this.localTracks[i].getType() == "video") {
            this.localTracks[i].attach("");
            videoConnection = {
              index: i,
              src: this.localTracks[i].stream.jitsiObjectURL,
            }
        } else {
            this.localTracks[i].attach("");
            audioConnection = {
              index: i,
              src: this.localTracks[i].stream.jitsiObjectURL,
            }
        }
        this.state.xrtcSDK.addTrack(this.localTracks[i]);
      }
      localConnectionList.push({
        video: videoConnection,
        audio: audioConnection,
      });
      this.setState({
        localConnectionList: localConnectionList,
      }, () => {
        this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_LOCAL_VIDEO);
      });
    }

    _onSessionCreated(sessionId, roomName) {
      console.log('onSessionCreated - session created with ' + sessionId + ' and user joined in ' + roomName);
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_SESSION_CREATED);
    }

    _onRemoteParticipantJoined() {
      console.log('onRemoteParticipantJoined');
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_REMOTE_PARTICIPANT_JOINED);
    }

    _onSessionConnected() {
      console.log('onSessionConnected');
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_SESSION_CONNECTED);
    }

    _onRemoteVideo(sessionId, track) {
      console.log('onRemoteVideo ' + sessionId + ' track ' + track);

      let participant = track.getParticipantId();
      if (!this.remoteTracks[participant])
          this.remoteTracks[participant] = [];
      let idx = this.remoteTracks[participant].push(track);
      let baseId = participant.replace(/(-.*$)|(@.*$)/,'');
      let id = baseId + track.getType();

      let remoteConnectionList = this.state.remoteConnectionList;
      let audioConnection = null;
      let videoConnection = null;

      // check if the audio or video component for this base track
      // already exists
      let existingConnection = _.find(remoteConnectionList, (obj) => {
        return obj.baseId === baseId;
      });

      // if it does remove half populated connection and save the audio
      // or video part to be used with the new connection for this baseId
      if (existingConnection) {
        audioConnection = existingConnection.audio;
        videoConnection = existingConnection.video;
        remoteConnectionList = _.without(remoteConnectionList, existingConnection);
      }

      track.attach(id);
      if (track.getType() == "video") {
        console.log('onRemoteVideo video');
        videoConnection = {
          index: id,
          src: track.stream.jitsiObjectURL,
        }
      } else {
        console.log('onRemoteVideo audio');
        audioConnection = {
          index: id,
          src: track.stream.jitsiObjectURL,
        }
      }
      remoteConnectionList.push({
        video: videoConnection,
        audio: audioConnection,
        baseId: baseId,
        track: track,
      });
      this.setState({
        remoteConnectionList: remoteConnectionList,
      }, () => {
        this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_REMOTE_VIDEO);
      });
    }

    _onRemoteParticipantLeft(id) {
      console.log('onRemoteParticipantLeft: ' + id);

      if (!this.remoteTracks[id]) {
        return;
      }

      let tracks = this.remoteTracks[id];
      for (let i = 0; i < tracks.length; i++) {
        let baseId = id.replace(/(-.*$)|(@.*$)/,'');
        //tracks[i].detach(trackId);

        let remoteConnectionList = this.state.remoteConnectionList;
        let existingConnection = _.find(remoteConnectionList, (obj) => {
          return obj.baseId === baseId;
        });

        remoteConnectionList = _.without(remoteConnectionList, existingConnection);
        this.setState({
          remoteConnectionList: remoteConnectionList,
        });
      }

      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_REMOTE_PARTICIPANT_LEFT);
    }

    _onSessionEnded(sessionId) {
      console.log('onSessionEnded: ' + sessionId);
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_SESSION_ENDED);
    }

    _onConnectionError(sessionId) {
      console.log('onConnectionError: ' + sessionId);
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_CONNECTION_ERROR);
    }

    _onNotificationReceived() {
      console.log('onNotificationReceived');
      this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_NOTIFICATION_RECEIVED);
    }

    _onAudioMute() {
      const isMuted = !this.state.isAudioMuted;
      this.setState({
        isAudioMuted: isMuted,
      }, () => {
        this.state.xrtcSDK.audioMuteUnmute(isMuted, (response) => {
          if (!response) {
            console.log("Local audio mute/unmute failed");
            this.setState({
              isAudioMuted: !this.state.isAudioMuted,
            });
          }
        });
        this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_AUDIO_MUTE);
      });
    }

    _onVideoMute() {
      const isMuted = !this.state.isVideoMuted;
      this.setState({
        isVideoMuted: isMuted,
      }, () => {
        this.state.xrtcSDK.videoMuteUnmute(isMuted, (response) => {
          if (!response) {
            this.setState({
              isVideoMuted: !this.state.isVideoMuted,
            });
          }
        });
        this.eventEmitter.emitWebRTCEvent(WebRTCConstants.WEB_RTC_ON_VIDEO_MUTE);
      });
    }

    get localVideos() {
      return this.state.localConnectionList ? this.state.localConnectionList : [];
    }

    get remoteVideos() {
      return this.state.remoteConnectionList ? this.state.remoteConnectionList : [];
    }

    render() {
      return (
        <ComposedComponent
          params={this.props.params}
          initializeWebRTC={this._initializeWebRTC.bind(this)}
          onAudioMute={this._onAudioMute.bind(this)}
          onVideoMute={this._onVideoMute.bind(this)}
          localVideos={this.localVideos}
          remoteVideos={this.remoteVideos}
          endSession={this._sessionEnd.bind(this)}
          addWebRTCListener={this.eventEmitter.addWebRTCListener.bind(this.eventEmitter)}
          removeWebRTCListener={this.eventEmitter.removeWebRTCListener.bind(this.eventEmitter)}
        />
      )
    }
  }
}
