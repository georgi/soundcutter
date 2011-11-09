var Clip = function(options) {
  _.extend(this, {
    startTime : 0,
    duration : options.buffer ? options.buffer.duration : 0,
    offset : 0,
    playing : false,
    selected : false
  }, options);
  
  this.element = $('<div class="clip"></div>');
  this.canvas = $('<canvas class="canvas"></canvas>');
  this.leftHandle = $('<div class="left-handle"></div>');
  this.rightHandle = $('<div class="right-handle"></div>');
  
  this.element.append(this.leftHandle);
  this.element.append(this.canvas);
  this.element.append(this.rightHandle);

  this.updateElement();

  this.element.mousedown(_.bind(this.onMouseDown, this));
  this.element.mouseover(_.bind(this.onMouseOver, this));
  this.element.mouseleave(_.bind(this.onMouseLeave, this));

  this._onDrag = _.bind(this.onDrag, this);
  this._onDragEnd = _.bind(this.onDragEnd, this);

  if (this.buffer) {
    this.draw();
  }
};

Clip.prototype = {

  setSampleRange: function(start, length) {
    this.offset = start;
    this.duration = length;
    this.updateElement();
  },

  updateAudio: function(context) {
    if (this.buffer) {
      if (!this.playing && 
          context.time + context.secondsPerBeat >= this.startTime && 
          context.time + context.secondsPerBeat < this.startTime + this.duration) {

        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.destination);

        var offset = this.offset;
        var duration = this.duration;

        if (context.time > this.startTime) {
          offset += context.time - this.startTime;
          duration -= context.time - this.startTime;
        }

        this.source.noteGrainOn(context.startTime + this.startTime, offset, duration);
        this.playing = true;
      }

      if (this.playing && context.time + context.secondsPerBeat >= this.startTime + this.duration) {
        this.source.noteOff(context.startTime + this.startTime + this.duration);
        this.playing = false;
        this.source = null;
      }
    }
  },

  updateElement: function() {
    this.element.css('left', this.startTime * this.application.pixelsPerSecond);
    this.element.width(this.duration * this.application.pixelsPerSecond);
    this.canvas.css('left', -this.offset * this.application.pixelsPerSecond);
  },

  updateGraphics: function() {
    this.draw();
    this.updateElement();
  },

  stop: function() {
    if (this.source) {
      this.source.noteOff(0);
      this.source = null;
    }
    this.playing = false;
  },

  draw: function() {
    var context = this.canvas.get(0).getContext("2d"),
        width = (this.buffer.length / this.buffer.sampleRate) * this.application.pixelsPerSecond,
        wave = this.buffer.getChannelData(0),
        height = 98,
        ymid = height / 2,
        xstep = Math.floor(this.buffer.sampleRate / this.application.pixelsPerSecond);

    this.canvas.attr('height', height);
    this.canvas.attr('width', width);

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#666";
    context.beginPath();
    context.moveTo(0, ymid);

    for (var i = 0; i < width; i++) {
      context.lineTo(i, ymid + wave[i * xstep] * height);
    }

    context.stroke();
  },

  select: function() {
    this.element.addClass('selected');
    this.selected = true;
  },
  
  deselect: function() {
    this.element.removeClass('selected');
    this.selected = false;
  },

  onMouseLeave: function(event) {
  },
  
  onMouseOver: function(event) {
  },

  onMouseDown: function(event) {
    this.drag = {
      target: event.target.className,
      startTime: this.startTime,
      offset: this.offset,
      duration: this.duration,
      pageX: event.pageX
    };

    if (this.selected) {
      this.deselect();
    }
    else {
      this.select();    
    }

    $(document).bind('mousemove', this._onDrag);
    $(document).bind('mouseup', this._onDragEnd);
  },

  onDrag: function(event) {
    var delta = (event.pageX - this.drag.pageX) / this.application.pixelsPerSecond;

    switch (this.drag.target) {
    case 'canvas':
      this.startTime = this.drag.startTime + delta;
      break;

    case 'left-handle':
      this.startTime = this.drag.startTime + delta;
      this.offset = this.drag.offset + delta;
      this.duration = this.drag.duration - delta;
      break;

    case 'right-handle':
      this.duration = this.drag.duration + delta;
      break;
    }

    this.checkBounds();
    this.updateElement();
    this.element.trigger('drag', event);
  },

  onDragEnd: function(event) {
    $(document).unbind('mousemove', this._onDrag);
    $(document).unbind('mouseup', this._onDragEnd);
  },

  checkBounds: function() {
    this.startTime = Math.max(0, this.startTime);
    this.offset = Math.max(0, this.offset);
    this.duration = Math.min(this.duration, this.buffer.duration);
  },
  
  clone: function(options) {
    return new Clip(_.extend({ 
      context: this.context,
      application: this.application,
      destination: this.destination,
      duration: this.duration,
      startTime: this.startTime,
      offset: this.offset,
      buffer: this.buffer,
      track: this.track
    }, options));
  }

};
