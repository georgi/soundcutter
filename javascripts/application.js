var Application = new Class({

  initialize: function() {
    this.context = new webkitAudioContext();

    document.addEventListener('keydown', this.onKeyDown.bind(this));

    this.root = new Widget({
      context: this.context
    });

    this.arrangement = this.root.add({
      type: Arrangement,
      layout: 'fit',
      pixelsPerSecond: 100
    });

    var track1 = this.arrangement.addTrack({ name: 'Track1' });
    var track2 = this.arrangement.addTrack({ name: 'Track2' });
    var track3 = this.arrangement.addTrack({ name: 'Track3' });
    var track4 = this.arrangement.addTrack({ name: 'Track4' });

    var clip1 = track1.addClip({ name: 'clip1' });
    var clip2 = track2.addClip({ name: 'clip2' });

    this.loadBuffer("loop1.wav", function(buffer) {
      clip1.setBuffer(buffer);
      clip2.setBuffer(buffer);
      clip1.sampleLength = 100000;
      clip2.sampleLength = 100000;
    });

    this.running = false;

    setInterval(function() {
      this.updateTime();
    }.bind(this), 50);
  },

  onKeyDown: function(event) {
    if (event.keyCode == 32) {
      this.running = !this.running;

      if (this.running) {
        this.startTime = this.context.currentTime;
      }
    }
  },

  updateTime: function() {
    if (this.running) {
      this.arrangement.updateTime(this.context.currentTime - this.startTime);
    }
  },

  loadBuffer: function(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = this.onLoadBuffer.bind(this, request, callback);
    request.send();
  },

  onLoadBuffer: function(request, callback) {
    callback(request.response);
  }

});