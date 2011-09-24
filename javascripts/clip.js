var Clip = function(options) {
  $.set(this, options);

  this.startTime = 0;
  this.sampleRate = 44100;
  this.sampleLength = 0;
  this.sampleStart = 0;
  this.playing = false;
  this.source = this.context.createBufferSource();
  this.source.connect(this.context.destination);

  this.element = $('<div class="clip"><canvas></canvas></div>');
  this.canvas = this.element.find('canvas');

  this.element.width(200);
  this.canvas.width(200);

  this.element.mousedown(this.onMouseDown.bind(this));
};

Clip.prototype = {

  length: function() {
    return this.sampleLength / this.sampleRate;
  },

  update: function(time) {
    if (this.wave) {
      if (!this.playing && time + 50 >= this.startTime) {
        this.source.noteOn(this.context.currentTime + this.startTime - time);
        this.playing = true;
      }
      if (this.playing && time + 50 >= this.startTime + this.length()) {
        this.source.noteOff(this.context.currentTime + this.startTime + this.length() - time);
        this.playing = false;
      }
    }
  },

  doLayout: function() {
    this.x = this.startTime * this.pixelsPerSecond;
    this.width = this.length() * this.pixelsPerSecond;
  },

  setBuffer: function(buffer) {
    this.source.buffer = this.context.createBuffer(buffer, false);
    this.wave = new Int16Array(buffer);
    this.sampleLength = this.wave.length;
    this.draw();
  },

  draw: function() {
    var context = this.canvas.get(0).getContext("2d");
    var wave = this.wave;
    var width = this.element.width();
    var height = this.element.height();
    var yscale = height / 65536 * 2;
    var ymid = height / 2;
    var xstep = parseInt(this.sampleRate / this.pixelsPerSecond);
    var offset = this.sampleStart;

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#666";
    context.beginPath();
    context.moveTo(0, ymid);

    for (var i = 0; i < width; i++) {
      context.lineTo(i, ymid + wave[offset + i * xstep] * yscale);
    }

    context.stroke();

    context.strokeRect(0, 0, width, height);
  },

  onTouchDown: function(event) {
    this.drag = {
      startTime: this.startTime,
      sampleStart: this.sampleStart,
      sampleLength: this.sampleLength,
      pageX: event.pageX
    };

    if (event.localX < 20) {
      this.drag.type = 'start';
    }
    else if ((this.width - event.localX) < 20) {
      this.drag.type = 'end';
    }
    else {
      this.drag.type = 'move';
    }

    return true;
  },

  onTouchMove: function(event) {
    var deltaX = event.pageX - this.drag.pageX;

    switch (this.drag.type) {
    case 'move':
      this.startTime = this.drag.startTime + deltaX / this.pixelsPerSecond;
      break;

    case 'start':
      this.startTime = this.drag.startTime + deltaX / this.pixelsPerSecond;
      this.sampleStart = this.drag.sampleStart + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      this.sampleLength = this.drag.sampleLength - (deltaX / this.pixelsPerSecond) * this.sampleRate;
      break;

    case 'end':
      this.sampleLength = this.drag.sampleLength + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      break;
    }

    this.startTime = Math.max(0, this.startTime);
    this.sampleStart = Math.max(0, this.sampleStart);
    this.sampleLength = Math.min(this.sampleLength, this.wave.length);

    if (this.drag.type == 'move') {
      this.fireEvent('move', [this, event]);
    }

    return true;
  }

};