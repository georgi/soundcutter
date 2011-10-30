var Clip = function(options) {
  _.extend(this, {
    startTime : 0,
    sampleRate : 44100,
    duration : 0,
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

  this.canvas.attr('height', 100);

  this.element.mousedown(_.bind(this.onMouseDown, this));

  this._onDrag = _.bind(this.onDrag, this);
  this._onDragEnd = _.bind(this.onDragEnd, this);

  if (this.arrayBuffer) {
    setTimeout(_.bind(this.setBuffer, this, this.arrayBuffer), 100);
  }
};

Clip.prototype = {

  setSampleRange: function(start, length) {
    this.offset = start;
    this.duration = length;
    this.updateElement();
  },
  
  pixelsPerSecond: function() {
    return this.application.pixelsPerSecond();
  },

  updateAudio: function(context) {
    if (this.wave) {
      if (!this.playing && 
          context.time + context.interval >= this.startTime && 
          context.time + context.interval < this.startTime + this.duration) {

        this.source = this.context.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.destination);

        // this.source.noteOn(context.startTime + this.startTime);

        var offset = this.offset;
        var duration = this.duration;

        if (context.time > this.startTime) {
          offset += context.time - this.startTime;
          duration -= context.time - this.startTime;
        }

        console.log(offset, duration);


        this.source.noteGrainOn(context.startTime + this.startTime, offset, duration - 0.1);
        // this.source.noteGrainOn(context.startTime + this.startTime, this.offset, this.duration);
        this.playing = true;
      }

      if (this.playing && context.time + context.interval >= this.startTime + this.duration) {
        this.source.noteOff(context.startTime + this.startTime + this.duration);
        this.playing = false;
        this.source = null;
      }
    }
  },

  updateElement: function() {
    this.element.css('left', this.startTime * this.pixelsPerSecond());
    this.element.width(this.duration * this.pixelsPerSecond());
    this.canvas.css('left', -this.offset * this.pixelsPerSecond());
  },

  updateGraphics: function() {
    this.draw();
    this.updateElement();
  },

  // play: function(context) {
  //   if (context.time > this.startTime && context.time < this.startTime + this.duration) {
  //     var offset = context.time - this.startTime;
  //     this.source.noteGrainOn(context.startTime + this.startTime, this.offset + offset, this.duration - offset);
  //     this.playing = true;
  //   }
  // },

  stop: function() {
    this.source.noteOff(0);
    this.source = null;
    this.playing = false;
  },

  setBuffer: function(buffer) {
    this.buffer = this.context.createBuffer(buffer, false);
    this.wave = new Int16Array(buffer);
    if(this.duration === 0) {      
      this.duration = this.wave.length / this.sampleRate / 2;
    }
    this.updateElement();
    this.draw();
  },

  draw: function() {
    var context = this.canvas.get(0).getContext("2d"),
        wave = this.wave,
        width = (this.wave.length / this.sampleRate) * this.pixelsPerSecond(),
        height = 100,
        yscale = height / 65536 * 2,
        ymid = height / 2,
        xstep = parseInt(this.sampleRate * 2 / this.pixelsPerSecond());

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

  select: function() {
    this.selected = this.selected ? false : true;    
    var style = this.selected ? {'border' : '1px dashed red'} : {'border':'1px solid #EEE'};
    this.element.css(style);
  },
  
  onMouseDown: function(event) {
    this.drag = {
      target: event.target.className,
      startTime: this.startTime,
      offset: this.offset,
      duration: this.duration,
      pageX: event.pageX
    };

    this.select();    
    
    $(document).bind('mousemove', this._onDrag);
    $(document).bind('mouseup', this._onDragEnd);
  },

  onDrag: function(event) {
    var delta = (event.pageX - this.drag.pageX) / this.pixelsPerSecond();

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
    this.duration = Math.min(this.duration, this.wave.length / this.sampleRate / 2);
  },
  
  clone: function(options) {
    return new Clip(_.extend({ 
      context: this.context,
      application: this.application,
      destination: this.destination,
      duration: this.duration,
      startTime: this.startTime,
      offset: this.offset,
      arrayBuffer: this.arrayBuffer
    }, options));
  }

};