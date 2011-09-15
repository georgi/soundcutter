var TrackMixer  = new Class({
  Extends: Widget,

  initialize: function(options) {
    Widget.prototype.initialize.call(this, options);
  },

  drawCanvas: function(context) {
    context.fillStyle = '#000';
    context.font = 'Arial';
    context.fillText(this.track.name, 10, 10);
  }
});

var TrackClipsView = new Class({
  Extends: Widget,

  initialize: function(options) {
    Widget.prototype.initialize.call(this, options);
  },

  doLayout: function() {
    var pps = this.track.pixelsPerSecond;
    var h = this.height;

    this.children.each(function(clip) {
      clip.pixelsPerSecond = pps;
      clip.height = h;
    });

    this.layoutChildren();
  },

  drawCanvas: function(context) {
    context.strokeStyle = '#eee';
    context.strokeRect(0, 0, this.width, this.height);
  }
});

var Track = new Class({
  Extends: Widget,

  initialize: function(options) {
    Widget.prototype.initialize.call(this, options);

    this.mixer = this.add({
      type: TrackMixer,
      track: this
    });

    this.clipsView = this.add({
      type: TrackClipsView,
      track: this
    });

    this.clips = [];
  },

  doLayout: function() {
    this.mixer.extent(0, 0, 100, this.height);
    this.clipsView.extent(100, 0, this.width - 100, this.height);

    this.layoutChildren();
  },

  updateTime: function(time) {
    this.clips.each(function(clip) {
      clip.updateTime(time);
    }, this);
  },

  addClip: function(name) {
    var clip = this.clipsView.add({
      type: Clip,
      name: name
    });

    this.clips.push(clip);

    return clip;
  },

});