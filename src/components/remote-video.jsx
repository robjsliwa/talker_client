import React from 'react';

export default class RemoteVideo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
          {this.props.vid ? <video autoPlay="1" id={this.props.vid.index} src={this.props.vid.src} /> : null}
      </div>
    );
  }
}
