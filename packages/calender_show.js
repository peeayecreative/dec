function forceResize(calendar) {
  try {
    var cal = calendar || window.calendar;
    if (cal && typeof cal.updateSize === 'function') {
      cal.updateSize();
    }
  } catch (e) {}
  // Do NOT trigger window resize here — FullCalendar responds to window resize
  // internally which fires datesRender, causing an infinite loop.
}

function decmSanitizeEventNs(id) {
  return String(id || 'decm').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function decmIsNarrowColumn($moduleRoot) {
  if (!$moduleRoot || !$moduleRoot.length) {
    return (window.innerWidth || screen.width) < 767;
  }
  var $parent = $moduleRoot.parent();
  return $parent.hasClass('et_pb_column_1_3') ||
    $parent.hasClass('et_pb_column_1_4') ||
    $parent.hasClass('et_pb_column_1_5') ||
    $parent.hasClass('et_pb_column_1_6') ||
    (window.innerWidth || screen.width) < 767;
}

/** Resolve weekday column header format (abbreviated / full / narrow). */
function decmResolveWeekdayFormat($moduleRoot, myAjax) {
  var screenWidth = window.innerWidth || screen.width;
  if (decmIsNarrowColumn($moduleRoot) || screenWidth < 767) {
    if (myAjax.day_of_the_week_name_phone) {
      return myAjax.day_of_the_week_name_phone;
    }
    return 'narrow';
  }
  if (screenWidth >= 768 && screenWidth <= 980 && myAjax.day_of_the_week_name_tablet) {
    return myAjax.day_of_the_week_name_tablet;
  }
  return myAjax.day_of_the_week_name || 'short';
}

function decmApplyResponsiveToolbar($calendarMount, $moduleRoot) {
  var narrow = decmIsNarrowColumn($moduleRoot);
  if (narrow) {
    $calendarMount.find('.fc-toolbar').css('display', 'block');
    $calendarMount.find('.fc-day-number').css('font-size', '17px');
    $calendarMount.find('.fc-day-header').css('font-size', '12px');
  } else {
    $calendarMount.find('.fc-toolbar').css('display', 'flex');
    $calendarMount.find('.fc-day-number').css('font-size', '24px');
    $calendarMount.find('.fc-day-header').css('font-size', '15px');
  }
}

/** Format event start/end times with the configured range separator. */
function decmFormatEventTimeRange(myAjax, startTime, endTime) {
  var separator = (myAjax && myAjax.timeRangeSeparator) ? String(myAjax.timeRangeSeparator) : ' - ';
  if (!separator.trim()) {
    separator = ' - ';
  }
  var start = (startTime || '').trim();
  var end = (endTime || '').trim();
  var showEnd = myAjax && (myAjax.calender_end_time === 'on' || myAjax.show_end_time === 'on');
  if (showEnd && end && end !== start) {
    return start + separator + end;
  }
  return start;
}

/** Prefer server-built time range (locale-safe), then fall back to client formatting. */
function decmGetEventTimeDisplay(myAjax, extendedProps) {
  if (!extendedProps) {
    return '';
  }
  if (extendedProps.event_time_range) {
    return extendedProps.event_time_range;
  }
  return decmFormatEventTimeRange(myAjax, extendedProps.event_start_time, extendedProps.event_end_time);
}

function decmSetListItemTime(info, show_calendar_thumbnail, timeText) {
  var $row = jQuery(info.el);
  var $existing = $row.children('.fc-list-item-time').first();
  var html = (show_calendar_thumbnail || '') + (timeText || '');
  if ($existing.length) {
    $existing.html(html);
  } else {
    $row.prepend('<td class="fc-list-item-time fc-widget-content">' + html + '</td>');
  }
}

/** Apply Days-of-the-Week design colors after FC v4 paints the header row. */
function decmApplyDaysOfWeekDesign($calendarMount, myAjax) {
  if (!$calendarMount || !$calendarMount.length || !myAjax) {
    return;
  }
  var $headers = $calendarMount.find('.fc-day-header');
  if (!$headers.length) {
    $headers = $calendarMount.find('th.fc-col-header-cell');
  }
  if (!$headers.length) {
    return;
  }
  if (myAjax.week_background_color) {
    $headers.css('background-color', myAjax.week_background_color);
  }
  if (myAjax.week_font_color) {
    $headers.css('color', myAjax.week_font_color);
    $headers.find('span, a').css('color', myAjax.week_font_color);
  }
}

function decmShowCalendarLoading($calendarMount) {
  $calendarMount.find('.fc-list-empty').remove();
  $calendarMount.find('.fc-view-container').append(
    "<div class='fc-list-empty-wrap2'><div class='fc-list-empty-wrap1'><div class='fc-list-empty'>" +
    "<div class='spinner_calendar'><div class='bounce_calendar1'></div><div class='bounce_calendar2'></div><div class='bounce_calendar3'></div></div>" +
    "Events are loading, please wait...</div></div></div>"
  );
  $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').addClass('ecs_is_loading_check');
}

function decmClearCalendarLoading($calendarMount) {
  $calendarMount.find('.fc-list-empty-wrap2').remove();
  $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').removeClass('ecs_is_loading_check');
}

/** Tooltip container scoped to one calendar module (not the first tbody on the page). */
function decmGetTooltipContainer($calendarMount, $moduleRoot) {
  if ($moduleRoot && $moduleRoot.length) {
    return $moduleRoot.get(0);
  }
  if (!$calendarMount || !$calendarMount.length) {
    return document.body;
  }
  var $tbody = $calendarMount.find('tbody.fc-body');
  if ($tbody.length) {
    return $tbody.get(0);
  }
  return $calendarMount.get(0) || document.body;
}

function decmDisposeCalendarTooltip(calendarMountEl) {
  if (!calendarMountEl || !calendarMountEl.decmTooltipInstance) {
    return;
  }
  try {
    calendarMountEl.decmTooltipInstance.dispose();
  } catch (e) {}
  calendarMountEl.decmTooltipInstance = null;
}

function decmDisposeAllCalendarTooltips() {
  document.querySelectorAll('.decm-calendar-mount[data-decm-config]').forEach(function (mountEl) {
    decmDisposeCalendarTooltip(mountEl);
  });
  if (typeof tooltip !== 'undefined' && tooltip) {
    try {
      tooltip.dispose();
    } catch (e) {}
    tooltip = null;
  }
}

function decmShouldShowCalendarTooltip(myAjax) {
  if (!myAjax) {
    return false;
  }
  var screenWidth = window.innerWidth || screen.width;
  if (screenWidth >= 981) {
    return myAjax.show_tooltip === 'on';
  }
  if (screenWidth >= 767) {
    return myAjax.show_tooltip_tablet === 'on' ||
      ((myAjax.show_tooltip_tablet === '' || myAjax.show_tooltip_tablet === undefined) && myAjax.show_tooltip === 'on');
  }
  return myAjax.show_tooltip_phone === 'on' ||
    ((myAjax.show_tooltip_phone === '' || myAjax.show_tooltip_phone === undefined) && myAjax.show_tooltip === 'on');
}

function decmCreateCalendarTooltip(calendarMountEl, $calendarMount, $moduleRoot, infoEl, html) {
  decmDisposeAllCalendarTooltips();
  if (!infoEl || !html) {
    return;
  }
  calendarMountEl.decmTooltipInstance = new Tooltip(infoEl, {
    title: html,
    html: true,
    delay: { show: 0, hide: 0 },
    placement: 'left',
    trigger: 'manual',
    container: decmGetTooltipContainer($calendarMount, $moduleRoot),
  });
  try {
    calendarMountEl.decmTooltipInstance.show();
  } catch (e) {}
}

function parse12HourTo24(hour, period) {
  var p = period.toLowerCase().replace(/\./g, '');
  if (p.indexOf('p') === 0 && hour !== 12) {
    hour += 12;
  } else if (p.indexOf('a') === 0 && hour === 12) {
    hour = 0;
  }
  return hour;
}

function parseTimeToSeconds(time) {
  if (!time || typeof time !== 'string') {
    return null;
  }
  var trimmed = time.trim();
  if (!trimmed) {
    return null;
  }

  var germanMatch = trimmed.match(/^(\d{1,2})\s*uhr$/i);
  if (germanMatch) {
    var gh = parseInt(germanMatch[1], 10);
    if (gh >= 0 && gh <= 23) {
      return gh * 3600;
    }
    return null;
  }

  // Portuguese / European: "7h", "07h", "7h30", "07h30"
  var hourHMatch = trimmed.match(/^(\d{1,2})\s*h(?:\s*(\d{2}))?$/i);
  if (hourHMatch) {
    var hh = parseInt(hourHMatch[1], 10);
    var hmm = hourHMatch[2] ? parseInt(hourHMatch[2], 10) : 0;
    if (hh >= 0 && hh <= 23 && hmm >= 0 && hmm <= 59) {
      return hh * 3600 + hmm * 60;
    }
    return null;
  }

  var clockMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?$/i);
  if (clockMatch) {
    var h = parseInt(clockMatch[1], 10);
    var m = parseInt(clockMatch[2], 10);
    var s = clockMatch[3] ? parseInt(clockMatch[3], 10) : 0;
    if (clockMatch[4]) {
      h = parse12HourTo24(h, clockMatch[4]);
    }
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return h * 3600 + m * 60 + s;
    }
    return null;
  }

  // "12am", "12 AM", "12 a.m."
  var ampmMatch = trimmed.match(/^(\d{1,2})\s*(a\.?m\.?|p\.?m\.?)$/i);
  if (ampmMatch) {
    var hour12 = parseInt(ampmMatch[1], 10);
    if (hour12 >= 1 && hour12 <= 12) {
      return parse12HourTo24(hour12, ampmMatch[2]) * 3600;
    }
    return null;
  }

  var compactAmPm = trimmed.match(/^(\d{1,2})(am|pm)$/i);
  if (compactAmPm) {
    var hourCompact = parseInt(compactAmPm[1], 10);
    if (hourCompact >= 1 && hourCompact <= 12) {
      return parse12HourTo24(hourCompact, compactAmPm[2]) * 3600;
    }
    return null;
  }

  // 24-hour labels used by FullCalendar in pt, nl, etc.: "7", "07"
  var bareHour = trimmed.match(/^(\d{1,2})$/);
  if (bareHour) {
    var bh = parseInt(bareHour[1], 10);
    if (bh >= 0 && bh <= 23) {
      return bh * 3600;
    }
    return null;
  }

  return null;
}

