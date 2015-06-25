(function() {
  'use strict';
  /* ---------------------------------------------- /*
		 * Scroll 2 top
		/* ---------------------------------------------- */

  $(window).scroll(function() {
    if ($(this).scrollTop() > 100) {
      $('.scroll-up').fadeIn();
    } else {
      $('.scroll-up').fadeOut();
    }
  });

  $('a[href="#totop"]').click(function() {
    $('html, body').animate({
      scrollTop: 0
    }, 'slow');
    return false;
  });
}());
