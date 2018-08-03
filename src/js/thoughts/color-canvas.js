module.exports = {
  init() {
    const steps = 64; // squares per color spectrum
    const squareMax = 256;
    const contentElement = document.getElementById('canvas-holder');
    const blueSlider = document.getElementById('blue-slider');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    let canSlide = false;
    let blue;
    contentElement.appendChild(canvas);

    blueSlider.setAttribute('step', squareMax / steps);
    blueSlider.setAttribute('max', squareMax);

    function setCanvasDimensions() {
      canvas.width = steps;
      canvas.height = steps;
    }

    function draw(r, g, b) { // 0-256 for each
      context.fillStyle = `rgb(${r},${g},${b})`;
      context.fillRect(
        (r / squareMax) * steps,
        (g / squareMax) * steps,
        1,
        1,
        false
      );
    }

    function drawLoop(r, g, b) {
      draw(r, g, b);

      g += Math.floor(squareMax / steps);

      if (g >= squareMax) {
        r += Math.floor(squareMax / steps);
        g = 0;
      }

      if (r < squareMax) {
        drawLoop(r, g, b);
      }
    }

    function updateSlider() {
      const newBlue = Number(blueSlider.value);
      if (newBlue !== blue) {
        blue = newBlue;
        drawLoop(0, 0, blue);
      }
      if (canSlide) window.requestAnimationFrame(updateSlider);
    }

    function slideOn() {
      canSlide = true;
      updateSlider();
    }

    function slideOff() {
      canSlide = false;
    }

    blueSlider.addEventListener('mousedown', slideOn);
    blueSlider.addEventListener('touchstart', slideOn);
    blueSlider.addEventListener('mouseup', slideOff);
    blueSlider.addEventListener('touchend', slideOff);

    setCanvasDimensions();
    updateSlider();
  },
};

