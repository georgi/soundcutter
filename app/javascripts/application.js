var Application = {

  initialize: function() {
    this.time = 0;
    this.interval = 0.050;
    this.running = false;
    this.tracks = [];
    this.context = new webkitAudioContext();
    this.playPosition = $('#play-position');
    
    this.bpm = 80;
    this.pixelsPerBeat = 50;

    $(document).keydown(_.bind(this.onKeyDown, this));

    this.createTrack({ name: 'track1' });
    this.createTrack({ name: 'track2' });

    $('#samples a').live('click', _.bind(this.onClickSample, this));

    setInterval(_.bind(this.updateAudio, this), this.interval * 1000);
  },

  pixelsPerSecond: function() {
    return (this.bpm / 60) * this.pixelsPerBeat;
  },

  onClickSample: function(event) {
    event.preventDefault();
    
    this.loadBuffer(event.target.href, _.bind(function(buffer) {
      this.tracks[0].createClip({ arrayBuffer: buffer });      
    }, this));
  },

  createTrack: function(options) {
    var track = new Track(_.extend({
      context: this.context,
      application: this
    }, options));

    this.tracks.push(track);

    return track;
  },
  
  onKeyDown: function(event) {
    switch (event.keyCode) {
    case 38:
      if (event.ctrlKey) {
        this.pixelsPerSecond() /= 2;
        this.updateGraphics();
      }
      break;

    case 40:
      if (event.ctrlKey) {
        this.pixelsPerSecond() *= 2;
        this.updateGraphics();
      }
      break;

    case 37:
      event.preventDefault();
      if (this.time > 0) {
        this.time -= 0.5;
        this.startTime -= 0.5;
      }
      break;

    case 39:
      event.preventDefault();
      this.time += 0.5;
      this.startTime += 0.5;
      break;

    case 32:
      event.preventDefault();
      if (this.running) {
        this.running = false;
        this.stopClips();
      }
      else {
        this.startTime = this.context.currentTime - this.time;
        this.running = true;
      }
      break;
      
    case 86:
      event.preventDefault();
      if (event.ctrlKey) {
        this.pasteClips();
      }
      break;
    }
  },

  eachClip: function(callback, scope) {
    _.each(this.tracks, function(track) {
      _.each(track.clips, callback, scope);
    });
  },

  updateAudio: function() {
    if (this.running) {
      this.time = this.context.currentTime - this.startTime;

      this.eachClip(function(clip) {
        clip.updateAudio(this);
      }, this);
    }

    this.playPosition.css('left', this.time * this.pixelsPerSecond());
  },

  updateGraphics: function() {
    this.eachClip(function(clip) {
      clip.updateGraphics();
    }, this);
  },

  pasteClips: function() {
    this.eachClip(function(clip) {
      if(clip.selected) {      
        var clone = clip.clone();
        clone.selected = false;
        this.tracks[0].addClip(clone);
      }
    }, this);
  },

  stopClips: function() {
    this.eachClip(function(clip) {
      clip.stop();
    }, this);
  },

  loadBuffer: function(url, callback) {
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    request.onload = _.bind(this.onLoadBuffer, this, request, callback);
    request.send();
  },

  onLoadBuffer: function(request, callback) {
    callback(request.response);
  }

};