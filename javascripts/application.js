var Application = {

  initialize: function() {
    this.clips = [];
    this.context = new webkitAudioContext();
    this.pixelsPerSecond = 100;

    $(document).keydown(this.onKeyDown.bind(this));

    var clip1 = new Clip({ context: this.context, name: 'clip1', pixelsPerSecond: this.pixelsPerSecond });
    var clip2 = new Clip({ context: this.context, name: 'clip2', pixelsPerSecond: this.pixelsPerSecond });

    this.clips.push(clip1);
    this.clips.push(clip2);

    $('#track-1').append(clip1.element);
    $('#track-2').append(clip2.element);

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
      for (var i = 0; i < this.clips.length; i++) {
        this.clips[i].update(this.context.currentTime - this.startTime);              
      }
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

};