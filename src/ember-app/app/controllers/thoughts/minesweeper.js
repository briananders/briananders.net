import Ember from 'ember';
import MineSweeperTileModel from '../../models/mine-sweeper-tile';

export default Ember.Controller.extend({

//beginner (8x8, 10 mines),
//intermediate (16x16, 40 mines)
//expert (24x24, 99 mines)
//Custom (0-25, 0-25, 0-99)

////////////////////////////////////////////// properties


  time: 0,

  timeOnes: Ember.computed('time', function() {
    return this.get('time') % 10;
  }),

  timeTens: Ember.computed('time', function() {
    return Math.floor(this.get('time') / 10 % 10);
  }),

  timeHundreds: Ember.computed('time', function() {
    return Math.floor(this.get('time') / 100);
  }),



  tileMouseDown: false,



  isPlaying: false,

  minesSet: false,

  inactiveSquares: [],

  totalFlags: 0,

  rowsAndColumns: [],

  gameOver: false,

  lastSquare: null,



  difficulty: "beginner",

  difficultyOptions: ["beginner", "intermediate", "expert"],



  numberOfRows: Ember.computed('difficulty', function() {

    switch(this.get('difficulty')) {
      case "beginner":
        return 8;
      case "intermediate":
        return 16;
      default:
        return 24;
    }

  }),

  numberOfColumns: Ember.computed('difficulty', function() {

    switch(this.get('difficulty')) {
      case "beginner":
        return 8;
      case "intermediate":
        return 16;
      default:
        return 24;
    }

  }),

  mineCount: Ember.computed('difficulty', function() {

    switch(this.get('difficulty')) {
      case "beginner":
        return 10;
      case "intermediate":
        return 40;
      default:
        return 99;
    }

  }),



////////////////////////////////////////////// computed properties



  mineCountMinusFlags: Ember.computed('mineCount', 'totalFlags', function() {
    return this.get('mineCount') - this.get('totalFlags');
  }),

  mineCountMinusFlagsOnes: Ember.computed('mineCountMinusFlags', function() {
    return this.get('mineCountMinusFlags') % 10;
  }),

  mineCountMinusFlagsTens: Ember.computed('mineCountMinusFlags', function() {
    return Math.floor(this.get('mineCountMinusFlags') / 10 % 10);
  }),

  mineCountMinusFlagsHundreds: Ember.computed('mineCountMinusFlags', function() {
    return Math.floor(this.get('mineCountMinusFlags') / 100);
  }),




  hasWon: Ember.computed('inactiveSquares', 'mineCount', function() {
    return this.get('inactiveSquares.length') === this.get('mineCount');
  }),



  columnWidthClass: Ember.computed('numberOfColumns', function() {

    switch(this.get('numberOfColumns')) {

      case 8:
        return "eight";
      case 9:
        return "nine";
      case 10:
        return "ten";
      case 11:
        return "eleven";
      case 12:
        return "twelve";
      case 13:
        return "thirteen";
      case 14:
        return "fourteen";
      case 15:
        return "fifteen";
      case 16:
        return "sixteen";
      case 17:
        return "seventeen";
      case 18:
        return "eighteen";
      case 19:
        return "nineteen";
      case 20:
        return "twenty";
      case 21:
        return "twenty-one";
      case 22:
        return "twenty-two";
      case 23:
        return "twenty-three";
      case 24:
        return "twenty-four";
      case 25:
        return "twenty-five";

    }

  }),



  singleArray: Ember.computed('rowsAndColumns', function() {

    var rowsAndColumns = this.get('rowsAndColumns');
    var ret = [];

    for(var r = 0; r < this.get('numberOfRows'); r++) {
      ret = ret.concat(rowsAndColumns[r]);
    }

    return ret;

  }),



  observersForReset: Ember.observer('numberOfRows', 'numberOfColumns', 'mineCount', 'difficulty', function() {

    this.send('reset');

  }),



  observesHasWon: Ember.observer('hasWon', function() {

    if(this.get('hasWon')) {
      var inactiveSquares = this.get('inactiveSquares');
      inactiveSquares.forEach(function(column) {
        column.set('flag', true);
      });
      this.countFlags();
    }

  }),



  // observesDifficulty: Ember.observer('difficulty', function() {

  //   this.send('reset');

  // }),



////////////////////////////////////////////// functions



  init() {

    this.setupTable();

  },



  setupTable() {

    var rowsAndColumns = this.get('rowsAndColumns');

    for(var r = 0; r < this.get('numberOfRows'); r++) {
      rowsAndColumns[r] = [];
      for(var c = 0; c < this.get('numberOfColumns'); c++) {
        rowsAndColumns[r][c] = MineSweeperTileModel.create({
          location: [r,c],
          controller: this
        });
      }
    }

  },



  setMines(location) {

    var numberOfRows = this.get('numberOfRows');
    var numberOfColumns = this.get('numberOfColumns');
    var rowsAndColumns = this.get('rowsAndColumns');
    var mineCount = this.get('mineCount');

    var randomRow;
    var randomColumn;

    while(mineCount > 0) {

      randomRow = Math.floor(Math.random() * numberOfRows);
      randomColumn = Math.floor(Math.random() * numberOfColumns);

      if(!(randomRow === location[0] && randomColumn === location[1]) &&
                rowsAndColumns[randomRow][randomColumn].get('mine') === false) {
        rowsAndColumns[randomRow][randomColumn].set('mine', true);
        mineCount--;
      }

    }

    this.set('minesSet', true);

  },



  findInactiveSquares() {

    var columns = this.get('singleArray');
    var inactiveSquares = [];

    columns.forEach(function(column) {
      if(!column.get('active')) {
        inactiveSquares.push(column)
      }
    });

    this.set('inactiveSquares', inactiveSquares);

  },



  startClock() {

    window.interval = setInterval(function() {

      if(this.get('time') === 999) {
        this.set('gameOver', true);
      }

      if(!(this.get('gameOver') || this.get('hasWon'))) {
        this.set('time', this.get('time') + 1);
        this.findInactiveSquares();
      } else {
        clearInterval(window.interval);
        window.interval = undefined;
      }

    }.bind(this), 1000);

  },



  playing() {

    this.countFlags();
    this.findInactiveSquares();

    if(window.interval === undefined) {
      this.set('isPlaying', true);
      this.startClock();
    }

  },



  countLocalFlags(location) {

    var flagCount = 0;

    var rowsAndColumns = this.get('rowsAndColumns');

    for(var r = location[0] - 1; r <= location[0] + 1; r++) {
      if(rowsAndColumns[r]) {
        for(var c = location[1] - 1; c <= location[1] + 1; c++) {
          if(rowsAndColumns[r][c] && rowsAndColumns[r][c].get('flag')) {
            flagCount++;
          }
        }
      }
    }

    return flagCount;

  },



  countFlags() {

    var columns = this.get('singleArray');
    var count = 0;

    columns.forEach(function(column) {
      count += (column.get('flag') ? 1 : 0);
    });

    this.set('totalFlags', count);

  },



  revealSurrounding(location) {

    var rowsAndColumns = this.get('rowsAndColumns');

    for(var r = location[0] - 1; r <= location[0] + 1; r++) {
      if(rowsAndColumns[r]) {
        for(var c = location[1] - 1; c <= location[1] + 1; c++) {
          if(rowsAndColumns[r][c] && !rowsAndColumns[r][c].get('active') && !rowsAndColumns[r][c].get('flag')) {

            rowsAndColumns[r][c].set('active', true);

            if(this.getValue([r,c]) === 0) {
              this.revealSurrounding([r,c]);
            }
          }
        }
      }
    }

  },



  getValue(location) {

    var rowsAndColumns = this.get('rowsAndColumns');
    var mines = 0;

    for(var r = location[0] - 1; r <= location[0] + 1; r++) {
      if(rowsAndColumns[r]) {
        for(var c = location[1] - 1; c <= location[1] + 1; c++) {
          if(rowsAndColumns[r][c] && rowsAndColumns[r][c].get('mine')) {
            mines++;
          }
        }
      }
    }

    return mines;

  },



////////////////////////////////////////////// actions



  actions: {

    tryRevealSurrounding(location, value) {

      Ember.run.next(this, function() {

        if(value === this.countLocalFlags(location)) {

          this.revealSurrounding(location);

        }

      });

    },



    selectDifficulty(difficulty) {

      this.set('difficulty', difficulty);

    },



    lose(location) {

      this.set('gameOver', true);
      this.set('lastSquare', location);

    },



    reset() {

      clearInterval(window.interval);
      window.interval = undefined;
      this.set('time', 0);
      this.set('isPlaying', false);
      this.set('minesSet', false);
      this.set('rowsAndColumns', []);
      this.set('gameOver', false);
      this.set('lastSquare', null);
      this.setupTable();
      this.countFlags();
      this.findInactiveSquares();

    }


  },


});
