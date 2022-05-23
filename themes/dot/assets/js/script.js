	function imgShow(outerdiv, innerdiv, bigimg, _this){  
        var src = _this.attr("src");
        $(bigimg).attr("src", src);

        $("<img/>").attr("src", src).load(function(){  
            var windowW = $(window).width();
            if(window.screen.width<=768){
				var windowH = $(window).height()-85;
			}else{
				var windowH = $(window).height()-105;
			}
            var realWidth = this.width;
            var realHeight = this.height;
            var imgWidth, imgHeight;  
            var scale = 0.9;
              
            if(realHeight>windowH*scale) {
                imgHeight = windowH*scale;
                imgWidth = imgHeight/realHeight*realWidth;
                if(imgWidth>windowW*scale) {
                    imgWidth = windowW*scale;
                }  
            } else if(realWidth>windowW*scale) {
                imgWidth = windowW*scale;
                imgHeight = imgWidth/realWidth*realHeight;
            } else {
                imgWidth = realWidth;  
                imgHeight = realHeight;  
            }  
            $(bigimg).css("width",imgWidth);
              
            var w = (windowW-imgWidth)/2;
            var h = (windowH-imgHeight)/2;
            if(window.screen.width>=768){
				$(innerdiv).css({"top":h, "left":w});
			}
            // $(outerdiv).fadeIn("fast");
			$(outerdiv).show();
        });  
          
        $(outerdiv).click(function(){
            // $(this).fadeOut("fast");  
			$(this).hide();
        });  
    }  
(function ($) {
  'use strict';

  // Background-images
  $('[data-background]').each(function () {
    $(this).css({
      'background-image': 'url(' + $(this).data('background') + ')'
    });
  });


  // Accordions
  $('.collapse').on('shown.bs.collapse', function () {
    $(this).parent().find('.ti-plus').removeClass('ti-plus').addClass('ti-minus');
  }).on('hidden.bs.collapse', function () {
    $(this).parent().find('.ti-minus').removeClass('ti-minus').addClass('ti-plus');
  });


  // match height
  $(function () {
    $('.match-height').matchHeight({
      byRow: true,
      property: 'height',
      target: null,
      remove: false
    });
  });

  // Get Parameters from some url
  var getUrlParameter = function getUrlParameter(sPageURL) {
    var url = sPageURL.split('?');
    var obj = {};
    if (url.length == 2) {
      var sURLVariables = url[1].split('&'),
        sParameterName,
        i;
      for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        obj[sParameterName[0]] = sParameterName[1];
      }
      return obj;
    } else {
      return undefined;
    }
  };

  // Execute actions on images generated from Markdown pages
  var images = $(".content img").not(".inline");
  // Wrap image inside a featherlight (to get a full size view in a popup)
  $(".content img").css("cursor","pointer");
  $(".content img").click(function(){  
	var _this = $(this);//将当前的pimg元素作为_this传入函数  
    imgShow("#outerdiv", "#innerdiv", "#bigimg", _this);  
  }); 
  // images.wrap(function () {
  //   var image = $(this);
  //   if (!image.parent("a").length) {
  //     return "<a href='" + image[0].src + "' data-featherlight='image'></a>";
  //   }
  // });

  // Change styles, depending on parameters set to the image
  images.each(function (index) {
    var image = $(this)
    var o = getUrlParameter(image[0].src);
    if (typeof o !== "undefined") {
      var h = o["height"];
      var w = o["width"];
      var c = o["classes"];
      image.css("width", function () {
        if (typeof w !== "undefined") {
          return w;
        } else {
          return "auto";
        }
      });
      image.css("height", function () {
        if (typeof h !== "undefined") {
          return h;
        } else {
          return "auto";
        }
      });
      if (typeof c !== "undefined") {
        var classes = c.split(',');
        for (i = 0; i < classes.length; i++) {
          image.addClass(classes[i]);
        }
      }
    }
  });


  // tab
  $('.tab-content').find('.tab-pane').each(function (idx, item) {
    var navTabs = $(this).closest('.code-tabs').find('.nav-tabs'),
      title = $(this).attr('title');
    navTabs.append('<li class="nav-item"><a class="nav-link" href="#">' + title + '</a></li>');
  });

  $('.code-tabs ul.nav-tabs').each(function () {
    $(this).find("li:first").addClass('active');
  })

  $('.code-tabs .tab-content').each(function () {
    $(this).find("div:first").addClass('active');
  });

  $('.nav-tabs a').click(function (e) {
    e.preventDefault();
    var tab = $(this).parent(),
      tabIndex = tab.index(),
      tabPanel = $(this).closest('.code-tabs'),
      tabPane = tabPanel.find('.tab-pane').eq(tabIndex);
    tabPanel.find('.active').removeClass('active');
    tab.addClass('active');
    tabPane.addClass('active');
  });



  // search
  $('#search').keyup(function () {
    if (this.value) {
      $(this).addClass('active')
    } else {
      $(this).removeClass('active')
    }
  })
  $('#search').focusout(function () {
    $(this).removeClass('active')
  })
  $('#textChange').click(function() {
    var index;
    $(".hotQues > div").each(function() {
      if($(this).hasClass('d-flex')){
        index = $(this).index();
      }
    })
    if(index < 2){
      $(".hotQues > div").eq(index+1).addClass("d-flex").removeClass('d-none').siblings().removeClass('d-flex').addClass("d-none");
    }else{
      $(".hotQues > div").eq(0).addClass("d-flex").removeClass('d-none').siblings().removeClass('d-flex').addClass("d-none");
    }
  })


	//联系客服
	$(".customer_service").click(function(){
		window.open('http://tb.53kf.com/code/client/10116980/1', 'newwindow', 'height=560, width=700, top=200, left=200, toolbar=no, menubar=yes, scrollbars=yes, resizable=yes,location=yes, status=no')
	})

    if(window.location.pathname == "/domain/30/" || window.location.pathname == "/domain/31/" || window.location.pathname == "/domain/32/" ){
        window.location.href = "/domain/29/";
    }
})(jQuery);