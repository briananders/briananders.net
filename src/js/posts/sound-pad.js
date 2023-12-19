const ready = require('../_modules/document-ready');
const Sound = require('../_modules/sound');

ready.document(() => {
  const sound = new Sound();

  const padComponent = document.querySelector('pad-component');
  const padSelect = document.querySelector('sound-pad select');

  let mouseIsDown = false;

  // setInterval(() => {
  //   if(mouseIsDown) {
  //     debugger;
  //   }
  // }, 5);
  function onMouseUpdate({ offsetX, offsetY }) {
    console.log({ offsetX, offsetY });
  }

  padComponent.addEventListener('mousedown', () => {
    mouseIsDown = true;
    sound.start();
  });
  padComponent.addEventListener('mouseup', () => {
    mouseIsDown = false;
    sound.stop();
  });
  document.addEventListener('mousemove', onMouseUpdate);
  document.addEventListener('mouseenter', onMouseUpdate);
  padSelect.addEventListener('change', () => {
    sound.setType(padSelect.value);
  });
});
