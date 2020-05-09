





class GuitarNoteDetector {

  constructor() {

    this.audioCtx = new AudioContext();

    if(!this.audioCtx)
      console.log('Could not create AudioContext.');

    this.analyser = this.audioCtx.createAnalyser();

    this.running = false;
    this.loop = this.loop.bind(this);
  }

  async start() {

    if(!navigator.mediaDevices.getUserMedia) {
      console.log('getUserMedia not supported.');
      return Promise.resolve(false);
    }

    var constraints = {
      // Turn off any unwanted signal processing
      audio: {
        autoGainControl:  false,
        echoCancellation: false,
        noiseSupression:  false,
      }};

    try {
      var stream = await navigator.mediaDevices.getUserMedia(constraints);

      this.stream = stream;
      this.source = this.audioCtx.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      this.running = true;
      this.loop();

      return Promise.resolve(true);
    }
    catch (error) {
      console.log(error);

      this.running = false;
      return Promise.resolve(false);
    }

  }

  stop() {

    if(this.stream) {
      // Stop all tracks
      this.stream.getTracks().forEach(
        function(track){
          track.stop();
        });

      delete this.stream;
    }

    this.running = false;
  }

  loop(curTime) {

    this.lastTime = this.lastTime || 0;

    if(curTime) {

      var deltaTime = curTime - this.lastTime;

      console.log('Detector CPS: ', (1000 / deltaTime));

      this.lastTime = curTime;

    }

    if(this.running) {
      window.requestAnimationFrame(this.loop);
    }
  }

}


function gameLoop(curTime) {

  this.lastTime = this.lastTime || 0;

  if(curTime) {

    var deltaTime = curTime - this.lastTime;

    console.log('Game CPS: ', (1000 / deltaTime));

    this.lastTime = curTime;

  }

  window.requestAnimationFrame(gameLoop);

}


window.onload = function() {

  var detector = new GuitarNoteDetector();

  detector.start()
  .then((success) => {

    if(success) {
      console.log('Got access.');
      gameLoop();
    }
    else {
      console.log('Got no access.');
    }

  });

}
