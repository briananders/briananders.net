"use strict";


////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////// PRIVATE VARIABLES ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



var canvasContext,
    canvas,
    circles = [],
    borderStyle,
    alphaBorder,
    fillStyle,
    alphaFill,
    clearButton,
    eraseButton,
    paused = true,
    pauseButton;



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////// PRIVATE FUNCTIONS ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



window.addEventListener("load", initialize, false);



function initialize() {
  borderStyle = document.getElementById("border-style");
  alphaBorder = document.getElementById("alpha-border");
  fillStyle = document.getElementById("fill-style");
  alphaFill = document.getElementById("alpha-fill");
  pauseButton = document.getElementById("pause-button");
  clearButton = document.getElementById('clear-button');
  eraseButton = document.getElementById('erase-button');
  canvas = document.getElementById("my-canvas");

  canvasContext = canvas.getContext('2d');

  addEventListeners();
  setCanvasDimensions();
}



function addEventListeners() {

  var supportsOrientationChange = "onorientationchange" in window;
  var orientationEvent = supportsOrientationChange ? "orientationchange" : "resize";

  window.addEventListener(orientationEvent, erase, false);

  alphaBorder.addEventListener('change', updateAlphaBorder, false);
  alphaFill.addEventListener('change', updateAlphaFill, false);

  canvas.addEventListener("click", createCircle, false);
  pauseButton.addEventListener('click', pauseUnpause, false);
  clearButton.addEventListener('click', clear, false);
  eraseButton.addEventListener('click', erase, false);
}



function erase() {
  setCanvasDimensions();
  drawCanvas();
}



function updateAlphaBorder() {
  var i = circles.length;

  while(i) {
    circles[--i].updateAlphaBorder();
  }
}



function updateAlphaFill() {
  var i = circles.length;

  while(i) {
    circles[--i].updateAlphaFill();
  }
}



function pauseUnpause() {
  var pauseCache = paused;

  if(circles.length < 1) {
    paused = true;
    return;
  }

  paused = !paused;
  if(!paused) {
    window.setTimeout(draw, 0);
  }

  if(pauseCache !== paused) {
    if(paused) {
      pauseButton.classList.add('paused');
    } else {
      pauseButton.classList.remove('paused');
    }
  }
}



function createCircle(e) {
  circles.push(new Circle(e.x,e.y));

  if(circles.length === 1) {
    pauseUnpause();
  }
}



function setCanvasDimensions() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}



function randomColor() {
  return Math.floor(Math.random() * 256);
}



function update() {
  var i = circles.length;

  while(i) {
    circles[--i].update();
  }
}



function drawCanvas() {
  canvasContext.save();

  var i = circles.length;

  while(i) {
    circles[--i].draw(canvasContext);
  }

  canvasContext.restore();
}



function clear() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  circles = [];
  pauseUnpause();
}



function draw() {

  var i = 2;
  while(i--) {
    update();
    drawCanvas();
  }

  if(!paused) {
    window.setTimeout(draw, 0);
  }

}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// CLASSES ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////



function ColorObject() {

  var alpha = Math.random();
  var red = randomColor();
  var green = randomColor();
  var blue = randomColor();
  var average = Math.floor((red + green + blue) / 3);

  this.alpha = alpha;
  this.rgb = function() {
    return 'rgba(' + red + ',' + green + ',' + blue + ',' + this.alpha + ')';
  };
  this.gray = function() {
    return 'rgba(' + average + ',' + average + ',' + average + ',' + this.alpha + ')';
  };
  this.random = function() {
    return 'rgba(' + randomColor() + ',' + randomColor() + ',' + randomColor() + ',' + this.alpha + ')';
  };
  this.resetAlpha = function() {
    this.alpha = alpha;
  };
}

//Circle Class
function Circle(x,y) {
  //position and size
  if(x === undefined) {
    x = 1;
  }
  if(y === undefined) {
    y = 1;
  }
  var radius = Math.floor(Math.random() * 50);
  window.console.debug("radius: " + radius);

  //color
  var fill = new ColorObject();
  var border = new ColorObject();

  //speed
  var speed = (Math.random() * 50) + 50;
  var xVelocity = (Math.random() - 0.5) * speed;
  var yVelocity = (Math.random() - 0.5) * speed;





  this.draw = function(canvasContext) {
    canvasContext.beginPath();
    canvasContext.arc(x, y, radius, 0, 2 * Math.PI, false);

    switch(fillStyle.value) {
      case "no-fill":
        canvasContext.fillStyle = "rgba(0,0,0,0)";
        break;
      case "fill-gray":
        canvasContext.fillStyle = fill.gray();
        break;
      case "fill-color":
        canvasContext.fillStyle = fill.rgb();
        break;
      case "epileptic":
        canvasContext.fillStyle = fill.random();
        break;
    }

    canvasContext.fill();

    if(borderStyle.value !== "no-border") {
      canvasContext.lineWidth = "1px";

      switch(borderStyle.value) {
        case "border-black":
          canvasContext.strokeStyle = 'rgba(0,0,0,' + border.alpha + ')';
          break;
        case "border-gray":
          canvasContext.strokeStyle = border.gray();
          break;
        case "border-color":
          canvasContext.strokeStyle = border.rgb();
          break;
        case "epileptic":
          canvasContext.strokeStyle = border.random();
          break;
      }
      canvasContext.stroke();
    }

    canvasContext.closePath();
  };



  this.update = function() {

    if((y + yVelocity) < radius) {
      yVelocity = Math.abs(yVelocity);
    } else if((y + yVelocity) > (canvas.height - radius)) {
      yVelocity = 0 - Math.abs(yVelocity);
    }

    y += yVelocity;

    if((x + xVelocity) < radius) {
      xVelocity = Math.abs(xVelocity);
    } else if((x + xVelocity) > (canvas.width - radius)) {
      xVelocity = 0 - Math.abs(xVelocity);
    }

    x += xVelocity;

  };


  this.updateAlphaBorder = function() {
    if(alphaBorder.checked) {
      border.resetAlpha();
    } else {
      border.alpha = 1;
    }
  };


  this.updateAlphaFill = function() {
    if(alphaFill.checked) {
      fill.resetAlpha();
    } else {
      fill.alpha = 1;
    }
  };

  this.updateAlphaBorder();
  this.updateAlphaFill();

}