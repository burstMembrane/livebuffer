class AudioSource {
  constructor(buffer) {}
  playPreview() {
    this.source.isStarted
      ? console.log("source already started")
      : this.source.start(0);
    this.source.isStarted = true;
    this.source.loop = true;
    this.gain = this.audioCtx.createGain();
    this.source.connect(this.gain);
    this.gain.connect(this.audioCtx.destination);
    console.log(this.wavesurfer);
  }

  // TODO: MOVE AUDIO MANIPULATIONS TO OWN CLASS
  setRate(value) {
    this.source.playbackRate.value = value;
  }

  setLoopEnd(value) {
    this.source.loopEnd = value;
    this.wavesurfer.zoom(value);
  }
  setVolume(value) {
    this.gain.gain.linearRampToValueAtTime(value, this.audioCtx.currentTime);
  }

  setLoopStart(value) {
    this.source.loopStart = value;
  }
  setDetune(value) {}

  stopPreview() {
    this.source && this.gain.disconnect(this.audioCtx.destination);
  }
  //  TODO: MOVE ANALYZER TO OWN CLASS
}

export default AudioSource;
