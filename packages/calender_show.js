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

function decmGetViewportWidth() {
  var docWidth = 0;
  try {
    if (document.documentElement && document.documentElement.clientWidth) {
      docWidth = document.documentElement.clientWidth;
    }
  } catch (e) {}
  var inner = (typeof window !== 'undefined' && window.innerWidth) ? window.innerWidth : 0;
  // Prefer layout viewport so DevTools/console and real phones match CSS breakpoints.
  return docWidth || inner || (typeof screen !== 'undefined' ? screen.width : 1024) || 1024;
}

function decmGetContentBreakpoint() {
  var width = decmGetViewportWidth();
  if (width <= 767) {
    return 'phone';
  }
  if (width <= 1024) {
    return 'tablet';
  }
  return 'desktop';
}

function decmSettingIsEmpty(value) {
  return value == null || value === '';
}

function decmUnwrapSettingValue(value) {
  var guard = 0;
  while (value && typeof value === 'object' && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, 'value') && guard < 5) {
    value = value.value;
    guard += 1;
  }
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'boolean') {
    return value ? 'on' : 'off';
  }
  return value;
}

function decmResolveResponsiveSetting(myAjax, key) {
  var desktop = decmUnwrapSettingValue(myAjax && myAjax[key]);
  var tablet = decmUnwrapSettingValue(myAjax && myAjax[key + '_tablet']);
  var phone = decmUnwrapSettingValue(myAjax && myAjax[key + '_phone']);
  var breakpoint = decmGetContentBreakpoint();
  if (breakpoint === 'phone') {
    if (!decmSettingIsEmpty(phone)) {
      return phone;
    }
    if (!decmSettingIsEmpty(tablet)) {
      return tablet;
    }
    return desktop == null ? '' : desktop;
  }
  if (breakpoint === 'tablet') {
    if (!decmSettingIsEmpty(tablet)) {
      return tablet;
    }
    return desktop == null ? '' : desktop;
  }
  return desktop == null ? '' : desktop;
}

function decmSanitizeEventNs(id) {
  return String(id || 'decm').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function decmIsNarrowColumn($moduleRoot) {
  if (!$moduleRoot || !$moduleRoot.length) {
    return false;
  }
  var $parent = $moduleRoot.parent();
  return $parent.hasClass('et_pb_column_1_3') ||
    $parent.hasClass('et_pb_column_1_4') ||
    $parent.hasClass('et_pb_column_1_5') ||
    $parent.hasClass('et_pb_column_1_6');
}

function decmCloneWithResponsiveValues(source) {
  var out = {};
  if (!source || typeof source !== 'object') {
    return out;
  }
  Object.keys(source).forEach(function (key) {
    out[key] = source[key];
  });
  Object.keys(source).forEach(function (key) {
    if (/(_tablet|_phone)$/.test(key)) {
      return;
    }
    if (Object.prototype.hasOwnProperty.call(source, key + '_tablet') ||
        Object.prototype.hasOwnProperty.call(source, key + '_phone')) {
      out[key] = decmResolveResponsiveSetting(source, key);
    }
  });
  return out;
}

function decmPad2(n) {
  n = String(n);
  return n.length < 2 ? '0' + n : n;
}

function decmFormatLocalYmd(d) {
  return d.getFullYear() + '-' + decmPad2(d.getMonth() + 1) + '-' + decmPad2(d.getDate());
}

function decmNormalizeListViewOption(option) {
  var view = String(option || '').replace(/,/g, '').trim();
  if (view === 'listWeek' || view === 'listMonth' || view === 'listYear' || view === 'listDay') {
    return view;
  }
  return 'listWeek';
}

function decmBuildLimitEventWindow(myAjax) {
  if (!myAjax || myAjax.limit_event !== 'on') {
    return null;
  }
  var pastMonths = parseInt(myAjax.event_start_date, 10);
  var futureMonths = parseInt(myAjax.event_end_date, 10);
  if (isNaN(pastMonths)) {
    pastMonths = 1;
  }
  if (isNaN(futureMonths)) {
    futureMonths = 6;
  }
  pastMonths = Math.max(0, pastMonths);
  futureMonths = Math.max(0, futureMonths);
  var windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - pastMonths, 1);
  windowStart.setHours(0, 0, 0, 0);
  // Exclusive end: first day of the month after the last allowed month.
  var windowEnd = new Date();
  windowEnd.setMonth(windowEnd.getMonth() + futureMonths + 1, 1);
  windowEnd.setHours(0, 0, 0, 0);
  return { start: windowStart, end: windowEnd };
}

function decmLocalYearMonth(date) {
  return date.getFullYear() * 12 + date.getMonth();
}

function decmLimitWindowLastMonth(limitWindow) {
  return new Date(limitWindow.end.getTime() - 1);
}

function decmNormalizeFcLocale(lang) {
  var code = String(lang || '').trim().replace(/_/g, '-');
  if (!code) {
    return 'en';
  }
  return code;
}

function decmGetFcLocalesArray() {
  if (typeof window !== 'undefined' && Array.isArray(window.FullCalendarLocalesAll) && window.FullCalendarLocalesAll.length) {
    return window.FullCalendarLocalesAll;
  }
  if (typeof window !== 'undefined' && window.FullCalendarLocales && typeof window.FullCalendarLocales === 'object') {
    return Object.keys(window.FullCalendarLocales).map(function (key) {
      return window.FullCalendarLocales[key];
    }).filter(function (locale) {
      return locale && typeof locale === 'object';
    });
  }
  return [];
}

function decmMatchFcLocalePack(lang) {
  var code = String(lang || 'en').toLowerCase();
  var short = code.split('-')[0];
  var packs = decmGetFcLocalesArray();
  var i;
  var pack;
  for (i = 0; i < packs.length; i++) {
    pack = packs[i];
    if (pack && (String(pack.code).toLowerCase() === code || String(pack.code).toLowerCase() === short)) {
      return pack;
    }
  }
  return null;
}

function decmHoldFcLocaleGlobals() {
  var held = {
    all: window.FullCalendarLocalesAll,
    map: window.FullCalendarLocales
  };
  window.FullCalendarLocalesAll = [];
  window.FullCalendarLocales = {};
  return held;
}

function decmRestoreFcLocaleGlobals(held) {
  if (!held) {
    return;
  }
  window.FullCalendarLocalesAll = held.all;
  window.FullCalendarLocales = held.map;
}

function decmFormatMonthTitle(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang || 'en', { month: 'long', year: 'numeric' }).format(date);
  } catch (e) {
    return date.getFullYear() + '-' + decmPad2(date.getMonth() + 1);
  }
}

function decmApplyLocalizedCalendarTitle($mount, date, lang, viewType) {
  if (!$mount || !$mount.length || !date) {
    return;
  }
  var title;
  if (viewType === 'listYear') {
    title = String(date.getFullYear());
  } else {
    title = decmFormatMonthTitle(date, lang);
  }
  $mount.find('.fc-toolbar h2').text(title);
}

function decmWeekStartFromSetting(raw) {
  if (raw === '' || raw === undefined || raw === null) {
    return 0;
  }
  if (!isNaN(raw) && String(raw).trim() !== '') {
    var parsed = parseInt(raw, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 6) {
      return parsed;
    }
  }
  var name = String(raw).trim().toLowerCase();
  var named = {
    sunday: 0, zondag: 0, sonntag: 0, dimanche: 0,
    monday: 1, maandag: 1, montag: 1, lundi: 1,
    tuesday: 2, dinsdag: 2, dienstag: 2, mardi: 2,
    wednesday: 3, woensdag: 3, mittwoch: 3, mercredi: 3,
    thursday: 4, donderdag: 4, donnerstag: 4, jeudi: 4,
    friday: 5, vrijdag: 5, freitag: 5, vendredi: 5,
    saturday: 6, zaterdag: 6, samstag: 6, samedi: 6
  };
  if (Object.prototype.hasOwnProperty.call(named, name)) {
    return named[name];
  }
  return 0;
}

function decmIsMonthLikeView(viewType) {
  return viewType === 'dayGridMonth' || viewType === 'listMonth' || viewType === 'listYear';
}

