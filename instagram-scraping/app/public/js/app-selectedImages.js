// image gallery

$(document).on('each', '.image-checkbox', function(){ 
  if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
      $(this).addClass('image-checkbox-checked');
  }
  else {
      $(this).removeClass('image-checkbox-checked');
  }
});

// sync the state to the input        
$(document).on('click', '.image-checkbox', function (e) {
  $(this).toggleClass('image-checkbox-checked');
  var $checkbox = $(this).find('input[type="checkbox"]');
  $checkbox.prop("checked", !$checkbox.prop("checked"))

  e.preventDefault();
});