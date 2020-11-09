class MicCapture {
  constructor() {}

  async requestPermissions() {
    let stream = null;
    const constraints = { audio: true, video: false };
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
      //   console.log(stream);
      this.stream = stream;
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      /* use the stream */
    } catch (err) {
      console.log(err);
      /* handle the error */
    }
  }
  startPreview() {
    this.source = new MediaStreamAudioSourceNode(this.audioCtx, {
      mediaStream: this.stream,
    });

    this.source.connect(this.audioCtx.destination);
  }
  stopPreview() {
    this.source && this.source.disconnect(this.audioCtx.destination);
  }
  startRecording() {
    let chunks = [];
    this.mediaRecorder.start();

    this.mediaRecorder.ondataavailable = function (e) {
      chunks.push(e.data);
    };

    // console.log(this.mediaRecorder);
    // console.log(this.chunks);
    console.log("recorder started");
  }
  stopRecording() {
    this.mediaRecorder.stop();
    console.log(this.mediaRecorder.state);
    console.log("recorder stopped");
  }
  playRecording() {}

  captureSnippet(time) {}
}

export default MicCapture;
