module.exports = {
  '*': require('./all'),
  '/': require('./index'),
  404: require('./four-oh-four'),
  experience: {
    '/': require('./experience/index'),
  },
  thoughts: {
    '*': require('./thoughts/all'),
    '/': require('./thoughts/index'),
    '2d-automaton': require('./thoughts/2d-automaton'),
    'cellular-automaton': require('./thoughts/cellular-automaton'),
    'last-fm': require('./thoughts/last-fm'),
    'mine-sweeper': require('./thoughts/mine-sweeper'),
    'raining-paint': require('./thoughts/raining-paint'),
    'ten-star-movies': require('./thoughts/ten-star-movies'),
    'unique-stars': require('./thoughts/unique-stars'),
    'using-canvas-to-make-patterns-with-circles': require('./thoughts/using-canvas'),
  },
};
