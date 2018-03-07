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
    'last-fm': require('./thoughts/last-fm'),
    'mine-sweeper': require('./thoughts/mine-sweeper'),
    'ten-star-movies': require('./thoughts/ten-star-movies'),
    'using-canvas-to-make-patterns-with-circles': require('./thoughts/using-canvas'),
    'cellular-automaton': require('./thoughts/cellular-automaton'),
    '2d-automaton': require('./thoughts/2d-automaton'),
    'unique-stars': require('./thoughts/unique-stars'),
  },
};
