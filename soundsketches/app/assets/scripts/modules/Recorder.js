import WaveSurfer from "wavesurfer.js";
import util from "audio-buffer-utils";
import reverbImpulse from "../../sounds/silo.wav";

class Recorder {
  constructor(length = 800, sources = 1) {
    this.length = length;
    this.getPermissions();
    //instantiate audiocontext
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.initWaveform();
    this.numSources = sources;
  }
  reinitialize() {
    this.wavesurfer.destroy();
  }
  initWaveform() {
    this.wavesurfer = WaveSurfer.create({
      normalize: true,
      progressColor: "white",
      cursorColor: "transparent",
      container: "#waveform",
      hideScrollbar: true,
      interact: false,
      width: 600,
      height: 100,
      waveColor: "black",
      audioContext: this.audioCtx,
      scrollParent: true,
      fillParent: true,
    });
  }

  loadWaveform(url) {
    this.wavesurfer.load(url);
  }

  async getPermissions() {
    // get permission to record
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.stream = stream;
      this.stream && this.recordChunks();
    } catch (error) {
      console.log(error);
    }
  }

  async recordChunks() {
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.start();
    this.audioChunks = [];
    this.mediaRecorder.addEventListener("dataavailable", (event) => {
      this.audioChunks.push(event.data);
    });
    this.now = this.audioCtx.currentTime;
    setTimeout(() => {
      this.mediaRecorder.stop();
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
  }
  clearBuffer() {
    this.source.buffer = [];
  }
  readBlobAsArrayBuffer(blob) {
    const temporaryFileReader = new FileReader();
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsArrayBuffer(blob);
    });
  }
  normalizeBuffer(buffer) {
    util.normalize(buffer);
    util.removeStatic(buffer);
  }
  async loadToBuffer() {
    this.source && this.clearBuffer();
    const buf = await this.readBlobAsArrayBuffer(this.audioBlob);
    this.arrayBuffer = buf;
    //  here is where we'd make multiple sources

    const decodedBuffer = await this.audioCtx.decodeAudioData(this.arrayBuffer);
    this.normalizeBuffer(decodedBuffer);
    this.sources = [];
    // make sources
    for (let i = 0; i < this.numSources; i++) {
      this.sources[i] = this.createSource(decodedBuffer);
    }

    this.loadWaveform(this.audioUrl);
  }
  createSource(decodedBuffer) {
    let source = this.audioCtx.createBufferSource();
    source.buffer = decodedBuffer;

    return source;
  }
  playPreview() {
    this.masterBus = this.audioCtx.createGain();
    this.randomStarts = true;
    console.log(this.sources);
    for (const source of this.sources) {
      source.isStarted
        ? console.log("source already started")
        : source.start(
            this.randomStarts ? Math.random() * source.buffer.duration : 0
          );
      source.isStarted = true;
      source.loop = true;
      const gain = this.audioCtx.createGain();
      gain.gain.value = 1 / this.numSources;
      source.gain = gain;
      source.connect(source.gain);
      const pannerOptions = { pan: 0 };
      const panner = new StereoPannerNode(this.audioCtx);
      panner.pan.setValueAtTime(
        Math.random() * 2 - 1,
        this.audioCtx.currentTime
      );
      //  set random detune for swarm/cloud effect
      // source.detune.value = Math.random() * 10 - 5;

      gain.connect(panner).connect(this.masterBus);
    }
    this.masterBus.connect(this.audioCtx.destination);
  }

  // TODO: MOVE AUDIO MANIPULATIONS TO OWN CLASS
  setRate(value) {
    this.sources.forEach((source) => {
      source.playbackRate.value = value;
    });
  }

  setLoopEnd(value) {
    this.sources.forEach((source) => {
      source.loopEnd = value;
    });
  }
  setVolume(value) {
    this.sources.forEach((source) => {
      source.gain.gain.linearRampToValueAtTime(
        value / this.sources.length,
        this.audioCtx.currentTime
      );
    });
  }

  setReverbGain(value) {
    this.reverbGain.gain.value = value;
  }

  async reverb() {
    const getImpulseBuffer = (audioCtx, impulseUrl) => {
      return fetch(impulseUrl)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => audioCtx.decodeAudioData(arrayBuffer));
    };
    this.reverbGain = this.audioCtx.createGain();

    this.convolver = this.audioCtx.createConvolver();
    const buf = util.create(1000);
    this.noiseBuffer = util.noise(buf);

    this.convolver.buffer = await getImpulseBuffer(
      this.audioCtx,
      reverbImpulse
    );

    this.masterBus.connect(this.reverbGain);
    this.reverbGain.connect(this.convolver).connect(this.audioCtx.destination);
  }

  setLoopStart(value) {
    this.sources.forEach((source) => {
      source.loopStart = value;
    });
  }
  setDetune(value) {
    const offset = value / 2;
    this.sources.forEach((source) => {
      source.detune.value = Math.random() * value - offset;
    });
  }

  stopPreview() {
    this.sources && this.masterBus.disconnect(this.audioCtx.destination);
  }
}

export default Recorder;
