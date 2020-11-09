class Recorder {
  constructor(length = 800) {
    this.length = length;
    this.getPermissions();
    //instantiate audiocontext
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  getPermissions() {
    // get permission to record
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        //setup stream
        this.stream = stream;
        this.recordChunks();
      })
      .catch((err) => {
        console.log(err);
      });

    return true;
  }

  recordChunks() {
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start();
    this.audioChunks = [];
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      this.audioChunks.push(event.data);
    });
    setTimeout(() => {
      this.mediaRecorder.stop();
      //   console.log(this.audioChunks);
      console.log("stopped recorder");
    }, this.length);

    this.mediaRecorder.addEventListener("stop", () => {
      this.audioBlob = new Blob(this.audioChunks);
      this.audioUrl = URL.createObjectURL(this.audioBlob);

      this.loadToBuffer();
    });
  }

  playSimple() {
    this.audio = new Audio(this.audioUrl);
    console.log(this.audio);
    this.audio.loop = true;
    this.audio.play();
  }
  clearBuffer() {
    this.source.buffer = [];
  }
  loadToBuffer() {
    this.source && this.clearBuffer();
    // start new file reader
    let fileReader = new FileReader();
    let arrayBuffer;

    // read blob data as audio file and play
    fileReader.onloadend = () => {
      arrayBuffer = fileReader.result;
      this.arrayBuffer = arrayBuffer;

      this.source = this.audioCtx.createBufferSource();

      // TODO change to promise based syntax with await
      this.audioCtx.decodeAudioData(this.arrayBuffer, (buffer) => {
        this.source.buffer = buffer;
        console.log("buffer loaded");
        this.source.isStarted = false;
      });
    };

    // read in response as audio data
    fileReader.readAsArrayBuffer(this.audioBlob);
  }

  playPreview() {
    this.source.isStarted
      ? console.log("source already started")
      : this.source.start(0);
    this.source.isStarted = true;
    this.source.loop = true;
    this.gain = this.audioCtx.createGain();
    this.source.connect(this.gain);
    this.gain.connect(this.audioCtx.destination);
  }

  // TODO: MOVE AUDIO MANIPULATIONS TO OWN CLASS
  setRate(value) {
    this.source.playbackRate.value = value;
  }

  setLoopEnd(value) {
    this.source.loopEnd = value;
  }
  setVolume(value) {
    this.gain.gain.value = value;
  }

  setLoopStart(value) {
    this.source.loopStart = value;
  }
  setDetune(value) {
    this.source.detune.value = value;
  }

  stopPreview() {
    this.source && this.gain.disconnect(this.audioCtx.destination);
    this.gain.disconnect(this.analyzer);
  }
  //  TODO: MOVE ANALYZER TO OWN CLASS
  showAnalyzer(canvas) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    function draw(canvas, analyzer) {
      analyzer.getByteTimeDomainData(dataArray);
      canvas.fillStyle = "rgb(255, 255, 255)";
      canvas.fillRect(0, 0, canvas.width, canvas.height);
      canvas.lineWidth = 2;
      canvas.strokeStyle = "rgb(0, 0, 0)";
      canvas.beginPath();
      var sliceWidth = (canvas.width * 1.0) / bufferLength;
      var x = 0;
      for (var i = 0; i < bufferLength; i++) {
        var v = (dataArray[i] / 128.0) * 2;
        var y = (v * canvas.height) / 2 / 2;
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
    this.analyzer = this.audioCtx.createAnalyser();
    this.gain.connect(this.analyzer);
    this.analyzer.fftSize = 1024;
    console.log(this.source);
    console.log(this.analyzer);
    var bufferLength = this.analyzer.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    draw(canvas, this.analyzer);
  }
}

export default Recorder;
