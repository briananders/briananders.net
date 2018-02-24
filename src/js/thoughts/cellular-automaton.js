
function init() {
  console.debug('thoughts/cellular-automaton.js');

  const canvas = document.getElementById('canvas');
  const ruleInput = document.getElementById('rule');
  const playInput = document.getElementById('play');
  const canvasContext = canvas.getContext('2d');

  let rule;
  let world;
  let ruleString;
  let cellWidth;
  let maxHeight;
  let play = false;

  const FILL_STYLE = 'darkgrey';
  const WIDTH = 255;
  const FPS = 1000 / 30;

  let date;
  canvasContext.fillStyle = FILL_STYLE;


  function addRow(y) {
    world[y] = new Array(WIDTH);
    for (let x = 0; x < WIDTH; x++) {
      world[y][x] = calculate(x, y);
    }
  }


  function getRow(y) {
    if (world[y] === undefined) {
      addRow(y);
    }
    return world[y];
  }


  function drawRow(rowNumber, offset) {
    const row = getRow(rowNumber);
    row.forEach((val, index) => {
      if (val) {
        canvasContext.fillRect(
          cellWidth * index,
          cellWidth * (rowNumber - offset),
          cellWidth,
          cellWidth);
      }
    });
  }


  function calculate(x, y) {
    const parentRow = getRow(y - 1);

    // get parent 3 values
    let binary = '';
    [-1, 0, 1].forEach((val) => {
      // add width and mod width to account for array overflow
      binary += parentRow[(x + val + WIDTH) % WIDTH];
    });

    // convert to decimal
    const ruleIndex = parseInt(binary, 2);

    return Number(ruleString.charAt(ruleIndex));
  }


  function drawRange(y1, y2) {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = y1; y < y2; y++) {
      drawRow(y, y1);
    }
  }


  function run(count, checkDate, runDate) {
    let then = runDate || 0;

    if (checkDate !== date) {
      console.log('reset');
      return;
    }

    if (then + FPS < Date.now() && (play || then === 0)) {
      drawRange(++count, count + maxHeight);
      then += FPS;
    }

    window.requestAnimationFrame(() => {
      run(count, checkDate, then);
    });
  }


  function reverse(str) {
    let retString = '';
    for (let i = 0; i < str.length; i++) {
      retString = str.charAt(i) + retString;
    }
    return retString;
  }


  function reset() {
    const rect = canvas.getClientRects()[0];
    cellWidth = window.innerWidth / WIDTH;
    canvas.width = rect.width;
    canvas.height = rect.height;
    maxHeight = rect.height / cellWidth;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    world = [];
    rule = Number(ruleInput.value);
    ruleString = `00000000${rule.toString(2)}`; // leading zeros on binary rule
    ruleString = ruleString.substr(ruleString.length - 8); // must be 8 characters long
    ruleString = reverse(ruleString);
    world.push(new Array(WIDTH).fill(0));
    world[0][Math.floor(WIDTH / 2)] = 1;
    date = Date.now();
    run(-1, date, 0);
  }


  function addEventListeners() {
    ruleInput.addEventListener('change', reset);
    window.addEventListener('resize', reset);
    window.addEventListener('onorientationchange', reset);
    playInput.addEventListener('change', () => {
      play = playInput.checked;
    });
  }

  reset(); // setup
  addEventListeners();
}


module.exports = {
  init,
};
