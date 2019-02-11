module.exports = function Slider(parent) {
  let scope;
  const Sound = require('../../_modules/sound');
  /*
    tones.numberOfScales
    tones.order
    tones.hertz
    tones.labels
  */
  const tones = require('../../_modules/tones');
  const sound = new Sound();

  const events = {
    removeMeEvent: new Event('remove'),
  };

  const elements = {};

  let hertz = [261.6];

  let mouseDownOnSlider = false;

  function removeMe() {
    sound.stop();
    parent.dispatchEvent(events.removeMeEvent);
    scope.outerHTML = '';
  }

  function watchSlider() {
    hertz.push(elements.slider.value);
    if (mouseDownOnSlider) {
      setTimeout(watchSlider, 100);
    }
  }

  function setupEventListeners() {
    elements.remove.addEventListener('click', removeMe);
    elements.slider.addEventListener('mousedown', () => {
      mouseDownOnSlider = true;
      watchSlider();
    });
    ['mouseup', 'mouseleave', 'mouseout'].forEach((activity) => {
      document.documentElement.addEventListener(activity, () => {
        mouseDownOnSlider = false;
      });
    });
    elements.input.addEventListener('change', () => {
      hertz.push(elements.input.value);
    });
    elements.select.addEventListener('change', () => {
      hertz.push(elements.select.value);
    });
    elements['play-pause'].addEventListener('click', () => {
      if (sound.isPlaying()) {
        elements['play-pause'].value = 'play';
        sound.stop();
      } else {
        elements['play-pause'].value = 'pause';
        sound.start();
      }
    });
  }

  function renderUpdatedValues() {
    const currentFrequency = hertz[0];
    sound.setFrequency(currentFrequency);
    if (elements.input.value !== currentFrequency) {
      elements.input.value = currentFrequency;
    }
    if (elements.slider.value !== currentFrequency) {
      elements.slider.value = currentFrequency;
    }
  }

  function addToneSelect() {
    elements.select = document.createElement('select');
    scope.appendChild(elements.select);

    for (let scale = 0; scale < tones.numberOfScales; scale++) {
      tones.order.forEach((tone) => {
        const option = document.createElement('option');
        option.value = tones.hertz[`${tone}${scale}`];
        option.innerHTML = `${scale} ${tones.labels[tone]}`;
        elements.select.appendChild(option);
      });
    }
  }

  function runLoop() {
    if (hertz.length > 1) {
      hertz = [Number(hertz[hertz.length - 1])];
      renderUpdatedValues();
    }
    setTimeout(runLoop, 100);
  }

  function buildAndRender(callback = () => {}) {
    const doc = new DOMParser().parseFromString(window.soundSlider, 'text/html');
    scope = doc.body.firstChild;
    parent.appendChild(scope);

    addToneSelect();

    elements['play-pause'] = scope.querySelector('button.play-pause');
    elements.slider = scope.querySelector('input.hertz-slider');
    elements.input = scope.querySelector('input.hertz-input');
    elements.remove = scope.querySelector('button[value=remove]');

    return callback();
  }

  function init() {
    buildAndRender(setupEventListeners);
    runLoop();
  }

  init();
};
