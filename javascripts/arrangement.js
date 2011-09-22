var Arrangement = new Class({
  Extends: Widget,

  initialize: function(options) {
    Widget.prototype.initialize.call(this, options);
  },

  addTrack: function(options) {
    return this.add(Object.merge({
      type: Track,
      on: {
        clipmove: this.onClipMove.bind(this)
      }
    }, options));
  },

  onClipMove: function(track, clip, event) {
    if (!track.isInside(event.pageX, event.pageY)) {
      var newTrack = this.findTrackFor(event.pageX, event.pageY);
      if (newTrack) {
        track.removeClip(clip);
        newTrack.addClip(clip);
      }
    }
  },

  findTrackFor: function(pageX, pageY) {
    for (var i = 0; i < this.children.length; i++) {
      var track = this.children[i];
      if (track.isInside(pageX, pageY)) {
        return track;
      }
    }
  },

  doLayout: function() {
    if (this.children.length == 0) {
      return;
    }

    this.x = 0;
    this.y = 0;
    this.width = this._parent.width;
    this.height = this._parent.height;

    var y = 0;
    var h = this.height / this.children.length;

    h = 80;
    this.children.each(function(track) {
      track.extent(0, y, this.width, h);
      y += h;
    }, this);

    this.layoutChildren();
  },

  drawCanvas: function(context) {
    context.fillStyle = "#444";
    context.fillRect(this.pixelsPerSecond * this.time, 0, 1, this.height);
  },

  updateTime: function(time) {
    this.time = time;
    this.children.each(function(track) {
      track.pixelsPerSecond = this.pixelsPerSecond;
      track.updateTime(time);
    }, this);
  }
});
