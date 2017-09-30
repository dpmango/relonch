$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

  function isRetinaDisplay() {
    if (window.matchMedia) {
        var mq = window.matchMedia("only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)");
        return (mq && mq.matches || (window.devicePixelRatio > 1));
    }
  }

  var _mobileDevice = isMobile();
  // detect mobile devices
  function isMobile(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      return true
    } else {
      return false
    }
  }

  //////////
  // COMMON
  //////////

 	// Prevent # behavior
	$('[href="#"]').click(function(e) {
		e.preventDefault();
	});


  // HAMBURGER TOGGLER
  $('.hamburger').on('click', function(){
    $('.hamburger').toggleClass('is-active');
    $('.mobile-navi').toggleClass('is-active');
  });

  //////////
  // ORDER
  //////////

  // opens dialog window
  $('[js-action]').each(function(i,val){
    var self = $(val);

    var action = self.data('action');
    var targetBlock = $('.action[data-action='+action+']');

    if ( action && targetBlock ){
      self.on('click', function(e){
        targetBlock.addClass('is-active');
      })
    }
  })

  $('[js-close]').each(function(i,val){
    var self = $(val);

    self.on('click', function(e){
      self.closest('.action').removeClass('is-active');
    })

  })


  // autocompleate
  $('[js-search-autocompleate]').on('keydown', function(e){
    var curVal = $(this).val();
    // var searchUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/xml?input="+curVal+"&types=address&key=AIzaSyARV4GddkVojvH-Xt-wXay2ZTM2hnpVdBs"
    var iataCodes = {
      url: "http://iatacodes.org/api/v6",
      endpioint: "autocomplete?query="+curVal+"",
      key: "0057b314-ac37-41df-ba78-d167ae99f25f"
    }
    var searchUrl = iataCodes.url + "/" + iataCodes.endpioint + "?api_key=" + iataCodes.key
    console.log(searchUrl)
    // $.ajax({
    //   url: searchUrl,
    //   type: 'GET',
    //   headers: {"Access-Control-Allow-Origin": "*"},
    //   dataType: 'json',
    //   sucsess: function(res) {
    //     console.log(res)
    //   }
    // });
    // https://sandbox.amadeus.com/travel-innovation-sandbox/apis/get/airports/autocomplete
    // https://www.programmableweb.com/api/amadeus-airport-autocomplete
    // https://www.air-port-codes.com
  })
  ////////////
  // UI
  ////////////

  // handle outside click
  $(document).click(function (e) {
    var container = new Array();
    container.push($('.ui-select'));

    $.each(container, function(key, value) {
        if (!$(value).is(e.target) && $(value).has(e.target).length === 0) {
            $(value).removeClass('active');
        }
    });
  });


  // Datepicker
  $('[js-datepicker]').datepicker({
    inline: true,
    minDate: new Date(),
    language: 'en',
    multipleDates: 2,
    range: true
  });

});
