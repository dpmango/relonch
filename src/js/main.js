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
    $('.mobile-navi').toggleClass('is-active');
  });

  $('.order').on('click', function(e){
    $('.hamburger').removeClass('is-active');
    $('.mobile-navi').removeClass('is-active');
  });


  // Viewport units buggyfill

  window.viewportUnitsBuggyfill.init({
    force: true,
    hacks: window.viewportUnitsBuggyfillHacks,
    appendToBody: true
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


  // default is intro
  var showIntro = true;
  setIntro();

  $('[js-goTo-order]').on('click', function(){
    showIntro = false
    setOrder();
    setTimeout(clearAll, 1000);
  });

  function setIntro(){
    // add when loaded
    $('.order-intro').css({
      'transform': 'translate3d(0,-'+0+'px,0)'
    })
    $('.order').css({
      'transform': 'translate3d(0,'+_window.height()+'px,0)'
    })
  }

  function setOrder(){
    $('.order-intro').css({
      'transform': 'translate3d(0,-'+_window.height()+'px,0)'
    })
    $('.order').css({
      'transform': 'translate3d(0,-'+0+'px,0)'
    })
  }

  function clearAll(){
    $('.order-intro').remove();
    $('.order').attr('style', '')
  }
  function resizeToggler(){
    showIntro ? setIntro() : setOrder();
  }

  _window.on('resize', resizeToggler);

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

        if ( action == "order-from" || action == "order-to" ){
          var targetInput = targetBlock.find('input')
          targetInput.focus().val('');
          targetBlock.find('.destination-results__card').remove();
          targetBlock.find('.destination-search').removeClass('is-filled')
        }
      });
    }
  })

  $('[js-close]').each(function(i,val){
    var self = $(val);
    self.on('click touchstart', function(e){
      closeAction(self);
    });
  })

  function closeAction(self){

    // fix for viewport bug with keyboard - timeout for close
    if (
      self.closest('.action').data('action') == "order-from" ||
      self.closest('.action').data('action') == "order-to"
    ){
      self.parent().find('.destination-search input').focusout();
      setTimeout(function(){
        self.closest('.action').removeClass('is-active');
      }, 700)
    } else {
      self.closest('.action').removeClass('is-active');
    }

  }

  // autocompleate
  $('[js-search-autocompleate]').on('keyup', function(e){
    var curVal = $(this).val();
    searchUrl = "https://api.sandbox.amadeus.com/v1.2/airports/autocomplete?apikey=PGjVW0u5Yi3BMPbYnmT30cSzC766J9i0&term="+curVal+"";
    if ( curVal && curVal != "" ){
      $.ajax({
        url: searchUrl,
        type: 'GET',
        dataType: 'json',
      }).done(function(res) {
        $('.destination-results__card').remove();
        $('.destination-results__no').remove();
        if ( res.length > 0 ){
          $.each(res, function(i, val){
            var appendedEl = "<div class='destination-results__card' data-location="+val.value+"><span>"+val.label+"</span><span>"+val.value+"</span> </div>"
            $('.destination-results').append(appendedEl)
          })
        } else {
          var noResultsStr = "<div class=destination-results__no>No matching locations found</div>"
          $('.destination-results').append(noResultsStr)
        }
      });

      $(this).parent().addClass('is-filled');
    } else {
      $(this).parent().removeClass('is-filled')
    }
  });

  // create placeholder and close current dialog
  $('.destination-results').on('click', '.destination-results__card', function(){
    // var locationData = $(this).data('location');
    var closestAction = $(this).closest('.action');
    var linkedInput = $('.order__input[data-action='+closestAction.data('action')+']');
    // closestAction.removeClass('is-active');
    closeAction( closestAction.find('[js-close]') )

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

  // clear typed
  $('.destination-search .ico-close').on('click', function(){
    var parentEl = $(this).parent()
    parentEl.find('input').val('');
    $(this).closest('.action').find('.destination-results__card').remove();
    parentEl.removeClass('is-filled')
  })

  // Datepicker

  var calendarState = {
    currentDate: new Date(),
    rangeFrom: "",
    rangeTo: ""
  }

  function initCalendar(){
    // hide past months
    $('.ui-calendar__month').each(function(i,val){
      if ( yyyymm(calendarState.currentDate) > $(val).data('month') ){
        $(val).addClass('is-hidden');
      }
    });

    // find past and current dates
    $('.ui-calendar__day').each(function(i,val){
      if ( yyyymmdd(calendarState.currentDate) == $(val).data('date') ){
        $(val).addClass('is-current');
      }
      if ( yyyymmdd(calendarState.currentDate) > $(val).data('date') ){
        $(val).addClass('is-disabled');
      }
    });

    $('.ui-calendar__day').on('click', function(){
      var dayData = $(this).data('date');
      var isValid = !$(this).is('.is-disabled')

      if ( dayData && isValid){
        var dayYear = dayData.toString().substring(0,4);
        var dayMonth = formatMonth( parseInt(dayData.toString().substring(4,6)) - 1 );
        var dayMonthRaw = parseInt(dayData.toString().substring(4,6));
        var dayDay = dayData.toString().substring(6,8);
        var dayDate = new Date(dayYear, dayMonthRaw - 1, dayDay);
        var dayStrFormated = dayDay + " " + dayMonth ;


        function resetValues(){
          $('.ui-calendar__day')
            .removeClass('is-selected')
            .removeClass('is-range-from')
            .removeClass('is-range-to')
            .removeClass('is-in-range')

          calendarState.rangeFrom = ""
          calendarState.rangeTo = ""

          $('[js-paste-start-date]').html("START DATE").removeClass('is-ready');
          $('[js-paste-end-date]').html("END DATE").removeClass('is-ready');
          $('[js-calc-days]').html("")
        }

        function setRangeFrom(el){
          $('[js-paste-start-date]').html(dayStrFormated).addClass('is-ready');
          collectData.orderStartDay = dayData
          calendarState.rangeFrom = dayDate

          el.addClass('is-selected').addClass('is-range-from');
        }

        function setRangeTo(el){
          $('[js-paste-end-date]').html(dayStrFormated).addClass('is-ready');
          collectData.orderEndDay = dayData
          calendarState.rangeTo = dayDate

          el.addClass('is-selected').addClass('is-range-to');
        }

        // reset if both selected and it's clicked again
        if ( calendarState.rangeFrom != "" && calendarState.rangeTo != "" ){
          resetValues();
        }

        // not allow select in past
        if ( calendarState.rangeFrom != "" && calendarState.rangeTo == "" ){
          if ( yyyymmdd(calendarState.rangeFrom) > dayData ){
            resetValues();
            setRangeFrom( $(this) );
          }
        }

        // first & second date select operator
        if ( calendarState.rangeFrom == "" ){
          setRangeFrom( $(this) );
        } else if (calendarState.rangeTo == ""){
          setRangeTo( $(this) );
        }

        // calc difference
        if ( calendarState.rangeFrom != "" && calendarState.rangeTo != "" ){
          var timeDiff = Math.abs(calendarState.rangeTo.getTime() - calendarState.rangeFrom.getTime());
          var calcDaysStr = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1 + " days";

          $('[js-calc-days]').html(calcDaysStr);
        }

        // set range
        if ( calendarState.rangeFrom != "" && calendarState.rangeTo != "" ){
          $.each( $('.ui-calendar__day'), function(i,val) {
            var _this = $(val);
            var _thisDate = _this.data('date');
            if ( _thisDate > collectData.orderStartDay && _thisDate < collectData.orderEndDay ){
              _this.addClass('is-in-range')
            }
          });
        }

      }
    })

  }

  initCalendar();

  // set date to placeholder and close dialog
  $('[js-apply-date]').on('click', function(){
    var startDate = $('[js-paste-start-date].is-ready').html();
    var endDate = $('[js-paste-end-date].is-ready').html();

    if ( startDate ){
      $('[js-paste-date-summary] span:first-child').html(startDate);
      if ( !endDate ){
        $('[js-paste-date-summary] span:last-child').html(startDate)
      }
    }

    if ( endDate ){ $('[js-paste-date-summary] span:last-child').html(endDate) }

    if ( startDate || endDate ){
      $('[js-paste-date-summary]').closest('[js-action]').addClass('is-filled').removeClass('has-error');;
    }

    $(this).closest('.action').removeClass('is-active');
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
  });

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
  var formPending = false;
  $('[js-validate-order-name]').on('submit', function(e){
    var name = $('#form_nickname');
    var phone = $('#form_phone');
    var nameValid, phoneValid;

    if ( name.val() && name.val().length > 3 ){
      name.removeClass('has-error')
      nameValid = true
    } else {
      name.addClass('has-error');
      nameValid = false

    }
    if ( phone.val() && phone.val().length > 7 ){
      phone.removeClass('has-error')
      phoneValid = true
    } else {
      phone.addClass('has-error');
      phoneValid = false
    }

    // update orderToDate if empty - same date
    if ( collectData.orderEndDay == "" ){
      collectData.orderEndDay = collectData.orderStartDay
    }

    if ( nameValid && phoneValid){
      // prevent multiple submits
      if ( !formPending ){
        formPending = true
        $.ajax({
          url: "https://aws-test.relonch.com/api/1.0/rent/inst",
          type: 'POST',
          data: {
            start_day: collectData.orderStartDay, //yyyymmdd format
            end_day: collectData.orderEndDay, //yyyymmdd format
            name: name.val(), // instagram nickname
            phone: phone.val(), // phone number from form
            trendsetter: collectData.trendsetter, //
            from: collectData.orderFrom, // city
            to: collectData.orderTo, // city
            who: collectData.orderWho
          },
          dataType: 'json',
        }).done(function(res) {
          console.log(res);
          $('.order-number').addClass('is-active');
          // var orderNumber = Math.floor(1000 + Math.random() * 9000);
          var orderNumber = res.result;
          $('[js-paste-booking-number]').text(orderNumber);
          $('[js-copy-clipboard]').attr('data-clipboard-text', orderNumber.toString());

          formPending = false
        });
      }
    }

    e.preventDefault();
  });

  // COPY OT CLIPBOARD
  var clipboard = new Clipboard('[js-copy-clipboard]');

  clipboard.on('success', function(e) {
    alert('Order number copied');
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

  function yyyymmdd(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    var dd = date.getDate();

    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('');
  };

  function yyyymm(date) {
    var mm = date.getMonth() + 1; // getMonth() is zero-based
    return [date.getFullYear(),
            (mm>9 ? '' : '0') + mm
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
