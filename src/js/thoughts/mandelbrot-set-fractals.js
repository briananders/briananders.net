(function mandelbrot() {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const buttons = document.querySelectorAll('button');

  let magnification = 450;
  let panX = 1.5;
  let panY = 1.05;

  // Create Canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let mouseOverCanvas = false;

  function belongsToMandelbrotSet(x, y) {
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
          belongsToMandelbrotSet(
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

  function panRight() {
    panX -= panChange();
  }
  function panLeft() {
    panX += panChange();
  }
  function panUp() {
    panY += panChange();
  }
  function panDown() {
    panY -= panChange();
  }
  function zoomIn() {
    magnification += magnification;
  }
  function zoomOut() {
    magnification += magnification;
  }

  buttons.forEach((button) => {
    button.addEventListener('click', ({ target }) => {
      switch (target.value) {
        case '+1':
          zoomIn();
          panRight();
          panDown();
          break;
        case '-1':
          zoomOut();
          panLeft();
          panUp();
          break;
        case 'up':
          panUp()
          break;
        case 'down':
          panDown();
          break;
        case 'left':
          panLeft();
          break;
        case 'right':
          panRight();
          break;
        default:
          return;
      }
      draw();
    });
  });

  document.addEventListener('keydown', (evt) => {
    switch (evt.keyCode) {
      case 38: // up
        evt.preventDefault();
        panUp();
        break;
      case 40: // down
        evt.preventDefault();
        panDown();
        break;
      case 37: // left
        evt.preventDefault();
        panLeft();
        break;
      case 39: // right
        evt.preventDefault();
        panRight();
        break;
      default:
        console.log(evt.keyCode);
        return;
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
}());
