import React from 'react';
import Measure from 'react-measure';

export default class Pictionary extends React.Component {
  constructor(props) {
    super(props);

    this.ctx = null;

    this.birdImage = null;
    this.birdAssets = ['img/Bird_Red_1.png',
                  'img/Bird_Red_2.png',
                  'img/Bird_Red_3.png',
                  'img/Bird_Red_4.png',
                  'img/Bird_Red_5.png',
                  'img/Bird_Red_6.png',
                  'img/Bird_Red_7.png',
                  'img/Bird_Red_8.png',
                  'img/Bird_Red_9.png',
                  'img/Bird_Red_10.png',
                  'img/Bird_Red_11.png',
                  'img/Bird_Red_12.png',
                  'img/Bird_Red_13.png',
                  'img/Bird_Red_14.png',
                  'img/Bird_Red_15.png',
                  'img/Bird_Red_16.png',
                  'img/Bird_Red_17.png',
                  'img/Bird_Red_18.png'
                 ];
    this.frames = [];
    this.currentFrame = 0;
    this.birdHeight = 40;
    this.birdWidth = 40;
    this.framesPerSecond = 30;

    this.state = {
      dimensions: {}
    }
  }

  componentDidMount() {
    for (let index = 0; index < this.birdAssets.length; index++) {
      let birdImage = new Image();
      birdImage.onload = this._onImageLoad.bind(this);
      birdImage.src = this.birdAssets[index];
      this.frames.push(birdImage);
    }
    this.refs.pictcanvas.style.width = '100%';
    this.refs.pictcanvas.style.height = '100%';
    this.refs.pictcanvas.width = this.refs.pictcanvas.offsetWidth;
    this.refs.pictcanvas.height = this.refs.pictcanvas.offsetHeight;
    this.ctx = this.refs.pictcanvas.getContext('2d');
    setInterval(() => {
      this._updateCanvas();
      this._drawCanvas();
    }, 1000 / this.framesPerSecond);
  }

  _onImageLoad() {
    console.log('Loading image...');
  }

  _updateCanvas() {

  }

  _drawCanvas() {
    const { width, height } = this.state.dimensions;
    this._drawRect(0, 0, width, height * 2, 'black');
    this.ctx.drawImage(this.frames[this.currentFrame], 50, 50, this.birdWidth, this.birdHeight);
    this.currentFrame = (this.currentFrame + 1) % this.frames.length;
  }

  _drawRect(x, y, w, h, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  render() {
    const { width, height } = this.state.dimensions;
    console.log("w: " + width + " h: " + height);
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
