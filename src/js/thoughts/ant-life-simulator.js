/* eslint-disable max-classes-per-file */
const { log } = require('../_modules/log');
const ready = require('../_modules/document-ready');

const ANT = 'ant';
const ANT_EATER = 'anteater';

const STARTING_ANT_COUNT = 15;
const STARTING_ANT_EATER_COUNT = 15;

const SIZE = 70;

const STEPS = 5;
const DURATION = 100;
const DELAY = DURATION / STEPS;

function diceRoll() {
  return Math.ceil(Math.random() * 6);
}

class Cell {
  constructor(element) {
    this.element = element;
    /*
      Public Variables
    */
    this.x = Number(element.dataset.x);
    this.y = Number(element.dataset.y);
    this.value = undefined;
    this.procreated = false;
    this.toDie = false;
  }

  /*
    Public Computed Properties
  */

  isEmpty() { return this.value === '' || this.value === null || this.value === undefined; }

  isAnt() { return this.value === ANT; }

  isAntEater() { return this.value === ANT_EATER; }

  /*
    Public Functions
  */

  render() {
    this.element.dataset.value = (this.value) ? this.value.toString() : '';
    this.procreated = false;
  }
}

class Board {
  /*
    Private variables
  */
  #element;
  #board;
  width = 0;
  height = 0;
  antsEaten = 0;
  antEatersEaten = 0;

  constructor(element, size) {
    this.#element = element;
    this.width = size;
    this.height = size;
    this.#element.dataset.size = size;
    this.#element.style.setProperty('--size', size);

    const returnArray = [];
    for (let i = 0; i < size; i++) {
      returnArray[i] = [];

      for (let j = 0; j < size; j++) {
        const cellElement = document.createElement('div');
        cellElement.dataset.x = i;
        cellElement.dataset.y = j;
        element.append(cellElement);

        returnArray[i][j] = new Cell(cellElement);
      }
    }
    this.#board = returnArray;

    /*
      Function Calls
    */

    this.#mapElementsToBoard();

    this.#initializeAnts();
    this.#initializeAntEaters();
  }

  /*
    Private functions
  */

  #mapElementsToBoard() {
    Array.from(this.#element.children).forEach((childElement) => {
      const x = Number(childElement.dataset.x);
      const y = Number(childElement.dataset.y);

      this.#board[x][y] = new Cell(childElement);
    });
  };

  #initializeAnts() {
    let antsToPlace = STARTING_ANT_COUNT;

    while (antsToPlace > 0) {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);

      if (this.#cellIsEmpty(randomX, randomY)) {
        this.#setCell(randomX, randomY, ANT);
        antsToPlace--;
      }
    }
  };

  #initializeAntEaters() {
    let antEatersToPlace = STARTING_ANT_EATER_COUNT;

    while (antEatersToPlace > 0) {
      const randomX = Math.floor(Math.random() * this.width);
      const randomY = Math.floor(Math.random() * this.height);

      if (this.#cellIsEmpty(randomX, randomY)) {
        this.#setCell(randomX, randomY, ANT_EATER);
        antEatersToPlace--;
      }
    }
  };

  render() {
    this.#board.forEach((row) => {
      row.forEach((cell) => {
        cell.render();
      });
    });
  };

  #moveFromTo([x, y], [newX, newY], type) {
    const oldCell = this.#getCell(x, y);
    const newCell = this.#getCell(newX, newY);

    oldCell.value = undefined;
    newCell.value = type;
  };

  #moveLeft(x, y, type) {
    if (x - 1 >= 0 && this.#getCell(x - 1, y).isEmpty()) {
      this.#moveFromTo([x, y], [x - 1, y], type);
    }
  };
  #moveRight(x, y, type) {
    if (x + 1 < this.width && this.#getCell(x + 1, y).isEmpty()) {
      this.#moveFromTo([x, y], [x + 1, y], type);
    }
  };
  #moveDown(x, y, type) {
    if (y - 1 >= 0 && this.#getCell(x, y - 1).isEmpty()) {
      this.#moveFromTo([x, y], [x, y - 1], type);
    }
  };
  #moveUp(x, y, type) {
    if (y + 1 < this.height && this.#getCell(x, y + 1).isEmpty()) {
      this.#moveFromTo([x, y], [x, y + 1], type);
    }
  };

  getAnts() {
    const ants = [];

    this.#board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isAnt()) ants.push(cell);
      });
    });

    return ants;
  };

  getAntEaters() {
    const antEaters = [];

    this.#board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isAntEater()) antEaters.push(cell);
      });
    });

    return antEaters;
  };

  #getSurroundingCells(x, y) {
    const returnArray = [];
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if ((x + i >= 0)
            && (x + i < this.width)
            && (y + j >= 0)
            && (y + j < this.height)
            && !(i === 0 && j === 0)) {
          returnArray.push(this.#getCell(x + i, y + j));
        }
      }
    }
    return returnArray;
  };

  #multiplyAnts() {
    const ants = this.getAnts();
    ants.forEach((ant) => {
      const { x, y } = ant;
      const surrounds = this.#getSurroundingCells(x, y);
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

  #multiplyAntEaters() {
    const antEaters = this.getAntEaters();
    antEaters.forEach((antEater) => {
      const { x, y } = antEater;
      const surrounds = this.#getSurroundingCells(x, y);
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

  #moveAnts() {
    const ants = this.getAnts();
    ants.forEach((ant) => {
      const { x, y } = ant;

      switch (Math.floor(Math.random() * 4)) {
        case 0: // left
          this.#moveLeft(x, y, ANT);
          break;
        case 1: // right
          this.#moveRight(x, y, ANT);
          break;
        case 2: // up
          this.#moveUp(x, y, ANT);
          break;
        default: // down
          this.#moveDown(x, y, ANT);
      }
    });
  };

  #eatAnts() {
    const antEaters = this.getAntEaters();
    antEaters.forEach((eater) => {
      const { x, y } = eater;
      const surrounds = this.#getSurroundingCells(x, y);
      const surroundAnts = surrounds.filter((cell) => cell.isAnt());

      surroundAnts.forEach((ant) => { ant.value = undefined; this.antsEaten++; });
    });
  };

  #killAntEaters() {
    const antEaters = this.getAntEaters();
    antEaters.forEach((eater) => {
      const { x, y } = eater;
      const surrounds = this.#getSurroundingCells(x, y);
      const surroundAnts = surrounds.filter((cell) => cell.isAnt());
      const surroundAntEaters = surrounds.filter((cell) => cell.isAntEater());
      if (surroundAnts.length === surrounds.length) {
        eater.value = undefined;
        this.antEatersEaten++;
      } else if (surroundAntEaters.length === surrounds.length) {
        eater.toDie = true;
      }
    });
    antEaters.forEach((eater) => {
      if (eater.toDie) {
        eater.value = undefined;
        this.antEatersEaten++;
        eater.toDie = false;
      }
    });
  };

  #moveAntEaters() {
    const antEaters = this.getAntEaters();
    antEaters.forEach((antEater) => {
      const { x, y } = antEater;

      switch (Math.floor(Math.random() * 4)) {
        case 0: // left
          this.#moveLeft(x, y, ANT_EATER);
          break;
        case 1: // right
          this.#moveRight(x, y, ANT_EATER);
          break;
        case 2: // up
          this.#moveUp(x, y, ANT_EATER);
          break;
        default: // down
          this.#moveDown(x, y, ANT_EATER);
      }
    });
  };

  #getCell(x, y) { return this.#board[Number(x)][Number(y)]; }

  #cellIsEmpty(x, y) { return this.#getCell(Number(x), Number(y)).isEmpty(); }

  #setCell(x, y, value) {
    this.#getCell(Number(x), Number(y)).value = value;
  };

  getScores() { return {
    antsCount: this.getAnts().length,
    antEatersCount: this.getAntEaters().length,
    antsEaten: this.antsEaten,
    antEatersEaten: this.antEatersEaten,
  };
}

  move() {
    let index = 0;

    setTimeout(() => {
      // step 0
      this.#moveAnts();
      this.render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 1
      this.#moveAntEaters();
      this.render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 2
      this.#killAntEaters();
      this.render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 3
      this.#eatAnts();
      this.render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 4
      this.#multiplyAntEaters();
      this.render();
    }, DELAY * index);

    index++;

    setTimeout(() => {
      // step 5
      this.#multiplyAnts();
      this.render();
    }, DELAY * index);
  };

}

