var Track = function(options) {
  _.extend(this, options);

  this.clips = [];

  this.output = this.context.createGainNode();
  this.output.connect(this.context.destination);

  this.element = $('<div class="track"></div>');
  this.element.width(10000);

  $('#arrangement').append(this.element);
};

Track.prototype = {

  createClip: function(options) {
    var clip = new Clip(_.extend({ 
      context: this.context,
      pixelsPerSecond: this.pixelsPerSecond,
      destination: this.output 
    }, options));

    this.clips.push(clip);
    this.element.append(clip.element);

    return clip;
  }

}

