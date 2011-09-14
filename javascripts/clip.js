var Clip = new Class({
    Extends: Widget,

    initialize: function(options) {        
        Widget.prototype.initialize.call(this, options);

        this.length = 0;
        this.playing = false;
        this.source = this.context.createBufferSource();
        this.source.connect(this.context.destination);
    },    

    updateTime: function(time) {
        return;
        if (this.wave) {
            if (!this.playing && time + 50 >= this.start) {
                this.source.noteOn(this.context.currentTime + this.start - time);
                this.playing = true;
            }
            if (this.playing && time + 50 >= this.start + this.length) {
                this.source.noteOff(this.context.currentTime + this.start + this.length - time);
                this.playing = false;
            }
        }
    },

    setBuffer: function(buffer) {
        this.source.buffer = this.context.createBuffer(buffer, false);
        this.wave = new Int16Array(buffer);
        this.length = this.wave.length / 441000;
    },

    drawCanvas: function(context) {
        context.fillStyle = '#ccc';
        context.fillRect(0, 0, this.width, this.height);

        if (this.wave) {
            var yscale = this.height / 65536 * 2;
            var ymid = this.height / 2;
            var xstep = parseInt(44100 / this.pixelsPerSecond);

            context.fillStyle = "#666";
            context.beginPath();
            context.moveTo(0, ymid);

            for (var i = 0; i < this.width; i++) {
                context.lineTo(i, ymid + this.wave[i * xstep] * yscale);
            }

            context.stroke();
        }

        context.fillStyle = '#000';
        context.font = 'Arial';
        context.fillText(this.name, 10, 10);
    }

});