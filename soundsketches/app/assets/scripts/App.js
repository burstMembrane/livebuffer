//! import styles
import "../styles/styles.css";

import Recorder from "./modules/Recorder";

//  TRANSPORT CONTROLS //
const recordButton = document.querySelector(".record");
const stopButton = document.querySelector(".stop");
const playButton = document.querySelector(".play");

// CONTROLS
const playRateSlider = document.querySelector(".playbackrate");
const loopStartSlider = document.querySelector(".loopstart");
const loopEndSlider = document.querySelector(".loopend");
const timeInput = document.querySelector(".time");
const detuneSlider = document.querySelector(".detune");
const volumeInput = document.querySelector(".volume");

// DISABLE UI BUTTONS -- PLAY & STOP
playButton.classList.add("disabled");
playButton.disabled = true;
stopButton.classList.add("disabled");
stopButton.disabled = true;

// WAVEFORM VIEW
const analyzer = document.querySelector("#analyzer");

// default length of recording in ms

let length = timeInput.value;
// Setup recorder object as global (this would change in production)
let r;

//  BUTTON EVENT LISTENERS
recordButton.addEventListener("click", () => {
  recordButton.classList.add("red");
  r = new Recorder(length);

  //   r && r.recordChunks();
  setTimeout(() => {
    recordButton.classList.remove("red");
    playButton.classList.remove("disabled");
    stopButton.classList.remove("disabled");
    playButton.disabled = false;
    stopButton.disabled = false;
  }, length);
});

playButton.addEventListener("click", () => {
  stopButton.classList.remove("blue");
  recordButton.classList.remove("red");
  r && r.playPreview();
  r.showAnalyzer(analyzer);
  playButton.classList.add("green");
});

stopButton.addEventListener("click", () => {
  r && r.stopPreview();
  playButton.classList.remove("green");
  stopButton.classList.add("blue");
});

// CONTROLS EVENT LISTENERS

timeInput.addEventListener("input", (e) => {
  length = e.target.value;
  timeInput.value = length;
});

volumeInput.addEventListener("input", (e) => {
  document.querySelector("#volumelabel").innerText = `Volume ${e.target.value}`;
  r && r.setVolume(e.target.value);
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
    loopEndSlider.setAttribute("max", r.source.buffer.duration);
    r.setLoopEnd(e.target.value);
    document.querySelector(
      "#loopendlabel"
    ).innerText = `Loop End ${e.target.value}`;
  }
});
loopStartSlider.addEventListener("input", (e) => {
  if (r) {
    loopStartSlider.setAttribute("max", r.source.buffer.duration);
    r.setLoopStart(e.target.value);
    document.querySelector(
      "#loopstartlabel"
    ).innerText = `Loop Start ${e.target.value}`;
  }
});

// ! allow hot reloading of the files in project
if (module.hot) {
  module.hot.accept();
}
