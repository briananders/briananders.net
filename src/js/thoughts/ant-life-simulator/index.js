const { log } = require('../../_modules/log');
const ready = require('../../_modules/document-ready');

const Board = require('./_board');
const ScoreBar = require('./_score-bar');
const ScoreBoard = require('./_score-board');

const {
  BOARD_SIZE,
  DURATION,
  DELAY,
} = require('./_constants');

ready.document(() => {
  const boardElement = document.getElementById('board');
  const board = new Board(boardElement, BOARD_SIZE);

  const antsCountElement = document.getElementById('ants-count');
  const antEatersCountElement = document.getElementById('ant-eaters-count');
  const antsEatenElement = document.getElementById('ants-eaten');
  const antEatersEatenElement = document.getElementById('ant-eaters-eaten');
  const antEatersKilledElement = document.getElementById('ant-eaters-killed');
  const scoreBoard = new ScoreBoard({
    board,
    antsCountElement,
    antEatersCountElement,
    antsEatenElement,
    antEatersEatenElement,
    antEatersKilledElement,
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
