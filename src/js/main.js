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
  // ORDER + BLOGGER
  //////////

  // store global state
  var collectData = {
    orderFrom: "",
    orderTo: "",
    orderStartDay: "",
    orderEndDay: "",
    orderWho: "",
    trendsetter: ""
  }

  // hide blogger screen
  $('[js-goTo-order]').on('click', function(){
    $('.order-bloger').addClass('is-removed')
  });

  // Blogger trendsetter
  if ( getUrlParameter('blogger') ){
    var parseTrendsetter = getUrlParameter('blogger').replace(/\+/g, '%20');
    parseTrendsetter = decodeURIComponent(parseTrendsetter);
    $('[js-paste-trendsetter]').html(parseTrendsetter)
    collectData.trendsetter = parseTrendsetter;
  }

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
    // var locationData = $(this).data('location');
    var closestAction = $(this).closest('.action');
    var linkedInput = $('.order__input[data-action='+closestAction.data('action')+']');
    closestAction.removeClass('is-active');

    linkedInput.addClass('is-filled').removeClass('has-error');
    linkedInput.find('span:first-child').html( $(this).find('span:nth-child(2)').html() );
    linkedInput.find('span:last-child').html( $(this).find('span:nth-child(1)').html() );

    // update global state
    if ( closestAction.data('action') == "order-from" ){
      collectData.orderFrom = $(this).find('span:nth-child(1)').html() ;
    } else if (closestAction.data('action') == "order-to" ){
      collectData.orderTo = $(this).find('span:nth-child(1)').html() ;
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
        collectData.orderStartDay = date[0].yyyymmdd()
      }

      if ( date[1] ){
        var endDateStr = date[1].getDate() + " " + formatMonth(date[1].getMonth());;

        $('[js-paste-end-date]').html(endDateStr).addClass('is-ready');
        collectData.orderEndDay = date[1].yyyymmdd()
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
      $('[js-paste-date-summary]').closest('[js-action]').addClass('is-filled').removeClass('has-error');;
      $(this).closest('.action').removeClass('is-active');
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
      linkedInput.addClass('is-filled').removeClass('has-error');;

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
    if ( collectData.orderFrom && collectData.orderTo && collectData.orderStartDay && collectData.orderWho ){
      $('.order-name').addClass('is-active');
    } else {
      // validation

      if ( !collectData.orderFrom ){
        $('[js-action][data-action=order-from]').addClass('has-error');
      }
      if ( !collectData.orderFrom ){
        $('[js-action][data-action=order-to]').addClass('has-error');
      }
      if ( !collectData.orderStartDay ){
        $('[js-action][data-action=order-date]').addClass('has-error');
      }
      if ( !collectData.orderWho ){
        $('[js-action][data-action=order-who]').addClass('has-error');
      }
    }

    e.preventDefault();
  });


  // ORDER NAME FORM
  $('[js-validate-order-name]').on('submit', function(e){
    var input = $(this).find('input').val();

    if ( input && input.length > 5 ){
      // validate with instagramm api ?

      // if all good -- show form and booking number
      console.log(collectData)

      $.ajax({
        url: "https://aws-test.relonch.com/api/1.0/rent/inst",
        type: 'POST',
        data: {
          start_day: collectData.orderStartDay, //yyyymmdd format
          end_day: collectData.orderEndDay, //yyyymmdd format
          name: input, // instagram nickname
          trendsetter: collectData.trendsetter, //
          from: collectData.orderFrom, // city
          to: collectData.orderTo, // city
          who: collectData.orderWho
        },
        dataType: 'json',
      }).done(function(res) {
        console.log('got responce from api', res)
        $('.order-number').addClass('is-active');
        // var orderNumber = Math.floor(1000 + Math.random() * 9000);
        var orderNumber = res.result;
        $('[js-paste-booking-number]').text(orderNumber);
        $('[js-copy-clipboard]').attr('data-clipboard-text', orderNumber.toString());

      });

    } else {
      $(this).find('input').addClass('has-error')
    }

    e.preventDefault();
  });

  // COPY OT CLIPBOARD
  var clipboard = new Clipboard('[js-copy-clipboard]');

  clipboard.on('success', function(e) {
    alert('Order number Copied: ' + e.text + '. Please refer back to instagramm');

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

  Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

  function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
      sURLVariables = sPageURL.split('&'),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
          return sParameterName[1] === undefined ? true : sParameterName[1];
      }
    }
  };


});