function isSecondsInRange(seconds, startSec, endSec) {
  if (startSec <= endSec) {
    return seconds >= startSec && seconds <= endSec;
  }
  return seconds >= startSec || seconds <= endSec;
}

function secondsToSlotTime(seconds) {
  var capped = Math.max(0, Math.min(seconds, 86400));
  var h = Math.floor(capped / 3600) % 24;
  var m = Math.floor((capped % 3600) / 60);
  return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m + ':00';
}

function getHiddenSlotTimes(enabled, startPoint, endPoint) {
  var defaults = { slotMinTime: '00:00:00', slotMaxTime: '24:00:00', needsDomHide: false };
  if (enabled !== 'on') {
    return defaults;
  }

  var startSec = parseTimeToSeconds(startPoint);
  var endSec = parseTimeToSeconds(endPoint);
  if (startSec === null || endSec === null) {
    return { slotMinTime: '00:00:00', slotMaxTime: '24:00:00', needsDomHide: true };
  }

  if (startSec === 0 && endSec < 86400 - 1) {
    return {
      slotMinTime: secondsToSlotTime(Math.min(endSec + 3600, 86400)),
      slotMaxTime: '24:00:00',
      needsDomHide: true,
    };
  }

  if (endSec >= 86400 - 3600 && startSec > 0) {
    return {
      slotMinTime: '00:00:00',
      slotMaxTime: secondsToSlotTime(startSec),
      needsDomHide: false,
    };
  }

  return { slotMinTime: '00:00:00', slotMaxTime: '24:00:00', needsDomHide: true };
}

// Per-calendar guard — prevents scheduleHiddenTimeRangeApply from re-entering itself.
// Without this, the call chain was:
//   datesRender → scheduleHiddenTimeRangeApply → setOption('minTime') →
//   FullCalendar re-renders → datesRender → scheduleHiddenTimeRangeApply → ∞
var _hiddenRangeApplyPending = {};

function scheduleHiddenTimeRangeApply(calendar, myAjax, $calContainer) {
  if (!calendar || !myAjax || myAjax.hide_time_range_in_week_day !== 'on') {
    return;
  }
  var pendingKey = calendar.el && calendar.el.id ? calendar.el.id : 'decm';
  // Skip if a call is already queued — prevents stacking on rapid view switches.
  if (_hiddenRangeApplyPending[pendingKey]) {
    return;
  }
  _hiddenRangeApplyPending[pendingKey] = true;

  setTimeout(function () {
    _hiddenRangeApplyPending[pendingKey] = false;

    if (!calendar.view) {
      return;
    }
    var viewType = calendar.view.type;
    if (viewType !== 'timeGridDay' && viewType !== 'timeGridWeek') {
      return;
    }

    // Do NOT call calendar.setOption('minTime/maxTime/scrollTime') here.
    // Those options are already set at calendar initialisation (minTime/maxTime
    // on the Calendar constructor). Calling setOption() during or after a render
    // triggers a full FullCalendar re-render which fires datesRender again,
    // creating the infinite loop seen in the console.

    var $cal = $calContainer && $calContainer.length ? $calContainer : jQuery(calendar.el);
    applyHiddenTimeRange($cal, myAjax.start_point, myAjax.end_point);
    // applyHiddenTimeRange already calls requestAnimationFrame(forceResize).
  }, 100);
}

function applyHiddenTimeRange($container, startPoint, endPoint) {
  if (!$container || !$container.length) {
    return;
  }

  var startSec = parseTimeToSeconds(startPoint);
  var endSec = parseTimeToSeconds(endPoint);
  if (startSec === null || endSec === null) {
    return;
  }

  $container.find('td[data-time]').closest('tr').show();
  $container.find('.fc-axis.fc-time.fc-widget-content span').show();
  $container.find('.fc-axis.fc-time.fc-widget-content').closest('tr').show();

  $container.find('td[data-time]').each(function () {
    var $cell = jQuery(this);
    var rowSec = parseTimeToSeconds($cell.attr('data-time') || '');
    if (rowSec !== null && isSecondsInRange(rowSec, startSec, endSec)) {
      $cell.closest('tr').hide();
    }
  });

  $container.find(
    '.fc-timegrid-slot-label-cushion, .fc-axis.fc-time.fc-widget-content span, .fc-widget-content.fc-axis.fc-time span'
  ).each(function () {
    var $label = jQuery(this);
    var labelSec = parseTimeToSeconds($label.text() || '');
    if (labelSec !== null && isSecondsInRange(labelSec, startSec, endSec)) {
      $label.hide();
      $label.closest('tr').hide();
    }
  });

  // FullCalendar v4 half-hour rows.
  $container.find('tr.fc-minor').each(function () {
    var $row = jQuery(this);
    var rowSec = parseTimeToSeconds($row.attr('data-time') || '');
    if (rowSec !== null && isSecondsInRange(rowSec, startSec, endSec)) {
      $row.hide();
    }
  });

  // FullCalendar v4 keeps a visible 12am row even when minTime is later.
  if (startSec === 0) {
    $container.find('td[data-time="00:00:00"], td[data-time="0:00:00"]').closest('tr').hide();
    $container.find('tr.fc-minor td[data-time="00:00:00"], tr.fc-minor td[data-time="0:00:00"]').closest('tr').hide();
    $container.find('.fc-axis.fc-time span, .fc-timegrid-slot-label-cushion').each(function () {
      var t = jQuery(this).text().trim().toLowerCase().replace(/\s+/g, '');
      if (
        t === '12am' || t === '00uhr' || t === '0uhr' || t === '12:00am' ||
        t === '0' || t === '00' || t === '0h' || t === '00h' || t === '0h00' || t === '00h00'
      ) {
        jQuery(this).closest('tr').hide();
      }
    });
  }

  requestAnimationFrame(function () {
    forceResize();
  });
}

