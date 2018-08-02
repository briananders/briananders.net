module.exports = {
  init() {
    const canvas = document.getElementById('canvas');
    const canvasContext = canvas.getContext('2d');
    const steps = 32; // squares per color spectrum
    const squareMax = 256;

    function setCanvasDimensions() {
      canvas.width = steps ** 2;
      canvas.height = steps;
    }

    function draw(r, g, b) { // 0-256 for each
      canvasContext.beginPath();
      canvasContext.rect(
        (((r * (steps ** 1)) + (g * (steps ** 0))) / squareMax) * steps,
        (b / squareMax) * steps,
        1,
        1,
        false
      );
      canvasContext.fillStyle = `rgb(${r},${g},${b})`;
      canvasContext.fill();
      canvasContext.closePath();
    }

    function drawSpectrum(r, g, b) {
      draw(r, g, b);

      b += (squareMax / steps);

      if (b > squareMax) {
        g += (squareMax / steps);
        b = 0;
      }

      if (g > squareMax) {
        r += (squareMax / steps);
        g = 0;
      }

      if (!(r >= squareMax && g >= squareMax && b >= squareMax)) {
        window.setTimeout(() => {
          drawSpectrum(r, g, b);
        }, 0);
      } else {
        console.log(r, g, b);
      }
    }

    function addEventListeners() {
      document.addEventListener('draw', (evt) => {
        draw(...evt.detail);
      });
    }

    setCanvasDimensions();
    addEventListeners();
    // updateBlue();
    drawSpectrum(0, 0, 0);
    console.info({
      steps,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    });
  },
};

