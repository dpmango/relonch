$(document).ready(function(){

  //////////
  // Global variables
  //////////

  var _window = $(window);
  var _document = $(document);

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
    // $('.mobile-navi').toggleClass('is-active');
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

  // store global state
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
        console.log('got responce from api', res)
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

  // create placeholder and close current dialog
  $('.destination-results').on('click', '.destination-results__card', function(){
    var locationData = $(this).data('location');
    var closestAction = $(this).closest('.action');
    var linkedInput = $('.order__input[data-action='+closestAction.data('action')+']');
    closestAction.removeClass('is-active');

      linkedInput.addClass('is-filled');
    linkedInput.find('span:first-child').html( $(this).find('span:nth-child(2)').html() );
    linkedInput.find('span:last-child').html( $(this).find('span:nth-child(1)').html() );

    // update global state
    if ( closestAction.data('action') == "order-from" ){
      collectData.orderFrom = locationData;
    } else if (closestAction.data('action') == "order-to" ){
      collectData.orderTo = locationData;
    }
  });

  // Datepicker
  $('[js-datepicker]').datepicker({
    inline: true,
    minDate: new Date(),
    language: 'en',
    multipleDates: 2,
    range: true,
    onSelect: function(formattedDate, date, inst){
      if ( date[0] ){
        var startDateStr = date[0].getDate() + " " + formatMonth(date[0].getMonth());

        $('[js-paste-start-date]').html(startDateStr).addClass('is-ready');
      }

      if ( date[1] ){
        var endDateStr = date[1].getDate() + " " + formatMonth(date[1].getMonth());;

        $('[js-paste-end-date]').html(endDateStr).addClass('is-ready');
      }

      if ( date[0] && date[1] ){
        var timeDiff = Math.abs(date[1].getTime() - date[0].getTime());
        var calcDaysStr = Math.ceil(timeDiff / (1000 * 3600 * 24)) + " days";

        $('[js-calc-days]').html(calcDaysStr);
      }
    }
  });

  // set date to placeholder and close dialog
  $('[js-apply-date]').on('click', function(){
    var startDate = $('[js-paste-start-date].is-ready').html();
    var endDate = $('[js-paste-end-date].is-ready').html();

    if ( startDate ){ $('[js-paste-date-summary] span:first-child').html(startDate) }

    if ( endDate ){ $('[js-paste-date-summary] span:last-child').html(endDate) }

    if ( startDate || endDate ){
      $('[js-paste-date-summary]').closest('[js-action]').addClass('is-filled');
      $(this).closest('.action').removeClass('is-active');

      collectData.orderDate = "from " + startDate + " - to " + endDate
    }
  });

  // set who placeholder and close dialog
  $('[js-select-who]').each(function(i,val){
    var self = $(val);

    self.on('click', function(e){
      var selectedOption = self.data('option');
      var closestAction = $(this).closest('.action');
      var linkedInput = $('.order__input[data-action='+closestAction.data('action')+']');
      closestAction.removeClass('is-active');
      linkedInput.addClass('is-filled');

      if ( selectedOption ){
        self.siblings().removeClass('is-active');
        self.addClass('is-active');
        linkedInput.find('.order__input-data span').html(selectedOption)
        collectData.orderWho = selectedOption;
      }
    })
  })

  // handle outside click
  $('[js-closable-wrapper]').on('click', function(e){
    if ( $(this).is(e.target) ){
      $(this).parent().removeClass('is-active');
    }
  })

  // form submit handler
  $('[js-process-booking]').on('click', function(e){
    // do some valdation
    if ( collectData.orderFrom && collectData.orderTo && collectData.orderDate && collectData.orderWho ){
      alert("Send to API:" + JSON.stringify(collectData) );
      $('.order-name').addClass('is-active');

    } else {
      alert('Whoops.. you must fill in all data')
    }

    e.preventDefault();
  });


  // ORDER NAME FORM
  $('[js-validate-order-name]').on('submit', function(e){
    var input = $(this).find('input').val();

    if ( input && input.length > 5 ){
      // validate with instagramm api ?

      // if all good -- show form and booking number
      $('.order-number').addClass('is-active');

      // should this parsed from API?
      var orderNumber = Math.floor(1000 + Math.random() * 9000);
      $('[js-paste-booking-number]').text(orderNumber);
      $('[js-copy-clipboard]').attr('data-clipboard-text', orderNumber.toString());

    } else {
      alert('please enter your nickname');
    }

    e.preventDefault();
  });

  // COPY OT CLIPBOARD
  var clipboard = new Clipboard('[js-copy-clipboard]');

  clipboard.on('success', function(e) {
    alert('copied ' + e.text + '. Redirect somewhere else?');

    // console.info('Action:', e.action);
    // console.info('Text:', e.text);
    // console.info('Trigger:', e.trigger);
    // e.clearSelection();
  });




  ////////////////////
  // UTILITIES
  ////////////////////

  function formatMonth(date){
    var formatedStr;
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
