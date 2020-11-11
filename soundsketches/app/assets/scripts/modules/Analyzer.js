class Analyzer {
  constructor(canvas, ctx, sourcenode) {
    this.audioCtx = ctx;
    this.sourcenode = sourcenode;
    this.canvas = canvas;
    this.analyzer = this.audioCtx.createAnalyser();
    this.analyzerGain = this.audioCtx.createGain();
    this.sourcenode.connect(this.analyzerGain);
    this.analyzerGain.gain.value = 1.5;
    this.analyzerGain.connect(this.analyzer);
    this.analyzer.fftSize = 512;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }
  render() {
    let { canvas, dataArray, bufferLength } = this;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    function draw(canvas, analyzer) {
      analyzer.getByteTimeDomainData(dataArray);
      canvas.fillStyle = "rgb(255, 255, 255)";
      canvas.fillRect(0, 0, canvas.width, canvas.height);
      canvas.lineWidth = 3;
      canvas.strokeStyle = "rgb(0, 0, 0)";
      canvas.beginPath();
      var sliceWidth = (canvas.width * 1.0) / bufferLength;
      var x = 0;
      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = (v * canvas.height) / 2;
        if (i === 0) {
          canvas.moveTo(x, y);
        } else {
          canvas.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvas.lineTo(width, height / 2);
      canvas.stroke();
      requestAnimationFrame(() => {
        draw(canvas, analyzer);
      });
    }
    draw(canvas, this.analyzer);
  }

  stop() {
    this.analyzerGain.disconnect(this.analyzer);
  }
}

export default Analyzer;
