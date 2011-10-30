
$(document).ready(function() {
  $('.slider').slider({
    slide: function(ui) {
      Application.pixelsPerBeat = ui.value;
      Application.updateGraphics();
    }
  });
});