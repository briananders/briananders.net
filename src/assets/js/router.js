
module.exports = {

  init: function(routes) {
    var cleanArray = require('clean-array');

    function init(module) {
      if(module !== undefined && module.init !== undefined) {
        return module.init();
      }
    }

    function checkForStar(routeObject) {
      if(typeOfObject(routeObject["*"]) === "[object Object]") {
        init(routeObject["*"]);
      }
    }

    function checkForIndex(routeObject) {
      if(typeOfObject(routeObject["/"]) === "[object Object]") {
        init(routeObject["/"]);
      }
    }

    function typeOfObject(thing) {
      return Object.prototype.toString.call(thing);
    }

    function getRoute(arr) {
      var retObject = routes;
      for(var i = 0; i < arr.length; i++) {
        if(retObject[arr[i]] !== undefined) {
          retObject = retObject[arr[i]];
        } else {
          return undefined;
        }
      }
      return retObject;
    }


    var path = window.location.pathname;
    var splitPath = cleanArray(path.split('/'));


    //always run ALL
    init(routes["*"]);

    //then check if there's just a straight match
    if(routes[path]) {
      init(routes[path]);
    }

    //then run through the path-as-an-object model
    for(var pathIndex = 1; pathIndex <= splitPath.length; pathIndex++) {
      var currentPathArray = splitPath.slice(0, pathIndex);
      var routeObject = getRoute(currentPathArray);
      var typeOfModule = typeOfObject(routeObject);

      if (typeOfModule === "[object Object]") {
        checkForStar(routeObject);

        if(pathIndex === splitPath.length) {
          checkForIndex(routeObject);
        }

        init(routeObject);
      }
    }

  }

}