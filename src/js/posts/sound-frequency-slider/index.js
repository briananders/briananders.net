const ready = require('../../_modules/document-ready');

ready.document(() => {
  const Slider = require('./slider');
  const sliders = [];

  const scope = document.getElementById('slider-holder');

  function addAnother() {
    sliders.push(new Slider(scope));
  }

  function addEventListeners() {
    scope.querySelector('button[value=add]').addEventListener('click', addAnother.bind(this));
  }

  addEventListeners();
  addAnother();
});