function decmDateToYearMonthDate(d) {
  if (!d || isNaN(d.getTime())) {
    d = new Date();
  }
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function decmAddCalendarMonths(date, delta) {
  var y = date.getFullYear();
  var m = date.getMonth() + delta;
  y += Math.floor(m / 12);
  m = ((m % 12) + 12) % 12;
  return new Date(y, m, 1);
}

function decmFcUtcMonthInput(date) {
  var d = decmDateToYearMonthDate(date);
  return [d.getFullYear(), d.getMonth(), 1];
}

function decmVisibleMonthDate(calendar) {
  var d = null;
  try {
    if (calendar && calendar.view && calendar.view.currentStart) {
      d = calendar.view.currentStart;
    }
  } catch (e) {}
  if (!d || isNaN(d.getTime())) {
    try {
      d = calendar.getDate();
    } catch (e2) {
      d = new Date();
    }
  }
  if (!d || isNaN(d.getTime())) {
    d = new Date();
  }
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), 1);
  }
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function decmGetCalendarLocalDate(calendar) {
  return decmVisibleMonthDate(calendar);
}

function decmFcUtcDateInput(date) {
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  return [date.getFullYear(), date.getMonth(), date.getDate()];
}

function decmShiftViewDate(date, viewType, delta) {
  var y = date.getFullYear();
  var m = date.getMonth();
  var d = date.getDate();
  if (viewType === 'listYear') {
    return new Date(y + delta, 0, 1);
  }
  if (viewType === 'dayGridMonth' || viewType === 'listMonth') {
    return decmAddCalendarMonths(new Date(y, m, 1), delta);
  }
  if (viewType === 'timeGridWeek' || viewType === 'listWeek') {
    return new Date(y, m, d + (delta * 7));
  }
  return new Date(y, m, d + delta);
}

function decmGotoCalendarDate(calendar, date, viewType) {
  var input;
  if (viewType === 'dayGridMonth' || viewType === 'listMonth' || viewType === 'listYear' || !viewType) {
    input = decmFcUtcMonthInput(date);
  } else {
    input = decmFcUtcDateInput(date);
  }
  try {
    calendar.gotoDate(input);
  } catch (e) {
    try {
      calendar.gotoDate(decmFormatLocalYmd(decmDateToYearMonthDate(date)));
    } catch (e2) {}
  }
}

function decmClampDateToLimitWindow(date, limitWindow) {
  if (!limitWindow || !date) {
    return date;
  }
  var ym = decmLocalYearMonth(date);
  var startYm = decmLocalYearMonth(limitWindow.start);
  var endYm = decmLocalYearMonth(decmLimitWindowLastMonth(limitWindow));
  if (ym < startYm) {
    return new Date(limitWindow.start.getFullYear(), limitWindow.start.getMonth(), 1);
  }
  if (ym > endYm) {
    var last = decmLimitWindowLastMonth(limitWindow);
    return new Date(last.getFullYear(), last.getMonth(), 1);
  }
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function decmSyncLimitEventNav($mount, currentMonth, limitWindow) {
  if (!$mount || !$mount.length) {
    return;
  }
  var $prev = $mount.find('.fc-prev-button, .fc-decmPrev-button');
  var $next = $mount.find('.fc-next-button, .fc-decmNext-button');
  $prev.prop('disabled', false).css('pointer-events', 'auto');
  $next.prop('disabled', false).css('pointer-events', 'auto');
  if (!limitWindow || !currentMonth) {
    $prev.css({ opacity: '', cursor: '' });
    $next.css({ opacity: '', cursor: '' });
    return;
  }
  var ym = decmLocalYearMonth(currentMonth);
  var canPrev = ym > decmLocalYearMonth(limitWindow.start);
  var canNext = ym < decmLocalYearMonth(decmLimitWindowLastMonth(limitWindow));
  $prev.css({
    opacity: canPrev ? '' : '0.45',
    cursor: canPrev ? '' : 'default',
    pointerEvents: 'auto'
  });
  $next.css({
    opacity: canNext ? '' : '0.45',
    cursor: canNext ? '' : 'default',
    pointerEvents: 'auto'
  });
}

function decmClampEventFetchRange(fetchInfo, myAjax) {
  var startStr = fetchInfo && fetchInfo.startStr ? String(fetchInfo.startStr).split('T')[0] : '';
  var endStr = fetchInfo && fetchInfo.endStr ? String(fetchInfo.endStr).split('T')[0] : '';
  var limitWindow = decmBuildLimitEventWindow(myAjax);
  if (!limitWindow) {
    return { start: startStr, end: endStr };
  }
  var windowStart = limitWindow.start;
  var windowEnd = new Date(limitWindow.end.getTime() - 1);
  var viewStart = fetchInfo && fetchInfo.start ? new Date(fetchInfo.start) : windowStart;
  var viewEnd = fetchInfo && fetchInfo.end ? new Date(fetchInfo.end) : windowEnd;
  var clampedStart = viewStart < windowStart ? windowStart : viewStart;
  var clampedEnd = viewEnd > windowEnd ? windowEnd : viewEnd;
  if (clampedStart > clampedEnd) {
    clampedStart = windowStart;
    clampedEnd = windowEnd;
  }
  return {
    start: decmFormatLocalYmd(clampedStart),
    end: decmFormatLocalYmd(clampedEnd),
  };
}

function decmSanitizeFcStartEnd(start, end) {
  var s = typeof start === 'string' ? start : '';
  var e = typeof end === 'string' ? end : '';
  if (/^\d{4}-\d{2}-\d{2}T$/i.test(s)) {
    s = s.slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}T$/i.test(e)) {
    e = e.slice(0, 10);
  }
  return { start: s, end: e };
}

function decmNormalizeCalendarEvents(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  var seen = {};
  var out = [];
  raw.forEach(function (ev, i) {
    if (!ev || typeof ev !== 'object') {
      return;
    }
    var se = decmSanitizeFcStartEnd(ev.start, ev.end);
    var id = ev.id != null && String(ev.id) !== ''
      ? String(ev.id)
      : (ev.ID != null ? String(ev.ID) : ('decm-' + i));
    var key = id + '|' + se.start + '|' + se.end;
    if (seen[key]) {
      return;
    }
    seen[key] = true;
    ev.start = se.start;
    ev.end = se.end;
    ev.id = id;
    ev.allDay = false;
    out.push(ev);
  });
  return out;
}

function decmEventOverlapsDay(ev, dateStr) {
  if (!ev || !ev.start || !dateStr) {
    return false;
  }
  var start = ev.start instanceof Date ? ev.start : new Date(ev.start);
  if (isNaN(start.getTime())) {
    return false;
  }
  var dayStart = new Date(dateStr + 'T00:00:00');
  var dayEnd = new Date(dayStart.getTime());
  dayEnd.setDate(dayEnd.getDate() + 1);
  var end = ev.end instanceof Date ? ev.end : (ev.end ? new Date(ev.end) : start);
  if (isNaN(end.getTime())) {
    end = start;
  }
  return start < dayEnd && end > dayStart;
}

function decmFixMoreLinkCounts(calendar, $calendarMount, limit) {
  if (!calendar || !$calendarMount || !$calendarMount.length) {
    return;
  }
  var events = [];
  try {
    events = calendar.getEvents() || [];
  } catch (err) {
    return;
  }
  limit = parseInt(limit, 10);
  if (isNaN(limit) || limit < 1) {
    limit = 2;
  }
  $calendarMount.find('.fc-row').each(function () {
    var $row = jQuery(this);
    $row.find('a.fc-more').each(function () {
      var moreEl = this;
      var moreRect = moreEl.getBoundingClientRect();
      var cx = moreRect.left + (moreRect.width / 2);
      var dateStr = '';
      var dayRect = null;
      $row.find('.fc-bg td.fc-day[data-date]').each(function () {
        var r = this.getBoundingClientRect();
        if (cx >= r.left && cx < r.right) {
          dateStr = this.getAttribute('data-date') || '';
          dayRect = r;
          return false;
        }
      });
      if (!dateStr || !dayRect) {
        return;
      }
      var total = 0;
      var seenEv = {};
      events.forEach(function (ev) {
        if (!decmEventOverlapsDay(ev, dateStr)) {
          return;
        }
        var key = String(ev.id || '') + '|' + (ev.start ? ev.start.valueOf() : '');
        if (seenEv[key]) {
          return;
        }
        seenEv[key] = true;
        total += 1;
      });
      var visible = 0;
      $row.find('.fc-content-skeleton .fc-event').each(function () {
        if (jQuery(this).closest('.fc-limited').length) {
          return;
        }
        var er = this.getBoundingClientRect();
        if (er.width < 2 || er.height < 2) {
          return;
        }
        if (er.left < dayRect.right && er.right > dayRect.left) {
          visible += 1;
        }
      });
      var hidden = Math.max(0, total - visible);
      if (hidden < 1) {
        moreEl.style.display = 'none';
        return;
      }
      moreEl.style.display = '';
      moreEl.textContent = '+' + hidden + ' more';
    });
  });
}

