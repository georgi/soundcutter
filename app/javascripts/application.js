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

    this.setBpm(120);
    this.setPixelsPerSecond(50);
    
    $(document).keydown(_.bind(this.onKeyDown, this));
    
    this.searchInput.keydown(_.bind(this.onEnterSearch, this));
    this.arrangement.click(_.bind(this.onClickArrangement, this));
    this.sampleLink.live('click', _.bind(this.onClickSample, this));

    this.loadTemplate("search/result");

    this.renderContext = { 
      render: _.bind(this.render, this)
    };

    this.loadTracks();
    this.scheduleAudio();
  },
  
  scheduleAudio: function() {
    setInterval(_.bind(this.updateAudio, this), this.secondsPerBeat * 1000);
    setInterval(_.bind(this.updatePosition, this), 10);
    setInterval(_.bind(this.updateTime, this), 10);
  },
  
  setBpm: function(bpm) {
    this.bpm = bpm;
    this.secondsPerBeat = 60 / this.bpm;
  },

  setPixelsPerSecond: function(value) {
    this.pixelsPerSecond = value;
    this.pixelsPerBeat = this.secondsPerBeat * this.pixelsPerSecond;
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
    var link = event.target;

    event.preventDefault();
    
    $.ajax({
      url: link.href.replace("http://api.soundcloud.com/", "/_api/"),
      data: {
        client_id: this.clientId
      },
      success: _.bind(function(url) {
        this.loadBuffer(url.replace("http://ak-media.soundcloud.com/", "/mp3/"), _.bind(function(arrayBuffer) {
          this.context.decodeAudioData(arrayBuffer, _.bind(function(buffer) {
            var track = this.createTrack({ name: $(link).html() });
            track.createClip({ buffer: buffer });    
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
    this.time = time;
    this.startTime = this.context.currentTime - this.time;
    this.updatePosition();
  },
  
  onKeyDown: function(event) {
    console.log(event.keyCode);
    
    switch (event.keyCode) {
    case 37: // cursor left
      event.preventDefault();
      if (this.time > 0) {
        this.setTime(this.time - this.secondsPerBeat);
      }
      break;
      
    case 39: // cursor right
      event.preventDefault();
      this.setTime(this.time + this.secondsPerBeat);
      break;

    case 32: // space
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

  updateAudio: function() {
    if (this.running) {
      this.updatePosition();
      this.eachClip(function(clip) {
        clip.updateAudio(this);
      }, this);
    }
  },
  
  updateTime: function() {
    if (this.running) {
      this.time = this.context.currentTime - this.startTime;
    }
  },
  
  updatePosition: function() {
    this.playPosition.css({
      height: this.arrangement.height(),
      left: this.time * this.pixelsPerSecond
    });
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
