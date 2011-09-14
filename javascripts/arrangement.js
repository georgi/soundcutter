var Arrangement = new Class({
    Extends: Widget,

    initialize: function(options) {        
        Widget.prototype.initialize.call(this, options);

        this.tracks = [];
    },

    addTrack: function(name) {
        var track = this.add({
            type: Track,
            name: name
        });

        this.tracks.push(track);

        return track;
    },

    getTrack: function(name) {
        for (var i = 0; i < this.tracks.length; i++) {
            if (this.tracks[i].name == name) {
                return this.tracks[i];
            }
        }
        return null;
    },

    doLayout: function() {
        if (this.tracks.length == 0) {
            return;
        }

        this.x = 0;
        this.y = 0;
        this.width = this._parent.width;
        this.height = this._parent.height;

        var y = 0;
        var h = this.height / this.tracks.length;


        h = 30;
        this.tracks.each(function(track) {
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
        this.tracks.each(function(track) {
            track.updateTime(time);
        }, this);
    }
});
