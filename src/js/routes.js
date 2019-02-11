module.exports = {
  '*': require('./all'),
  '/': require('./homepage'),
  404: require('./four-oh-four'),
  experience: {
    '/': require('./experience/index'),
  },
  thoughts: {
    '*': require('./thoughts/all'),
    '/': require('./thoughts/index'),
    '2d-automaton': require('./thoughts/2d-automaton'),
    'cellular-automaton': require('./thoughts/cellular-automaton'),
    'color-canvas': require('./thoughts/color-canvas'),
    'earth-rotating-sprite-animation': require('./thoughts/earth-rotating-sprite-animation'),
    'last-fm': require('./thoughts/last-fm'),
    'minesweeper': require('./thoughts/minesweeper/index'),
    'paint': require('./thoughts/paint'),
    'raining-paint': require('./thoughts/raining-paint'),
    'sound-slider': require('./thoughts/sound-slider'),
    'ten-star-movies': require('./thoughts/ten-star-movies'),
    'unique-stars': require('./thoughts/unique-stars'),
    'using-canvas-to-make-patterns-with-circles': require('./thoughts/using-canvas'),
  },
};
