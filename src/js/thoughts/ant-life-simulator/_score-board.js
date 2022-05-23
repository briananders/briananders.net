class ScoreBoard {
  constructor({
    board,
    antsCountElement,
    antEatersCountElement,
    antsEatenElement,
    antEatersEatenElement,
    antEatersKilledElement,
  }) {
    this.board = board;
    this.antsCountElement = antsCountElement;
    this.antEatersCountElement = antEatersCountElement;
    this.antsEatenElement = antsEatenElement;
    this.antEatersEatenElement = antEatersEatenElement;
    this.antEatersKilledElement = antEatersKilledElement;
  }

  update() {
    const scores = this.board.getScores();

    this.antsCountElement.innerText = scores.antsCount;
    this.antEatersCountElement.innerText = scores.antEatersCount;
    this.antsEatenElement.innerText = scores.antsEaten;
    this.antEatersEatenElement.innerText = scores.antEatersEaten;
    this.antEatersKilledElement.innerText = scores.antEatersKilled;
  }
}

module.exports = ScoreBoard;
