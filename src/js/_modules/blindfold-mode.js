const Cookies = require('js-cookie');
const queryParameters = require('./queryParameters');

const parameters = queryParameters();

const interactiveElements = [
  'a',
  'button'
].join(',');

const mainElements = [
  '#skip-to-main',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'code',
  'select',
  'label',
  'input',
  'textarea',
  'a',
  'button',
  'li',
  'figcaption',
  'img',
  '[role=img]',
  'video'
].join(',');

let isBlindFoldMode = false;

function getFocus() {
  return (document.activeElement === document.body) ? false : document.activeElement;
}

function cleanFocus() {
  const tabIndexElements = new Array(...document.querySelectorAll('[tabindex="0"]'));
  tabIndexElements.forEach((element) => {
    element.removeAttribute('tabindex');
  });
}

function setFocus(element) {
  cleanFocus();
  element.setAttribute('tabindex', 0);
  element.focus();
}

function isHidden(element) {
  const style = window.getComputedStyle(element);
  return (style.display === 'none');
}

function getElements() {
  const allElements = document.querySelectorAll(mainElements);
  const allElementsArray = new Array(...allElements);
  const filteredElements = allElementsArray.filter(
    (element) => {
      if (element.closest('[aria-hidden="true"]') !== null) return false;
      if (isHidden(element)) return false;
      return element.parentElement.closest(interactiveElements) === null;
    }
  );
  return filteredElements;
}

function goToNextElement() {
  const elements = getElements();

  // find current element
  const currentElement = getFocus();

  if (!currentElement) {
    // if no current element, go to the first element
    setFocus(elements[0]);
  } else if (elements.indexOf(currentElement) >= elements.length - 1) {
    // if no next element, go to the first element
    setFocus(elements[0]);
  } else {
    // otherwise go to the element at index + 1
    setFocus(elements[elements.indexOf(currentElement) + 1]);
  }
}

function goToPreviousElement() {
  const elements = getElements();

  // find current element
  const currentElement = getFocus();

  if (!currentElement) {
    // if no current element, go to the first element
    setFocus(elements[0]);
  } else if (elements.indexOf(currentElement) <= 0) {
    // if no previous element, go to the last element
    setFocus(elements[elements.length - 1]);
  } else {
    // otherwise go to the element at index - 1
    setFocus(elements[elements.indexOf(currentElement) - 1]);
  }
}

function addInstructions() {
  const instructionsDiv = document.createElement('div');
  instructionsDiv.id = 'blindfold-instructions';
  instructionsDiv.classList.add('content');
  instructionsDiv.setAttribute('aria-hidden', 'true');
  instructionsDiv.innerHTML = `
    <h2>Welcome to BLINDFOLD MODE.</h2>
    <p>An experience to emulate what it is like to navigate a website using a screen reader.</p>
    <div>Use your arrow keys to navigate the page content.</div>
    <div>Use your ENTER key trigger buttons and links.</div>
    <div>Use your ESCAPE key to exit blindfold mode.</div>
  `;
  document.body.insertBefore(instructionsDiv, document.body.firstChild);
  window.scrollTo(0, 0);
}

function removeInstructions() {
  const instructions = document.getElementById('blindfold-instructions');
  if (instructions) instructions.remove();
}

function onKeyDown(evt) {
  if (!isBlindFoldMode) return;
  switch (evt.key) {
    case 'ArrowUp':
    case 'ArrowLeft':
      evt.preventDefault();
      goToPreviousElement();
      break;
    case 'ArrowDown':
    case 'ArrowRight':
      evt.preventDefault();
      goToNextElement();
      break;
    case 'Escape':
      isBlindFoldMode = false;
      toggleBlindfoldStyles();
      break;
    default:
  }
}

function addEventListeners() {
  document.addEventListener('keydown', onKeyDown);
}

function removeEventListeners() {
  document.addEventListener('keydown', onKeyDown);
}

function toggleBlindfoldStyles() {
  Cookies.set('blindfold-mode', isBlindFoldMode);
  if (isBlindFoldMode) {
    document.documentElement.classList.add('blindfold-mode');
    addEventListeners();
    addInstructions();
  } else {
    document.documentElement.classList.remove('blindfold-mode');
    removeEventListeners();
    removeInstructions();
  }
}

function blindfoldToggle() {
  const blindfoldButton = document.getElementById('blindfold');
  blindfoldButton.addEventListener('click', () => {
    isBlindFoldMode = !isBlindFoldMode;
    toggleBlindfoldStyles();
  });

  if (parameters['blindfold-mode'] !== undefined) { // check parameter
    isBlindFoldMode = parameters['blindfold-mode'] !== 'false';
  } else if (Cookies.get('blindfold-mode') !== undefined) { // check cookie
    isBlindFoldMode = Cookies.get('blindfold-mode') !== 'false';
  }
  toggleBlindfoldStyles();
}

module.exports = {
  blindfoldToggle,
};
