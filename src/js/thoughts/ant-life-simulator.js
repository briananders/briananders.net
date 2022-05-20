const { log } = require('../_modules/log');

function Cell(element) {
  this.x = Number(element.dataset.x);
  this.y = Number(element.dataset.y);
  this.value = undefined;

  this.isEmpty = () => {
    return this.value === '' || this.value === null || this.value === undefined;
  }

  this.render = () => {
    log(`render cell ${this.x},${this.y}: ${this.value}`);
    element.dataset.value = (this.value) ? this.value.toString() : '';
  }
}

function Board(element) {

  /*
    Private variables
  */

  const startingAntCount = 6;
  const startingAntEaterCount = 2;

  const ANT = 'ant';
  const ANT_EATER = 'anteater'

  const size = Number(element.dataset.size);

  const width = size;
  const height = size;
  const board = (() => {
    const returnArray = [];
    for (let i = 0; i < width; i++) {
      returnArray[i] = [];
    }
    return returnArray;
  })();

  /*
    Private functions
  */

  const mapElementsToBoard = () => {
    Array.from(element.children).forEach((childElement) => {
      const x = Number(childElement.dataset.x);
      const y = Number(childElement.dataset.y);

      board[x][y] = new Cell(childElement);
    });
  };

  const initializeAnts = () => {
    let antsToPlace = startingAntCount;

    while (antsToPlace > 0) {
      const randomX = Math.floor(Math.random() * width);
      const randomY = Math.floor(Math.random() * height);

      if (cellIsEmpty(randomX, randomY)) {
        setCell(randomX, randomY, ANT);
        antsToPlace--;
      }
    }
  };

  const initializeAntEaters = () => {
    let antEatersToPlace = startingAntEaterCount;

    while (antEatersToPlace > 0) {
      const randomX = Math.floor(Math.random() * width);
      const randomY = Math.floor(Math.random() * height);

      if (cellIsEmpty(randomX, randomY)) {
        setCell(randomX, randomY, ANT_EATER);
        antEatersToPlace--;
      }
    }
  };

  const render = () => {
    board.forEach((row) => {
      row.forEach((cell) => {
        cell.render();
      });
    });
  };

  const moveAnts = () => {
    log('moveAnts');
  };

  const moveAntEaters = () => {
    log('moveAntEaters');
  };

  const getCell = (x, y) => board[x][y];

  const cellIsEmpty = (x, y) => getCell(x, y).isEmpty();

  const setCell = (x, y, value) => {
    getCell(x, y).value = value;
  };

  /*
    Public variables
  */

  this.move = () => {
    moveAnts();
    moveAntEaters();
    render();
  };

  /*
    Function Calls
  */

  mapElementsToBoard();

  initializeAnts();
  initializeAntEaters();
}

(function init() {
  const boardElement = document.getElementById('board');
  const board = new Board(boardElement);
  board.move();

  // setInterval(board.move, 1000);
}());
