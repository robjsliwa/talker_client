import React from 'react';

export default class RemoteAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.audio ? <audio autoPlay='1' id={this.props.audio.index} src={this.props.audio.src} /> : null }
      </div>
    );
  }
}
