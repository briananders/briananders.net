(function earthRotating() {
  const frameContainer = document.getElementById('frame-container');
  const numberOfFrames = 48;
  let number = 0;
  const frameSlider = document.getElementById('frame-slider');
  let canSlide = false;

  // function next() {
  //   number++;

  //   if (number > 48) {
  //     number %= 48;
  //   }

  //   frameContainer.dataset.number = number;
  //   window.setTimeout(next, 1000 / 25);
  // }

  // next();

  function animate() {
    frameContainer.dataset.number = Number(frameSlider.value);

    if (canSlide) window.requestAnimationFrame(animate);
  }

  frameSlider.addEventListener('touchstart', () => {
    canSlide = true;
    animate();
  });

  frameSlider.addEventListener('touchend', () => {
    canSlide = false;
  });

  document.documentElement.addEventListener('mousemove', (event) => {
    number = ((number + event.movementX) + (numberOfFrames * 100)) % numberOfFrames;
    frameContainer.dataset.number = number;
  });
}());
