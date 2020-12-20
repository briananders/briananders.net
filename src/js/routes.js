module.exports = {
  '*': require('./all'),
  '/': require('./homepage'),
  thoughts: {
    '2d-automaton': require('./thoughts/2d-automaton'),
    'cellular-automaton': require('./thoughts/cellular-automaton'),
    'lissajous-curve': require('./thoughts/lissajous-curve'),
    'last-fm': require('./thoughts/last-fm'),
    minesweeper: require('./thoughts/minesweeper/index'),
    paint: require('./thoughts/paint'),
    yahtzee: require('./thoughts/yahtzee'),
    'earth-rotating-sprite-animation': require('./thoughts/earth-rotating-sprite-animation'),
    'color-canvas': require('./thoughts/color-canvas'),
    'raining-paint': require('./thoughts/raining-paint'),
    'unique-stars': require('./thoughts/unique-stars'),
    'using-canvas-to-make-patterns-with-circles': require('./thoughts/using-canvas'),
  },
};
