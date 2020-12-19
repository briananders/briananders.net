module.exports = {
  init() {
    const rollElement = document.getElementById('roll');
    const diceElement = document.getElementById('dice');
    const die0Element = document.getElementById('die-0');
    const die1Element = document.getElementById('die-1');
    const die2Element = document.getElementById('die-2');
    const die3Element = document.getElementById('die-3');
    const die4Element = document.getElementById('die-4');
    const scoreBoardElement = document.getElementById('score-board');
    const onesElement = document.getElementById('ones');
    const twosElement = document.getElementById('twos');
    const threesElement = document.getElementById('threes');
    const foursElement = document.getElementById('fours');
    const fivesElement = document.getElementById('fives');
    const sixesElement = document.getElementById('sixes');
    const kindTotalElement = document.getElementById('kind-total');
    const bonusElement = document.getElementById('bonus');
    const threeKindElement = document.getElementById('three-kind');
    const fourKindElement = document.getElementById('four-kind');
    const smallStraightElement = document.getElementById('small-straight');
    const largeStraightElement = document.getElementById('large-straight');
    const fullHouseElement = document.getElementById('full-house');
    const wildElement = document.getElementById('wild');
    const yahtzeeElement = document.getElementById('yahtzee');
    const totalElement = document.getElementById('total');

    let rollCount = 0;

    const lockedScores = {
      ones: 0,
      twos: 0,
      threes: 0,
      fours: 0,
      fives: 0,
      sixes: 0,
      bonus: 0,
      threeKind: 0,
      fourKind: 0,
      smallStraight: 0,
      largeStraign: 0,
      fullHouse: 0,
      wild: 0,
      yahtzee: 0,
    };

    const diceElementArray = [die0Element, die1Element, die2Element, die3Element, die4Element];

    function disable(element) {
      element.setAttribute('disabled', 'disabled');
    }

    function enable(element) {
      element.removeAttribute('disabled');
    }

    function isDisabled(element) {
      return element.hasAttribute('disabled');
    }

    function isEnabled(element) {
      return !isDisabled(element);
    }

    function getRollableDice() {
      return diceElementArray.filter((element) => isEnabled(element));
    }

    function rollADie(dieElement) {
      dieElement.value = Math.floor(Math.random() * 6);
    }

    function roll() {
      const rollableDice = getRollableDice();
      rollableDice.forEach((dieElement) => {
        rollADie(dieElement);
      });
      diceElementArray.forEach((die) => {
        die.innerText = die.value;
      });
    }

    function getGrandTotal() {
      return Object.keys(lockedScores).map((key) => lockedScores[key]).reduce((sum = 0, value) => sum + value);
    }

    function updateScoreBoard() {}

    function isThreeOfAKind() {}

    function isFourOfAKind() {}

    function getOnesTotal() {
      return diceElementArray.filter((element) => element.value === 1).length * 1;
    }

    function getTwosTotal() {
      return diceElementArray.filter((element) => element.value === 2).length * 2;
    }

    function getThreesTotal() {
      return diceElementArray.filter((element) => element.value === 3).length * 3;
    }

    function getFoursTotal() {
      return diceElementArray.filter((element) => element.value === 4).length * 4;
    }

    function getFivesTotal() {
      return diceElementArray.filter((element) => element.value === 5).length * 5;
    }

    function getSixesTotal() {
      return diceElementArray.filter((element) => element.value === 6).length * 6;
    }

    function attachEventListeners() {
      rollElement.addEventListener('click', () => {
        if (rollCount < 2) {
          roll();
          rollCount++;
        }
        if (rollCount >= 2) {
          disable(rollElement);
        }
      });


    }

    attachEventListeners();
  },
};
