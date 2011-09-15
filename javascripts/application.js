var Application = new Class({

  initialize: function() {
    this.context = new webkitAudioContext();

    this.root = new Widget({
      context: this.context
    });

    this.arrangement = this.root.add({
      type: Arrangement,
      layout: 'fit',
      pixelsPerSecond: 100
    });

    var clip1 = this.arrangement.addTrack('Track1').addClip('loop1');
    var clip2 = this.arrangement.addTrack('Track2').addClip('loop2');
    var clip3 = this.arrangement.addTrack('Track3').addClip('loop2');
    var clip4 = this.arrangement.addTrack('Track4').addClip('loop2');

    this.loadBuffer("loop1.wav", function(buffer) {
      clip1.setBuffer(buffer);
      clip2.setBuffer(buffer);
      clip3.setBuffer(buffer);
      clip4.setBuffer(buffer);
      clip1.sampleLength = 100000;
      clip2.sampleLength = 100000;
      clip3.sampleLength = 100000;
      clip4.sampleLength = 100000;
    });

    setInterval(function() {
      this.updateTime();
    }.bind(this), 50);
  },

  updateTime: function() {
    this.arrangement.updateTime(this.context.currentTime);
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