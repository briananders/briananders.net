
module.exports = {

  init(routes) {
    const cleanArray = require('clean-array');

    function typeOfObject(thing) {
      return Object.prototype.toString.call(thing);
    }

    function init(module) {
      if (module !== undefined && module.init !== undefined) {
        return module.init();
      }
    }

    function checkForStar(routeObject) {
      if (typeOfObject(routeObject['*']) === '[object Object]') {
        init(routeObject['*']);
      }
    }

    function checkForIndex(routeObject) {
      if (typeOfObject(routeObject['/']) === '[object Object]') {
        init(routeObject['/']);
      }
    }

    function getRoute(arr) {
      let retObject = routes;
      for (let i = 0; i < arr.length; i++) {
        if (retObject[arr[i]] !== undefined) {
          retObject = retObject[arr[i]];
        } else {
          return undefined;
        }
      }
      return retObject;
    }


    const path = window.location.pathname;
    const splitPath = cleanArray(path.split('/'));


    // always run ALL
    init(routes['*']);

    // then check if there's just a straight match
    if (routes[path]) {
      init(routes[path]);
    }

    // then run through the path-as-an-object model
    for (let pathIndex = 1; pathIndex <= splitPath.length; pathIndex++) {
      const currentPathArray = splitPath.slice(0, pathIndex);
      const routeObject = getRoute(currentPathArray);
      const typeOfModule = typeOfObject(routeObject);

      if (typeOfModule === '[object Object]') {
        checkForStar(routeObject);

        if (pathIndex === splitPath.length) {
          checkForIndex(routeObject);
        }

        init(routeObject);
      }
    }
  },

};