/** Resolve weekday column header format (abbreviated / full / narrow). */
function decmResolveWeekdayFormat($moduleRoot, myAjax) {
  var weekday;
  if (decmIsNarrowColumn($moduleRoot)) {
    weekday = decmResolveResponsiveSetting(myAjax, 'day_of_the_week_name') || 'narrow';
  } else {
    weekday = decmResolveResponsiveSetting(myAjax, 'day_of_the_week_name') || 'short';
  }
  weekday = String(weekday || 'short').toLowerCase();
  if (weekday === 'long' || weekday === 'dddd') {
    return 'long';
  }
  if (weekday === 'narrow' || weekday === 'dd' || weekday === 'd') {
    return 'narrow';
  }
  return 'short';
}

/**
 * FC v4 without @fullcalendar/moment uses NativeFormatter objects.
 * A moment string like 'ddd' creates CmdFormatter and throws:
 * "t.cmdFormatter is not a function".
 */
function decmResolveWeekdayNativeFormat($moduleRoot, myAjax) {
  return { weekday: decmResolveWeekdayFormat($moduleRoot, myAjax) };
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

function decmSerializeAdditionalFieldSettings(settings) {
  if (!settings) {
    return '';
  }
  if (typeof settings === 'string') {
    return settings;
  }
  try {
    return JSON.stringify(settings);
  } catch (e) {
    return '';
  }
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

function decmIsAllDayEvent(props) {
  if (!props) {
    return false;
  }
  var flag = props.is_all_day;
  if (flag === true || flag === 1 || flag === '1' || flag === 'true') {
    return true;
  }
  var startTime = props.event_start_time;
  return startTime == null || String(startTime).trim() === '';
}

function decmAllDayListTimeText(props) {
  var text = (props && (props.allDayEvent || props.calallday || props.all_day_text))
    ? String(props.allDayEvent || props.calallday || props.all_day_text).trim()
    : '';
  return text || 'All Day Event';
}

function decmSetListItemTime(info, timeText) {
  var $row = jQuery(info.el);
  var $existing = $row.children('.fc-list-item-time, .fc-list-event-time');
  // List view never shows calendar-day thumbnails (Visual Builder parity).
  var html = timeText || '\u00a0';
  if ($existing.length) {
    $existing.first().html(html);
    $existing.slice(1).remove();
  } else {
    $row.prepend('<td class="fc-list-item-time fc-widget-content">' + html + '</td>');
  }
}

var DECM_WEEKDAY_NAME_TO_INDEX = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

function decmNormalizeHiddenWeekdays(raw) {
  var days = [];
  var seen = {};
  function addDay(day) {
    var named = DECM_WEEKDAY_NAME_TO_INDEX[String(day == null ? '' : day).trim().toLowerCase()];
    var parsed = named !== undefined ? named : parseInt(day, 10);
    if (parsed >= 0 && parsed <= 6 && !seen[parsed]) {
      seen[parsed] = true;
      days.push(parsed);
    }
  }
  if (Array.isArray(raw)) {
    var asFlags = raw.length === 7;
    var i;
    if (asFlags) {
      for (i = 0; i < raw.length; i++) {
        var flag = String(raw[i] == null ? '' : raw[i]).trim().toLowerCase();
        if (flag !== 'on' && flag !== 'off' && flag !== '1' && flag !== '0' && flag !== '') {
          asFlags = false;
          break;
        }
      }
    }
    if (asFlags) {
      for (i = 0; i < raw.length; i++) {
        flag = String(raw[i] == null ? '' : raw[i]).trim().toLowerCase();
        if (flag === 'on' || flag === '1') {
          addDay(i);
        }
      }
      return days;
    }
    raw.forEach(addDay);
    return days;
  }
  if (typeof raw === 'string' && raw.trim() !== '') {
    if (raw.indexOf('|') !== -1) {
      raw.split('|').forEach(function (flag, index) {
        var normalized = flag.trim().toLowerCase();
        if (normalized === 'on' || normalized === '1') {
          addDay(index);
        }
      });
      return days;
    }
    raw.split(/[,\s]+/).forEach(addDay);
  }
  return days;
}

function decmWeekdayFromYmd(ymd) {
  var match = String(ymd || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) {
    return -1;
  }
  return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10)).getDay();
}

function decmIsListDayHeading(el) {
  return el && el.classList && (el.classList.contains('fc-list-day') || el.classList.contains('fc-list-heading'));
}

/** Hide list-view day groups whose weekday is in Disable Days of the Week. */
function decmApplyListViewHiddenDays($calendarMount, hiddenDays) {
  var container = $calendarMount && $calendarMount.length ? $calendarMount.get(0) : null;
  if (!container) {
    return;
  }
  var hidden = {};
  (hiddenDays || []).forEach(function (day) {
    hidden[Number(day)] = true;
  });
  var headings = container.querySelectorAll('.fc-list-day, .fc-list-heading');
  headings.forEach(function (heading) {
    var weekday = decmWeekdayFromYmd(heading.getAttribute('data-date') || '');
    var hide = weekday >= 0 && hidden[weekday];
    var display = hide ? 'none' : '';
    heading.style.display = display;
    var sibling = heading.nextElementSibling;
    while (sibling && !decmIsListDayHeading(sibling)) {
      sibling.style.display = display;
      sibling = sibling.nextElementSibling;
    }
    var table = heading.closest ? heading.closest('table') : null;
    if (table && table.querySelectorAll('.fc-list-day, .fc-list-heading').length === 1) {
      table.style.display = hide ? 'none' : '';
    }
  });
}

/** Apply Days-of-the-Week design colors after FC v4 paints the header row / list headings. */
function decmSetCssImportant($nodes, props) {
  if (!$nodes || !$nodes.length) {
    return;
  }
  $nodes.each(function () {
    var el = this;
    if (!el || !el.style || typeof el.style.setProperty !== 'function') {
      return;
    }
    Object.keys(props).forEach(function (name) {
      el.style.setProperty(name, props[name], 'important');
    });
  });
}

/** Apply Days-of-the-Week design colors after FC v4 paints the header row / list headings. */
function decmApplyDaysOfWeekDesign($calendarMount, myAjax) {
  if (!$calendarMount || !$calendarMount.length || !myAjax) {
    return;
  }
  var $headers = $calendarMount.find('.fc-day-header');
  if (!$headers.length) {
    $headers = $calendarMount.find('th.fc-col-header-cell');
  }
  var headerColor = myAjax.week_font_color || '#2C3E50';
  if ($headers.length) {
    if (myAjax.week_background_color) {
      decmSetCssImportant($headers, { 'background-color': myAjax.week_background_color });
    }
    decmSetCssImportant($headers.add($headers.find('span, a')), {
      color: headerColor,
      'text-transform': 'none'
    });
  }

  var $listHeadings = $calendarMount.find('.fc-list-heading td, .fc-list-heading-main, .fc-list-heading-alt, a.fc-list-heading-main, a.fc-list-heading-alt, .fc-list-day-text, .fc-list-day-side-text, .fc-list-day-cushion');
  var listHeadingColor = myAjax.week_font_color || '#2C3E50';
  if ($listHeadings.length) {
    decmSetCssImportant($listHeadings, { color: listHeadingColor, 'font-weight': '700' });
  }
  decmSetCssImportant($calendarMount.find('.fc-list-heading td, .fc-list-day-cushion'), {
    'background-color': 'rgba(208, 208, 208, 0.3)',
    background: 'rgba(208, 208, 208, 0.3)',
    border: '1px solid #ddd',
    padding: '8px 14px'
  });
  decmSetCssImportant($calendarMount.find('.fc-day-header'), {
    border: '1px solid rgb(221, 221, 221)',
    padding: '9px 0'
  });

  var eventBg = myAjax.events_background_color || '';
  var eventFg = myAjax.events_font_color || '';
  if (eventBg || eventFg) {
    var $fcColorTargets = $calendarMount.add($calendarMount.find('.fc'));
    $fcColorTargets.each(function () {
      if (eventBg) {
        this.style.setProperty('--fc-event-bg-color', eventBg, 'important');
        this.style.setProperty('--fc-event-border-color', eventBg, 'important');
        this.style.setProperty('--decm-list-event-row-bg', eventBg, 'important');
        this.style.setProperty('--decm-list-event-row-hover-bg', eventBg, 'important');
      }
      if (eventFg) {
        this.style.setProperty('--fc-event-text-color', eventFg, 'important');
      }
    });
  }

  if (myAjax.nav_background_color || myAjax.nav_font_color) {
    var $nav = $calendarMount.find('.fc-today-button, .fc-prev-button, .fc-next-button');
    if (myAjax.nav_background_color) {
      $nav.css('background-color', myAjax.nav_background_color);
    }
    if (myAjax.nav_font_color) {
      $nav.css('color', myAjax.nav_font_color);
    }
  }

  var $viewButtons = $calendarMount.find('.fc-dayGridMonth-button, .fc-timeGridWeek-button, .fc-timeGridDay-button, .fc-listWeek-button, .fc-listMonth-button, .fc-listYear-button');
  if ($viewButtons.length) {
    if (myAjax.view_background_color) {
      $viewButtons.css('background-color', myAjax.view_background_color);
    }
    if (myAjax.view_font_color) {
      $viewButtons.css('color', myAjax.view_font_color);
    }
    var $activeView = $viewButtons.filter('.fc-button-active');
    if (myAjax.current_view_background_color) {
      $activeView.css('background-color', myAjax.current_view_background_color);
    }
    if (myAjax.current_view_font_color) {
      $activeView.css('color', myAjax.current_view_font_color);
    }
  }
}

