import React from 'react';

export default class LocalVideo extends React.Component {
  constructor(props) {
    super(props);
  }

  /*
  <div className="box">
    <div className="boxInner">
  </div>
</div>
  */

  render() {
    return (
      <div>
          {this.props.vid ? <video autoPlay="1" id={'localVideo' + this.props.vid.index} src={this.props.vid.src} /> : null}
      </div>
    );
  }
}
