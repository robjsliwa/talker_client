import React from 'react';

export default class RemoteVideo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="box">
        <div className="boxInner">
          {this.props.video ? <video autoPlay="1" id={this.props.video.index} src={this.props.video.src} /> : null}
          {this.props.audio ? <audio autoPlay="1" id={this.props.audio.index} src={this.props.audio.src} /> : null}
        </div>
      </div>
    );
  }
}