function decmEnsureCalendarLoaderStyles() {
  if (document.getElementById('decm-calendar-loader-css')) {
    return;
  }
  var style = document.createElement('style');
  style.id = 'decm-calendar-loader-css';
  style.textContent =
    '@keyframes decm-et-loader{0%{background-size:0 4px,4px 0,0 4px,4px 0}12.5%{background-size:100% 4px,4px 0,0 4px,4px 0}25%{background-size:100% 4px,4px 100%,0 4px,4px 0}37.5%{background-size:100% 4px,4px 100%,100% 4px,4px 0}45%,55%{background-size:100% 4px,4px 100%,100% 4px,4px 100%}62.5%{background-size:0 4px,4px 100%,100% 4px,4px 100%}75%{background-size:0 4px,4px 0,100% 4px,4px 100%}87.5%{background-size:0 4px,4px 0,0 4px,4px 100%}100%{background-size:0 4px,4px 0,0 4px,4px 0}}' +
    '@keyframes decm-et-loader-2{0%,49.9%{background-position:0 0,100% 0,100% 100%,0 100%}50%,100%{background-position:100% 0,100% 100%,0 100%,0 0}}' +
    '.decm-calendar-loader-host{position:relative !important}' +
    '.decm-events-loader--overlay[data-decm-calendar-loader]{position:absolute;inset:0;z-index:99999;display:flex;justify-content:center;align-items:center;min-height:200px;width:100%;background:rgba(255,255,255,.7);pointer-events:all}' +
    '.decm-events-loader--overlay .et-vb-loader-wrapper{display:flex;justify-content:center;align-items:center}' +
    '.decm-events-loader--overlay .et-vb-loader{box-sizing:border-box;display:block;width:35px;height:35px;background:no-repeat linear-gradient(#326bff 0 0) 0 0,no-repeat linear-gradient(#326bff 0 0) 100% 0,no-repeat linear-gradient(#326bff 0 0) 100% 100%,no-repeat linear-gradient(#326bff 0 0) 0 100%;animation:decm-et-loader 2s infinite,decm-et-loader-2 2s infinite}';
  (document.head || document.documentElement).appendChild(style);
}

function decmGetCalendarLoaderHost($calendarMount) {
  if (!$calendarMount || !$calendarMount.length) {
    return $calendarMount;
  }
  var $host = $calendarMount.closest(
    '.decm_divi_event_calendar, [class*="decm_divi_event_calendar"], [class*="et_pb_event_calendar"]'
  );
  if (!$host.length) {
    $host = $calendarMount;
  }
  $host.addClass('decm-calendar-loader-host');
  return $host;
}

function decmCalendarLoaderHtml() {
  return (
    '<div class="decm-events-loader et-vb-loader-inline decm-events-loader--overlay" data-decm-calendar-loader="1" role="status" aria-live="polite" aria-label="Loading events">' +
      '<div class="et-vb-loader-wrapper" aria-hidden="true">' +
        '<span class="et-vb-loader"></span>' +
      '</div>' +
    '</div>'
  );
}

function decmShowCalendarLoading($calendarMount) {
  if (!$calendarMount || !$calendarMount.length) {
    return;
  }
  decmEnsureCalendarLoaderStyles();
  var $host = decmGetCalendarLoaderHost($calendarMount);
  var hostEl = $host.get(0);
  if (hostEl && hostEl.decmLoaderHideTimer) {
    clearTimeout(hostEl.decmLoaderHideTimer);
    hostEl.decmLoaderHideTimer = null;
  }
  $host.find('.fc-list-empty-wrap2').has('.spinner_calendar').remove();
  $calendarMount.find('.fc-list-empty-wrap2').has('.spinner_calendar').remove();
  if (!$host.find('[data-decm-calendar-loader]').length) {
    $host.append(decmCalendarLoaderHtml());
  }
  $host.addClass('decm-calendar-is-loading');
  $calendarMount.addClass('decm-calendar-is-loading');
  $host.attr('aria-busy', 'true');
  if (hostEl) {
    hostEl.decmLoaderShownAt = Date.now();
    hostEl.decmLoaderPendingHide = false;
  }
}

function decmHideCalendarLoadingNow($calendarMount) {
  if (!$calendarMount || !$calendarMount.length) {
    return;
  }
  var $host = decmGetCalendarLoaderHost($calendarMount);
  var hostEl = $host.get(0);
  if (hostEl) {
    hostEl.decmLoaderPendingHide = false;
    hostEl.decmLoaderHideTimer = null;
  }
  $host.find('[data-decm-calendar-loader]').remove();
  $calendarMount.find('[data-decm-calendar-loader]').remove();
  $host.find('.fc-list-empty-wrap2').has('.spinner_calendar').remove();
  $calendarMount.find('.fc-list-empty-wrap2').has('.spinner_calendar').remove();
  $host.removeClass('decm-calendar-is-loading');
  $calendarMount.removeClass('decm-calendar-is-loading');
  $host.removeAttr('aria-busy');
  $calendarMount.find('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').removeClass('ecs_is_loading_check');
}

function decmClearCalendarLoading($calendarMount) {
  if (!$calendarMount || !$calendarMount.length) {
    return;
  }
  var $host = decmGetCalendarLoaderHost($calendarMount);
  var hostEl = $host.get(0);
  var minMs = 450;
  var shownAt = hostEl && hostEl.decmLoaderShownAt ? hostEl.decmLoaderShownAt : 0;
  var wait = shownAt ? Math.max(0, minMs - (Date.now() - shownAt)) : 0;
  if (!wait) {
    decmHideCalendarLoadingNow($calendarMount);
    return;
  }
  if (hostEl) {
    hostEl.decmLoaderPendingHide = true;
    clearTimeout(hostEl.decmLoaderHideTimer);
    hostEl.decmLoaderHideTimer = setTimeout(function () {
      if (hostEl.decmLoaderPendingHide) {
        decmHideCalendarLoadingNow($calendarMount);
      }
    }, wait);
  }
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
  if (calendarMountEl) {
    var leftover = calendarMountEl.querySelector('[data-decm-fe-tooltip]');
    if (leftover && leftover.parentNode) {
      leftover.parentNode.removeChild(leftover);
    }
  }
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
  return decmResolveResponsiveSetting(myAjax, 'show_tooltip') === 'on';
}

