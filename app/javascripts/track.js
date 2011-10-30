var Track = function(options) {
  _.extend(this, options);

  this.clips = [];

  this.output = this.context.createGainNode();
  this.output.connect(this.context.destination);

  this.element = $('<div id="'+options.name+'" class="track"></div>');
  this.element.width(10000);

  $('#arrangement').append(this.element);
};

Track.prototype = {

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
    this.clips.push(clip);
    this.element.append(clip.element);
  }

};