let calendar_html;
var tooltip = null;

jQuery(document).ready(function ($) {
  // D5 multi-calendar pages initialize per mount in decmInitCalendar.
  if (document.querySelectorAll('.decm-calendar-mount[data-decm-config]').length > 0) {
    return;
  }
  if (typeof myAjax === 'undefined') {
    return;
  }


  //   setTimeout(()=>{
  //     jQuery('.fc-day-top.fc-past').each(function () {
  //       // Get the index of the past date column
  //       var pastDateIndex = $(this).index();

  //       // Check the corresponding column in the <tbody> for events
  //       jQuery('tbody tr').each(function () {
  //           // Find the event in the same column as the past date
  //           var eventCell = $(this).find('td').eq(pastDateIndex);

  //           // Check if the event cell has any events
  //           if (eventCell.find('.fc-day-grid-event').length > 0) {
  //               console.log("--Pass--");
  //               // Add a unique class to each event found in the past date column
  //               eventCell.find('.fc-day-grid-event').each(function () {
  //                   jQuery(this).addClass('past-event-unique-class');
  //               });
  //           } else {
  //               console.log("--Fail--");
  //           }
  //       });
  //   });
  // },4500);


  if (jQuery('.fc-right').is(':empty')) {
    jQuery('.fc-right').css("width", "20.5%");
  }

  function handleTabVisibility() {
    if (document.visibilityState === 'visible') {

      // Your existing code here
      setTimeout(function () {
        jQuery(document.body).on("click", 'td.fc-event-container', function () {
          var text = jQuery(this).find('.fc-content .fc-title .fc-calendar-title a').text();
          jQuery("#event_name_input").val(text);
        });

        var info_btn = myAjax.detail_below_calander;
        if (info_btn === 'off') {
          var style = `<style> @media screen and (max-width: 430px) {.fc-body .dec-tooltip{ display: none !important}} </style>`
          style = jQuery(style);
          jQuery("body").append(style);
        } else {
          const CheckCalender = setInterval(function () {
            if (jQuery("a.fc-day-grid-event.fc-h-event").length) {
              clearInterval(CheckCalender)
              setTimeout(function () {
                // Your existing code here
                var style = `<style> div.dec-tooltip.active-event { position: relative !important;transform: inherit !important;visibility: visible !important;will-change: unset !important; display: block !important}@media screen and (max-width: 430px) {div.dec-tooltip { display: none !important; } div#calendar {height: 851px !important;} div.dec-tooltip.active-event { width: 100% !important;} img.attachment-post-thumbnail.size-post-thumbnail.wp-post-image {width: 110px !important;height: 70px !important;object-fit: cover !important;}.tooltip_main {display: flex !important;align-items: end !important;}} </style>`
                style = jQuery(style);
                jQuery("body").append(style);

                jQuery("body").on("click", "a.fc-day-grid-event.fc-h-event", function () {
                  let widthScreen = jQuery(window).width();
                  if (widthScreen < 430) {
                    jQuery(".custom-toolTip").before(jQuery("div.dec-tooltip"))
                    const checkTool = setInterval(function () {
                      if ($("div.dec-tooltip").length) {
                        clearInterval(checkTool)
                        jQuery("div.dec-tooltip").addClass("active-event");
                      }
                    }, 50)
                  }
                });
              }, 100)
            }
          }, 50);
        }
      }, 2000);
    }
  }

  // Attach event listener to detect visibility change
  //  document.addEventListener('visibilitychange', handleTabVisibility);

  // Initial execution
  //  handleTabVisibility();

  // Time Range code start
  var str = myAjax.hide_time_range_in_week_day;

  var hiddenSlots = getHiddenSlotTimes(
    myAjax.hide_time_range_in_week_day,
    myAjax.start_point,
    myAjax.end_point
  );

  if (str === 'on') {
    function processTimeData() {
      if (window.calendar) {
        scheduleHiddenTimeRangeApply(window.calendar, myAjax, jQuery(window.calendar.el));
        return;
      }
      var $calendar = jQuery('#calendar');
      if (!$calendar.length) {
        $calendar = jQuery('.event_calendar_module__inner');
      }
      applyHiddenTimeRange($calendar, myAjax.start_point, myAjax.end_point);
    }

    function handleButtonClick() {
      if ($(this).hasClass('fc-button-active')) {
        setTimeout(processTimeData, 100);
      }
    }

    $('body').on('click', '.fc-timeGridWeek-button.fc-button, .fc-timeGridDay-button.fc-button', handleButtonClick);
    $('body').on('click', '.fc-prev-button.fc-button, .fc-next-button.fc-button', function () {
      if ($('.fc-timeGridWeek-button.fc-button-active, .fc-timeGridDay-button.fc-button-active').length) {
        setTimeout(processTimeData, 100);
      }
    });
  }

  jQuery('.fc-list-empty').remove();
  // Time Range code end
  jQuery('.fc-view-container').append("<div class='fc-list-empty-wrap2'><div class='fc-list-empty-wrap1'><div class='fc-list-empty'><div class='spinner_calendar'><div class='bounce_calendar1'></div><div class='bounce_calendar2'></div><div class='bounce_calendar3'></div></div>Events are loading, please wait...</div></div></div>");
  // jQuery('.fc-button-next span').click(function () {
  //   alert('nextis clicked, do something');
  // });
  //  jQuery('.fc-list-empty').remove();
  jQuery('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').addClass("ecs_is_loading_check");
  //  console.log("Plugin oNE");
  //  console.log("Rafy");
  jQuery(window).on('resize', function () {

    // var screenWidth = jQuery(this).width();
    if (jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true ||
      jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true || jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true || jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true || screen.width < 767) {

      jQuery(".fc-toolbar").css("display", "block");
      jQuery(".fc-day-number").css("font-size", "17px");
      jQuery(".fc-day-header").css("font-size", "12px");


    }
    else {
      jQuery(".fc-toolbar").css("display", "flex");
      jQuery(".fc-day-number").css("font-size", "24px");
      jQuery(".fc-day-header").css("font-size", "15px");
    }
  });
  jQuery('body').on('click', ('button.fc-next-button,button.fc-prev-button'), function () {
    // alert('nextis clicked, do something');
    if (jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true || jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true || jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true || jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true || screen.width < 767) {

      jQuery(".fc-toolbar").css("display", "block");
      jQuery(".fc-day-number").css("font-size", "17px");
      jQuery(".fc-day-header").css("font-size", "12px");
    }
    else {
      jQuery(".fc-toolbar").css("display", "flex");
      jQuery(".fc-day-number").css("font-size", "24px");
      jQuery(".fc-day-header").css("font-size", "15px");
    }
  });
});
//'dayGridMonth,timeGridWeek,timeGridDay'


