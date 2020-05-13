
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


/* NOTE DETECTOR STUFF */

// Variables

var audioCtx;
var analyser;
var sigBuffer;

var micReadyFlag;
var micErrorFlag;

// Functions

function initNoteDetector() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  sigBuffer = new Uint8Array(4096);
  micReadyFlag = false;
}

function openMicrophone() {
  var constrains = {
      audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false
      }};
  // Open audio stream
  navigator.mediaDevices.getUserMedia(constrains)
      .then((stream) => {
          window.audioCtx.createMediaStreamSource(stream).connect(window.analyser);
          window.micReadyFlag = true;
      })
      .catch((err) => {
          console.log(err);
      });
}

function closeMicrophone() {

}






function gameLoop(time) {

  if(!time || !isActive('button-play')) {
    // Initial call or game explicitly stopped
    this.resetGame = true;
  }
  else {
    // Normal game logic

    // Constants
    const MAX_ROUND_TIME = 2000;
    const NEW_ROUND_DELAY = 500;

    // Reset routine (start a new game)
    if(this.resetGame) {

      console.log('Starting new game @', time);
      this.resetGame = false;

      // Stats tracking
      this.total = 0;
      this.correct = 0;
      this.gameStart = time;

      // Reset score display
      this.taskField = this.taskField || document.getElementById('task');
      this.scoreField = this.scoreField || document.getElementById('score');
      this.timeBar = this.timeBar || document.getElementById('timeBarInner');

      this.resetRound = true;
    }

    if(this.resetRound) {

      console.log('Starting new round @', time);
      this.resetRound = false;

      // Get new target

      var allowedStrings = ['e','B','G','D','A','E'].filter((s) => isActive('button-' + s));

      if(allowedStrings.length === 0) {
        console.log('Failed to start game, no strings selected.');
        alert('Please select atleast one string.');
        setInactive('button-play');
        window.requestAnimationFrame(gameLoop);
        // Exit for next gameloop
        return;
      }

      const notes = ['C','C#','Db','D','D#','Eb','E','F','F#','Gb','G','G#','Ab','A','A#','Bb','B'];

      var allowedNotes = [];

      notes.forEach((n) => {
        switch(n.slice(-1)) {
          case '#':
            if(isActive('button-sharp')) {
              allowedNotes.push(n);
            }
            break;
          case 'b':
            if(isActive('button-flat')) {
              allowedNotes.push(n);
            }
            break;
          default:
            allowedNotes.push(n);
        }
      });

      console.log(allowedNotes);

      this.target = {
        string: allowedStrings[getRandomInt(allowedStrings.length)],
        note: allowedNotes[getRandomInt(allowedNotes.length)],
      };

      this.roundStart = time + NEW_ROUND_DELAY;


    }

    // Check if round time over
    if(time - this.roundStart > MAX_ROUND_TIME) {
      // Missed without guess

      console.log('Time expired, round over @', time);

      this.total += 1;

      this.resetRound = true;
    }
    // Check if guitar note detected
    else if(false) {

      this.total += 1;
      // TODO: Check if correct note!

      this.resetRound = true;
    }
    // Waiting for next round
    if(this.roundStart > time) {
      // Draw waiting screen time bar
      this.timeBar.style.width = '100%';
      this.timeBar.innerHTML = 'Waiting..';
    }
    // In round, but no special event
    else {

      this.taskField.innerHTML = 'Play ' + this.target.note + ' on ' + this.target.string + '-string!';
      this.scoreField.innerHTML = 'Score: ' + this.correct + ' of ' + this.total;

      // Just update time bar

      var sinceStart = time - this.roundStart;

      var percent = (1 - sinceStart / MAX_ROUND_TIME) * 100 + '%';
      var timeLeftInSec = (Math.max(MAX_ROUND_TIME - sinceStart, 0) / 1000).toFixed(1) + 's';

      this.timeBar.style.width = percent;
      this.timeBar.innerHTML = timeLeftInSec;
    }
  }

  window.requestAnimationFrame(gameLoop);
}



window.onload = function() {

  initNoteDetector();
  initButtons();

  openMicrophone();

  gameLoop();

}
