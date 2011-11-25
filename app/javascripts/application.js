var Application = {

  initialize: function() {
    _.templateSettings = {
      interpolate : /\{\{(.+?)\}\}/g,
      evaluate : /\{%(.+?)%\}/g
    };
    this.clientId = "d9ec4081d8936c9a35d6b2f1c5903f51";
    this.templates = {};
    this.time = 0;
    this.running = false;
    this.tracks = [];
    this.selection = [];
    this.context = new webkitAudioContext();
    this.playPosition = $('#play-position');
    this.searchInput = $("#search-input");
    this.arrangement = $("#arrangement");
    this.sampleLink = $('#search a');
    this.playButton = $('#play');
    this.trackHeight = 100;
    this.beatCount = 4;
    this.stepsPerBeat = 4;
    this.setBpm(120);
    this.setPixelsPerBeat(Math.floor(this.arrangement.width() / this.beatCount));
    this.loopLength = this.secondsPerBeat * this.beatCount;
     
    $(document).keydown(_.bind(this.onKeyDown, this));
    
    $('#rewind').click(_.bind(this.rewind, this));
    $('#forward').click(_.bind(this.forward, this));
    $('#copy').click(_.bind(this.copyClips, this));
    $('#paste').click(_.bind(this.pasteClips, this));
    this.playButton.click(_.bind(this.togglePlay, this));
    this.searchInput.keydown(_.bind(this.onEnterSearch, this));
    this.arrangement.click(_.bind(this.onClickArrangement, this));
    this.sampleLink.live('click', _.bind(this.onClickSample, this));

    this.loadTemplate("search/result");

    this.renderContext = { 
      render: _.bind(this.render, this)
    };

    this.loadTracks();
    this.schedule();
  },
  
  schedule: function() {
    setInterval(_.bind(this.updateTime, this), 10);
  },
  
  setBpm: function(bpm) {
    this.bpm = bpm;
    this.secondsPerBeat = 60 / this.bpm;
    this.secondsPerStep = this.secondsPerBeat / this.stepsPerBeat;
  },

  setPixelsPerBeat: function(value) {
    this.pixelsPerBeat = value;
    this.pixelsPerSecond = this.pixelsPerBeat / this.secondsPerBeat;
    this.pixelsPerStep = this.pixelsPerBeat / this.stepsPerBeat;
  },
  
  setPixelsPerSecond: function(value) {
    this.pixelsPerSecond = value;
    this.pixelsPerBeat = this.secondsPerBeat * this.pixelsPerSecond;
    this.pixelsPerStep = this.pixelsPerBeat / this.stepsPerBeat;
  },
  
  visibleRangeInSeconds: function() {
    return $('#arrangement').width() / this.pixelsPerSecond;
  },

  render: function(name, context) {
    return this.templates[name](_.extend(this.renderContext, context));
  },

  loadTemplate: function(name) {
    $.ajax({
      url: "/templates/" + name + ".html",
      success: _.bind(this.onLoadTemplate, this, name)
    });
  },

  onLoadTemplate: function(name, data) {
    this.templates[name] = _.template(data);
  },

  onEnterSearch: function(event) {
    if (event.keyCode == 13) {
      $('#search').html('<img src="/loading.gif"/>');
      this.searchTracks(this.searchInput.val(), _.bind(this.renderSearch, this));
      $(event.target).val('');
    }
  },

  loadTracks: function() {
    $('#search').html('<img src="/loading.gif"/>');
    $.ajax({
      url: "/_api/users/user1239006/tracks.json",
      data: {
        client_id: this.clientId
      },
      success: _.bind(this.renderSearch, this)
    });
  },

  renderSearch: function(data) {
    $('#search').html(this.render("search/result", { tracks: data }));
  },

  searchTracks: function(q, callback) {
    $.ajax({
      url: "/_api/tracks.json",
      data: {
        client_id: this.clientId,
        q: q
      },
      success: callback
    });
  },

  onClickSample: function(event) {
    var link = event.currentTarget;
    event.preventDefault();
    
    var track = this.createTrack({ name: link.title, startTime: this.time });    
    // var clip = track.createClip({ duration: parseInt($(link).attr('data-duration')) / 1000 });    
    var clip = track.createClip({ duration: 1  });    
    
    $.ajax({
      url: link.href.replace("http://api.soundcloud.com/", "/_api/"),
      data: {
        client_id: this.clientId
      },
      success: _.bind(function(url) {
        this.loadBuffer(url.replace("http://ak-media.soundcloud.com/", "/mp3/"), _.bind(function(arrayBuffer) {
          this.context.decodeAudioData(arrayBuffer, _.bind(function(buffer) {
            clip.buffer = buffer;
            clip.draw();
          }, this));
        }, this));
      }, this)
    });
  },
  
  onClickArrangement: function(event) {    
    this.setTime(event.offsetX / this.pixelsPerSecond);
  },
  
  createTrack: function(options) {
    var track = new Track(_.extend({
      context: this.context,
      application: this
    }, options));

    this.tracks.push(track);

    return track;
  },

  setTime: function(time) {
    this.time = Math.floor(time / this.secondsPerStep) * this.secondsPerStep;
    this.startTime = this.context.currentTime - this.time;
    this.updatePosition();
  },

  rewind: function() {
    if (this.time > 0) {
      this.setTime(this.time - this.secondsPerStep);
    }
  },
  
  forward: function() {
    this.setTime(this.time + this.secondsPerStep);
  },

  togglePlay: function() {
    if (this.running) {
      this.running = false;
      this.stopClips();
      this.playButton.html('&#9654;');
    }
    else {
      this.startTime = this.context.currentTime - this.time;
      this.running = true;
      this.playButton.html('&#9632;');
     }
  },
  
  onKeyDown: function(event) {
    console.log(event.keyCode);
    
    switch (event.keyCode) {
    case 37: // cursor left
      event.preventDefault();
      this.rewind();
      break;
      
    case 39: // cursor right
      event.preventDefault();
      this.forward();
      break;

    case 32: // space
      event.preventDefault();
      this.togglePlay();
      break;

    case 67: // c
      event.preventDefault();

      if (event.ctrlKey) {
        this.copyClips();
      }
      break;
      
    case 86: // v
      event.preventDefault();

      if (event.ctrlKey) {
        this.pasteClips();
      }
      break;
    }
  },
  
  updatePosition: function() {
    this.playPosition.css({
      height: this.arrangement.height(),
      left: this.time * this.pixelsPerSecond
    });     
  },
  
  updateTime: function() {
    if (this.running) {
      this.time = this.context.currentTime - this.startTime;
      
      this.updatePosition();
      
      if (this.time + 0.01 > this.loopLength) {
        this.setTime(this.time - this.loopLength);
      }
      
      this.eachClip(function(clip) {
        clip.updateAudio(this);
      }, this);
    }
  },

  updateGraphics: function() {
    this.eachClip(function(clip) {
      clip.updateGraphics();
    }, this);
  },
  
  eachClip: function(callback, scope) {
    _.each(this.tracks, function(track) {
      _.each(track.clips, callback, scope);
    });
  },

  clips: function() {
    var clips = [];
    this.eachClip(function(clip) { clips.push(clip); });
    return clips;
  },

  selectClips: function() {
    _.invoke(this.clips(), "select");
  },
  
  deselectClips: function() {
    _.invoke(this.clips(), "deselect");
  },

  selectedClips: function() {
    return _.filter(this.clips(), function(clip) { return clip.selected; });
  },
  
  copyClips: function() {
    this.selection = _.sortBy(this.selectedClips(), function(clip) { return clip.startTime; });
    this.deselectClips();
  },
  
  pasteClips: function() {
    if (this.selection.length > 0) {
      var offset = this.selection[0].startTime;

      _.each(this.selection, function(clip) {
        var clone = clip.clone();
        clone.startTime += this.time - offset; 
        clip.track.addClip(clone);
      }, this);
    }
  },

  stopClips: function() {
    _.invoke(this.clips(), "stop");
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
