import React from 'react';

export default class LocalVideo extends React.Component {
  constructor(props) {
    super(props);
    console.log('in constructor of localVideo');
    console.log(this.props);
  }

  render() {
    return (
      <div className="box">
        <div className="boxInner">
          {this.props.video ? <video autoPlay="1" muted="true" id={'localVideo' + this.props.video.index} src={this.props.video.src} /> : null}
          {this.props.audio ? <audio autoPlay="1" muted="true" id={'localAudio' + this.props.audio.index} src={this.props.audio.src} /> : null}
        </div>
      </div>
    );
  }
}
