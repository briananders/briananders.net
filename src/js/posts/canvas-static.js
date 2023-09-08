const ready = require('../_modules/document-ready');

const FILL_STYLE = 'rgba(255,255,255,1)';
const BACKGROUND_STYLE = 'rgba(33,33,33,0.03)';

ready.document(() => {
  const steps = 24; // squares per color spectrum
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');
  let cellWidth;

  function setCanvasDimensions() {
    const rect = canvas.getClientRects()[0];
    cellWidth = rect.width / steps;
    canvas.width = rect.width;
    canvas.height = rect.width;
  }

  function draw(x, y) { // 0-256 for each
    context.fillStyle = FILL_STYLE;
    context.strokeStyle = FILL_STYLE;
    context.fillRect(
      cellWidth * x,
      cellWidth * y,
      cellWidth,
      cellWidth
    );

    context.fillStyle = BACKGROUND_STYLE;
    context.strokeStyle = BACKGROUND_STYLE;
    context.fillRect(
      cellWidth * 0,
      cellWidth * 0,
      cellWidth * steps,
      cellWidth * steps
    );
  }

  function play() {
    const x = Math.floor(Math.random() * steps);
    const y = Math.floor(Math.random() * steps);

    draw(x, y);

    window.requestAnimationFrame(play);
    // setTimeout(play, 500);
  }

  function firstDraw() {
    context.fillStyle = FILL_STYLE;
    context.strokeStyle = FILL_STYLE;
    context.fillRect(
      cellWidth * 0,
      cellWidth * 0,
      cellWidth * steps,
      cellWidth * steps
    );

    context.fillStyle = BACKGROUND_STYLE;
    context.strokeStyle = BACKGROUND_STYLE;
    context.fillRect(
      cellWidth * 0,
      cellWidth * 0,
      cellWidth * steps,
      cellWidth * steps
    );
  }

  setCanvasDimensions();
  firstDraw();
  play();
});
