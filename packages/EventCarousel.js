

(function ($) {

    $(document).ready(function () {
        $('.owl-carousel').each(function () {
            if ($(this).data('owl.carousel')) {
                return;
            }

            var items = parseInt($(this).attr('data'), 10);
            var itemsTablet = parseInt($(this).attr('data-items-tablet'), 10);
            var itemsPhone = parseInt($(this).attr('data-items-phone'), 10);
            var loopStatus = $(this).attr('loopstatus') == "1" ? true : false;
            var show_arrows = $(this).attr('show_arrows') == "on" ? true : false;
            var show_arrows_phone = "";
            var show_arrows_tablet = ""; //$(this).attr('show_arrows_tablet')=="off" || $(this).attr('show_arrows_tablet') == "" ? false:true;
            var show_more = $(this).attr('show_arrows_phone') == "" ? true : false;

            if ($(this).attr('show_arrows_phone') == "on" || $(this).attr('show_arrows_phone') == "" && $(this).attr('show_arrows') == "on") {
                show_arrows_phone = true;
            }
            if ($(this).attr('show_arrows') == "off" && $(this).attr('show_arrows_phone') == "on") {
                show_arrows_phone = true;
            }
            if ($(this).attr('show_arrows') == "on" && $(this).attr('show_arrows_phone') == "off") {
                show_arrows_phone = false;
            }
            if ($(this).attr('show_arrows') == "off" && $(this).attr('show_arrows_phone') == "") {
                show_arrows_phone = false;
            }
            if ($(this).attr('show_arrows_tablet') == "on" || $(this).attr('show_arrows_tablet') == "" && $(this).attr('show_arrows') == "on") {
                show_arrows_tablet = true;
            }
            if ($(this).attr('show_arrows') == "off" && $(this).attr('show_arrows_tablet') == "on") {
                show_arrows_tablet = true;
            }
            if ($(this).attr('show_arrows') == "on" && $(this).attr('show_arrows_tablet') == "off") {
                show_arrows_tablet = false;
            }
            if ($(this).attr('show_arrows') == "off" && $(this).attr('show_arrows_tablet') == "") {
                show_arrows_tablet = false;
            }

            // else{
            //    show_arrows_phone=true;
            // }
            //var show_arrows_phone = $(this).attr('show_arrows_phone')=="on" || $(this).attr('show_arrows_phone')!="undefined" ? true:$(this).attr('show_arrows')=="off" && $(this).attr('show_arrows_phone') =="on" ?true:$(this).attr('show_arrows')=="on" || $(this).attr('show_arrows_phone') =="off"?false:true;
            var show_control = $(this).attr('show_control') == "on" ? true : false;
            var autoplay = $(this).attr('data-autoplay') == "on" ? true : false;
            var hoverpause = $(this).attr('data-hoverpause') == "on" ? false : true;
            var mousedrag = $(this).attr('data-mouse-drag') == "on" ? true : false;
            var touchdrag = $(this).attr('data-touch-drag') == "on" ? true : false;
            var autowidth = $(this).attr('data-auto-width') == "on" ? true : false;
            var prev_link = $(this).attr('prev_link') || 'Previous';
            var next_link = $(this).attr('next_link') || 'Next';
            var columns_type = $(this).attr('columns_type');
            var layoutType = $(this).attr('data-layout') || '';
            if (layoutType !== 'list') {
            if (columns_type == "1" && ($(this).attr('image_align') == "topimage_bottomdetail" || $(this).attr('image_align') == "leftimage_rightdetail" || $(this).attr('image_align') == "rightimage_leftdetail")) {
                items = 1;
            }
            if (columns_type == "2" && ($(this).attr('image_align') == "topimage_bottomdetail" || $(this).attr('image_align') == "leftimage_rightdetail" || $(this).attr('image_align') == "rightimage_leftdetail")) {
                items = 2;
            }
            }

            var rewind = $(this).attr('data-rewind') == "on" ? true : false;
            //var loop = loopStatus == 'on' ? true : false;
            var slideby = $(this).attr('data-slide-by');
            var autoplay_speed = $(this).attr('data-autoplaytimeout');
            var lazyload = $(this).attr('data-lazy-load') == "on" ? true : false;
            if (isNaN(items) || items < 1) {
                items = 3;
            }
            if (isNaN(itemsTablet) || itemsTablet < 1) {
                itemsTablet = 2;
            }
            if (isNaN(itemsPhone) || itemsPhone < 1) {
                itemsPhone = 1;
            }

          var buttonAlign = $(this).attr('data-button-align') === 'true';
          var itemsCount = parseInt(items, 10) || 1;
          var useAutoHeight = !buttonAlign && itemsCount <= 1;
          var equalizeCarouselCards = function($carousel) {
                var $cards = $carousel.find('.owl-item:not(.cloned) .event-container.button-align-enabled, .owl-item:not(.cloned) > .ecs-event-posts.event-container.button-align-enabled');
                if (!$cards.length) {
                    return;
                }
                $cards.css({ height: 'auto', minHeight: '' });
                var rows = {};
                $cards.each(function() {
                    var $item = $(this).closest('.owl-item');
                    var top = Math.round($item.position().top || 0);
                    if (!rows[top]) {
                        rows[top] = $();
                    }
                    rows[top] = rows[top].add($(this));
                });
                $.each(rows, function(_, $group) {
                    var maxHeight = 0;
                    $group.each(function() {
                        maxHeight = Math.max(maxHeight, $(this).outerHeight());
                    });
                    if (maxHeight > 0) {
                        $group.css({ minHeight: maxHeight + 'px', height: maxHeight + 'px' });
                    }
                });
            };

            $(this).owlCarousel({
                autoplay: autoplay,
                autoplayHoverPause: hoverpause,
                items: items,
                margin: 0,
                //transitionStyle : "fade",
                loop: loopStatus,
                merge: false,
                autoHeight: useAutoHeight,
                nav: show_arrows,
                navText: [
                    '<span class="screen-reader-text">' + prev_link + '</span>',
                    '<span class="screen-reader-text">' + next_link + '</span>'
                ],
                dots: show_control,
                mouseDrag: mousedrag,
                touchDrag: touchdrag,
                autoplayTimeout: autoplay_speed,
                lazyLoad: true,
                responsive: {
                    980: {
                        items: items,
                        margin: 0,
                        nav: show_arrows,
                        dots: show_control,
                        mouseDrag: mousedrag,
                        touchDrag: touchdrag,
                        autoHeight: useAutoHeight,

                    },
                    767: {
                        items: itemsTablet,
                        margin: 0,
                        nav: show_arrows_tablet,
                        dots: show_control,
                        autoplay: autoplay,
                        mouseDrag: mousedrag,
                        touchDrag: touchdrag,
                    },
                    0: {
                        nav: show_arrows_phone,
                        items: itemsPhone,
                        margin: 0,
                        autoplay: autoplay,
                    }
                }
            }).on('initialized.owl.carousel refreshed.owl.carousel resized.owl.carousel changed.owl.carousel', function() {
                if (buttonAlign) {
                    equalizeCarouselCards($(this));
                }
            });

        });
    });
})(jQuery);
