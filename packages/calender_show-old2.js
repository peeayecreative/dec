let calendar_html;
let calendar_view = "";
let calendar_view_tablet = "";
let calendar_view_phone = "";
var tooltip = null;
let number_event_day = 3;
number_event_day = myAjax.number_event_day == "1" ? 1 : myAjax.number_event_day == "2" ? 2 : myAjax.number_event_day == "3" ? 3 : myAjax.number_event_day == "4" ? 4 : myAjax.number_event_day == "5" ? 5 : myAjax.number_event_day == "6" ? 6 : myAjax.number_event_day == "7" ? 7 : myAjax.number_event_day == "8" ? 8 : myAjax.number_event_day == "9" ? 9 : myAjax.number_event_day == "10" ? 10 : myAjax.number_event_day == "default" ? false : "";

jQuery(document).ready(function ($) {
    if (jQuery('.fc-right').is(':empty')) {
        jQuery('.fc-right').css("width", "20.5%");
    }

    // Time Range code start
    var str = myAjax.hide_time_range_in_week_day;

    if (str === 'on') {
        function processTimeData() {
            const Z = [];
            const H = [];
            jQuery('.fc-axis.fc-time.fc-widget-content span').each(function () {
                let currentDataElement = $(this);
                var value = $(this).text();
                Z.push(value);
            });

            function convertTo24HourFormat(time) {
                const [hour, period] = time.match(/\d+|\D+/g);
                return period.toLowerCase() === 'pm' ? (parseInt(hour, 10) + 12).toString() : hour.padStart(2, '0');
            }

            function isTimeInRange(time, startTime, endTime) {
                const formattedTime = convertTo24HourFormat(time);
                const formattedStartTime = convertTo24HourFormat(startTime);
                const formattedEndTime = convertTo24HourFormat(endTime);
                return formattedTime >= formattedStartTime && formattedTime <= formattedEndTime;
            }

            var start = myAjax.start_point;
            var end = myAjax.end_point;

            const startTime = start;
            const endTime = end;

            jQuery('.fc-axis.fc-time.fc-widget-content span').each(function () {
                const time = $(this).text();
                if (isTimeInRange(time, startTime, endTime)) {
                    H.push(time);
                    $(this).hide();
                    $(this).parent().parent().hide();
                }
            });

            const newTimeArray = H.map(time => {
                const [hour, minute] = time.match(/\d+/g);
                const formattedHour = hour.padStart(2, '0');
                const formattedMinute = '30';
                const formattedTime = `${formattedHour}:${formattedMinute}:00`;

                if (time.toLowerCase().includes('pm')) {
                    const adjustedHour = (parseInt(hour, 10) + 12).toString().padStart(2, '0');
                    return `${adjustedHour}:${formattedMinute}:00`;
                }

                return formattedTime;
            });
        }

        $('.fc-timeGridWeek-button.fc-button.fc-button-primary').on('click', function () {
            if ($(this).hasClass('fc-button-active')) {
                processTimeData();
            }
        });

        $('.fc-timeGridDay-button.fc-button.fc-button-primary').on('click', function () {
            if ($(this).hasClass('fc-button-active')) {
                processTimeData();
            }
        });

        $('.fc-prev-button.fc-button.fc-button-primary').on('click', function () {
            if ($('.fc-timeGridWeek-button.fc-button.fc-button-primary').hasClass('fc-button-active') ||
                $('.fc-timeGridDay-button.fc-button.fc-button-primary').hasClass('fc-button-active')) {
                processTimeData();
            }
        });

        $('.fc-next-button.fc-button.fc-button-primary').on('click', function () {
            if ($('.fc-timeGridWeek-button.fc-button.fc-button-primary').hasClass('fc-button-active') ||
                $('.fc-timeGridDay-button.fc-button.fc-button-primary').hasClass('fc-button-active')) {
                processTimeData();
            }
        });
    }
    // Time Range code end

    jQuery('.fc-list-empty').remove();
    jQuery('.fc-view-container').append("<div class='fc-list-empty-wrap2'><div class='fc-list-empty-wrap1'><div class='fc-list-empty'><div class='spinner_calendar'><div class='bounce_calendar1'></div><div class='bounce_calendar2'></div><div class='bounce_calendar3'></div></div>Events are loading, please wait...</div></div></div>");

    jQuery(window).on('resize', function () {
        if (jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true ||
            screen.width < 767) {

            jQuery(".fc-toolbar").css("display", "block");
            jQuery(".fc-day-number").css("font-size", "17px");
            jQuery(".fc-day-header").css("font-size", "12px");
        } else {
            jQuery(".fc-toolbar").css("display", "flex");
            jQuery(".fc-day-number").css("font-size", "24px");
            jQuery(".fc-day-header").css("font-size", "15px");
        }
    });

    jQuery('body').on('click', ('button.fc-next-button,button.fc-prev-button'), function () {
        if (jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true ||
            jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true ||
            screen.width < 767) {

            jQuery(".fc-toolbar").css("display", "block");
            jQuery(".fc-day-number").css("font-size", "17px");
            jQuery(".fc-day-header").css("font-size", "12px");
        } else {
            jQuery(".fc-toolbar").css("display", "flex");
            jQuery(".fc-day-number").css("font-size", "24px");
            jQuery(".fc-day-header").css("font-size", "15px");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var language = document.getElementsByTagName("html")[0].getAttribute("lang");
    var calendarEl = document.getElementById("calendar");

    // Set up calendar views
    if (myAjax.show_month_view_button == 'on') {
        calendar_view += "dayGridMonth,";
    }
    if (myAjax.show_week_view_button == 'on') {
        calendar_view += "timeGridWeek,";
    }
    if (myAjax.show_day_view_button == 'on') {
        calendar_view += "timeGridDay,";
    }
    if (myAjax.show_list_view_button == 'on') {
        calendar_view += myAjax.calendar_list_view_option;
    }

    // Tablet views
    if (myAjax.show_month_view_button_tablet == 'on' || (myAjax.show_month_view_button_tablet == "" && myAjax.show_month_view_button == "on")) {
        calendar_view_tablet += "dayGridMonth,";
    }
    if (myAjax.show_week_view_button_tablet == 'on' || (myAjax.show_week_view_button_tablet == "" && myAjax.show_week_view_button == "on")) {
        calendar_view_tablet += "timeGridWeek,";
    }
    if (myAjax.show_day_view_button_tablet == 'on' || (myAjax.show_day_view_button_tablet == "" && myAjax.show_day_view_button == "on")) {
        calendar_view_tablet += "timeGridDay,";
    }
    if (myAjax.show_list_view_button_tablet == 'on' || (myAjax.show_list_view_button_tablet == "" && myAjax.show_list_view_button == "on")) {
        calendar_view_tablet += myAjax.calendar_list_view_option;
    }

    // Phone views
    if (myAjax.show_month_view_button_phone == 'on' || (myAjax.show_month_view_button_phone == "" && myAjax.show_month_view_button == "on")) {
        calendar_view_phone += "dayGridMonth,";
    }
    if (myAjax.show_week_view_button_phone == 'on' || (myAjax.show_week_view_button_phone == "" && myAjax.show_week_view_button == "on")) {
        calendar_view_phone += "timeGridWeek,";
    }
    if (myAjax.show_day_view_button_phone == 'on' || (myAjax.show_day_view_button_phone == "" && myAjax.show_day_view_button == "on")) {
        calendar_view_phone += "timeGridDay,";
    }
    if (myAjax.show_list_view_button_phone == 'on' || (myAjax.show_list_view_button_phone == "" && myAjax.show_list_view_button == "on")) {
        calendar_view_phone += myAjax.calendar_list_view_option;
    }

    // Clean up view strings
    calendar_view = calendar_view.slice(0, -1);
    calendar_view_tablet = calendar_view_tablet.slice(0, -1);
    calendar_view_phone = calendar_view_phone.slice(0, -1);

    // Week start day
    var week_start_on = "";
    if (myAjax.week_start_on == "Sunday") { week_start_on = 0 }
    if (myAjax.week_start_on == "Monday") { week_start_on = 1 }
    if (myAjax.week_start_on == "Tuesday") { week_start_on = 2 }
    if (myAjax.week_start_on == "Wednesday") { week_start_on = 3 }
    if (myAjax.week_start_on == "Thursday") { week_start_on = 4 }
    if (myAjax.week_start_on == "Friday") { week_start_on = 5 }
    if (myAjax.week_start_on == "Saturday") { week_start_on = 6 }

    var hide_past_event = myAjax.hide_past_event == "on" ? new Date() : "";

    // Initialize FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
        eventOrder: myAjax.calendar_eventorder,
        showNonCurrentDates: myAjax.hide_pre_nxt_event === 'on' ? false : true,
        displayEventTime: false,
        plugins: ['dayGrid', 'timeGrid', 'list'],
        defaultView: screen.width <= 981 && screen.width >= 767 && myAjax.calendar_default_view_tablet != "" ?
            myAjax.calendar_default_view_tablet :
            screen.width <= 766 && myAjax.calendar_default_view_phone != "" ?
                myAjax.calendar_default_view_phone :
                myAjax.calendar_default_view,
        fixedWeekCount: false,
        header: {
            left: 'prev,next today',
            center: 'title',
            right: screen.width <= 981 && screen.width >= 767 ? calendar_view_tablet :
                screen.width <= 766 ? calendar_view_phone :
                    calendar_view,
        },
        hiddenDays: myAjax.hidden_day,
        firstDay: week_start_on,
        locales: language,
        eventLimit: number_event_day,
        nextDayThreshold: myAjax.multidaycutoff,
        views: {
            dayGridMonth: {
                columnHeaderFormat: {
                    weekday: jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true ||
                        jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true ||
                        jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true ||
                        jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true ||
                        screen.width < 767 ? "narrow" :
                        screen.width <= 981 && screen.width >= 767 && myAjax.day_of_the_week_name_tablet != "" ?
                            myAjax.day_of_the_week_name_tablet :
                            myAjax.day_of_the_week_name,
                }
            }
        },

        loading: function (bool) {
            if (bool == true) {
                // Show loading indicator
            } else {
                jQuery('.fc-list-empty-wrap2').remove();
                jQuery('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').removeClass("ecs_is_loading_check");

                if (jQuery('button').hasClass("ecs_next_class")) {
                    // Handle specific case
                } else {
                    jQuery('.fc-list-empty-wrap2').remove();
                    jQuery('.fc-dayGridMonth-view, .fc-timeGridDay-view, .fc-timeGridWeek-view').removeClass("ecs_is_loading_check");
                }
            }
        },
        viewDidMount: function(view, element) {
            console.log("Month changed via viewRender:", view.start, view.end);
            calendar.refetchEvents();
          },
        
        events: function (fetchInfo, successCallback, failureCallback) {
            var startDate = fetchInfo.startStr;
            var endDate = fetchInfo.endStr;

            var apiUrl = 'http://localhostdivi-5.1/wp-json/custom/v1/events_cal' +
                '?start=' + encodeURIComponent(startDate) +
                '&end=' + encodeURIComponent(endDate);

            jQuery.ajax({
                url: apiUrl,
                method: 'GET',
                dataType: 'json',
                success: function (response) {
                    if (!Array.isArray(response)) {
                        console.error("Response is not an array:", response);
                        failureCallback('Invalid response format');
                        return;
                    }

                    var events = response.map(function (event) {
                        var titleEl = document.createElement('div');
                        titleEl.innerHTML = event.title;
                        var plainTitle = titleEl.textContent || titleEl.innerText || '';

                        var startISO = toLocalISOString(event.event_start_date, event.event_start_time);
                        var endISO = toLocalISOString(event.event_end_date, event.event_end_time);


                        return {
                            title: plainTitle,
                            start: startISO,
                            end: endISO,
                            allDay: true,
                            url: event.custom_event_link_url,
                            extendedProps: {
                                description: event.post_event_excerpt,
                                location: event.venue,
                                categories: (event.category_data || []).map(cat => cat.name),
                                feature_image: event.feature_image,
                                feature_image_calendar: event.feature_image_calendar,
                                event_start_time: event.event_start_time,
                                event_end_time: event.event_end_time,
                                event_start_date: event.event_start_date,
                                event_end_date: event.event_end_date,
                                show_event_venue: event.show_event_venue,
                                show_time_zone_on_calendar: event.show_time_zone_on_calendar,
                                html: event.html,
                                calallday: event.calallday,
                                featured_class: event.featured_class,
                                category_data: event.category_data || [],
                                allDayEvent: event.allDayEvent
                            }
                        };
                    });

                    console.log("Parsed Events:", events);
                    successCallback(events);
                },
                error: function (xhr, status, error) {
                    console.error('AJAX Error:', status, error);
                    failureCallback('Error fetching events: ' + error);
                }
            });
        },


        eventRender: function (info) {
            let show_calendar_thumbnail = myAjax.show_calendar_thumbnail == "on" ? info.event.extendedProps.feature_image_calendar : "";

            if (jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_3") == true ||
                jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_4") == true ||
                jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_5") == true ||
                jQuery(".decm_divi_event_calendar").parent().hasClass("et_pb_column_1_6") == true ||
                screen.width < 767 && calendar.view.type != 'timeGridDay') {
                jQuery(info.el).children(".fc-content").css("visibility", "hidden").css("width", "10px").css("height", "10px");
            }

            if (calendar.view.type == 'timeGridDay' && screen.width < 767) {
                jQuery(info.el).children(".fc-content").attr('style', "visibility: visible !important").css("width", "auto").css("height", "auto");
            } else {
                jQuery(info.el).children(".fc-content").css("visibility", "visible").css("width", "auto").css("height", "auto");
            }

            if (calendar.view.type == 'dayGridMonth' || calendar.view.type == 'timeGridWeek' || calendar.view.type == 'timeGridDay') {
                if (info.event.extendedProps.event_start_time == null) {
                    if (myAjax.hide_calendar_event_all_day == "on") {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
                    } else {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.allDayEvent + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
                    }
                }

                if ((info.event.extendedProps.event_start_time != null)) {
                    if (myAjax.hide_calendar_event_multi_days == "on" && info.event.extendedProps.event_end_date != "") {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
                    } else if (myAjax.hide_calendar_event_multi_days == "off" && info.event.extendedProps.event_end_date != "") {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
                    }

                    if (myAjax.show_calendar_event_date == "off" && info.event.extendedProps.event_end_date == "") {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-title">' + info.event.title + "</span>";
                    } else if (myAjax.show_calendar_event_date == "on" && info.event.extendedProps.event_end_date == "") {
                        info.el.querySelector('.fc-title').innerHTML = show_calendar_thumbnail + '<span class="fc-calendar-time">' + info.event.extendedProps.event_start_time + info.event.extendedProps.event_end_time + '</span></br><span class="fc-calendar-title">' + info.event.title + "</span>";
                    }
                }

                if (myAjax.show_calendar_event_date === 'on' && info.event.extendedProps.event_start_time != null) {
                    let eventStartTime = info.event.extendedProps.event_start_time;
                    let EndSeparator = info.event.extendedProps.event_end_time != '' ? myAjax.timeRangeSeparator : '';
                    let eventEndTime = myAjax.calender_end_time === "on" ? ' ' + EndSeparator + ' ' + info.event.extendedProps.event_end_time : "";
                    let eventTimeHtml = '';
                    let timeZoneHtml = myAjax.show_time_zone_on_calendar === "on" ? '<span class="fc-calendar-show-time-zone">' + info.event.extendedProps.show_time_zone_on_calendar + '</span></br>' : "";

                    if (eventStartTime || eventEndTime) {
                        eventTimeHtml = '<span class="fc-calendar-time">' + (eventStartTime || '') + (eventEndTime || '') + '</span></br>';
                    }

                    let eventHtml = show_calendar_thumbnail + eventTimeHtml + timeZoneHtml + '<span class="fc-calendar-title">' + info.event.title + '</span>';
                    info.el.querySelector('.fc-title').innerHTML = eventHtml;
                }

                if (myAjax.show_event_venue == "on" && info.event.extendedProps.show_event_venue) {
                    info.el.querySelector('.fc-title').innerHTML += '<div class="fc-calendar-venue">' + info.event.extendedProps.show_event_venue + '</div>';
                }
            }

            if (calendar.view.type == 'listWeek' || calendar.view.type == 'listMonth' || calendar.view.type == 'listYear') {
                if (info.event.extendedProps.event_start_time == null) {
                    if (myAjax.hide_calendar_event_all_day == "off") {
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + info.event.extendedProps.calallday + '</td>');
                    } else {
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + '</td>');
                    }
                }

                if ((info.event.extendedProps.event_start_time != null)) {
                    if (myAjax.hide_calendar_event_multi_days == "on" && info.event.extendedProps.event_end_date != "") {
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content"> </td>');
                    } else if (myAjax.hide_calendar_event_multi_days == "off" && info.event.extendedProps.event_end_date != "") {
                        let EndSeparator = info.event.extendedProps.event_end_time != '' ? myAjax.timeRangeSeparator : '';
                        let eventEndTime = myAjax.calender_end_time === "on" ? ' ' + EndSeparator + ' ' + info.event.extendedProps.event_end_time : "";
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + info.event.extendedProps.event_start_time + eventEndTime + '</td>');
                    }

                    if (myAjax.show_calendar_event_date == "off" && info.event.extendedProps.event_end_date == "") {
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + ' </td>');
                    } else if (myAjax.show_calendar_event_date == "on" && info.event.extendedProps.event_end_date == "") {
                        let EndSeparator = info.event.extendedProps.event_end_time != '' ? myAjax.timeRangeSeparator : '';
                        let eventEndTime = myAjax.calender_end_time === "on" ? ' ' + EndSeparator + ' ' + info.event.extendedProps.event_end_time : "";
                        jQuery(info.el).prepend('<td class="fc-list-item-time fc-widget-content">' + show_calendar_thumbnail + info.event.extendedProps.event_start_time + eventEndTime + '</td>');
                    }
                }
                info.el.querySelector('.fc-list-item-title').innerHTML = info.event.title;
            }

            if (calendar.view.type == 'timeGridDay') {
                info.event.start = info.event.extendedProps.event_start_date + "T" + info.event.extendedProps.event_start_time;
            }

            if (info.event.extendedProps.categories !== false) {
                for (let i = 0; i < info.event.extendedProps.category_data.length; i++) {
                    jQuery(info.el).addClass(info.event.extendedProps.category_data[i].slug + '_dec_category');
                }
            }

            if (info.event.extendedProps.featured_class !== "") {
                jQuery(info.el).addClass(info.event.extendedProps.featured_class);
            }
            
        },

        eventMouseEnter: function (info) {
            console.log('mouse enter');
            var nsfields = info.event.extendedProps;    
            nsfields.html
            console.log(nsfields.html);
            if (tooltip) {
                tooltip.dispose();
            }

            if (myAjax.show_tooltip == "on" && screen.width >= 981) {
                tooltip = new Tooltip(info.el, {
                    title: nsfields.html,
                    html: true,
                    delay: 10,
                    placement: "left",
                    trigger: "hover",
                    container: "tbody"
                });
            }

            if ((myAjax.show_tooltip_tablet == "on" || (myAjax.show_tooltip_tablet == "" && myAjax.show_tooltip == "on")) && screen.width <= 981 && screen.width >= 767) {
                tooltip = new Tooltip(info.el, {
                    title: nsfields.html,
                    delay: 10,
                    html: true,
                    placement: "left",
                    trigger: "hover",
                    container: "tbody"
                });
            }

            if ((myAjax.show_tooltip_phone == "on" || (myAjax.show_tooltip_phone == "" && myAjax.show_tooltip == "on")) && screen.width < 767) {
                tooltip = new Tooltip(info.el, {
                    title: nsfields.html,
                    delay: 10,
                    html: true,
                    placement: "left",
                    trigger: "hover",
                    container: "tbody"
                });
            }
        }
    });

    calendar.render();
    calendar.setOption('locale', language);

    if (myAjax.show_specific_month == 'on') {
        let dateOne = new Date();
        let date = new Date(dateOne.getFullYear(), dateOne.getMonth(), 1);
        let no_of_months = getMonthFromString(myAjax.specific_month_start, myAjax.specific_years_start);
        date.setMonth(no_of_months);
        date.setFullYear(myAjax.specific_years_start);
        calendar.gotoDate(date);
    }
});

function getMonthFromString(mon, year) {
    return new Date(Date.parse(mon + " 1, " + year)).getMonth();
}

function toLocalISOString(dateStr, timeStr) {
    const date = new Date(dateStr + ' ' + timeStr);

    const pad = (n) => (n < 10 ? '0' + n : n);

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}