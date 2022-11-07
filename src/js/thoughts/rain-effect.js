const ready = require('../_modules/document-ready');

const COLOR = (a) => `rgba(255,255,255,${a})`;
const RADIUS = 6;
const PADDING = 2;
const TAIL_LENGTH = 13;
const lanes = [];
let extraPadding = 0;
let maxHeight = 0;

function randomLength() {
  return Math.floor(Math.random() * maxHeight) + 5;
}

function RainDrop({
  LANE,
  canvas,
  context,
}) {
  let index = 0;
  const length = randomLength();
  const radius = RADIUS;
  const lane = LANE;
  const middleOfTheLane = ((((RADIUS * 2) + PADDING) * (lane + 1)) - RADIUS) + (extraPadding / 2);
  const clearX = middleOfTheLane - RADIUS;
  const clearY = 0;

  function clearLane() {
    context.beginPath();
    context.clearRect(clearX, clearY, RADIUS * 2, canvas.height);
    context.closePath();
  }

  function dropY(yIndex) {
    return ((((RADIUS * 2) + PADDING) * yIndex) - RADIUS) + (extraPadding / 2);
  }

  function draw({
    lane,
    index,
  }) {
    clearLane();

    context.beginPath();

    for (let i = 0; i < TAIL_LENGTH; i++) {
      const y = dropY(index - i);
      context.arc(middleOfTheLane, y - i, RADIUS, 0, 2 * Math.PI, false);
      context.fillStyle = COLOR(1 - ((1 / TAIL_LENGTH) * i));
      context.fill();
    }

    context.closePath();
  }

  function animate() {
    index++;
    draw({ lane, index });

    if (index >= length) {
      lanes[lane] = undefined;
      clearLane();
    } else {
      setTimeout(animate, 1000 / 30);
    }
  }

  animate();
}

ready.document(() => {
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  canvas.width = canvas.clientWidth * 2;
  canvas.height = canvas.clientHeight * 2;

  const dropLanes = ((canvas.width - PADDING) / ((RADIUS * 2) + PADDING)) - 1;
  extraPadding = (canvas.width - PADDING) % ((RADIUS * 2) + PADDING);
  maxHeight = ((canvas.height - extraPadding - PADDING) / ((RADIUS * 2) + PADDING)) - 1;

  function loop() {
    const randomLane = Math.floor(Math.random() * dropLanes);
    if (lanes[randomLane] === undefined) {
      lanes[randomLane] = true;
      RainDrop({
        LANE: randomLane,
        canvas,
        context,
      });
    }

    setTimeout(loop, 1000 / 24);
  }

  loop();
});
