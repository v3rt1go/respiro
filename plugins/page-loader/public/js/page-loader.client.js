(function() {
  'use strict';
  /* ---------------------------------------------- /*
	 * Preloader
	/* ---------------------------------------------- */

	$(window).load(function() {
		$('.loader').fadeOut();
		$('.page-loader').delay(150).fadeOut('slow');
	});
}());
