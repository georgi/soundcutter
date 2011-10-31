var Track = function(options) {
  _.extend(this, options);

  this.clips = [];

  this.output = this.context.createGainNode();
  this.output.connect(this.context.destination);

  this.element = $('<div id="'+options.name+'" class="track"></div>');
  this.canvas = $('<canvas class="canvas"></canvas>');
  
  $('#arrangement').append(this.element);
  
  this.element.append(this.canvas);
  this.draw();
};

Track.prototype = {

  draw: function() {
    var context = this.canvas.get(0).getContext("2d"),
        width = this.element.width(),
        height = this.element.height(),
        xstep = width / this.application.totalSteps;
    
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
      destination: this.output,
      duration: this.application.secondsPerBeat
    }, options));

    this.addClip(clip);

    return clip;
  },

  addClip: function(clip) {
    this.clips.push(clip);
    this.element.append(clip.element);
  }

};

