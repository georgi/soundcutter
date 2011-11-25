var Track = function(options) {
  _.extend(this, options);

  this.clips = [];

  this.output = this.context.createGainNode();
  this.output.connect(this.context.destination);

  this.element = $('<div class="track"></div>');
  this.canvas = $('<canvas class="canvas"></canvas>');
  this.title = $('<div class="title"></div>');

  this.title.html(this.name);

  $('#arrangement').append(this.element);

  this.element.height(this.application.trackHeight + 20);
  this.element.append(this.title);
  this.element.append(this.canvas);
  this.draw();
};

Track.prototype = {

  draw: function() {
    var context = this.canvas.get(0).getContext("2d"),
        width = this.element.width(),
        height = this.application.trackHeight,
        xstep = this.application.pixelsPerStep,
        beats = this.application.beatCount;
    
    this.canvas.attr('height', height);
    this.canvas.attr('width', width);

    context.clearRect(0, 0, width, height);
    context.strokeStyle= "#666";
    context.lineWidth = 0.2;

    for (var x = 0; x < width; x += xstep) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
  },

  createClip: function(options) {
    var clip = new Clip(_.extend({ 
      context: this.context,
      application: this.application,
      destination: this.output
    }, options));

    this.addClip(clip);

    return clip;
  },

  addClip: function(clip) {
    clip.track = this;
    this.clips.push(clip);
    this.element.append(clip.element);
    clip.updateElement();
  }

};

