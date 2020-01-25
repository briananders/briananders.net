
function init() {
  const darkMode = require('../_modules/dark-mode');
  const canvas = document.getElementById('canvas');
  const ruleInput = document.getElementById('rule');
  const ruleArrows = document.querySelectorAll('#rule-up-and-down button');
  const playInput = document.getElementById('play');
  const randomStartInput = document.getElementById('random-start');
  const canvasContext = canvas.getContext('2d');

  window.nowPlane;
  window.thenPlane;

  let rule;
  let ruleString;
  let cellWidth;
  let play = true;
  let randomStart = false;
  let stepArray = [];

  const MIN = 0;
  const MAX = 65535;

  const FILL_STYLE = darkMode.isDarkMode ? '#ffffff' : '#212121';
  const WIDTH = 256;
  const FPS = 1000 / 15;

  let date;


  function resetPlane() {
    const returnArray = new Array(WIDTH);
    for (let i = 0; i < WIDTH; i++) {
      returnArray[i] = new Array(WIDTH).fill(0);
    }
    return returnArray;
  }


  function setup10110Array() {
    const CHECK = '10110';
    const returnArray = [];

    for (let i = MIN; i < MAX; i++) {
      const currBinary = i.toString(2);
      if (currBinary.substr(currBinary.length - 5) === CHECK) {
        returnArray.push(i);
      }
    }

    return returnArray;
  }


  function calculate(x, y) {
    // get parent 3 values
    let binary = '';
    [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0]
    ].forEach(([xVal, yVal]) => {
      // add width and mod width to account for array overflow
      binary += window.nowPlane[(x + xVal + WIDTH) % WIDTH][(y + yVal + WIDTH) % WIDTH];
    });

    // convert to decimal
    const ruleIndex = parseInt(binary, 2);

    window.thenPlane[x][y] = Number(ruleString.charAt(ruleIndex));
  }


  function drawPlane() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    window.nowPlane.forEach((row, rIndex) => {
      row.forEach((col, cIndex) => {
        calculate(rIndex, cIndex);

        if (col) {
          canvasContext.fillStyle = FILL_STYLE;
          canvasContext.strokeStyle = FILL_STYLE;
          canvasContext.fillRect(
            cellWidth * rIndex,
            cellWidth * cIndex,
            cellWidth,
            cellWidth
          );
        }
      });
    });
    window.nowPlane = window.thenPlane;
    window.thenPlane = resetPlane();
  }


  function run(checkDate, then) {
    if (checkDate !== date) {
      return;
    }

    if (then + FPS < Date.now() && (play || then === 0)) {
      drawPlane();
      then = Date.now();
    }

    window.requestAnimationFrame(() => {
      run(checkDate, then);
    });
  }


  function reverse(str) {
    let retString = '';
    for (let i = 0; i < str.length; i++) {
      retString = str.charAt(i) + retString;
    }
    return retString;
  }


  function setupFirstPlane() {
    const plane = resetPlane();
    const half = Math.floor(WIDTH / 2);
    if (randomStart) {
      plane.forEach((row, rIndex) => {
        row.forEach((col, cIndex) => {
          plane[rIndex][cIndex] = Math.round(Math.random());
        });
      });
    } else {
      plane[half][half] = 1;
    }
    window.nowPlane = plane;
  }


  function reset() {
    const rect = canvas.getClientRects()[0];
    cellWidth = rect.width / WIDTH;
    canvas.width = rect.width;
    canvas.height = rect.width;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    rule = Number(ruleInput.value);
    ruleString = `000000000000000000000${rule.toString(2)}`; // leading zeros on binary rule
    ruleString = ruleString.substr(ruleString.length - 8); // must be 8 characters long
    ruleString = reverse(ruleString);

    window.thenPlane = resetPlane();
    setupFirstPlane();
    date = Date.now();
    run(date, 0);
  }


  function addEventListeners() {
    ruleInput.addEventListener('change', reset);
    window.addEventListener('resize', reset);
    window.addEventListener('onorientationchange', reset);
    playInput.addEventListener('change', () => {
      play = playInput.checked;
    });
    randomStartInput.addEventListener('change', () => {
      randomStart = randomStartInput.checked;
      reset();
    });
    ruleArrows.forEach((arrow) => {
      arrow.addEventListener('click', () => {
        const iterator = Number(arrow.value);
        let newRule = rule + iterator;

        while (
          !stepArray.includes(newRule) &&
          (newRule > MIN && newRule < MAX)
        ) {
          newRule += iterator;
        }

        ruleInput.value = newRule;
        reset();
      });
    });
  }

  playInput.checked = true;
  reset(); // setup
  addEventListeners();
  stepArray = setup10110Array();
}


module.exports = {
  init,
};