function decmPlaceCalendarTooltip(tooltip, eventEl, mountEl, viewType) {
  var eventRect = eventEl.getBoundingClientRect();
  var calendarRect = mountEl.getBoundingClientRect();
  var tooltipWidth = tooltip.offsetWidth;
  var tooltipHeight = tooltip.offsetHeight;
  var gap = 10;
  var maxLeft = Math.max(0, calendarRect.width - tooltipWidth);
  var maxTop = Math.max(0, calendarRect.height - tooltipHeight);
  var left;
  var top = eventRect.top - calendarRect.top;
  var isList = typeof viewType === 'string' && viewType.indexOf('list') === 0;

  if (isList) {
    left = maxLeft;
  } else {
    left = eventRect.left - calendarRect.left - tooltipWidth - gap;
    if (left < 0) {
      left = eventRect.right - calendarRect.left + gap;
    }
  }

  tooltip.style.left = Math.min(Math.max(0, left), maxLeft) + 'px';
  tooltip.style.top = Math.min(Math.max(0, top), maxTop) + 'px';
}

function decmCreateCalendarTooltip(calendarMountEl, $calendarMount, $moduleRoot, infoEl, html) {
  decmDisposeAllCalendarTooltips();
  if (!infoEl || !html || !calendarMountEl) {
    return;
  }

  var existing = calendarMountEl.querySelector('[data-decm-fe-tooltip]');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  var tooltip = document.createElement('div');
  tooltip.className = 'dec-tooltip tooltip_main';
  tooltip.setAttribute('data-decm-fe-tooltip', '1');
  tooltip.setAttribute('role', 'tooltip');
  tooltip.innerHTML = html;
  tooltip.style.position = 'absolute';
  tooltip.style.zIndex = '99999';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.opacity = '1';
  tooltip.style.visibility = 'visible';
  tooltip.style.display = 'block';
  calendarMountEl.appendChild(tooltip);

  var viewType = '';
  try {
    if (calendarMountEl.decmFcInstance && calendarMountEl.decmFcInstance.view) {
      viewType = calendarMountEl.decmFcInstance.view.type || '';
    }
  } catch (e) {}

  var place = function () {
    if (!tooltip.isConnected) {
      return;
    }
    decmPlaceCalendarTooltip(tooltip, infoEl, calendarMountEl, viewType);
  };
  place();
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(place);
  }

  calendarMountEl.decmTooltipInstance = {
    dispose: function () {
      if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }
  };
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


/**
 * FullCalendar v4 hides the last visible event row when more events exist below
 * it (`[seg].concat(segsBelow)`). That makes eventLimit=2 show only 1 bar.
 * Match v6 dayMaxEvents: keep all N visible rows and append "+ more" under them.
 */
function decmPatchFcDayGridLimitRow() {
  var DayGrid = window.FullCalendarDayGrid && window.FullCalendarDayGrid.DayGrid;
  if (!DayGrid || !DayGrid.prototype) {
    return false;
  }
  if (DayGrid.prototype.decmLimitRowPatched) {
    return true;
  }
  DayGrid.prototype.decmLimitRowPatched = true;

  var originalUnlimitRow = DayGrid.prototype.unlimitRow;
  DayGrid.prototype.unlimitRow = function (row) {
    if (typeof originalUnlimitRow === 'function') {
      originalUnlimitRow.call(this, row);
    }
    var rowStruct = this.eventRenderer && this.eventRenderer.rowStructs
      ? this.eventRenderer.rowStructs[row]
      : null;
    var tbody = rowStruct && rowStruct.tbodyEl;
    if (!tbody) {
      return;
    }
    var extraRows = tbody.querySelectorAll('tr.decm-more-row');
    var r;
    for (r = extraRows.length - 1; r >= 0; r--) {
      if (extraRows[r].parentNode) {
        extraRows[r].parentNode.removeChild(extraRows[r]);
      }
    }
  };

  DayGrid.prototype.limitRow = function (row, levelLimit) {
    var colCnt = this.colCnt;
    var isRtl = this.isRtl;
    var rowStruct = this.eventRenderer && this.eventRenderer.rowStructs
      ? this.eventRenderer.rowStructs[row]
      : null;
    if (!rowStruct || !rowStruct.segLevels || !rowStruct.cellMatrix || !rowStruct.tbodyEl) {
      return;
    }
    var moreNodes = [];
    var col = 0;
    var levelSegs;
    var cellMatrix;
    var limitedNodes;
    var i;
    var seg;
    var segsBelow;
    var totalSegsBelow;
    var colSegsBelow;
    var td;
    var j;
    var moreWrap;
    var moreLink;
    var extraTr = null;
    var self = this;

    var appendMoreLink = function (targetTd, linkCol, hiddenSegs) {
      if (!targetTd || !hiddenSegs || !hiddenSegs.length) {
        return;
      }
      moreLink = self.renderMoreLink(row, linkCol, hiddenSegs);
      moreWrap = document.createElement('div');
      moreWrap.className = 'decm-more-wrap';
      moreWrap.appendChild(moreLink);
      targetTd.appendChild(moreWrap);
      moreNodes.push(moreWrap);
    };

    var ensureExtraMoreRow = function () {
      if (extraTr) {
        return extraTr;
      }
      extraTr = document.createElement('tr');
      extraTr.className = 'decm-more-row';
      var c;
      for (c = 0; c < colCnt; c++) {
        extraTr.appendChild(document.createElement('td'));
      }
      var lastVisibleTr = rowStruct.tbodyEl.children[levelLimit - 1];
      if (lastVisibleTr && lastVisibleTr.nextSibling) {
        rowStruct.tbodyEl.insertBefore(extraTr, lastVisibleTr.nextSibling);
      } else {
        rowStruct.tbodyEl.appendChild(extraTr);
      }
      return extraTr;
    };

    var emptyCellsUntil = function (endCol) {
      while (col < endCol) {
        segsBelow = self.getCellSegs(row, col, levelLimit);
        if (segsBelow.length) {
          td = cellMatrix[levelLimit - 1][col];
          appendMoreLink(td, col, segsBelow);
        }
        col++;
      }
    };

    if (levelLimit && levelLimit < rowStruct.segLevels.length) {
      levelSegs = rowStruct.segLevels[levelLimit - 1] || [];
      cellMatrix = rowStruct.cellMatrix;
      limitedNodes = Array.prototype.slice.call(rowStruct.tbodyEl.children).slice(levelLimit);
      limitedNodes.forEach(function (node) {
        node.classList.add('fc-limited');
      });

      for (i = 0; i < levelSegs.length; i++) {
        seg = levelSegs[i];
        var leftCol = isRtl ? (colCnt - 1 - seg.lastCol) : seg.firstCol;
        var rightCol = isRtl ? (colCnt - 1 - seg.firstCol) : seg.lastCol;
        emptyCellsUntil(leftCol);
        colSegsBelow = [];
        totalSegsBelow = 0;
        while (col <= rightCol) {
          segsBelow = this.getCellSegs(row, col, levelLimit);
          colSegsBelow.push(segsBelow);
          totalSegsBelow += segsBelow.length;
          col++;
        }
        if (totalSegsBelow) {
          td = cellMatrix[levelLimit - 1][leftCol];
          var span = (td && td.colSpan) ? td.colSpan : 1;
          for (j = 0; j < colSegsBelow.length; j++) {
            segsBelow = colSegsBelow[j];
            if (!segsBelow.length) {
              continue;
            }
            if (span > 1) {
              appendMoreLink(ensureExtraMoreRow().children[leftCol + j], leftCol + j, segsBelow);
            } else {
              appendMoreLink(cellMatrix[levelLimit - 1][leftCol + j], leftCol + j, segsBelow);
            }
          }
        }
      }
      emptyCellsUntil(this.colCnt);
      rowStruct.moreEls = moreNodes;
      rowStruct.limitedEls = limitedNodes;
    }
  };

  return true;
}

decmPatchFcDayGridLimitRow();

