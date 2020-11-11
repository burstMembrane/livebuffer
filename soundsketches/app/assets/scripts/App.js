//! import styles
import "../styles/styles.css";
import regeneratorRuntime from "regenerator-runtime";

import Recorder from "./modules/Recorder";
import Analyzer from "./modules/Analyzer";
import Grain from "./modules/Grain";
//  TRANSPORT CONTROLS //
const recordButton = document.querySelector(".record");
const stopButton = document.querySelector(".stop");
const playButton = document.querySelector(".play");

// CONTROLS
const playRateSlider = document.querySelector(".playbackrate");
const loopStartSlider = document.querySelector(".loopstart");
const loopEndSlider = document.querySelector(".loopend");
const timeInput = document.querySelector(".time");
const sourcesInput = document.querySelector(".sources");
const detuneSlider = document.querySelector(".detune");
const volumeInput = document.querySelector(".volume");
const reverbVolume = document.querySelector(".reverbvolume");
// const normalizeButton = document.querySelector(".normalize");
const reverbCheckbox = document.querySelector(".reverb");
// DISABLE UI BUTTONS -- PLAY & STOP
playButton.classList.add("disabled");
playButton.disabled = true;
stopButton.classList.add("disabled");
stopButton.disabled = true;
document
  .querySelectorAll("input[type=range]")
  .forEach((input) => (input.disabled = true));

// WAVEFORM VIEW
const analyzer = document.querySelector("#analyzer");

// default length of recording in ms

let length = timeInput.value;
let numSources = sourcesInput.value;

// Setup class objects as global (this would change in production)
let r;
let a;
let g;

//  BUTTON EVENT LISTENERS
recordButton.addEventListener("click", () => {
  recordButton.classList.add("red");
  // instantiate new Recorder class
  r = new Recorder(length, numSources);

  // if there is a stream, start recording
  r.stream && r.recordChunks();

  //  after specified time, stop recording
  setTimeout(() => {
    recordButton.classList.remove("red");
    playButton.classList.remove("disabled");
    stopButton.classList.remove("disabled");
    playButton.disabled = false;
    stopButton.disabled = false;
    document
      .querySelectorAll("input[type=range]")
      .forEach((input) => (input.disabled = false));
    // g = new Grain(r.arrayBuffer, r.audioCtx, r.audioCtx.destination, 1.0);
  }, length);
});

playButton.addEventListener("click", () => {
  // playing back
  stopButton.classList.remove("blue");
  recordButton.classList.remove("red");

  // play previews
  r && r.playPreview();

  // start Analyzer
  a = new Analyzer(analyzer, r.audioCtx, r.sources[0]);
  a && a.render();
  playButton.classList.add("green");
});

stopButton.addEventListener("click", () => {
  r && r.stopPreview();
  a && a.stop();
  r.wavesurfer && r.wavesurfer.destroy();
  playButton.classList.remove("green");
  stopButton.classList.add("blue");
});

// CONTROLS EVENT LISTENERS

timeInput.addEventListener("input", (e) => {
  length = e.target.value;
  timeInput.value = length;
});

sourcesInput.addEventListener("input", (e) => {
  numSources = e.target.value;
});
volumeInput.addEventListener("input", (e) => {
  document.querySelector("#volumelabel").innerText = `Volume ${e.target.value}`;
  r && r.setVolume(e.target.value);
});
reverbVolume.addEventListener("input", (e) => {
  document.querySelector(
    "#reverbvolumelabel"
  ).innerText = `Reverb Volume ${e.target.value}`;
  console.log(r.reverbGain);
  r.reverbGain.gain.value = e.target.value;
});
playRateSlider.addEventListener("input", (e) => {
  document.querySelector(
    "#playbacklabel"
  ).innerText = `Playback Rate ${e.target.value}`;
  r && r.setRate(e.target.value);
});

detuneSlider.addEventListener("input", (e) => {
  document.querySelector("#detunelabel").innerText = `Detune ${e.target.value}`;
  r && r.setDetune(e.target.value);
});

loopEndSlider.addEventListener("input", (e) => {
  if (r) {
    loopEndSlider.setAttribute("max", r.sources[0].buffer.duration);
    r.setLoopEnd(e.target.value);
    document.querySelector(
      "#loopendlabel"
    ).innerText = `Loop End ${e.target.value}`;
  }
});
loopStartSlider.addEventListener("input", (e) => {
  if (r) {
    loopStartSlider.setAttribute("max", r.sources[0].buffer.duration);
    r.setLoopStart(e.target.value);
    document.querySelector(
      "#loopstartlabel"
    ).innerText = `Loop Start ${e.target.value}`;
  }
});
reverbCheckbox.onclick = () => r && r.reverb(reverbCheckbox.checked);
// normalizeButton.onclick = () => r && r.normalizeBuffer();

// ! allow hot reloading of the files in project
if (module.hot) {
  module.hot.accept();
}
