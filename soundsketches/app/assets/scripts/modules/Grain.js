class Grain {
  constructor(buffer, audioContext, master, trans) {
    this.audioContext = audioContext;
    this.now = this.audioContext.currentTime;
    this.source = this.audioContext.createBufferSource();
    this.source.playbackRate.value = this.source.playbackRate.value * trans;
    this.source.buffer = buffer;
    this.gain = this.audioContext.createGain();
  }
  play() {
    this.gain.gain.value = 1;

    this.source.loop = true;
    this.source.start(0);

    this.source.connect(this.gain);
    this.gain.connect(this.audioContext.destination);
  }
}

export default Grain;

// //the grain class
// function grain(p, buffer, positionx, positiony, attack, release, spread, pan) {
//   var that = this; //for scope issues
//   this.now = context.currentTime; //update the time value
//   //create the source
//   this.source = context.createBufferSource();
//   this.source.playbackRate.value = this.source.playbackRate.value * trans;
//   this.source.buffer = buffer;
//   //create the gain for enveloping
//   this.gain = context.createGain();

//   //experimenting with adding a panner node - not all the grains will be panned for better performance
//   var yes = parseInt(p.random(3), 10);
//   if (yes === 1) {
//     this.panner = context.createPanner();
//     this.panner.panningModel = "equalpower";
//     this.panner.distanceModel = "linear";
//     this.panner.setPosition(p.random(pan * -1, pan), 0, 0);
//     //connections
//     this.source.connect(this.panner);
//     this.panner.connect(this.gain);
//   } else {
//     this.source.connect(this.gain);
//   }

//   this.gain.connect(master);

//   //update the position and calcuate the offset
//   this.positionx = positionx;
//   this.offset = this.positionx * (buffer.duration / w); //pixels to seconds

//   //update and calculate the amplitude
//   this.positiony = positiony;
//   this.amp = this.positiony / h;
//   this.amp = p.map(this.amp, 0.0, 1.0, 1.0, 0.0) * 0.7;

//   //parameters
//   this.attack = attack * 0.4;
//   this.release = release * 1.5;

//   if (this.release < 0) {
//     this.release = 0.1; // 0 - release causes mute for some reason
//   }
//   this.spread = spread;

//   this.randomoffset = Math.random() * this.spread - this.spread / 2; //in seconds
//   ///envelope
//   this.source.start(
//     this.now,
//     this.offset + this.randomoffset,
//     this.attack + this.release
//   ); //parameters (when,offset,duration)
//   this.gain.gain.setValueAtTime(0.0, this.now);
//   this.gain.gain.linearRampToValueAtTime(this.amp, this.now + this.attack);
//   this.gain.gain.linearRampToValueAtTime(
//     0,
//     this.now + (this.attack + this.release)
//   );

//   //garbage collection
//   this.source.stop(this.now + this.attack + this.release + 0.1);
//   var tms = (this.attack + this.release) * 1000; //calculate the time in miliseconds
//   setTimeout(function () {
//     that.gain.disconnect();
//     if (yes === 1) {
//       that.panner.disconnect();
//     }
//   }, tms + 200);

//   //drawing the lines
//   p.stroke(p.random(125) + 125, p.random(250), p.random(250)); //,(this.amp + 0.8) * 255
//   //p.strokeWeight(this.amp * 5);
//   this.randomoffsetinpixels = this.randomoffset / (buffer.duration / w);
//   //p.background();
//   p.line(
//     this.positionx + this.randomoffsetinpixels,
//     0,
//     this.positionx + this.randomoffsetinpixels,
//     p.height
//   );
//   setTimeout(function () {
//     p.background();
//     p.line(
//       that.positionx + that.randomoffsetinpixels,
//       0,
//       that.positionx + that.randomoffsetinpixels,
//       p.height
//     );
//   }, 200);
// }
