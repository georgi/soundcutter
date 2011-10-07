var Clip = function(options) {
  $.set(this, options);

  this.startTime = 0;
  this.sampleRate = 44100;
  this.sampleLength = 0;
  this.sampleStart = 0;
  this.playing = false;
  this.source = this.context.createBufferSource();
  this.source.connect(this.context.destination);

  this.element = $('<div class="clip"><div class="left-handle"></div><div class="canvas-clip"><canvas></canvas></div><div class="right-handle"></div></div>');
  this.canvas = this.element.find('canvas');
  this.canvasClip = this.element.find('.canvas-clip');
  this.leftHandle = this.element.find('.left-handle');
  this.rightHandle = this.element.find('.right-handle');

  this.canvas.attr('height', 100);

  this.canvas.mousedown(this.onMouseDown.bind(this, 'move'));
  this.leftHandle.mousedown(this.onMouseDown.bind(this, 'left'));
  this.rightHandle.mousedown(this.onMouseDown.bind(this, 'right'));

  this._onDrag = this.onDrag.bind(this);
  this._onDragEnd = this.onDragEnd.bind(this);
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

  setBuffer: function(buffer) {
    this.source.buffer = this.context.createBuffer(buffer, false);
    this.wave = new Int16Array(buffer);
    this.sampleLength = this.wave.length;
    this.updateElement();
    this.draw();
  },

  draw: function() {
    var context = this.canvas.get(0).getContext("2d");
    var wave = this.wave;
    var width = (this.wave.length / this.sampleRate) * this.pixelsPerSecond;
    var height = 100;
    var yscale = height / 65536 * 2;
    var ymid = height / 2;
    var xstep = parseInt(this.sampleRate / this.pixelsPerSecond);d

    this.canvas.attr('height', height);
    this.canvas.attr('width', width);

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#666";
    context.beginPath();
    context.moveTo(0, ymid);

    for (var i = 0; i < width; i++) {
      context.lineTo(i, ymid + wave[i * xstep] * yscale);
    }

    context.stroke();
  },

  onMouseDown: function(type, event) {
    this.drag = {
      type: type,
      startTime: this.startTime,
      sampleStart: this.sampleStart,
      sampleLength: this.sampleLength,
      pageX: event.pageX
    };

    $(document).bind('mousemove', this._onDrag);
    $(document).bind('mouseup', this._onDragEnd);
  },

  onDrag: function(event) {
    var deltaX = event.pageX - this.drag.pageX;

    switch (this.drag.type) {
    case 'move':
      this.startTime = this.drag.startTime + deltaX / this.pixelsPerSecond;
      this.checkBounds();
      break;

    case 'left':
      this.startTime = this.drag.startTime + deltaX / this.pixelsPerSecond;
      this.sampleStart = this.drag.sampleStart + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      this.sampleLength = this.drag.sampleLength - (deltaX / this.pixelsPerSecond) * this.sampleRate;
      this.checkBounds();
      break;

    case 'right':
      this.sampleLength = this.drag.sampleLength + (deltaX / this.pixelsPerSecond) * this.sampleRate;
      this.checkBounds();
      break;
    }

    this.updateElement();
    this.element.trigger('drag', event);
  },

  onDragEnd: function(event) {
    $(document).unbind('mousemove', this._onDrag);
    $(document).unbind('mouseup', this._onDragEnd);
  },

  updateElement: function() {
    this.element.css('left', this.startTime * this.pixelsPerSecond);
    this.canvasClip.width((this.sampleLength / this.sampleRate) * this.pixelsPerSecond);
    this.element.width(this.leftHandle.width() + this.canvasClip.width() + this.rightHandle.width());
  },

  checkBounds: function() {
    this.startTime = Math.max(0, this.startTime);
    this.sampleStart = Math.max(0, this.sampleStart);
    this.sampleLength = Math.min(this.sampleLength, this.wave.length);
  }

};