document.addEventListener("DOMContentLoaded", function () {
  decmPatchFcDayGridLimitRow();
  function decmInitCalendar(calendarMountEl, myAjax) {
  decmPatchFcDayGridLimitRow();
  if (!calendarMountEl || !myAjax) {
    return;
  }

  var calendarConfigSource = {};
  Object.keys(myAjax).forEach(function (key) {
    calendarConfigSource[key] = myAjax[key];
  });
  function applyResponsiveOverlay() {
    var resolved = decmCloneWithResponsiveValues(calendarConfigSource);
    Object.keys(resolved).forEach(function (key) {
      myAjax[key] = resolved[key];
    });
  }
  applyResponsiveOverlay();
  var calendarEventsFetchActive = false;
  var calendarClickLoaderTimer = null;

  var $calendarMount = jQuery(calendarMountEl);
  var $moduleRoot = $calendarMount.closest(
    '.decm_divi_event_calendar, [class*="decm_divi_event_calendar"], [class*="et_pb_event_calendar"]'
  );
  var eventNs = '.decmCal_' + decmSanitizeEventNs(calendarMountEl.id);
  var language = decmNormalizeFcLocale(document.getElementsByTagName("html")[0].getAttribute("lang"));
  var uiLocalePack = decmMatchFcLocalePack(language);
  var uiButtonText = uiLocalePack && uiLocalePack.buttonText ? uiLocalePack.buttonText : null;
  var uiAllDayText = uiLocalePack && uiLocalePack.allDayText ? uiLocalePack.allDayText : 'All Day Event';

  let number_event_day = 2;
  if (myAjax.number_event_day === "default") {
    number_event_day = 1;
  } else if (typeof myAjax.number_event_day === 'number' && !isNaN(myAjax.number_event_day)) {
    number_event_day = Math.max(1, parseInt(myAjax.number_event_day, 10));
  } else if (
    typeof myAjax.number_event_day === 'string' &&
    myAjax.number_event_day.trim() !== '' &&
    !isNaN(parseInt(myAjax.number_event_day, 10))
  ) {
    number_event_day = Math.max(1, parseInt(myAjax.number_event_day, 10));
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

  // Desktop toolbar strings must use the original config, not the current-breakpoint overlay.
  var showMonthView = calendarConfigSource.show_month_view_button !== undefined && calendarConfigSource.show_month_view_button !== '' ? calendarConfigSource.show_month_view_button : 'on';
  var showWeekView = calendarConfigSource.show_week_view_button !== undefined && calendarConfigSource.show_week_view_button !== '' ? calendarConfigSource.show_week_view_button : 'on';
  var showDayView = calendarConfigSource.show_day_view_button !== undefined && calendarConfigSource.show_day_view_button !== '' ? calendarConfigSource.show_day_view_button : 'on';
  var showListView = calendarConfigSource.show_list_view_button !== undefined && calendarConfigSource.show_list_view_button !== '' ? calendarConfigSource.show_list_view_button : 'on';
  var desktopListViewOption = calendarConfigSource.calendar_list_view_option;
  var tabletListViewOption = calendarConfigSource.calendar_list_view_option_tablet || desktopListViewOption;
  var phoneListViewOption = calendarConfigSource.calendar_list_view_option_phone || tabletListViewOption;

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
    calendarView += decmNormalizeListViewOption(desktopListViewOption);
    if (!calendarView.endsWith(',')) {
      calendarView += ',';
    }
  }
  
  // Remove trailing comma and ensure at least one view
  calendarView = calendarView.replace(/,$/, '');
  if (calendarView === '') {
    calendarView = 'dayGridMonth';
  }
  
  var limitEventWindow = decmBuildLimitEventWindow(myAjax);
  var decmLimitClampBusy = false;
  var decmNavMonth = new Date();
  decmNavMonth = new Date(decmNavMonth.getFullYear(), decmNavMonth.getMonth(), 1);
  if (limitEventWindow) {
    decmNavMonth = decmClampDateToLimitWindow(decmNavMonth, limitEventWindow);
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
      tabletDefaultView = decmNormalizeListViewOption(tabletListViewOption);
    }
  } else if (calendarConfigSource.calendar_default_view) {
    tabletDefaultView = calendarConfigSource.calendar_default_view;
    if (tabletDefaultView == "listWeek" || tabletDefaultView == "listMonth" || tabletDefaultView == "listYear") {
      tabletDefaultView = decmNormalizeListViewOption(desktopListViewOption);
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
    calendarViewTablet += decmNormalizeListViewOption(tabletListViewOption);
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
      phoneDefaultView = decmNormalizeListViewOption(phoneListViewOption);
    }
  } else if (calendarConfigSource.calendar_default_view) {
    phoneDefaultView = calendarConfigSource.calendar_default_view;
    if (phoneDefaultView == "listWeek" || phoneDefaultView == "listMonth" || phoneDefaultView == "listYear") {
      phoneDefaultView = decmNormalizeListViewOption(desktopListViewOption);
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
    calendarViewPhone += decmNormalizeListViewOption(phoneListViewOption);
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
  var week_start_on = decmWeekStartFromSetting(myAjax.week_start_on);
  var hiddenWeekdays = decmNormalizeHiddenWeekdays(myAjax.hidden_day);
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

  var hide_past_event = decmResolveResponsiveSetting(calendarConfigSource, 'hide_past_event') == "on" ? new Date() : "";

  // Function to get the appropriate view buttons based on screen width
  function getResponsiveViewButtons() {
    var breakpoint = decmGetContentBreakpoint();
    if (breakpoint === 'phone') {
      return calendarViewPhone;
    }
    if (breakpoint === 'tablet') {
      return calendarViewTablet;
    }
    return calendarView;
  }

  // Get initial view buttons based on current screen width
  var initialViewButtons = getResponsiveViewButtons();

  // Function to get the correct default view, handling list view options
  function getDefaultView() {
    var defaultView = decmResolveResponsiveSetting(calendarConfigSource, 'calendar_default_view')
      || myAjax.calendar_default_view
      || 'dayGridMonth';

    // If default view is a list view, use the calendar_list_view_option
    if (defaultView == "listWeek" || defaultView == "listMonth" || defaultView == "listYear" || defaultView == "listDay") {
      defaultView = decmNormalizeListViewOption(
        decmResolveResponsiveSetting(calendarConfigSource, 'calendar_list_view_option')
        || myAjax.calendar_list_view_option
      );
    }

    return defaultView;
  }

  var hiddenSlotTimes = getHiddenSlotTimes(
    myAjax.hide_time_range_in_week_day,
    myAjax.start_point,
    myAjax.end_point
  );

  var calendar;
  var decmHeaderLeft = 'prev,next today';

  calendar = new FullCalendar.Calendar(calendarEl, {
    minTime: hiddenSlotTimes.slotMinTime,
    maxTime: hiddenSlotTimes.slotMaxTime,
    scrollTime: hiddenSlotTimes.slotMinTime,
    eventOrder: myAjax.calendar_eventorder,
    showNonCurrentDates: myAjax.hide_pre_nxt_event === 'on' ? false : true,
    displayEventTime: false,
    allDayText: uiAllDayText || 'All Day Event',
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
      left: decmHeaderLeft,
      center: 'title',
      right: initialViewButtons,
    },

    hiddenDays: hiddenWeekdays,

    firstDay: week_start_on,
    locale: language,
    locales: decmGetFcLocalesArray(),
    eventLimit: number_event_day,
    eventLimitClick: 'popover',
    eventLimitText: function (n) {
      return '+' + n + ' more';
    },
    nextDayThreshold: '00:00:00',
    columnHeaderFormat: decmResolveWeekdayNativeFormat($moduleRoot, myAjax),
    views: {
      dayGridMonth: {
        columnHeaderFormat: decmResolveWeekdayNativeFormat($moduleRoot, myAjax),
      },
      timeGridWeek: {
        columnHeaderFormat: decmResolveWeekdayNativeFormat($moduleRoot, myAjax),
      },
      timeGridDay: {
        columnHeaderFormat: decmResolveWeekdayNativeFormat($moduleRoot, myAjax),
      },
      listWeek: {
        duration: { weeks: 1 },
        buttonText: 'List',
      },
      listMonth: {
        duration: { months: 1 },
        buttonText: 'List',
      },
      listYear: {
        duration: { years: 1 },
        buttonText: 'List',
      },
    },


    loading: function (isLoading) {
      if (isLoading) {
        calendarEventsFetchActive = true;
        decmShowCalendarLoading($calendarMount);
        return;
      }
      calendarEventsFetchActive = false;
      scheduleHiddenTimeRangeApply(calendar, myAjax, $calendarMount);
      decmClearCalendarLoading($calendarMount);
      decmApplyDaysOfWeekDesign($calendarMount, myAjax);
      decmFixMoreLinkCounts(calendar, $calendarMount, number_event_day);
      decmApplyListViewHiddenDays($calendarMount, hiddenWeekdays);
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
      decmFixMoreLinkCounts(calendar, $calendarMount, number_event_day);
      decmApplyListViewHiddenDays($calendarMount, hiddenWeekdays);
      if (limitEventWindow && !decmLimitClampBusy && info.view && decmIsMonthLikeView(info.view.type)) {
        var visible = decmVisibleMonthDate(calendar);
        var clamped = decmClampDateToLimitWindow(visible, limitEventWindow);
        if (decmLocalYearMonth(clamped) !== decmLocalYearMonth(visible)) {
          decmLimitClampBusy = true;
          decmGotoCalendarDate(calendar, clamped, info.view.type);
          decmLimitClampBusy = false;
          visible = clamped;
        }
        decmNavMonth = visible;
        decmSyncLimitEventNav($calendarMount, visible, limitEventWindow);
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
      if ((calendar.view.type == 'dayGridMonth' || calendar.view.type == 'timeGridWeek' || calendar.view.type == 'timeGridDay') && info.el.querySelector('.fc-title')) {

        if (info.event.extendedProps.event_start_time == null) {
          // if (myAjax.show_calendar_event_date_tablet == "on" || myAjax.show_calendar_event_date_tablet == "") {
          //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date_tablet == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
          // }
          // if (myAjax.show_calendar_event_date_phone == "on" || myAjax.show_calendar_event_date_phone == "") {
          //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date_phone == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
          // }
          if (myAjax.hide_calendar_event_all_day == "on") {
            //info.el.querySelector('.fc-title').innerHTML =show_calendar_thumbnail+ '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
          }
          else {
            // console.log('allDayEvent else', info.event.extendedProps.allDayEvent);
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
        }
        if ((info.event.extendedProps.event_start_time != null)) {

          if (myAjax.hide_calendar_event_multi_days == "on" && info.event.extendedProps.event_end_date != "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
            //  info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
          }
          else if (myAjax.hide_calendar_event_multi_days == "off" && info.event.extendedProps.event_end_date != "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
          if (myAjax.show_calendar_event_date == "off" && info.event.extendedProps.event_end_date == "") {
            if (myAjax.show_event_end_date == "on") {
              info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.event_end_time + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
            } else {

              info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
            }
          }
          else if (myAjax.show_calendar_event_date == "on" && info.event.extendedProps.event_end_date == "") {
            info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>";
            // info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail+ '<span class="fc-calendar-title">' + info.event.title + "</span>" ;
          }
        }






        if (myAjax.show_calendar_event_date === 'on') {


          let eventStartTime = info.event.extendedProps.event_start_time;
          let eventTimeHtml = '';
          let timeZoneHtml = myAjax.show_time_zone_on_calendar === "on" ? '<span class="fc-calendar-show-time-zone">' + info.event.extendedProps.show_time_zone_on_calendar + '</span><br>' : "";


          if (eventStartTime != null ) {
            eventTimeHtml = '<span class="fc-calendar-time">' + decmGetEventTimeDisplay(myAjax, info.event.extendedProps) + '</span><br>';
          }
          else if(info.event.extendedProps.allDayEvent != null && myAjax.hide_calendar_event_all_day != "on"){
            eventTimeHtml = '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span><br>';
          }

          info.el.querySelector('.fc-title').innerHTML =
            show_calendar_thumbnail + eventTimeHtml + timeZoneHtml +
            '<span class="fc-calendar-title">' + info.event.title + '</span>';
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
        //     '<span class="fc-calendar-time rafy">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span><br>' +
        //     '<span class="fc-calendar-shshow-time-zone">' + info.event.extendedProps.show_time_zone_on_calendar + '</span><br>' +
        //     '<span class="fc-calendar-title">' + info.event.title + '</span>';
        // }

        // else {
        //   info.el.querySelector('.fc-title').innerHTML = myAjax.show_calendar_event_date == "on" ? show_calendar_thumbnail+'<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span><br><span class="fc-calendar-title">' + info.event.title + "</span>" : '<span class="fc-calendar-title">' + info.event.title + "</span>";
        // }
      }

      // if(calendar.view.type=='timeGridWeek'||calendar.view.type=='timeGridDay'){
      //   jQuery("td").first(".fc-widget-content").css('border', 'none');
      // }
      if (calendar.view.type == 'listWeek' || calendar.view.type == 'listMonth' || calendar.view.type == 'listYear' || calendar.view.type == 'listDay') {
        var listProps = info.event.extendedProps || {};
        var isAllDayEvent = decmIsAllDayEvent(listProps);
        var listTimeText = '';
        if (isAllDayEvent) {
          // List view always shows the all-day label (VB/FC parity). Hide Time applies to month/week/day chips.
          listTimeText = decmAllDayListTimeText(listProps);
        } else if (myAjax.show_calendar_event_date != 'off') {
          // Use the event's clock times on every list-view day, not FC segment times
          // (e.g. 11:00am-4:00pm each day instead of 11:00am-12:00am / all-day / 12:00am-4:00pm).
          listTimeText = decmGetEventTimeDisplay(myAjax, listProps);
        }
        decmSetListItemTime(info, listTimeText);
        if (info.el.querySelector('.fc-list-item-title')) {
          info.el.querySelector('.fc-list-item-title').innerHTML = info.event.title;
        }
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
      var fetchRange = decmClampEventFetchRange(info, myAjax);
      calendarEventsFetchActive = true;
      decmShowCalendarLoading($calendarMount);

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
        "&show_image_tablet=" + (calendarConfigSource.show_image_tablet || '') +
        "&show_image_phone=" + (calendarConfigSource.show_image_phone || '') +
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
        "&show_month_view_button_tablet=" + (calendarConfigSource.show_month_view_button_tablet || '') +
        "&show_list_view_button_tablet=" + (calendarConfigSource.show_list_view_button_tablet || '') +
        "&show_week_view_button_tablet=" + (calendarConfigSource.show_week_view_button_tablet || '') +
        "&show_day_view_button_tablet=" + (calendarConfigSource.show_day_view_button_tablet || '') +
        "&show_month_view_button_phone=" + (calendarConfigSource.show_month_view_button_phone || '') +
        "&show_list_view_button_phone=" + (calendarConfigSource.show_list_view_button_phone || '') +
        "&show_week_view_button_phone=" + (calendarConfigSource.show_week_view_button_phone || '') +
        "&show_day_view_button_phone=" + (calendarConfigSource.show_day_view_button_phone || '') +
        "&categslug=" +
        "&categId=" +
        "&show_tooltip_category=" + myAjax.show_tooltip_category +
        "&enable_category_link=" + myAjax.enable_category_link +
        "&custom_category_link_target=" + myAjax.custom_category_link_target +
        "&show_tooltip_weburl=" + myAjax.show_tooltip_weburl +
        "&show_additional_fields=" + (myAjax.show_additional_fields || 'off') +
        "&additional_field_settings=" + encodeURIComponent(decmSerializeAdditionalFieldSettings(myAjax.additional_field_settings)) +
        "&hidden_day=" + myAjax.hidden_day +
        "&week_start_on=" + myAjax.week_start_on +
        "&start=" + fetchRange.start +
        "&end=" + fetchRange.end +
        "&show_calendar_event_date=" + myAjax.show_calendar_event_date +
        "&calender_end_time=" + myAjax.calender_end_time +
        "&timeRangeSeparator=" + myAjax.timeRangeSeparator +
        "&calendar_default_view=" + myAjax.calendar_default_view +
        "&calendar_default_view_tablet=" + (calendarConfigSource.calendar_default_view_tablet || '') +
        "&calendar_default_view_phone=" + (calendarConfigSource.calendar_default_view_phone || '') +
        "&calendar_list_view_option=" + myAjax.calendar_list_view_option +
        "&show_recurring_event=" + myAjax.show_recurring_event +
        "&hide_past_event=" + (decmUnwrapSettingValue(calendarConfigSource.hide_past_event) || '') +
        "&hide_past_event_tablet=" + (decmUnwrapSettingValue(calendarConfigSource.hide_past_event_tablet) || '') +
        "&hide_past_event_phone=" + (decmUnwrapSettingValue(calendarConfigSource.hide_past_event_phone) || '') +
        "&viewport_width=" + decmGetViewportWidth() +
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
        "&day_of_the_week_name_tablet=" + (calendarConfigSource.day_of_the_week_name_tablet || '') +
        "&day_of_the_week_name_phone=" + (calendarConfigSource.day_of_the_week_name_phone || '') +
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
        .then(function (events) {
          successCallback(decmNormalizeCalendarEvents(events));
          window.setTimeout(function () {
            decmFixMoreLinkCounts(calendar, $calendarMount, number_event_day);
            decmApplyListViewHiddenDays($calendarMount, hiddenWeekdays);
          }, 50);
        })
        .catch(function (error) {
          calendarEventsFetchActive = false;
          decmClearCalendarLoading($calendarMount);
          failureCallback(error);
        });
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

  calendar.render();
  if (limitEventWindow) {
    decmNavMonth = decmVisibleMonthDate(calendar);
    decmSyncLimitEventNav($calendarMount, decmNavMonth, limitEventWindow);
    calendarMountEl.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest
        ? e.target.closest('button.fc-prev-button, button.fc-next-button')
        : null;
      if (!btn || !calendar.view || !decmIsMonthLikeView(calendar.view.type)) {
        return;
      }
      var before = decmVisibleMonthDate(calendar);
      var viewType = calendar.view.type;
      var isPrev = btn.classList.contains('fc-prev-button');
      var beforeYm = decmLocalYearMonth(before);
      var startYm = decmLocalYearMonth(limitEventWindow.start);
      var endYm = decmLocalYearMonth(decmLimitWindowLastMonth(limitEventWindow));
      if ((isPrev && beforeYm <= startYm) || (!isPrev && beforeYm >= endYm)) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') {
          e.stopImmediatePropagation();
        }
        decmSyncLimitEventNav($calendarMount, before, limitEventWindow);
        return;
      }
      window.setTimeout(function () {
        var after = decmVisibleMonthDate(calendar);
        var afterYm = decmLocalYearMonth(after);
        var clamped = decmClampDateToLimitWindow(after, limitEventWindow);
        if (afterYm !== beforeYm) {
          if (afterYm !== decmLocalYearMonth(clamped)) {
            decmGotoCalendarDate(calendar, clamped, viewType);
            after = clamped;
          }
          decmNavMonth = after;
          decmSyncLimitEventNav($calendarMount, after, limitEventWindow);
          return;
        }
        var target = viewType === 'listYear'
          ? new Date(before.getFullYear() + (isPrev ? -1 : 1), 0, 1)
          : decmAddCalendarMonths(before, isPrev ? -1 : 1);
        clamped = decmClampDateToLimitWindow(target, limitEventWindow);
        if (decmLocalYearMonth(clamped) === beforeYm) {
          decmSyncLimitEventNav($calendarMount, before, limitEventWindow);
          return;
        }
        decmNavMonth = clamped;
        decmGotoCalendarDate(calendar, clamped, viewType);
        decmSyncLimitEventNav($calendarMount, clamped, limitEventWindow);
      }, 0);
    }, true);
  }
  if (calendarEventsFetchActive) {
    decmShowCalendarLoading($calendarMount);
  }
  if (limitEventWindow) {
    decmSyncLimitEventNav($calendarMount, decmNavMonth, limitEventWindow);
  }
  scheduleHiddenTimeRangeApply(calendar, myAjax, $calendarMount);
  decmApplyResponsiveToolbar($calendarMount, $moduleRoot);
  decmApplyDaysOfWeekDesign($calendarMount, myAjax);

  $calendarMount.off('click' + eventNs);
  $calendarMount.on('click' + eventNs, 'button.fc-next-button, button.fc-prev-button, button.fc-decmNext-button, button.fc-decmPrev-button, button.fc-today-button, button.fc-dayGridMonth-button, button.fc-timeGridWeek-button, button.fc-timeGridDay-button, button.fc-listWeek-button, button.fc-listMonth-button, button.fc-listYear-button', function () {
    if (jQuery(this).hasClass('fc-today-button') && calendar.view && decmIsMonthLikeView(calendar.view.type)) {
      var now = new Date();
      decmNavMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      if (limitEventWindow) {
        decmNavMonth = decmClampDateToLimitWindow(decmNavMonth, limitEventWindow);
      }
    }
    decmShowCalendarLoading($calendarMount);
    clearTimeout(calendarClickLoaderTimer);
    calendarClickLoaderTimer = setTimeout(function () {
      if (!calendarEventsFetchActive) {
        decmClearCalendarLoading($calendarMount);
      }
    }, 400);
    decmApplyResponsiveToolbar($calendarMount, $moduleRoot);
    window.setTimeout(function () {
      decmApplyDaysOfWeekDesign($calendarMount, myAjax);
    }, 0);
  });

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
  var lastViewButtons = initialViewButtons;
  function updateCalendarViewButtons() {
    var newViewButtons = getResponsiveViewButtons();
    if (newViewButtons === lastViewButtons) {
      return false;
    }
    lastViewButtons = newViewButtons;
    var stayDate = decmVisibleMonthDate(calendar);
    if (calendar.getOption('headerToolbar')) {
      calendar.setOption('headerToolbar', {
        left: decmHeaderLeft,
        center: 'title',
        right: newViewButtons,
      });
    } else if (calendar.getOption('header')) {
      calendar.setOption('header', {
        left: decmHeaderLeft,
        center: 'title',
        right: newViewButtons,
      });
    }
    decmGotoCalendarDate(calendar, stayDate);
    return true;
  }

  var lastHidePastEvent = decmResolveResponsiveSetting(calendarConfigSource, 'hide_past_event');
  var lastBreakpoint = decmGetContentBreakpoint();
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
      updateCalendarViewButtons();
      var nextBreakpoint = decmGetContentBreakpoint();
      var nextHidePastEvent = decmResolveResponsiveSetting(calendarConfigSource, 'hide_past_event');
      if (nextBreakpoint !== lastBreakpoint || String(nextHidePastEvent) !== String(lastHidePastEvent)) {
        lastBreakpoint = nextBreakpoint;
        lastHidePastEvent = nextHidePastEvent;
        applyResponsiveOverlay();
        if (calendar && typeof calendar.setOption === 'function') {
          try {
            calendar.setOption('columnHeaderFormat', decmResolveWeekdayNativeFormat($moduleRoot, myAjax));
            calendar.setOption('hiddenDays', decmNormalizeHiddenWeekdays(myAjax.hidden_day));
            calendar.setOption('firstDay', decmWeekStartFromSetting(myAjax.week_start_on));
            calendar.setOption('showNonCurrentDates', myAjax.hide_pre_nxt_event === 'on' ? false : true);
          } catch (e) {}
        }
        if (calendar && typeof calendar.refetchEvents === 'function') {
          calendar.refetchEvents();
        }
      }
      if (limitEventWindow && calendar.view && decmIsMonthLikeView(calendar.view.type)) {
        var visible = decmVisibleMonthDate(calendar);
        var restored = decmClampDateToLimitWindow(visible, limitEventWindow);
        if (decmLocalYearMonth(visible) !== decmLocalYearMonth(restored)) {
          decmGotoCalendarDate(calendar, restored, calendar.view.type);
          visible = restored;
        }
        decmNavMonth = visible;
        decmSyncLimitEventNav($calendarMount, visible, limitEventWindow);
      }
    }, 250);
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(function () {
      window.dispatchEvent(new Event('resize'));
    }, 150);
  });


  // Navigate to specific month/year if enabled.
  // specific_month_start is a 0-based month index (0=January … 11=December).
  // specific_years_start is a four-digit year string.
  if (myAjax.show_specific_month === 'on') {
    var _monthIdx = parseInt(myAjax.specific_month_start);
    var _year     = parseInt(myAjax.specific_years_start);
    if (!isNaN(_monthIdx) && !isNaN(_year)) {
      decmNavMonth = new Date(_year, _monthIdx, 1);
      if (limitEventWindow) {
        decmNavMonth = decmClampDateToLimitWindow(decmNavMonth, limitEventWindow);
      }
      decmGotoCalendarDate(calendar, decmNavMonth);
    }
  }

  } // end decmInitCalendar

  var shared = typeof decmCalendarShared !== 'undefined' ? decmCalendarShared : {};
  var mounts = document.querySelectorAll('.decm-calendar-mount[data-decm-config]');

  if (mounts.length > 0) {
    mounts.forEach(function (mountEl) {
      try {
        var config = JSON.parse(mountEl.getAttribute('data-decm-config') || '{}');
        if (!config.hide_past_event) {
          config.hide_past_event = mountEl.getAttribute('data-hide-past-event') || '';
        }
        if (!config.hide_past_event_tablet) {
          config.hide_past_event_tablet = mountEl.getAttribute('data-hide-past-event-tablet') || '';
        }
        if (!config.hide_past_event_phone) {
          config.hide_past_event_phone = mountEl.getAttribute('data-hide-past-event-phone') || '';
        }
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


