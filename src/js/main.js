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

  var collectData = {
    orderFrom: "",
    orderTo: "",
    orderDate: "",
    orderWho: ""
  }

  // autocompleate
  $('[js-search-autocompleate]').on('keyup', function(e){
    var curVal = $(this).val();
    // var searchUrl = "https://maps.googleapis.com/maps/api/place/autocomplete/xml?input="+curVal+"&types=address&key=AIzaSyARV4GddkVojvH-Xt-wXay2ZTM2hnpVdBs"
    // var iataCodes = {
    //   url: "http://iatacodes.org/api/v6",
    //   endpioint: "autocomplete?query="+curVal+"",
    //   key: "0057b314-ac37-41df-ba78-d167ae99f25f"
    // }
    // var searchUrl = iataCodes.url + "/" + iataCodes.endpioint + "?api_key=" + iataCodes.key
    searchUrl = "http://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=yaTbPeg2zvnWJiiQNU9eFlV3gSAPGXYo&term="+curVal+"";
    if ( curVal && curVal != "" ){
      $.ajax({
        url: searchUrl,
        type: 'GET',
        dataType: 'json',
      }).done(function(res) {
        console.log('got responsive from api', res)
        $('.destination-results__card').remove();
        $.each(res, function(i, val){
          var appendedEl = "<div class='destination-results__card' data-location="+val.value+"><span>"+val.label+"</span><span>"+val.value+"</span> </div>"
          $('.destination-results').append(appendedEl)
        })
      });
    }
    // https://sandbox.amadeus.com/travel-innovation-sandbox/apis/get/airports/autocomplete
    // https://www.programmableweb.com/api/amadeus-airport-autocomplete
    // https://www.air-port-codes.com
  });


  $('.destination-results').on('click', '.destination-results__card', function(){
    var locationData = $(this).data('location');
    var closestAction = $(this).closest('.action');
    var linkedInput = $('.order__input[data-action='+closestAction.data('action')+']');
    closestAction.removeClass('is-active');

    linkedInput.addClass('is-filled');
    linkedInput.find('span:first-child').html( $(this).find('span:nth-child(2)').html() );
    linkedInput.find('span:last-child').html( $(this).find('span:nth-child(1)').html() );

    // update global state
    collectData.orderFrom = locationData;
  });

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
    range: true,
    onSelect: function(formattedDate, date, inst){
      console.log(date);
      if ( date[0] ){
        var startDateStr = date[0].getDate() + " " + formatMonth(date[0].getMonth());

        $('[js-paste-start-date]').html(startDateStr);
      }

      if ( date[1] ){
        var endDateStr = date[1].getDate() + " " + formatMonth(date[1].getMonth());;

        $('[js-paste-end-date]').html(endDateStr);
      }

      if ( date[0] && date[1] ){
        var timeDiff = Math.abs(date[1].getTime() - date[0].getTime());
        var calcDaysStr = Math.ceil(timeDiff / (1000 * 3600 * 24)) + " days"; 

        $('[js-calc-days]').html(calcDaysStr);
      }
    }
  });

  function formatMonth(date){
    var formatedStr;
    console.log(date)
    switch(date){
      case 0:
        formatedStr = "Jan"
        break;
      case 1:
        formatedStr = "Feb"
        break;
      case 2:
        formatedStr = "Mar"
        break;
      case 3:
        formatedStr = "Apr"
        break;
      case 4:
        formatedStr = "May"
        break;
      case 5:
        formatedStr = "Jun"
        break;
      case 6:
        formatedStr = "Jul"
        break;
      case 7:
        formatedStr = "Aug"
        break;
      case 8:
        formatedStr = "Sep"
        break;
      case 9:
        formatedStr = "Oct"
        break;
      case 10:
        formatedStr = "Nov"
        break;
      case 11:
        formatedStr = "Dec"
        break;
      default:
        break;
    }
    return formatedStr;
  }

});
