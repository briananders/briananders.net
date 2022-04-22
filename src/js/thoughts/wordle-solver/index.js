const { WorkDocs } = require('aws-sdk');

(function init() {

  const dictionary = require('./five-letter-words');

  const boardElement = document.getElementById('board');
  const answersElement = document.getElementById('options');
  const lines = Array.from(boardElement.querySelectorAll('.line'));
  const textInputs = Array.from(boardElement.querySelectorAll('input[type=text'));
  const checkboxes = Array.from(boardElement.querySelectorAll('input[type=radio]'));
  const submitButtons = Array.from(boardElement.querySelectorAll('button'));

  const isLetter = (value) => /[a-zA-Z]/.test(value);

  function getLetters() {
    let closeLetters = [];
    let wrongLetters = [];
    let correctLetters = new Array(5);
    let cannotBeLetters = [[],[],[],[],[]];

    textInputs.forEach(inputElement => {
      const { state, letterNumber } = inputElement.dataset;
      const letterIndex = Number(letterNumber);
      const { value } = inputElement;
      if (value === '') return;

      if (state === 'wrong') {
        wrongLetters.push(value);
      } else if (state === 'close') {
        closeLetters.push(value);
        cannotBeLetters[letterIndex].push(value);
      } else if (state === 'correct') {
        closeLetters.push(value);
        if (correctLetters[letterIndex]) {
          alert(`It looks like you have two letters marked for the same position: ${value} and ${correctLetters[letterIndex]}`);
        }
        correctLetters[letterIndex] = value;
      }
    });

    return {
      closeLetters,
      wrongLetters,
      correctLetters,
      cannotBeLetters,
    };
  }

  function Matcher({
    closeLetters,
    wrongLetters,
    correctLetters,
    cannotBeLetters,
  }) {
    function any(word, letters) {
      for(let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        if (word.includes(letter)) return true;
      }
      return false;
    }

    function all(word, letters) {
      for(let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        if (!word.includes(letter)) return false;
      }
      return true;
    }

    function correctLettersMatch(word, letters) {
      for(let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        if (letter !== undefined && word[i] !== letter) return false;
      }
      return true;
    }

    // confirms that the close letters do not appear in the same positions
    function cannotBeLettersMatch(word, letters2DArray) { // letters is a 2D array
      for(let i = 0; i < letters2DArray.length; i++) {
        const letters = letters2DArray[i];
        for (let j = 0; j < letters.length; j++) {
          const letter = letters[j];
          if (word[i] === letter) return false;
        }
      }
      return true;
    }

    this.matches = (word) => {
      if (!correctLettersMatch(word, correctLetters)) return false;
      if (any(word, wrongLetters)) return false;
      if (!all(word, closeLetters)) return false;
      if (!cannotBeLettersMatch(word, cannotBeLetters)) return false;
      return true;
    };
  }

  function calculate() {
    // check letter states
    const {
      closeLetters,
      wrongLetters,
      correctLetters,
      cannotBeLetters,
    } = getLetters();
    // look for conflicts
    // look for letters used twice
    // find matches

    const potentialMatches = [];

    const matcher = new Matcher({
      closeLetters,
      wrongLetters,
      correctLetters,
      cannotBeLetters,
    });

    dictionary.forEach((word) => {
      const upperCaseWord = word.toUpperCase();
      if (matcher.matches(upperCaseWord)) potentialMatches.push(word);
    });

    console.table({
      closeLetters: closeLetters.toString(),
      wrongLetters: wrongLetters.toString(),
      correctLetters: correctLetters.toString(),
      cannotBeLetters: cannotBeLetters.toString(),
    });

    const wordElements = potentialMatches.map(word => `<span>${word}</span>`);
    answersElement.innerHTML = wordElements.join(' ');
  }

  function checkboxUpdated({ srcElement }) {
    if (!srcElement.checked) return;
    const [state, lineNumber, letterNumber] = srcElement.id.split('-');
    const letterInput = document.getElementById(`letter-${lineNumber}-${letterNumber}`);
    letterInput.dataset.state = state;
  }

  function previousInput(srcElement) {
    const [letterWord, lineNumber, letterNumber] = srcElement.id.split('-');

    const nextInput = document.getElementById(`${letterWord}-${lineNumber}-${Number(letterNumber) - 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  function nextInput(srcElement) {
    const [letterWord, lineNumber, letterNumber] = srcElement.id.split('-');

    const nextInput = document.getElementById(`${letterWord}-${lineNumber}-${Number(letterNumber) + 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  function inputKeydown(evt) {
    const { srcElement, key } = evt;
    const char = key.toUpperCase();

    switch (key) {
      case 'Backspace':
        srcElement.value = '';
      case 'ArrowLeft':
        previousInput(srcElement);
        evt.preventDefault();
        return;
      case 'Tab':
      case 'ArrowRight':
        nextInput(srcElement);
        evt.preventDefault();
        return;
      default:
    }

    if (isLetter(char) && char.length === 1) {
      srcElement.value = char;
      nextInput(srcElement);
      evt.preventDefault();
    } else {
      srcElement.value = '';
    }
  }

  function initEventListeners() {
    textInputs.forEach(input => {
      input.addEventListener('keydown', inputKeydown);
    });
    submitButtons.forEach(button => {
      button.addEventListener('click', calculate);
    });
    checkboxes.forEach(box => {
      box.addEventListener('change', checkboxUpdated)
    })
  }

  initEventListeners();

}());
