
function init() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const buttons = document.querySelectorAll('button');

  let magnification = 450;
  let panX = 1.5;
  let panY = 1.05;

  // Create Canvas
  canvas.width = 1000;
  canvas.height = 1000;

  let mouseOverCanvas = false;

  function checkIfBelongsToMandelbrotSet(x, y) {
    let realComponentOfResult = x;
    let imaginaryComponentOfResult = y;
    const maxIterations = 100;
    for (let i = 0; i < maxIterations; i++) {
      const tempRealComponent = (
        (realComponentOfResult * realComponentOfResult)
        - (imaginaryComponentOfResult * imaginaryComponentOfResult)
      ) + x;
      const tempImaginaryComponent = (
        (2 * realComponentOfResult)
        * imaginaryComponentOfResult
      ) + y;
      realComponentOfResult = tempRealComponent;
      imaginaryComponentOfResult = tempImaginaryComponent;

      // Return a number as a percentage
      if (realComponentOfResult * imaginaryComponentOfResult > 5) {
        return ((i / maxIterations) * 100);
      }
    }
    return 0; // Return zero if in set
  }

  function draw() {
    console.info({
      magnification,
      panX,
      panY,
    });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const belongsToSet =
          checkIfBelongsToMandelbrotSet(
            (x / magnification) - panX,
            (y / magnification) - panY
          );
        if (belongsToSet) {
          ctx.fillRect(x, y, 1, 1); // Draw a black pixel
        }
      }
    }
  }

  function panChange() {
    return (50 / magnification);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', ({ target }) => {
      switch (target.value) {
        case '+1':
          magnification += 50;
          break;
        case '-1':
          magnification -= 50;
          break;
        case 'up':
          panY -= panChange();
          break;
        case 'down':
          panY += panChange();
          break;
        case 'left':
          panX -= panChange();
          break;
        case 'right':
          panX += panChange();
          break;
        default:
      }
      draw();
    });
  });

  document.addEventListener('keydown', (evt) => {
    switch (evt.keyCode) {
      case 38:
        // up = 38
        evt.preventDefault();
        panY += panChange();
        break;
      case 40:
        // down = 40
        evt.preventDefault();
        panY -= panChange();
        break;
      case 37:
        // left = 37
        evt.preventDefault();
        panX += panChange();
        break;
      case 39:
        // right = 39
        evt.preventDefault();
        panX -= panChange();
        break;
      default:
    }
    draw();
  });

  canvas.addEventListener('mouseover', () => {
    mouseOverCanvas = true;
    document.documentElement.style.overflow = 'hidden';
    console.info({ mouseOverCanvas });
  });

  canvas.addEventListener('mouseout', () => {
    mouseOverCanvas = false;
    document.documentElement.style.overflow = '';
    console.info({ mouseOverCanvas });
  });

  document.addEventListener('scroll', (evt) => {
    console.log(evt.eventPhase);
    if (mouseOverCanvas) {
      evt.preventDefault();
    }
  });

  draw();
}

module.exports = {
  init,
};
