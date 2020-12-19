module.exports = {
  init() {
    const rollElement = document.getElementById('roll');
    // const diceElement = document.getElementById('dice');
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
      ones: false,
      twos: false,
      threes: false,
      fours: false,
      fives: false,
      sixes: false,
      bonus: false,
      threeKind: false,
      fourKind: false,
      smallStraight: false,
      largeStraign: false,
      fullHouse: false,
      wild: false,
      yahtzee: false,
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

    function getDiceTotal() {
      return diceElementArray.reduce((sum = 0, element) => sum + element.value);
    }

    function isThreeOfAKind() {
      //
    }

    function getThreeOfAKindTotal() {
      return (isThreeOfAKind()) ? getDiceTotal() : 0;
    }

    function isFourOfAKind() {
      // only two numbers total
    }

    function getFourOfAKindTotal() {
      return (isFourOfAKind()) ? getDiceTotal() : 0;
    }

    function isFullHouse() {
      // only two numbers total
    }

    function getFullHouseTotal() {
      return (isFullHouse()) ? 25 : 0;
    }

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

    function getKindTotal() {
      return 0;
    }

    function getBonus() {
      return (getKindTotal() > 62) ? 35 : 0;
    }

    function updateRollCounter() {
      rollElement.setAttribute('data-rolls-left', 3 - rollCount);
      if (rollCount >= 3) {
        disable(rollElement);
      } else {
        enable(rollElement);
      }
    }

    function resetRollCount() {
      rollCount = 0;
      updateRollCounter();
    }

    function updateSingleScore(element, lock, scoringFunction) {
      if (lock !== false) {
        element.value = lock;
        element.innerText = lock;
      } else {
        element.value = scoringFunction();
        element.innerText = scoringFunction();
      }
    }

    function updateScoreBoard() {
      updateSingleScore(onesElement, lockedScores.ones, getOnesTotal);
      updateSingleScore(twosElement, lockedScores.twos, getTwosTotal);
      updateSingleScore(threesElement, lockedScores.threes, getThreesTotal);
      updateSingleScore(foursElement, lockedScores.fours, getFoursTotal);
      updateSingleScore(fivesElement, lockedScores.fives, getFivesTotal);
      updateSingleScore(sixesElement, lockedScores.sixes, getSixesTotal);
      updateSingleScore(kindTotalElement, false, getKindTotal);
      updateSingleScore(bonusElement, false, getBonus);
      updateSingleScore(threeKindElement, lockedScores.threeKind, getThreeOfAKindTotal);
      updateSingleScore(fourKindElement, lockedScores.fourKind, getFourOfAKindTotal);
      // updateSingleScore(smallStraightElement
      // updateSingleScore(largeStraightElement
      // updateSingleScore(fullHouseElement
      // updateSingleScore(wildElement
      // updateSingleScore(yahtzeeElement
      // updateSingleScore(totalElement
    }

    function attachEventListeners() {
      rollElement.addEventListener('click', () => {
        if (rollCount < 3) {
          roll();
          rollCount++;
        }
        updateRollCounter();
        updateScoreBoard();
      });
    }

    attachEventListeners();
    resetRollCount();
  },
};
