const { log } = require('../_modules/log');
const ready = require('../_modules/document-ready');

const ANT = 'ant';
const ANT_EATER = 'anteater';

const STARTING_ANT_COUNT = 15;
const STARTING_ANT_EATER_COUNT = 15;

const STEPS = 5;
const DURATION = 100;
const DELAY = DURATION / STEPS;

function diceRoll() {
  return Math.ceil(Math.random() * 6);
}

function Cell(element) {
  /*
    Public Variables
  */
  this.x = Number(element.dataset.x);
  this.y = Number(element.dataset.y);
  this.value = undefined;
  this.procreated = false;
  this.toDie = false;

  /*
    Public Computed Properties
  */

  this.isEmpty = () => this.value === '' || this.value === null || this.value === undefined;
  this.isAnt = () => this.value === ANT;
  this.isAntEater = () => this.value === ANT_EATER;

  /*
    Public Functions
  */

  this.render = () => {
    element.dataset.value = (this.value) ? this.value.toString() : '';
    this.procreated = false;
  };
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

  let antsEaten = 0;
  let anteatersEaten = 0;

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
  };

  const moveLeft = (x, y, type) => {
    if (x - 1 >= 0 && getCell(x - 1, y).isEmpty()) {
      moveFromTo([x, y], [x - 1, y], type);
    }
  };
  const moveRight = (x, y, type) => {
    if (x + 1 < width && getCell(x + 1, y).isEmpty()) {
      moveFromTo([x, y], [x + 1, y], type);
    }
  };
  const moveDown = (x, y, type) => {
    if (y - 1 >= 0 && getCell(x, y - 1).isEmpty()) {
      moveFromTo([x, y], [x, y - 1], type);
    }
  };
  const moveUp = (x, y, type) => {
    if (y + 1 < height && getCell(x, y + 1).isEmpty()) {
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
  };

  const getAntEaters = () => {
    const antEaters = [];

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isAntEater()) antEaters.push(cell);
      });
    });

    return antEaters;
  };

  const getSurroundingCells = (x, y) => {
    const returnArray = [];
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if ((x + i >= 0)
            && (x + i < width)
            && (y + j >= 0)
            && (y + j < height)
            && !(i === 0 && j === 0)) {
          returnArray.push(getCell(x + i, y + j));
        }
      }
    }
    return returnArray;
  };

  const multiplyAnts = () => {
    const ants = getAnts();
    ants.forEach((ant) => {
      const { x, y } = ant;
      const surrounds = getSurroundingCells(x, y);
      const surroundAnts = surrounds.filter((cell) => cell.isAnt() && !cell.procreated);
      const surroundEmpty = surrounds.filter((cell) => cell.isEmpty());

      if (surroundAnts.length && surroundEmpty.length && diceRoll() < 5) {
        const randomEmptyIndex = Math.floor(Math.random() * surroundEmpty.length);
        const randomAntIndex = Math.floor(Math.random() * surroundAnts.length);
        surroundEmpty[randomEmptyIndex].value = ANT;

        // mark as procreated.
        ant.procreated = true;
        surroundAnts[randomAntIndex].procreated = true;
        surroundEmpty[randomEmptyIndex].procreated = true;
      }
    });
  };

  const multiplyAntEaters = () => {
    const antEaters = getAntEaters();
    antEaters.forEach((antEater) => {
      const { x, y } = antEater;
      const surrounds = getSurroundingCells(x, y);
      const surroundAntEaters = surrounds.filter((cell) => cell.isAntEater() && !cell.procreated);
      const surroundEmpty = surrounds.filter((cell) => cell.isEmpty());

      if (surroundAntEaters.length && surroundEmpty.length && diceRoll() < 2) {
        const randomEmptyIndex = Math.floor(Math.random() * surroundEmpty.length);
        const randomAntIndex = Math.floor(Math.random() * surroundAntEaters.length);
        surroundEmpty[randomEmptyIndex].value = ANT_EATER;

        // mark as procreated.
        antEater.procreated = true;
        surroundAntEaters[randomAntIndex].procreated = true;
        surroundEmpty[randomEmptyIndex].procreated = true;
      }
    });
  };

  const moveAnts = () => {
    const ants = getAnts();
    ants.forEach((ant) => {
      const { x, y } = ant;

      switch (Math.floor(Math.random() * 4)) {
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
  };

  const eatAnts = () => {
    const antEaters = getAntEaters();
    antEaters.forEach((eater) => {
      const { x, y } = eater;
      const surrounds = getSurroundingCells(x, y);
      const surroundAnts = surrounds.filter((cell) => cell.isAnt());

      surroundAnts.forEach((ant) => { ant.value = undefined; antsEaten++; });

      // if (surroundAnts.length) {
      //   const randomAntIndex = Math.floor(Math.random() * surroundAnts.length);
      //   surroundAnts[randomAntIndex].value = undefined;
      // }
    });
  };

  const killAntEaters = () => {
    const antEaters = getAntEaters();
    antEaters.forEach((eater) => {
      const { x, y } = eater;
      const surrounds = getSurroundingCells(x, y);
      const surroundAnts = surrounds.filter((cell) => cell.isAnt());
      const surroundAntEaters = surrounds.filter((cell) => cell.isAntEater());
      if (surroundAnts.length === surrounds.length) {
        eater.value = undefined;
        anteatersEaten++;
      } else if (surroundAntEaters.length === surrounds.length) {
        eater.toDie = true;
      }
    });
    antEaters.forEach((eater) => {
      if (eater.toDie) {
        eater.value = undefined;
        anteatersEaten++;
        eater.toDie = false;
      }
    })
  };

  const moveAntEaters = () => {
    const antEaters = getAntEaters();
    antEaters.forEach((antEater) => {
      const { x, y } = antEater;

      switch (Math.floor(Math.random() * 4)) {
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
  };

  const getCell = (x, y) => board[x][y];

  const cellIsEmpty = (x, y) => getCell(x, y).isEmpty();

  const setCell = (x, y, value) => {
    getCell(x, y).value = value;
  };

  const getScores = () => ({
    antsCount: getAnts().length,
    anteatersCount: getAntEaters().length,
    antsEaten,
    anteatersEaten,
  });

  const move = () => {
    let index = 0;

    setTimeout(() => {
      // step 0
      moveAnts();
      render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 1
      moveAntEaters();
      render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 2
      killAntEaters();
      render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 3
      eatAnts();
      render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 4
      multiplyAntEaters();
      render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 5
      multiplyAnts();
      render();
    }, DELAY * index);
  };

  /*
    Public Functions
  */

  this.move = move;
  this.render = render;
  this.getScores = getScores;

  /*
    Function Calls
  */

  mapElementsToBoard();

  initializeAnts();
  initializeAntEaters();
}

ready.document(() => {
  const boardElement = document.getElementById('board');
  const antsCountElement = document.getElementById('ants-count');
  const anteatersCountElement = document.getElementById('anteaters-count');
  const antsEatenElement = document.getElementById('ants-eaten');
  const anteatersEatenElement = document.getElementById('anteaters-eaten');
  const board = new Board(boardElement);

  board.render();
  setInterval(board.move, DURATION);
  setInterval(() => {
    const scores = board.getScores();

    antsCountElement.innerText = scores.antsCount;
    anteatersCountElement.innerText = scores.anteatersCount;
    antsEatenElement.innerText = scores.antsEaten;
    anteatersEatenElement.innerText = scores.anteatersEaten;
  }, DELAY);
});
