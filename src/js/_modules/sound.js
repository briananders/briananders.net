module.exports = function Sound(oscillatorType = 'sine') {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  let frequency = 261.6;
  // types: `sine` `square` `triangle` `sawtooth`
  oscillator.type = oscillatorType;
  oscillator.connect(gain);
  gain.gain.value = 0.00001;
  setFrequency(frequency);
  oscillator.start();

  let isPlaying = false;

  function runLoop() {
    if (isPlaying) {
      // console.log(frequency);
      // setFrequency(frequency + 5);
      setTimeout(() => {
        runLoop();
      }, 100);
    }
  }

  function start() {
    if (isPlaying) { return; }
    isPlaying = true;
    runLoop();
    // console.info(gain.gain.value);
    context.resume().then(() => {
      gain.connect(context.destination);
      gain.gain.exponentialRampToValueAtTime(
        1, context.currentTime + 0.04
      );
    });
  }

  function setVolume(newVolume) {
    // console.log(`setVolume(${newVolume})`);
    gain.gain.exponentialRampToValueAtTime(
      newVolume, context.currentTime + 0.04
    );
  }

  function getVolume() {
    return gain.gain.value;
  }

  function stop() {
    // console.info(gain.gain.value);
    gain.gain.exponentialRampToValueAtTime(
      0.00001, context.currentTime + 0.04
    );
    setTimeout(() => {
      try {
        gain.disconnect(context.destination);
      } catch {}
      isPlaying = false;
    }, 200);
  }

  function setFrequency(newFrequency) {
    // console.log(`setFrequency(${newFrequency})`);
    frequency = newFrequency;
    oscillator.frequency.setValueAtTime(frequency, context.currentTime); // value in hertz
  }

  function getFrequency() {
    return oscillator.frequency.value;
  }

  function setType(newType) {
    oscillator.type = newType;
  }

  function getType() {
    return oscillator.type.toString();
  }

  this.isPlaying = () => isPlaying;
  this.start = start;
  this.stop = stop;
  this.setFrequency = setFrequency;
  this.getFrequency = getFrequency;
  this.setType = setType;
  this.getType = getType;
  this.setVolume = setVolume;
  this.getVolume = getVolume;
};
