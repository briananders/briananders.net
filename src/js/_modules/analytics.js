/* globals ga */

const { isProduction } = require('./environment');

const pushEvent = ({ category, action, label } = {}) => {
  const eventObject = {
    eventCategory: category,
    eventAction: action,
    eventLabel: label,
  };
  if (isProduction) {
    ga.getAll()[0].send('event', eventObject);
  } else {
    console.info(eventObject);
  }
};

module.exports = {
  pushEvent,

  watchElements: () => {
    document.querySelectorAll('a').forEach((element) => {
      element.addEventListener('click', () => {
        pushEvent({
          category: 'anchor click',
          action: element.href,
        });
      });
    });

    document.querySelectorAll('button').forEach((element) => {
      element.addEventListener('click', () => {
        pushEvent({
          category: 'button click',
          action: element.id || element.value,
        });
      });
    });

    document.querySelectorAll('input').forEach((element) => {
      element.addEventListener('click', () => {
        pushEvent({
          category: 'input click',
          action: element.id,
        });
      });
    });
  },
};
