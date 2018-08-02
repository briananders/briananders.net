module.exports = {
  init() {
    const steps = 64; // squares per color spectrum
    const squareMax = 256;
    const contentElement = document.getElementById('canvas-holder');
    const blueSlider = document.getElementById('blue-slider');
    let canSlide = false;

    blueSlider.setAttribute('step', squareMax / steps);
    blueSlider.setAttribute('max', squareMax);

    function setCanvasDimensions(canvas) {
      canvas.width = steps;
      canvas.height = steps;
    }

    function draw(context, r, g, b) { // 0-256 for each
      context.beginPath();
      context.rect(
        (r / squareMax) * steps,
        (g / squareMax) * steps,
        1,
        1,
        false
      );
      context.fillStyle = `rgb(${r},${g},${b})`;
      context.fill();
      context.closePath();
    }

    function drawSpectrum(context, r, g, b) {
      draw(context, r, g, b);

      g += (squareMax / steps);

      if (g > squareMax) {
        r += (squareMax / steps);
        g = 0;
      }

      if (!(r >= squareMax && g >= squareMax)) {
        drawSpectrum(context, r, g, b);
      } else {
        console.log(`${b} Done`);
      }
    }

    function newCanvas(blue) {
      const canvas = document.createElement('canvas');
      canvas.dataset.blue = blue;
      const canvasContext = canvas.getContext('2d');
      contentElement.appendChild(canvas);

      setCanvasDimensions(canvas);
      drawSpectrum(canvasContext, 0, 0, blue);
    }

    function iterator(blue) {
      console.log(`iterator ${blue}`);
      newCanvas(blue);

      if (blue < squareMax) {
        window.setTimeout(() => {
          iterator(blue + (squareMax / steps));
        }, 10);
      }
    }

    function updateSlider() {
      contentElement.dataset.blue = blueSlider.value;
      if (canSlide) window.requestAnimationFrame(updateSlider);
    }

    blueSlider.addEventListener('mousedown', () => {
      canSlide = true;
      updateSlider();
    });
    blueSlider.addEventListener('mouseup', () => {
      canSlide = false;
    });

    iterator(0);
    contentElement.dataset.blue = 0;
  },
};

