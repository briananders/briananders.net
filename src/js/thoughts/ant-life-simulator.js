const { log } = require('../_modules/log');

const ANT = 'ant';
const ANT_EATER = 'anteater'

const STARTING_ANT_COUNT = 12;
const STARTING_ANT_EATER_COUNT = 3;


function Cell(element) {
  this.x = Number(element.dataset.x);
  this.y = Number(element.dataset.y);
  this.value = undefined;

  this.isEmpty = () => {
    return this.value === '' || this.value === null || this.value === undefined;
  }

  this.render = () => {
    // log(`render cell ${this.x},${this.y}: ${this.value}`);
    element.dataset.value = (this.value) ? this.value.toString() : '';
  }

  this.isAnt = () => this.value === ANT;
  this.isAntEater = () => this.value === ANT_EATER;
}

function Board(element) {

  /*
    Private variables
  */

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
    let antsToPlace = STARTING_ANT_COUNT;

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
    let antEatersToPlace = STARTING_ANT_EATER_COUNT;

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
    log(`${Date.now()}: render board`);

    board.forEach((row) => {
      row.forEach((cell) => {
        cell.render();
      });
    });
  };

  const moveFromTo = ([x, y], [newX, newY], type) => {
    const oldCell = getCell(x, y);
    const newCell = getCell(newX, newY);

    oldCell.value = undefined;
    newCell.value = type;

    oldCell.render();
    newCell.render();

    // log(`[${x}, ${y}], [${newX}, ${newY}]`);
  };

  const moveLeft = (x, y, type) => {
    if (x - 1 >= 0 && getCell(x - 1, y).isEmpty()) {
      // log('moveLeft');
      moveFromTo([x, y], [x - 1, y], type);
    }
  };
  const moveRight = (x, y, type) => {
    if (x + 1 < width - 1 && getCell(x + 1, y).isEmpty()) {
      // log('moveRight');
      moveFromTo([x, y], [x + 1, y], type);
    }
  };
  const moveDown = (x, y, type) => {
    if (y - 1 >= 0 && getCell(x, y - 1).isEmpty()) {
      // log('moveDown');
      moveFromTo([x, y], [x, y - 1], type);
    }
  };
  const moveUp = (x, y, type) => {
    if (y + 1 < height - 1 && getCell(x, y + 1).isEmpty()) {
      // log('moveUp');
      moveFromTo([x, y], [x, y + 1], type);
    }
  };

  const getAnts = () => {
    const ants = [];

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isAnt()) ants.push(cell);
      });
    });

    return ants;
  }

  const getAntEaters = () => {
    const antEaters = [];

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isAntEater()) antEaters.push(cell);
      });
    });

    return antEaters;
  }

  const moveAnts = () => {
    // log('moveAnts');

    const ants = getAnts();
    ants.forEach(ant => {
      const { x, y } = ant;

      switch(Math.floor(Math.random() * 4)) {
        case 0: // left
          moveLeft(x, y, ANT);
          break;
        case 1: // right
          moveRight(x, y, ANT);
          break;
        case 2: // up
          moveUp(x, y, ANT);
          break;
        default: // down
          moveDown(x, y, ANT);
      }
    });

    // check for procreation
  };

  const moveAntEaters = () => {
    // log('moveAntEaters');

    const antEaters = getAntEaters();
    antEaters.forEach(antEater => {
      const { x, y } = antEater;

      switch(Math.floor(Math.random() * 4)) {
        case 0: // left
          moveLeft(x, y, ANT_EATER);
          break;
        case 1: // right
          moveRight(x, y, ANT_EATER);
          break;
        case 2: // up
          moveUp(x, y, ANT_EATER);
          break;
        default: // down
          moveDown(x, y, ANT_EATER);
      }
    });

    // check for procreation
  };

  const getCell = (x, y) => board[x][y];

  const cellIsEmpty = (x, y) => getCell(x, y).isEmpty();

  const setCell = (x, y, value) => {
    getCell(x, y).value = value;
  };

  const move = () => {
    moveAnts();
    moveAntEaters();
    // render();
  };

  /*
    Public Function
  */

  this.move = move;
  this.render = render;

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

  board.render();
  setInterval(board.move, 1000);
}());
