
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function isActive(buttonId) {
  return window.buttonStates[buttonId];
}

function setActive(buttonId) {
  document.getElementById(buttonId).classList.add('active');
  window.buttonStates[buttonId] = true;
}

function setInactive(buttonId) {
  document.getElementById(buttonId).classList.remove('active');
  window.buttonStates[buttonId] = false;
}

function initButtons() {

  window.buttonStates = [];

  var buttons = document.getElementsByClassName('button');

  for(var b = 0; b < buttons.length; b++) {

    let button = buttons[b];

    if(button.classList.contains('active')) {
      setActive(button.id);
    }
    else {
      setInactive(button.id);
    }

    button.addEventListener('click', function(event) {

      let target = event.target;

      if(isActive(target.id)) {
        setInactive(target.id);
      }
      else {
        setActive(target.id);
      }

    });
  }
}

function setTimeBar(percent, text) {
  this.inner = this.inner || document.getElementById('timeBarInner');
  // Set time bar
  this.inner.style.width = percent;
  this.inner.innerHTML = text;
}

function setScore(total, correct, avgTime) {
  this.score = this.score || document.getElementById('score');
  this.avgTime = this.avgTime || document.getElementById('avgTime');
  // Set score text
  this.score.innerHTML = 'Score: ' + correct + ' of ' + total + ' rounds';
  this.avgTime.innerHTML = 'Average time: ' + (avgTime / 1000).toFixed(1) + 's';
}


function getNewTarget() {

  this.targetDiv = this.targetDiv || document.getElementById('target');

  const strings = ['e', 'B', 'G', 'D', 'A', 'E'];
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'H'];

  var activeStrings = [];

  for(var s = 0; s < strings.length; s++) {
    if(isActive('button-' + strings[s])) {
      activeStrings += strings[s];
    }
  }

  if(activeStrings.length === 0) {
    return false;
  }

  var targetString = activeStrings[getRandomInt(activeStrings.length)];
  var targetNote = notes[getRandomInt(7)];

  this.targetDiv.innerHTML = 'Play ' + targetNote + ' on ' + targetString + ' string!';

  return {'string': targetString, 'note': targetNote};
}



function gameLoop(time) {

  time = time || 0;

  // Check if game should start
  if(isActive('button-play') && time != 0) {

    // GAME LOGIC HERE
    // ---------------

    const MAX_ROUND_TIME = 5000;
    const NEW_ROUND_DELAY = 500;

    if(this.newGame) {
      // Stats tracking
      this.total = 0;
      this.correct = 0;
      this.sumTime = 0;
      // Reset score display
      setScore(0, 0, 0);
      // Delete target (if set)
      if(this.target) {
        delete this.target;
      }
      this.newGame = false;
    }

    if(!this.target) {
      // Get new target
      this.target = getNewTarget();

      if(!this.target) {
        // Failed to get a target
        console.log('Select atleast one string!');
        setInactive('button-play');
      }
      else {
        // Set new round start
        this.roundStart = time + NEW_ROUND_DELAY;
        return;
      }
    }
    console.log(this.target);

    // Check if round time over
    if(time - this.roundStart > MAX_ROUND_TIME) {
      // Missed without guess

      this.total += 1;
      this.sumTime += MAX_ROUND_TIME;

      // Set score
      setScore(this.total, this.correct, this.sumTime / this.total);

      delete this.target;
    }
    // Check if guitar note detected
    else if(false) {
      this.total += 1;
      // TODO: Check if correct note!
      this.correct += (false);
      this.sumTime += MAX_ROUND_TIME;

      // Set score
      setScore(this.total, this.correct, this.sumTime / this.total);

      delete this.target;
    }
    // Just update time bar
    else {
      let timeInRound = time - this.roundStart;
      let percent = (100 - timeInRound / MAX_ROUND_TIME * 100) + '%';
      let text = ((MAX_ROUND_TIME - timeInRound) / 1000).toFixed(1) + 's';
      setTimeBar(percent, text);
    }

    // ---------------
  }
  else {
    this.newGame = true;
  }

  window.requestAnimationFrame(gameLoop);
}



window.onload = function() {

  initButtons();
  gameLoop();

}
