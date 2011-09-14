var Track = new Class({
    Extends: Widget,

    initialize: function(options) {        
        Widget.prototype.initialize.call(this, options);

        this.clips = [];
    },

    doLayout: function() {
        var pps = this._parent.pixelsPerSecond;
        var y = this.y;
        var h = this.height;

        this.clips.each(function(clip) {
            clip.pixelsPerSecond = pps;
            clip.extent(100 + clip.start * pps, y, clip.length * pps, h);
        });
    },

    updateTime: function(time) {
        this.clips.each(function(clip) {
            clip.updateTime(time);
        }, this);
    },

    addClip: function(name, start) {
        var clip = this.add({
            type: Clip,
            name: name,
            start: start
        });

        this.clips.push(clip);

        return clip;
    },

    drawCanvas: function(context) {
        context.fillStyle = '#000';
        context.font = 'Arial';
        context.fillText(this.name, 10, 10);
        // context.fillStyle = '#eee';
        // context.fillRect(0, 0, this.width, this.height);        
    }

});