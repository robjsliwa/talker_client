import React from 'react';
import Measure from 'react-measure';

export default class Pictionary extends React.Component {
  constructor(props) {
    super(props);

    this.ctx = null;

    this.birdHeight = 40;
    this.birdWidth = 40;

    this.state = {
      dimensions: {},
      blobImage: this.props.image
    }
  }

  componentDidMount() {
    this.refs.pictcanvas.style.width = '100%';
    this.refs.pictcanvas.style.height = '100%';
    this.refs.pictcanvas.width = this.refs.pictcanvas.offsetWidth;
    this.refs.pictcanvas.height = this.refs.pictcanvas.offsetHeight;
    this.ctx = this.refs.pictcanvas.getContext('2d');
  }

  _drawCanvas() {
    const { width, height } = this.state.dimensions;
    //this._drawRect(0, 0, width, height * 2, 'black');
    //this.ctx.drawImage(this.blobImage, 50, 50, this.birdWidth, this.birdHeight);
    this._drawBlob();
  }

  _drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  _drawBlob() {
    console.log('drawBlob - entry');
    let img = new Image();
    img.onload = () => {
      console.log('drawBlob: ' + this.blobImage);
      this.ctx.drawImage(img, 50, 50, this.birdWidth, this.birdHeight);
    }
    img.onerror = (error) => {
      console.log('drawBlob - error: ' + error);
      console.log(error);
    }
    console.log('drawBlob - before img.src');
    img.src = "data:image/png;base64," + this.props.image;
    console.log('drawBlob - after img.src');
  }

  render() {
    const { width, height } = this.state.dimensions;
    console.log("w: " + width + " h: " + height);
    if (this.ctx !== null) {
      console.log('drawCanvas');
      this._drawCanvas();
    }
    return (
      <Measure
        onMeasure={(dimensions) => {
          this.setState({dimensions})
        }}
      >
      <canvas ref="pictcanvas" width={width} height={height * 2} />
      </Measure>
    );
  }
}