document.addEventListener("DOMContentLoaded", function () {
  function decmInitCalendar(calendarMountEl, myAjax) {
  if (!calendarMountEl || !myAjax) {
    return;
  }

  var $calendarMount = jQuery(calendarMountEl);
  var $moduleRoot = $calendarMount.closest(
    '.decm_divi_event_calendar, [class*="decm_divi_event_calendar"], [class*="et_pb_event_calendar"]'
  );
  var eventNs = '.decmCal_' + decmSanitizeEventNs(calendarMountEl.id);
  var language = document.getElementsByTagName("html")[0].getAttribute("lang");

  let number_event_day = 3;
  if (myAjax.number_event_day === "default") {
    number_event_day = 1;
  } else if (
    typeof myAjax.number_event_day === 'string' &&
    myAjax.number_event_day.trim() !== '' &&
    !isNaN(parseInt(myAjax.number_event_day, 10))
  ) {
    number_event_day = parseInt(myAjax.number_event_day, 10);
  }
  let includedCategoriesString =
    Array.isArray(myAjax.included_categories) && myAjax.included_categories.length > 0
      ? myAjax.included_categories.join(',')
      : '';
  let includedOrganizersString =
    Array.isArray(myAjax.included_organizer) && myAjax.included_organizer.length > 0
      ? myAjax.included_organizer.join(',')
      : '';
  let includedOrganizercheck =
    Array.isArray(myAjax.included_organizer) && myAjax.included_organizer.length > 0
      ? myAjax.included_organizer.join('|')
      : '';
  let includedvenuesString =
    Array.isArray(myAjax.included_venue) && myAjax.included_venue.length > 0
      ? myAjax.included_venue.join(',')
      : '';
  let includedvenuecheck =
    Array.isArray(myAjax.included_venue) && myAjax.included_venue.length > 0
      ? myAjax.included_venue.join('|')
      : '';

  var calendarView = "";
  var calendarViewTablet = "";
  var calendarViewPhone = "";

  // Per-instance mount element (unique id per module on the page).
  var calendarEl = calendarMountEl;

  // Ensure default values if undefined (default to 'on' for all views)
  var showMonthView = myAjax.show_month_view_button !== undefined && myAjax.show_month_view_button !== '' ? myAjax.show_month_view_button : 'on';
  var showWeekView = myAjax.show_week_view_button !== undefined && myAjax.show_week_view_button !== '' ? myAjax.show_week_view_button : 'on';
  var showDayView = myAjax.show_day_view_button !== undefined && myAjax.show_day_view_button !== '' ? myAjax.show_day_view_button : 'on';
  var showListView = myAjax.show_list_view_button !== undefined && myAjax.show_list_view_button !== '' ? myAjax.show_list_view_button : 'on';

  if (showMonthView == 'on') {
    calendarView += "dayGridMonth,";
  }
  if (showWeekView == 'on') {
    calendarView += "timeGridWeek,";
  }

  if (showDayView == 'on') {
    calendarView += "timeGridDay,";
  }

  if (showListView == 'on') {
    calendarView += (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') ? myAjax.calendar_list_view_option : 'listWeek';
    if (!calendarView.endsWith(',')) {
      calendarView += ',';
    }
  }
  
  // Remove trailing comma and ensure at least one view
  calendarView = calendarView.replace(/,$/, '');
  if (calendarView === '') {
    calendarView = 'dayGridMonth';
  }
  
  var date1 = new Date();
  var date2 = new Date();
  var limitEventStartMonth = null;
  var limitEventEndMonth = null;
  if (myAjax.limit_event == "on") {
    var get_end_month = parseInt(myAjax.event_end_date) + 1;
    var get_start_month = parseInt(myAjax.event_start_date);
    limitEventEndMonth = new Date(date1.setMonth(date1.getMonth() + parseInt(get_end_month), 0));
    limitEventStartMonth = new Date(date2.setMonth(date2.getMonth() - parseInt(get_start_month), 1));
  }
  // Tablet views - use tablet values if set, otherwise fall back to desktop values
  // If tablet value is explicitly 'off', don't show even if desktop is 'on'
  var showMonthViewTablet = false;
  if (myAjax.show_month_view_button_tablet == 'on') {
    showMonthViewTablet = true;
  } else if (myAjax.show_month_view_button_tablet == 'off') {
    showMonthViewTablet = false;
  } else {
    // Empty or undefined - fall back to desktop value
    showMonthViewTablet = (showMonthView == 'on');
  }
  
  var showWeekViewTablet = false;
  if (myAjax.show_week_view_button_tablet == 'on') {
    showWeekViewTablet = true;
  } else if (myAjax.show_week_view_button_tablet == 'off') {
    showWeekViewTablet = false;
  } else {
    showWeekViewTablet = (showWeekView == 'on');
  }
  
  var showDayViewTablet = false;
  if (myAjax.show_day_view_button_tablet == 'on') {
    showDayViewTablet = true;
  } else if (myAjax.show_day_view_button_tablet == 'off') {
    showDayViewTablet = false;
  } else {
    showDayViewTablet = (showDayView == 'on');
  }
  
  var showListViewTablet = false;
  if (myAjax.show_list_view_button_tablet == 'on') {
    showListViewTablet = true;
  } else if (myAjax.show_list_view_button_tablet == 'off') {
    showListViewTablet = false;
  } else {
    showListViewTablet = (showListView == 'on');
  }

  // Get the default view for tablet to ensure it's included even if button is off
  var tabletDefaultView = '';
  if (myAjax.calendar_default_view_tablet && myAjax.calendar_default_view_tablet !== '') {
    tabletDefaultView = myAjax.calendar_default_view_tablet;
    // If it's a list view, use the list view option
    if (tabletDefaultView == "listWeek" || tabletDefaultView == "listMonth" || tabletDefaultView == "listYear") {
      if (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') {
        tabletDefaultView = myAjax.calendar_list_view_option.replace(/,/g, '');
      } else {
        tabletDefaultView = 'listWeek';
      }
    }
  } else if (myAjax.calendar_default_view) {
    tabletDefaultView = myAjax.calendar_default_view;
    if (tabletDefaultView == "listWeek" || tabletDefaultView == "listMonth" || tabletDefaultView == "listYear") {
      if (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') {
        tabletDefaultView = myAjax.calendar_list_view_option.replace(/,/g, '');
      } else {
        tabletDefaultView = 'listWeek';
      }
    }
  }

  if (showMonthViewTablet) {
    calendarViewTablet += "dayGridMonth,";
  } else if (tabletDefaultView === 'dayGridMonth') {
    // Include default view even if button is off
    calendarViewTablet += "dayGridMonth,";
  }
  if (showWeekViewTablet) {
    calendarViewTablet += "timeGridWeek,";
  } else if (tabletDefaultView === 'timeGridWeek') {
    calendarViewTablet += "timeGridWeek,";
  }
  if (showDayViewTablet) {
    calendarViewTablet += "timeGridDay,";
  } else if (tabletDefaultView === 'timeGridDay') {
    calendarViewTablet += "timeGridDay,";
  }
  if (showListViewTablet) {
    calendarViewTablet += (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') ? myAjax.calendar_list_view_option : 'listWeek';
    if (!calendarViewTablet.endsWith(',')) {
      calendarViewTablet += ',';
    }
  } else if (tabletDefaultView && (tabletDefaultView === 'listWeek' || tabletDefaultView === 'listMonth' || tabletDefaultView === 'listYear')) {
    // Include default list view even if button is off
    calendarViewTablet += tabletDefaultView;
    if (!calendarViewTablet.endsWith(',')) {
      calendarViewTablet += ',';
    }
  }

  // Phone views - use phone values if set, otherwise fall back to desktop values
  // If phone value is explicitly 'off', don't show even if desktop is 'on'
  var showMonthViewPhone = false;
  if (myAjax.show_month_view_button_phone == 'on') {
    showMonthViewPhone = true;
  } else if (myAjax.show_month_view_button_phone == 'off') {
    showMonthViewPhone = false;
  } else {
    // Empty or undefined - fall back to desktop value
    showMonthViewPhone = (showMonthView == 'on');
  }
  
  var showWeekViewPhone = false;
  if (myAjax.show_week_view_button_phone == 'on') {
    showWeekViewPhone = true;
  } else if (myAjax.show_week_view_button_phone == 'off') {
    showWeekViewPhone = false;
  } else {
    showWeekViewPhone = (showWeekView == 'on');
  }
  
  var showDayViewPhone = false;
  if (myAjax.show_day_view_button_phone == 'on') {
    showDayViewPhone = true;
  } else if (myAjax.show_day_view_button_phone == 'off') {
    showDayViewPhone = false;
  } else {
    showDayViewPhone = (showDayView == 'on');
  }
  
  var showListViewPhone = false;
  if (myAjax.show_list_view_button_phone == 'on') {
    showListViewPhone = true;
  } else if (myAjax.show_list_view_button_phone == 'off') {
    showListViewPhone = false;
  } else {
    showListViewPhone = (showListView == 'on');
  }

  // Get the default view for phone to ensure it's included even if button is off
  var phoneDefaultView = '';
  if (myAjax.calendar_default_view_phone && myAjax.calendar_default_view_phone !== '') {
    phoneDefaultView = myAjax.calendar_default_view_phone;
    // If it's a list view, use the list view option
    if (phoneDefaultView == "listWeek" || phoneDefaultView == "listMonth" || phoneDefaultView == "listYear") {
      if (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') {
        phoneDefaultView = myAjax.calendar_list_view_option.replace(/,/g, '');
      } else {
        phoneDefaultView = 'listWeek';
      }
    }
  } else if (myAjax.calendar_default_view) {
    phoneDefaultView = myAjax.calendar_default_view;
    if (phoneDefaultView == "listWeek" || phoneDefaultView == "listMonth" || phoneDefaultView == "listYear") {
      if (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') {
        phoneDefaultView = myAjax.calendar_list_view_option.replace(/,/g, '');
      } else {
        phoneDefaultView = 'listWeek';
      }
    }
  }

  if (showMonthViewPhone) {
    calendarViewPhone += "dayGridMonth,";
  } else if (phoneDefaultView === 'dayGridMonth') {
    // Include default view even if button is off
    calendarViewPhone += "dayGridMonth,";
  }
  if (showWeekViewPhone) {
    calendarViewPhone += "timeGridWeek,";
  } else if (phoneDefaultView === 'timeGridWeek') {
    calendarViewPhone += "timeGridWeek,";
  }
  if (showDayViewPhone) {
    calendarViewPhone += "timeGridDay,";
  } else if (phoneDefaultView === 'timeGridDay') {
    calendarViewPhone += "timeGridDay,";
  }
  if (showListViewPhone) {
    calendarViewPhone += (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') ? myAjax.calendar_list_view_option : 'listWeek';
    if (!calendarViewPhone.endsWith(',')) {
      calendarViewPhone += ',';
    }
  } else if (phoneDefaultView && (phoneDefaultView === 'listWeek' || phoneDefaultView === 'listMonth' || phoneDefaultView === 'listYear')) {
    // Include default list view even if button is off
    calendarViewPhone += phoneDefaultView;
    if (!calendarViewPhone.endsWith(',')) {
      calendarViewPhone += ',';
    }
  }
  // D5 stores numeric value "0"-"6"; D4 stored day name strings — handle both formats.
  var week_start_on = 0;
  if (myAjax.week_start_on !== "" && myAjax.week_start_on !== undefined) {
    var _wso = myAjax.week_start_on;
    if (!isNaN(_wso)) {
      week_start_on = parseInt(_wso);
    } else {
      if (_wso == "Sunday") { week_start_on = 0; } else if (_wso == "Monday") { week_start_on = 1; } else if (_wso == "Tuesday") { week_start_on = 2; } else if (_wso == "Wednesday") { week_start_on = 3; } else if (_wso == "Thursday") { week_start_on = 4; } else if (_wso == "Friday") { week_start_on = 5; } else if (_wso == "Saturday") { week_start_on = 6; }
    }
  }
  // Remove trailing commas and ensure at least one view for each
  calendarView = calendarView.replace(/,$/, '');
  if (calendarView === '') {
    calendarView = 'dayGridMonth';
  }
  calendarViewTablet = calendarViewTablet.replace(/,$/, '');
  if (calendarViewTablet === '') {
    // If no tablet views are enabled, use desktop view as fallback
    calendarViewTablet = calendarView || 'dayGridMonth';
  }
  calendarViewPhone = calendarViewPhone.replace(/,$/, '');
  if (calendarViewPhone === '') {
    // If no phone views are enabled, use desktop view as fallback
    calendarViewPhone = calendarView || 'dayGridMonth';
  }
  
  // Debug logging
  //  console.log(calendarView);
  // console.log(myAjax.button_classes);

  var hide_past_event = myAjax.hide_past_event == "on" ? new Date() : "";

  // Function to get the appropriate view buttons based on screen width
  function getResponsiveViewButtons() {
    var screenWidth = window.innerWidth || screen.width;
    // Divi breakpoints: phone <= 767px, tablet 768-980px, desktop > 980px
    if (screenWidth <= 767) {
      return calendarViewPhone;
    } else if (screenWidth >= 768 && screenWidth <= 980) {
      return calendarViewTablet;
    } else {
      return calendarView;
    }
  }

  // Get initial view buttons based on current screen width
  var initialViewButtons = getResponsiveViewButtons();

  // Function to get the correct default view, handling list view options
  function getDefaultView() {
    var screenWidth = window.innerWidth || screen.width;
    var defaultView = '';
    
    // Get the appropriate default view based on screen width
    if (screenWidth <= 767 && myAjax.calendar_default_view_phone != "") {
      defaultView = myAjax.calendar_default_view_phone;
    } else if (screenWidth >= 768 && screenWidth <= 980 && myAjax.calendar_default_view_tablet != "") {
      defaultView = myAjax.calendar_default_view_tablet;
    } else {
      defaultView = myAjax.calendar_default_view;
    }
    
    // If default view is a list view, use the calendar_list_view_option
    if (defaultView == "listWeek" || defaultView == "listMonth" || defaultView == "listYear") {
      if (myAjax.calendar_list_view_option && myAjax.calendar_list_view_option !== '') {
        // Remove any commas from the list view option
        defaultView = myAjax.calendar_list_view_option.replace(/,/g, '');
      } else {
        defaultView = 'listWeek'; // Fallback to listWeek if no option specified
      }
    }
    
    return defaultView;
  }

  var hiddenSlotTimes = getHiddenSlotTimes(
    myAjax.hide_time_range_in_week_day,
    myAjax.start_point,
    myAjax.end_point
  );

  var calendar = new FullCalendar.Calendar(calendarEl, {
    minTime: hiddenSlotTimes.slotMinTime,
    maxTime: hiddenSlotTimes.slotMaxTime,
    scrollTime: hiddenSlotTimes.slotMinTime,
    eventOrder: myAjax.calendar_eventorder,
    showNonCurrentDates: myAjax.hide_pre_nxt_event === 'on' ? false : true,
    displayEventTime: false,
    // eventLimit: 2,
    plugins: ['dayGrid', 'timeGrid', 'list'],
    // selectable: true,
    defaultView: getDefaultView(),
    //defaultView: myAjax.calendar_default_view,
    fixedWeekCount: false,
    //lazyFatching: true,
    // selectable: true,
    // navLinks: true,
    header: {
      left: 'prev,next today',
      center: 'title',
      right: initialViewButtons,

    },

    hiddenDays: myAjax.hidden_day,

    firstDay: week_start_on,
    locales: language,
    // validRange: {
    //   start: hide_past_event,
    //   end: "",
    // },
    eventLimit: number_event_day,
    nextDayThreshold: myAjax.multidaycutoff,
    columnHeaderFormat: {
      weekday: decmResolveWeekdayFormat($moduleRoot, myAjax),
    },
    views: {
      dayGridMonth: {
        columnHeaderFormat: {
          weekday: decmResolveWeekdayFormat($moduleRoot, myAjax),
        },
      },
      timeGridWeek: {
        columnHeaderFormat: {
          weekday: decmResolveWeekdayFormat($moduleRoot, myAjax),
        },
      },
      timeGridDay: {
        columnHeaderFormat: {
          weekday: decmResolveWeekdayFormat($moduleRoot, myAjax),
        },
      },
    },


    loading: function (bool) {
      if (bool == false) {
        scheduleHiddenTimeRangeApply(calendar, myAjax, $calendarMount);
        decmClearCalendarLoading($calendarMount);
        decmApplyDaysOfWeekDesign($calendarMount, myAjax);
      }
    },
    // viewRender: function (view, element) {
    //   var b = jQuery('#calendar').fullCalendar('getDate');
    //   alert(b.format('L'));
    // },

    windowResize: function (view) {

    },

    datesRender: function (info) {
      decmApplyDaysOfWeekDesign($calendarMount, myAjax);
      if (
        info.view.type === 'timeGridDay' ||
        info.view.type === 'timeGridWeek'
      ) {
        scheduleHiddenTimeRangeApply(calendar, myAjax, $calendarMount);
      }
    },

    eventRender: function (info) {
      var view = calendar.view;

      // For v4+ (most builds)
      var startDate = view.currentStart; // Date object (first visible day)
      var endDate = view.currentEnd;

//       console.log("Calendar Start:", startDate.toISOString().slice(0, 10));
// console.log("Calendar End:", endDate.toISOString().slice(0, 10));

      let show_calendar_thumbnail = myAjax.show_calendar_thumbnail == "on" ? info.event.extendedProps.feature_image_calendar : "";
      // let includedCategoriesString = `"${myAjax.included_categories.join(',')}"`;
      // let includedOrganizerString = `"${myAjax.included_organizer.join('|')}"`;

      //  console.log('cate',includedCategoriesString);
      //  console.log('org',includedOrganizerString);
      var date1 = new Date();
      var date2 = new Date();
      // var get_end_month = myAjax.event_end_date;
      var get_end_month = parseInt(myAjax.event_end_date) + 1;
      var get_start_month = parseInt(myAjax.event_start_date);
      // // console.log(myAjax.event_end_date);
      get_end_month = new Date(date1.setMonth(date1.getMonth() + parseInt(get_end_month), 0));
      get_start_month = new Date(date2.setMonth(date2.getMonth() - parseInt(get_start_month), 1));

      //  console.log(myAjax.hide_calendar_event_multi_days);

      if (decmIsNarrowColumn($moduleRoot) && calendar.view.type != 'timeGridDay') {
        jQuery(info.el).children(".fc-content").css("visibility", "hidden").css("width", "10px").css("height", "10px");
      }
      if (calendar.view.type == 'timeGridDay' && screen.width < 767) {
        jQuery(info.el).children(".fc-content").attr('style', "visibility: visible !important").css("width", "auto").css("height", "auto");

      }
      else { jQuery(info.el).children(".fc-content").css("visibility", "visible").css("width", "auto").css("height", "auto"); }
      if (calendar.view.type == 'dayGridMonth' || calendar.view.type == 'timeGridWeek' || calendar.view.type == 'timeGridDay') {

        if (info.event.extendedProps.event_start_time == null) {
          // if (myAjax.show_calendar_event_date_tablet == "on" || myAjax.show_calendar_event_date_tablet == "") {
          //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date_tablet == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
          // }
          // if (myAjax.show_calendar_event_date_phone == "on" || myAjax.show_calendar_event_date_phone == "") {
          //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date_phone == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
          // }
          if (myAjax.hide_calendar_event_all_day == "on") {
            //info.el.querySelector('.fc-title').innerHTML =show_calendar_thumbnail+ '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
          }
          else {
            // console.log('allDayEvent else', info.event.extendedProps.allDayEvent);
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
        }
        if ((info.event.extendedProps.event_start_time != null)) {

          if (myAjax.hide_calendar_event_multi_days == "on" && info.event.extendedProps.event_end_date != "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
            //  info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
          }
          else if (myAjax.hide_calendar_event_multi_days == "off" && info.event.extendedProps.event_end_date != "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
          if (myAjax.show_calendar_event_date == "off" && info.event.extendedProps.event_end_date == "") {
            if (myAjax.show_event_end_date == "on") {
              info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
            } else {

              info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
            }
          }
          else if (myAjax.show_calendar_event_date == "on" && info.event.extendedProps.event_end_date == "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
        }






        if (myAjax.show_calendar_event_date === 'on') {


          let eventStartTime = info.event.extendedProps.event_start_time;
          let eventTimeHtml = '';
          let timeZoneHtml = myAjax.show_time_zone_on_calendar === "on" ? '<span class="fc-calendar-show-time-zone">' + info.event.extendedProps.show_time_zone_on_calendar + '</span></br>' : "";


          if (eventStartTime != null ) {
            eventTimeHtml = '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span></br>';
          }
          else if(info.event.extendedProps.allDayEvent != null){
            eventTimeHtml = '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br>';
          }

          let eventHtml = eventTimeHtml +
            '<span class="fc-calendar-title">' + info.event.title + '</span>';

          if (eventTimeHtml) {
            eventHtml = show_calendar_thumbnail + eventTimeHtml + timeZoneHtml + '<span class="fc-calendar-title">' + info.event.title + '</span>';
          }

          info.el.querySelector('.fc-title').innerHTML = eventHtml;
        }

        if (myAjax.show_event_venue == "on" && info.event.extendedProps.show_event_venue) {

          info.el.querySelector('.fc-title').innerHTML += '<div class="fc-calendar-venue">' + info.event.extendedProps.show_event_venue + '</div>';;


        }


        // if (myAjax.show_event_venue == "on" && info.event.extendedProps.show_event_venue) {
        //   let currentHtml = info.el.querySelector('.fc-title').innerHTML;
        //   let eventStartTime = info.event.extendedProps.event_start_time;
        //   let eventEndTime = info.event.extendedProps.event_end_time;
        //   info.el.querySelector('.fc-title').innerHTML =
        //     currentHtml +
        //     '<div class="fc-calendar-venue">' + info.event.extendedProps.show_event_venue + '</div>';
        // }


        // if(myAjax.show_time_zone_on_calendar == 'on'){
        //   info.el.querySelector('.fc-title').innerHTML = 
        //     '<span class="fc-calendar-time rafy">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br>' +
        //     '<span class="fc-calendar-shshow-time-zone">' + info.event.extendedProps.show_time_zone_on_calendar + '</span></br>' +
        //     '<span class="fc-calendar-title">' + info.event.title + '</span>';
        // }

        // else {
        //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
        // }
      }

      // if(calendar.view.type=='timeGridWeek'||calendar.view.type=='timeGridDay'){
      //   jQuery("td").first(".fc-widget-content").css('border', 'none');
      // }
      if (calendar.view.type == 'listWeek' || calendar.view.type == 'listMonth' || calendar.view.type == 'listYear') {
        //info.el.querySelector('.fc-list-item').innerHTML=info.event.title;
        if (info.event.extendedProps.event_start_time == null) {
          if (myAjax.hide_calendar_event_all_day == "off") {
            jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + info.event.extendedProps.calallday + '</td>');
          }
          // if (myAjax.show_calendar_event_date_tablet == "on" || (myAjax.show_calendar_event_date_tablet == "" && myAjax.show_calendar_event_date == "on") && screen.width <= 981 && screen.width >= 767) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' +show_calendar_thumbnail+ info.event.extendedProps.calallday + '</td>');
          // }
          // if (myAjax.show_calendar_event_date == "on" && screen.width >= 981) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' +show_calendar_thumbnail+ info.event.extendedProps.calallday + '</td>');
          // }
          // if (myAjax.show_calendar_event_date_phone == "on" || (myAjax.show_calendar_event_date_phone == "" && myAjax.show_calendar_event_date == "on") && screen.width < 767) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' +show_calendar_thumbnail+ info.event.extendedProps.calallday + '</td>');
          // }
          else {
            jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + '</td>');
          }
        }
        if ((info.event.extendedProps.event_start_time != null)) {
          if (myAjax.hide_calendar_event_multi_days == "on" && info.event.extendedProps.event_end_date != "") {
            jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content"> </td>');
            //  info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
          }
          else if (myAjax.hide_calendar_event_multi_days == "off" && info.event.extendedProps.event_end_date != "") {
            decmSetListItemTime(info, show_calendar_thumbnail, decmGetEventTimeDisplay(myAjax, info.event.extendedProps));
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
          if (myAjax.show_calendar_event_date == "off" && info.event.extendedProps.event_end_date == "") {
            jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + ' </td>');
          }
          else if (myAjax.show_calendar_event_date == "on" && info.event.extendedProps.event_end_date == "") {
            decmSetListItemTime(info, show_calendar_thumbnail, decmGetEventTimeDisplay(myAjax, info.event.extendedProps));
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
          // if (myAjax.show_calendar_event_date_tablet == "on" || (myAjax.show_calendar_event_date_tablet == "" && myAjax.show_calendar_event_date == "on") && screen.width <= 981 && screen.width >= 767) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</td>');
          // }
          // if (myAjax.show_calendar_event_date_phone == "on" || (myAjax.show_calendar_event_date_phone == "" && myAjax.show_calendar_event_date == "on") && screen.width < 767) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</td>');
          // }
          // if (myAjax.show_calendar_event_date == "on" && screen.width >= 981) {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</td>');
          // }
          // else {
          //   jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content"> </td>');
          // }
        }
        info.el.querySelector('.fc-list-item-title').innerHTML = info.event.title;
      }
      if (calendar.view.type == 'timeGridDay') {
        info.event.start = info.event.extendedProps.event_start_date + "T" + info.event.extendedProps.event_start_time;
      }


      if (info.event.extendedProps.category_data !== false) {
        for (let i = 0; i < info.event.extendedProps.category_data.length; i++) {
          jQuery(info.el).addClass(info.event.extendedProps.category_data[i].slug + '_dec_category');
        }
      }
      //  jQuery(info.el).addClass("fc-event-dot");
      if (info.event.extendedProps.featured_class !== "") {
        jQuery(info.el).addClass(info.event.extendedProps.featured_class);

      }


    },
    eventMouseEnter: function (info) {
      var nsfields = info.event.extendedProps;
      if (!decmShouldShowCalendarTooltip(myAjax) || !nsfields || !nsfields.html) {
        return;
      }
      decmCreateCalendarTooltip(calendarMountEl, $calendarMount, $moduleRoot, info.el, nsfields.html);
    },
    eventMouseLeave: function () {
      decmDisposeCalendarTooltip(calendarMountEl);
    },
    
    events: function(info, successCallback, failureCallback) {

      let url = myAjax.ajaxurl + "?action=fetch_Events" +
        (myAjax.decm_fetch_events_nonce ? ("&decm_fetch_events_nonce=" + encodeURIComponent(myAjax.decm_fetch_events_nonce)) : "") +
        "&locale=en-US" +
        "&dateformat=" +
        "&timeformat=" +
        "&limit_event_title_length=" + myAjax.limit_event_title_length +
        "&event_title_length=" + myAjax.event_title_length +
        "&timezone=" + myAjax.timezone +
        "&show_time_zone_on_calendar=" + myAjax.show_time_zone +
        "&end_time=" +
        "&show_rsvp=" + myAjax.show_rsvp +
        "&show_event_venue=" + myAjax.show_event_venue +
        "&hide_pre_nxt_event=" + myAjax.hide_pre_nxt_event +
        "&timezone_abb=" + myAjax.show_time_zone_abb +
        "&venue=" + myAjax.show_venue +
        "&location=" + myAjax.show_location +
        "&street=" + myAjax.show_address +
        "&locality=" + myAjax.show_locality +
        "&postal=" + myAjax.show_postal +
        "&country=" + myAjax.show_country +
        "&street_comma=" + myAjax.show_address_comma +
        "&state_comma=" + myAjax.show_state_comma +
        "&locality_comma=" + myAjax.show_locality_comma +
        "&postal_comma=" + myAjax.show_postal_comma +
        "&country_comma=" + myAjax.show_country_comma +
        "&show_postal_code_before_locality=" + myAjax.show_postal_code_before_locality +
        "&organizer=" + (myAjax.show_organizer || '') +
        "&categories=" + includedCategoriesString +
        "&show_tooltip=" + myAjax.show_tooltip +
        "&show_tooltip_tablet=" + (myAjax.show_tooltip_tablet || '') +
        "&show_tooltip_phone=" + (myAjax.show_tooltip_phone || '') +
        "&show_image=" + myAjax.show_image +
        "&show_image_tablet=" +
        "&show_image_phone=" +
        "&show_icon_label=" + myAjax.show_icon_label +
        "&stack_label_icon=" + myAjax.stack_label_icon +
        "&stack_event_d=" + (myAjax.stack_event_d || 'on') +
        "&show_preposition_dividr=" + (myAjax.show_preposition_dividr || 'off') +
        "&show_colon=" + myAjax.show_colon +
        "&show_excerpt=" + myAjax.show_excerpt +
        "&show_price=" + myAjax.show_price +
        "&show_rsvp_feed=" +
        "&show_title=" + myAjax.show_title +
        "&show_date=" + myAjax.show_date +
        "&show_time=" + myAjax.show_time +
        "&calendar_eventorder=" + myAjax.calendar_eventorder +
        "&id=" +
        "&show_month_view_button=" + myAjax.show_month_view_button +
        "&show_list_view_button=" + myAjax.show_list_view_button +
        "&show_week_view_button=" + myAjax.show_week_view_button +
        "&show_day_view_button=" + myAjax.show_day_view_button +
        "&show_month_view_button_tablet=" +
        "&show_list_view_button_tablet=" +
        "&show_week_view_button_tablet=" +
        "&show_day_view_button_tablet=" +
        "&show_month_view_button_phone=" +
        "&show_list_view_button_phone=" +
        "&show_week_view_button_phone=" +
        "&show_day_view_button_phone=" +
        "&categslug=" +
        "&categId=" +
        "&show_tooltip_category=" + myAjax.show_tooltip_category +
        "&enable_category_link=" + myAjax.enable_category_link +
        "&custom_category_link_target=" + myAjax.custom_category_link_target +
        "&show_tooltip_weburl=" + myAjax.show_tooltip_weburl +
        "&hidden_day=" + myAjax.hidden_day +
        "&week_start_on=" + myAjax.week_start_on +
        "&start=" + info.startStr +
        "&end=" + info.endStr +
        "&show_calendar_event_date=" + myAjax.show_calendar_event_date +
        "&calender_end_time=" + myAjax.calender_end_time +
        "&timeRangeSeparator=" + myAjax.timeRangeSeparator +
        "&calendar_default_view=" + myAjax.calendar_default_view +
        "&calendar_default_view_tablet=" +
        "&calendar_default_view_phone=" +
        "&calendar_list_view_option=" + myAjax.calendar_list_view_option +
        "&show_recurring_event=" + myAjax.show_recurring_event +
        "&hide_past_event=" + myAjax.hide_past_event +
        "&event_start_date=" + myAjax.event_start_date +
        "&event_end_date=" + myAjax.event_end_date +
        "&day_of_the_week_name=" + myAjax.day_of_the_week_name +
        "&single_event_page_link=" + myAjax.single_event_page_link +
        "&disable_event_title_link=" + myAjax.disable_event_title_link +
        "&disable_event_image_link=" + myAjax.disable_event_image_link +
        "&disable_event_calendar_title_link=" + myAjax.disable_event_calendar_title_link +
        "&custom_event_link_url=" +myAjax.custom_event_link_url+
        "&custom_event_link_target=" + myAjax.custom_event_link_target +
        "&website_link=" + myAjax.website_link +
        "&custom_website_link_text=" + myAjax.custom_website_link_text +
        "&custom_website_link_target=" + myAjax.website_link_target +
        "&show_end_time=" + myAjax.show_end_time +
        "&included_organizer=" + includedOrganizersString +
        "&included_organizer_check=" + includedOrganizercheck +
        "&included_venue=" + includedvenuesString +
        "&included_venue_check=" + includedvenuecheck +
        "&included_series=" +
        "&included_series_check=" +
        "&enable_organizer_link=" + myAjax.enable_org_link +
        "&custom_organizer_link_target=" + myAjax.org_link_target +
        "&enable_venue_link=" + myAjax.enable_venue_link +
        "&custom_venue_link_target=" + myAjax.venue_link_target +
        "&state=" + myAjax.show_state +
        "&venue_id=" +
        "&organizer_id=" +
        "&event_selection=" + myAjax.event_selection +
        "&show_postponed_canceled_event=" + myAjax.show_postponed_canceled_event +
        "&show_virtual_event=" + myAjax.show_virtual_event +
        "&show_hybrid_event=" + myAjax.show_hybrid_event +
        "&number_event_day=" + myAjax.number_event_day +
        "&limit_event=" + myAjax.limit_event +
        "&hide_month_range=" + myAjax.hide_month_range +
        "&day_of_the_week_name_tablet=" +
        "&button_classes=" +
        "&disable_event_button_link=" + myAjax.disable_event_button_link +
        "&custom_icon=" +
        "&custom_icon_tablet=" +
        "&custom_icon_phone=" +
        "&view_more_text=" +
        "&module_class=" + encodeURIComponent(myAjax.module_class || 'et_pb_module decm_divi_event_calendar decm_divi_event_calendar_0') +
        "&event_time_format=" + myAjax.event_time_format +
        "&show_calendar_thumbnail=" + myAjax.show_calendar_thumbnail +
        "&hide_calendar_event_multi_days=" + myAjax.hide_calendar_event_multi_days +
        "&hide_calendar_event_all_day=" + myAjax.hide_calendar_event_all_day +
        "&multidaycutoff=" + myAjax.multidaycutoff +
        "&show_tag=" + myAjax.show_tag +
        "&hide_comma_tag=" + myAjax.hide_comma_tag +
        "&custom_tag_link_target=" +myAjax.custom_tag_link_target+
        "&enable_tag_links=" + myAjax.enable_tag_link +
        "&hide_comma_cat=" + myAjax.hide_comma_cat +
        "&category_detail_label=" + myAjax.category_detail_label +
        "&time_detail_label=" + myAjax.time_detail_label +
        "&date_detail_label=" + myAjax.date_detail_label +
        "&venue_detail_label=" + myAjax.venue_detail_label +
        "&location_detail_label=" + myAjax.location_detail_label +
        "&organizer_detail_label=" + myAjax.organizer_detail_label +
        "&price_detail_label=" + myAjax.price_detail_label +
        "&rsvp_detail_label=" + myAjax.rsvp_detail_label +
        "&tag_detail_label=" + myAjax.tag_detail_label +
        "&website_detail_label=" + myAjax.website_detail_label +
        "&event_series_label=" + myAjax.event_series_label +
        "&event_series_name=" + myAjax.event_series_name +
        "&custom_series_link_target=_self" +
        "&enable_series_link=on";
      fetch(url, { method: 'POST' })
        .then(response => response.json())
        .then(events => successCallback(events))
        .catch(error => failureCallback(error));
    }

  });

  calendarMountEl.decmFcInstance = calendar;
  if (!window.decmCalendars) {
    window.decmCalendars = [];
  }
  window.decmCalendars.push(calendar);
  if (!window.calendar) {
    window.calendar = calendar;
  }

  decmShowCalendarLoading($calendarMount);
  calendar.render();
  calendar.setOption('locale', language);
  scheduleHiddenTimeRangeApply(calendar, myAjax, $calendarMount);
  decmApplyResponsiveToolbar($calendarMount, $moduleRoot);
  decmApplyDaysOfWeekDesign($calendarMount, myAjax);

  $calendarMount.off('click' + eventNs);
  $calendarMount.on('click' + eventNs, 'button.fc-next-button, button.fc-prev-button', function () {
    decmApplyResponsiveToolbar($calendarMount, $moduleRoot);
    decmApplyDaysOfWeekDesign($calendarMount, myAjax);
  });

  if (limitEventStartMonth && limitEventEndMonth) {
    $calendarMount.on('click' + eventNs, 'button.fc-prev-button', function () {
      $calendarMount.find(".fc-prev-button").addClass("ecs_next_class");
      var calendar_current_date = new Date(calendar.view.title);

      if (calendar_current_date.getTime() < limitEventStartMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-prev-button").css("pointer-events", "none");
        }
      }
      if (calendar_current_date.getTime() < limitEventEndMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-next-button").css("pointer-events", "visible");
        }
      }
      if (calendar.view.props.dateProfile.currentRange.start.getTime() < limitEventStartMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-prev-button").css("pointer-events", "none");
        }
        if (myAjax.hide_month_range == "hide") {
          $calendarMount.find('.fc-view-container').append("<div class='fc-list-empty-wrap2'><div class='fc-list-empty-wrap1'><div class='fc-list-empty'>Sorry, there are no more events at this time</div></div></div>");
          $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').addClass("ecs_is_loading_check");
        }
      }
      if (calendar.view.props.dateProfile.currentRange.start.getTime() > limitEventStartMonth.getTime()) {
        $calendarMount.find(".fc-next-button").css("pointer-events", "visible");
        if (myAjax.hide_month_range == "hide") {
          decmClearCalendarLoading($calendarMount);
        }
      }
    });

    $calendarMount.on('click' + eventNs, 'button.fc-next-button', function () {
      var calendar_current_date = new Date(calendar.view.title);

      $calendarMount.find(".fc-next-button").addClass("ecs_next_class");

      if (calendar_current_date.getTime() > limitEventStartMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-prev-button").css("pointer-events", "visible");
        }
      }
      if (calendar_current_date.getTime() > limitEventEndMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-next-button").css("pointer-events", "none");
        }
        decmClearCalendarLoading($calendarMount);
        $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').addClass("ecs_is_loading_check");
      }
      if (calendar.view.props.dateProfile.currentRange.end.getTime() > limitEventStartMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-prev-button").css("pointer-events", "visible");
        }
        if (myAjax.hide_month_range == "hide") {
          decmClearCalendarLoading($calendarMount);
        }
      }
      if (calendar.view.props.dateProfile.currentRange.end.getTime() > limitEventEndMonth.getTime()) {
        if (myAjax.hide_month_range == "disable") {
          $calendarMount.find(".fc-next-button").css("pointer-events", "none");
        }
        if (myAjax.hide_month_range == "hide") {
          $calendarMount.find('.fc-view-container').append("<div class='fc-list-empty-wrap2'><div class='fc-list-empty-wrap1'><div class='fc-list-empty'>Sorry, there are no more events at this time</div></div></div>");
          $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').addClass("ecs_is_loading_check");
        }
      }
    });
  }

  var toolbarResizeTimeout;
  jQuery(window).on('resize' + eventNs, function () {
    clearTimeout(toolbarResizeTimeout);
    toolbarResizeTimeout = setTimeout(function () {
      decmApplyResponsiveToolbar($calendarMount, $moduleRoot);
    }, 150);
  });
  // calendar.gotoDate(date);

  // if (myAjax.show_specific_month == 'on') {
  //   let dateOne = new Date();
  //   let date = new Date(dateOne.getFullYear(), dateOne.getMonth(), 1);
  //   let no_of_months = getMonthFromString(myAjax.specific_month_start, myAjax.specific_years_start);
  //   date.setMonth(no_of_months);
  //   date.setFullYear(myAjax.specific_years_start);
  //   calendar.gotoDate(date);
  // }

  // Handle window resize to update view buttons based on device
  var resizeTimeout;
  function updateCalendarViewButtons() {
    var newViewButtons = getResponsiveViewButtons();
    if (calendar.getOption('headerToolbar')) {
      calendar.setOption('headerToolbar', {
        left: 'prev,next today',
        center: 'title',
        right: newViewButtons,
      });
    } else if (calendar.getOption('header')) {
      calendar.setOption('header', {
        left: 'prev,next today',
        center: 'title',
        right: newViewButtons,
      });
    }
  }
  
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(updateCalendarViewButtons, 250); // Debounce resize events
  });


  // Navigate to specific month/year if enabled.
  // specific_month_start is a 0-based month index (0=January … 11=December).
  // specific_years_start is a four-digit year string.
  if (myAjax.show_specific_month === 'on') {
    var _monthIdx = parseInt(myAjax.specific_month_start);
    var _year     = parseInt(myAjax.specific_years_start);
    if (!isNaN(_monthIdx) && !isNaN(_year)) {
      calendar.gotoDate(new Date(_year, _monthIdx, 1));
    }
  }

  } // end decmInitCalendar

  var shared = typeof decmCalendarShared !== 'undefined' ? decmCalendarShared : {};
  var mounts = document.querySelectorAll('.decm-calendar-mount[data-decm-config]');

  if (mounts.length > 0) {
    mounts.forEach(function (mountEl) {
      try {
        var config = JSON.parse(mountEl.getAttribute('data-decm-config') || '{}');
        if (!config.ajaxurl && shared.ajaxurl) {
          config.ajaxurl = shared.ajaxurl;
        }
        if (!config.decm_fetch_events_nonce && shared.decm_fetch_events_nonce) {
          config.decm_fetch_events_nonce = shared.decm_fetch_events_nonce;
        }
        decmInitCalendar(mountEl, config);
      } catch (err) {
        console.error('[DECM] Failed to initialize calendar instance', mountEl.id, err);
      }
    });
    return;
  }

  // Legacy single-calendar pages (D4 / older D5 markup).
  var legacyEl = document.getElementById('calendar');
  if (legacyEl && typeof myAjax !== 'undefined') {
    decmInitCalendar(legacyEl, myAjax);
  }

});

function getMonthFromString(mon, year) {
  return new Date(Date.parse(mon + " 1, " + year)).getMonth();
}
