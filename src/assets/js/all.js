var fmt = require('simple-fmt')

module.exports = {
  init: function() {
    console.debug("all.js");

    var variation = Math.floor(Math.random() * 7);
    document.body.classList.add(fmt('variation-{0}', variation));
  }
}