class ScoreBoard {
  constructor({
    board,
    antsCountElement,
    antEatersCountElement,
    antsEatenElement,
    antEatersEatenElement,
  }) {
    this.board = board;
    this.antsCountElement = antsCountElement;
    this.antEatersCountElement = antEatersCountElement;
    this.antsEatenElement = antsEatenElement;
    this.antEatersEatenElement = antEatersEatenElement;
  }

  update() {
    const scores = this.board.getScores();

    this.antsCountElement.innerText = scores.antsCount;
    this.antEatersCountElement.innerText = scores.antEatersCount;
    this.antsEatenElement.innerText = scores.antsEaten;
    this.antEatersEatenElement.innerText = scores.antEatersEaten;
  }
}

class ScoreBar {
  constructor({
    board,
    antsBarElement,
    antEatersBarElement,
  }) {
    this.board = board;
    this.antsBarElement = antsBarElement;
    this.antEatersBarElement = antEatersBarElement;
  }

  update() {
    const scores = this.board.getScores();
    const total = this.board.width * this.board.height;
    this.antsBarElement.style.width = `${(scores.antsCount / total) * 100}%`;
    this.antEatersBarElement.style.width = `${(scores.antEatersCount / total) * 100}%`;
  }
}

ready.document(() => {
  const boardElement = document.getElementById('board');
  const board = new Board(boardElement, SIZE);

  const antsCountElement = document.getElementById('ants-count');
  const antEatersCountElement = document.getElementById('anteaters-count');
  const antsEatenElement = document.getElementById('ants-eaten');
  const antEatersEatenElement = document.getElementById('anteaters-eaten');
  const scoreBoard = new ScoreBoard({
    board,
    antsCountElement,
    antEatersCountElement,
    antsEatenElement,
    antEatersEatenElement,
  });

  const antsBarElement = document.getElementById('ants-bar');
  const antEatersBarElement = document.getElementById('ant-eaters-bar');
  const scoreBar = new ScoreBar({
    board,
    antsBarElement,
    antEatersBarElement,
  });

  board.render();
  setInterval(() => { board.move(); }, DURATION);
  setInterval(() => { scoreBoard.update(); }, DELAY);
  setInterval(() => { scoreBar.update(); }, DELAY);
});
