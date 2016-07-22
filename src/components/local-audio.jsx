import React from 'react';

export default class LocalAudio extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <audio autoPlay='1' muted='true' id={'localAudio' + this.props.audio.index} src={this.props.audio.src} />
    );
  }
}
