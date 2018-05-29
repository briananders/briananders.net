function init() {
  const nInput = document.getElementById('n');
  const answerTag = document.querySelector('answer');
  const answerArrayTag = document.querySelector('answer-array');
  const arrows = document.querySelectorAll('#up-and-down button');

  function calculate(length, step) {
    let index = 0;
    const star = new Array(length).fill(0);
    while (star[index] !== 1) {
      star[index] = 1;
      index = (index + step) % length; // mod for wrapping
    }
    return !star.includes(0);
  }

  function go() {
    const n = Number(nInput.value);

    if (n > 20000) {
      nInput.value = 20000;
      return;
    }

    const answers = [];
    for (let i = 2; i < n / 2; i++) {
      if (calculate(n, i)) {
        answers.push(i);
      }
    }

    answerTag.innerHTML = `${answers.length} unique star${answers.length === 1 ? '' : 's'}`;
    answerArrayTag.innerHTML = `[${answers.join(', ')}]`;
  }

  function addEventListeners() {
    nInput.addEventListener('change', go);
    arrows.forEach((arrow) => {
      arrow.addEventListener('click', () => {
        nInput.value = Number(nInput.value) + Number(arrow.value);
        if (Number(nInput.value) > 20000) {
          nInput.value = 20000;
        } else if (Number(nInput.value) < 5) {
          nInput.value = 5;
        }
        go();
      });
    });
  }

  addEventListeners();
  go();
}

module.exports = {
  init,
};
