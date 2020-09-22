/*
 *****************************************************
 *	CUSTOM JS DOCUMENT                              *
 *	Single window load event                        *
 *   "use strict" mode on                           *
 *****************************************************
 */
$(window).on('load', function() {

    "use strict";
	
	//----------Choose Option-------------------
	
	$(".app_pickup_location_icons").click(function(){
		$(".app_pickup_location_icons").removeClass("active");
		$(this).addClass("active");
	});
	
	//----------Navbar Open Close--------------
	
	// $(".app_nav_icon").click(function(e){
	// 	  e.stopPropagation();
	// 	$(".app_nav_bar").addClass("active");
	// });
	// $('.app_nav_bar').click(function(e){
	// 	e.stopPropagation();
	// });
	// $('body,html').click(function(e){
	// 	$(".app_nav_bar").removeClass("active");
	// });	
	
	//----------Delivery Pickup Button--------------

	$(".app_delivery_pickup_btn").click(function(){
		$(".app_delivery_pickup_btn").removeClass("active");
		$(this).addClass("active");
	});
	
	//----------Tags Button--------------
	
	$(".app_scroll_button").click(function(){
		$(".app_scroll_button").removeClass("active");
		$(this).addClass("active");
	});
	
	$(".app_scroll_button").click(function(){
		$(".app_scroll_button").removeClass("active");
		$(this).addClass("active");
	});
	
	//----------Review Food Check--------------

	$(".app_the_food_image_icons_right").click(function(){
		$(".app_the_food_image_icons_right").removeClass("active");
		$(this).addClass("active");
	});
	
	//----------Review Food Popup--------------

	$(".app_add_review_btn").click(function(){
		$(".app_the_food_image_section").addClass("active");
		$(".app_popup_overlay").fadeIn();
	});
	
	$(".app_close_popup_img").click(function(){
		$(".app_the_food_image_section").removeClass("active");
		$(".app_popup_overlay").fadeOut();
	});
	
});