
/* Pitch detection code */

/* Variables */

window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
window.analyser = window.audioCtx.createAnalyser();
window.analyser.fftSize = 4096;
window.micBuffer = new Float32Array(window.analyser.fftSize);
window.lastNote = 0;
window.lastNoteTime = 0;
window.candidate = 0;
window.candidateCnt = 0;


function startMic() {

  // Set constrains for mic only access without filters
  const constrains = {
    audio: {
      autoGainControl: false,
      echoCancellation: false,
      noiseSuppression: false
    }};

  // Open audio stream
  navigator.mediaDevices.getUserMedia(constrains)
  .then((stream) => {
    window.audioCtx.createMediaStreamSource(stream).connect(window.analyser);
    window.stream = stream;
    // TODO: This does not belong here! (too ugly :P)
    audioLoop();
  })
  .catch((err) => {
    console.log(err);
    window.micAccessError = true;
  });

}

function stopMic() {
  if(window.stream) {
    window.stream.getTracks().forEach(track => track.stop());
  }
}


function pitchToNote(freq) {
  var stepsFromA3 = Math.round(12 * Math.log2(freq / 220));
  var notes = ['A','A#','H','C','C#','D','D#','E','F','F#','G','G#'];

  return notes[(12 + stepsFromA3 % 12) % 12];
}


function audioLoop(time) {

  // console.log('audioLoop @', time);

  // Get latest buffer data
  window.analyser.getFloatTimeDomainData(window.micBuffer);

  // Auto correlate

  const F_SAMPLE = window.audioCtx.sampleRate;

  // Frequency band to search pitch in
  const F_MIN = 50;
  const F_MAX = 700;
  // Actual search interval
  const start = Math.round(F_SAMPLE / F_MAX);
  const stop = Math.round(F_SAMPLE / F_MIN);

  const PERIOD = stop + 1;

  var acc = new Float32Array(PERIOD);
  var avg = 0;

  for(var o = 0; o < PERIOD; o++) {

    var sum = 0;

    for(var i = 0; i < PERIOD - o; i++) {
      sum += window.micBuffer[i] * window.micBuffer[i + o];
    }

    if(sum < 0) {
      sum = (-1) * sum;
    }

    avg += Math.abs(window.micBuffer[i]);
    acc[o] = sum;
  }

  avg /= PERIOD;

  var max = start;

  for(var o = start; o < stop; o++) {
    if(acc[o] > acc[max]) {
      max = o;
    }
  }

  var f_res = F_SAMPLE / max;
  var note = pitchToNote(f_res);

  const THRESHOLD = 0.2;
  const MAX_COUNT = 5;

  if(avg * acc[max] > THRESHOLD) {
    console.log(time.toFixed(4));
    if(note === window.candidate) {
      window.candidateCnt++;
      if(window.candidateCnt > MAX_COUNT) {
        window.lastNote = note;
        window.lastNoteTime = time;
        console.log('Detected ', note);
      }
    }
    else {
      window.candidate = note;
      window.candidateCnt = 1;
    }
  }
  else {
    window.candidate = 0;
    window.candidateCnt = 0;
  }


  // Check if note played

    // If yes save (with timestamp)

  if(window.stream && window.stream['active']) {
    window.requestAnimationFrame(window.audioLoop);
  }
}


/* UI code */


/* Game code */

function gameLoop(time) {

  console.log('gameLoop @', time);

  // Test if access to microphone failed
  window.micAccessError = window.micAccessError || (window.stream && !window.stream['active']);

  if(window.micAccessError) {
    console.log('Could not access mic. Reload the page!');
    return;
  }
  else if(!window.stream) {
    console.log('Please allow access to mic.');
  }
  else {
    // Normal game loop
  }

  window.requestAnimationFrame(window.gameLoop);

}



window.onload = function () {

  startMic();

  // gameLoop();

}
