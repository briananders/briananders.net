module.exports = {
  init() {
    const canvas = document.getElementById('canvas');
    const canvasContext = canvas.getContext('2d');
    let canDraw = false;
    const mainStroke = document.querySelector('main-stroke');
    const strokeSlider = document.getElementById('stroke-slider');
    const mainColor = document.querySelector('main-color');
    const colorSamples = document.querySelectorAll('color-sample');
    let fill = mainColor.dataset.color;
    let diameter = strokeSlider.value;

    function setCanvasDimensions() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    function drawOn() {
      canDraw = true;
    }

    function drawOff() {
      canDraw = false;
    }

    function drawCanvas() {
      canvasContext.save();

      canvasContext.restore();
    }

    function drawLine(x1, y1, x2, y2) {
      canvasContext.beginPath();
      canvasContext.strokeStyle = fill;
      canvasContext.stroke();
      canvasContext.lineWidth = diameter;
      canvasContext.moveTo(x1, y1);
      canvasContext.lineTo(x2, y2);
      canvasContext.stroke();
    }

    function addCircle(x, y) {
      // position and size
      if (x === undefined) {
        x = 1;
      }
      if (y === undefined) {
        y = 1;
      }

      canvasContext.beginPath();
      canvasContext.arc(x, y, diameter / 2, 0, 2 * Math.PI, false);

      canvasContext.fillStyle = fill;

      canvasContext.fill();

      canvasContext.closePath();
    }


    function draw({
      offsetX,
      movementX,
      offsetY,
      movementY,
    }) {
      if (canDraw) {
        drawLine(offsetX - movementX, offsetY - movementY, offsetX, offsetY);
        addCircle(offsetX, offsetY);
      }
    }


    function erase() {
      setCanvasDimensions();
    }


    function clear() {
      canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    }


    function updateColor() {
      mainColor.dataset.color = fill;
    }


    function updateStroke() {
      mainStroke.dataset.stroke = diameter;
    }


    function addEventListeners() {
      const supportsOrientationChange = 'onorientationchange' in window;
      const orientationEvent = supportsOrientationChange ? 'orientationchange' : 'resize';

      window.addEventListener(orientationEvent, erase, false);

      canvas.addEventListener('mousedown', drawOn, false);
      canvas.addEventListener('mousemove', draw, false);
      document.documentElement.addEventListener('mouseup', drawOff, false);

      colorSamples.forEach((colorSample) => {
        colorSample.addEventListener('click', (evt) => {
          fill = evt.target.dataset.color;
          updateColor();
        });
      });

      strokeSlider.addEventListener('change', (evt) => {
        diameter = evt.target.value;
        updateStroke();
      });
    }


    setCanvasDimensions();
    addEventListeners();
    updateColor();
    updateStroke();
  },
};
