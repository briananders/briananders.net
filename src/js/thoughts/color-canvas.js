module.exports = {
  init() {
    const canvas = document.getElementById('canvas');
    const canvasContext = canvas.getContext('2d');
    const blueSlider = document.getElementById('blue-slider');
    const blueValue = document.getElementById('blue-value');
    let squareWidth;
    let squareHeight;
    let b = 0;
    let isSliding = false;

    function decToHex(dec) {
      const numbers = '0123456789abcdef';
      let remainder = dec;
      let hex = '';

      for (let i = 1; i >= 0; i--) {
        const a = remainder / (16 ** i);
        remainder %= 16 ** i;
        hex += numbers.charAt(a);
      }

      return hex;
    }

    function setCanvasDimensions() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      squareWidth = canvas.width / 255;
      squareHeight = canvas.height / 255;
    }

    function draw(r, g) {
      canvasContext.beginPath();
      canvasContext.rect(r * squareWidth, g * squareHeight, squareWidth, squareHeight, false);
      // canvasContext.fillStyle = `#${decToHex(r)}${decToHex(g)}${decToHex(b)}`;
      canvasContext.fillStyle = `rgb(${r},${g},${b})`;
      canvasContext.fill();
      canvasContext.closePath();
    }

    function drawSpectrum() {
      console.log('drawSpectrum');
      for (let r = 0; r < 256; r++) {
        for (let g = 0; g < 256; g++) {
          draw(r, g, b);
        }
      }
    }

    function updateBlue() {
      b = Number(blueSlider.value);
      blueValue.innerHTML = b;
      drawSpectrum();
    }

    function updateSlider() {
      if (isSliding) {
        updateBlue();

        window.requestAnimationFrame(updateSlider, 100);
      }
    }

    function slideOn() {
      isSliding = true;
      updateSlider();
    }

    function slideOff() {
      isSliding = false;
    }

    function addEventListeners() {
      blueSlider.addEventListener('mousedown', slideOn, false);
      blueSlider.addEventListener('mouseup', slideOff, false);
    }

    setCanvasDimensions();
    addEventListeners();
    updateBlue();
    drawSpectrum();
  },
};

