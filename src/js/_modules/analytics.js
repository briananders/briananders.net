const { isProduction } = require('./environment');

const pushEvent = ({ category, action, label } = {}) => {
  const eventObject = {
    event: 'gaEvent',
    gaCategory: category,
    gaAction: action,
    gaLabel: label,
  };
  dataLayer.push(eventObject);
  if (!isProduction) {
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
