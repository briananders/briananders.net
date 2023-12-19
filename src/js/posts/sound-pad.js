const ready = require('../_modules/document-ready');
const Sound = require('../_modules/sound');

// up and down is softer to louder. louder is at the bottom
// left and right is hz. left is 95hz right is 1000hz

let time = Date.now();
const sound = new Sound();

ready.document(() => {

  const padComponent = document.querySelector('pad-component');
  const padSelect = document.querySelector('sound-pad select');

  const volumeSpan = document.getElementById('volume');
  const frequencySpan = document.getElementById('frequency');

  let mouseIsDown = false;

  const frequencyRange = [95, 1000];
  const frequency = (x) => {
    return (x * (frequencyRange[1] - frequencyRange[0])) + frequencyRange[0];
  }

  const volumeRange = [0.1, 2];
  const volume = (y) => {
    return (y * (volumeRange[1] - volumeRange[0])) + volumeRange[0];
  }

  function isOnCanvas( mouseX, mouseY, canvasOffsetX, canvasOffsetY, canvasWidth, canvasHeight) {
    let widthOk = false;
    let heightOk = false;

    if (mouseX >= canvasOffsetX && mouseX < canvasOffsetX + canvasWidth) {
      widthOk = true;
    }
    if (mouseY >= canvasOffsetY && mouseY < canvasOffsetY + canvasHeight) {
      heightOk = true;
    }
    return widthOk && heightOk;
  }

  function onMouseUpdate({ pageX, pageY }) { // debugger;
    // console.log({ pageX, pageY });

    const { width, height, top, left } = padComponent.getBoundingClientRect();

    if(isOnCanvas(pageX, pageY, left, top, width, height)) {
      const offsetX = pageX - left;
      const offsetY = pageY - top;

      sound.setFrequency(frequency(offsetX / width));
      frequencySpan.innerHTML = (frequency(offsetX / width));

      sound.setVolume(volume(offsetY / height));
      volumeSpan.innerHTML = (volume(offsetY / height));
    }
  }

  padComponent.addEventListener('mousedown', () => {
    mouseIsDown = true;
    sound.start();
  });
  document.addEventListener('mouseup', () => {
    mouseIsDown = false;
    sound.stop();
  });
  document.addEventListener('mousemove', onMouseUpdate);

  padComponent.addEventListener('mouseenter', () => {
    if (mouseIsDown) {
      console.log('mouseenter and start');
      sound.start();
    } else {
      console.log('mouseenter');
    }
  })

  padComponent.addEventListener('mouseleave', () => {
    console.log('mouseleave and stop');
    sound.stop();
  })

  padSelect.addEventListener('change', () => {
    sound.setType(padSelect.value);
  });
});
