(function blueGreen() {
  const { floor, max, random } = Math;
  const { log } = console;
  const MAX_COLOR = 255;

  const canvas = document.getElementById('canvas');
  const blueButton = document.getElementById('blue-button');
  const greenButton = document.getElementById('green-button');
  const submitButton = document.getElementById('submit');
  const chartElement = document.getElementById('chart');
  const chartBlue = chartElement.querySelector('.blue');
  const chartGreen = chartElement.querySelector('.green');

  const buttonsElement = document.querySelector('.buttons');
  const revealElement = document.querySelector('.reveal');

  let colorDirection = null;
  let step = 32;

  const colors = {
    red: 0,
    green: floor((MAX_COLOR / 2) + (random() * (MAX_COLOR / 2))),
    blue: floor((MAX_COLOR / 2) + (random() * (MAX_COLOR / 2))),
  };

  function updateColors() {
    canvas.style.backgroundColor = `rgb(${colors.red}, ${colors.green}, ${colors.blue})`;
    log(canvas.style.backgroundColor);

    let blueDiff;
    let greenDiff;

    if (colors.green < colors.blue) {
      blueDiff = colors.blue - colors.green;
      greenDiff = 0;
    } else {
      greenDiff = colors.green - colors.blue;
      blueDiff = 0;
    }
    chartBlue.innerHTML = blueDiff;
    chartBlue.dataset.value = blueDiff;
    chartBlue.style.background = `linear-gradient(to left, blue 0%, blue ${blueDiff / 2}%, transparent ${blueDiff / 2}%)`;
    chartGreen.innerHTML = greenDiff;
    chartGreen.dataset.value = greenDiff;
    chartGreen.style.background = `linear-gradient(to right, green 0%, green ${greenDiff / 2}%, transparent ${greenDiff / 2}%)`;
  }

  function halfStep(currentStep) {
    return max(floor(currentStep / 2), 1);
  }

  function setDirection(color) {
    if (colorDirection === null) {
      colorDirection = color;
    } else if (colorDirection !== color) {
      colorDirection = color;
      step = halfStep(step);
      log(`step size: ${step}`);
    }
  }

  function moreGreen() {
    log('moreGreen()');

    if (colors.green >= MAX_COLOR && colors.blue >= MAX_COLOR) {
      colors.blue -= step;
    } else if (colors.green >= MAX_COLOR) {
      colors.blue -= step;
    } else {
      colors.green += step;
    }

    updateColors();
  }

  function moreBlue() {
    log('moreBlue()');

    if (colors.blue >= MAX_COLOR && colors.green >= MAX_COLOR) {
      colors.green -= step;
    } else if (colors.blue >= MAX_COLOR) {
      colors.green -= step;
    } else {
      colors.blue += step;
    }

    updateColors();
  }

  blueButton.addEventListener('click', () => {
    setDirection('blue');
    moreGreen();
  });

  greenButton.addEventListener('click', () => {
    setDirection('green');
    moreBlue();
  });

  submitButton.addEventListener('click', () => {
    buttonsElement.style.display = 'none';
    revealElement.style.display = null;
  });

  updateColors();
}());
