(function init() {

  const dictionary = require('./five-letter-words');

  const boardElement = document.getElementById('board');
  const answersElement = document.getElementById('options');
  const lines = Array.from(boardElement.querySelectorAll('.line'));
  const textInputs = Array.from(boardElement.querySelectorAll('input[type=text'));
  const checkboxes = Array.from(boardElement.querySelectorAll('input[type=radio]'));
  const closeCheckboxes = checkboxes.filter(box => box.id.includes('close'));
  const correctCheckboxes = checkboxes.filter(box => box.id.includes('correct'));
  const wrongCheckboxes = checkboxes.filter(box => box.id.includes('wrong'));
  const submitButtons = Array.from(boardElement.querySelectorAll('button'));

  const isLetter = (value) => /[a-zA-Z]/.test(value);

  let goodLetters = [];
  let badLetters = [];
  let correctLetters = new Array(5);

  function getLetters() {
    debugger;
  }

  function calculate() {
    console.log('calculate');
    // check letter states
    // make correct letters
    // make good letters
    // make bad letters
    // look for conflicts
    // look for letters used twice
    // find matches
  }

  function checkboxUpdated({ srcElement }) {
    if (!srcElement.checked) return;
    const [state, lineNumber, letterNumber] = srcElement.id.split('-');
    const letterInput = document.getElementById(`letter-${lineNumber}-${letterNumber}`);
    letterInput.dataset.state = state;
  }

  function nextInput(srcElement) {
    if (srcElement.value === '') return;
    const [letterWord, lineNumber, letterNumber] = srcElement.id.split('-');

    const nextInput = document.getElementById(`${letterWord}-${lineNumber}-${Number(letterNumber) + 1}`);
    if (nextInput) {
      nextInput.focus();
    }
  }

  function validateTextInput({ srcElement }) {
    const value = srcElement.value;
    if (value === '') return;
    if (value.length > 1) {
      if (isLetter(value[1])) {
        srcElement.value = value[1].toUpperCase();
        nextInput(srcElement);
      } else {
        srcElement.value = value[0].toUpperCase();
      }
    } else if (isLetter(value)) {
      srcElement.value = value.toUpperCase();
      nextInput(srcElement);
    } else {
      srcElement.value = '';
    }
  }

  function initEventListeners() {
    textInputs.forEach(input => {
      input.addEventListener('keyup', validateTextInput);
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
