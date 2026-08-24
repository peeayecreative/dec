jQuery(function ($) {
	var __t = (window.wp && wp.i18n && typeof wp.i18n.__ === 'function')
		? function (s) { return wp.i18n.__(s, 'decm-divi-event-calendar-module'); }
		: function (s) { return s; };

	/**
	 * Keep the open filter item above wrapped sibling filters (CSS class only — no inline z-index).
	 */
	function decm_syncFilterDropdownStacking() {
		$('.decm_event_filter_child').each(function () {
			var $child = $(this);
			var isOpen = $child.find('.dec-filter-list').filter(function () {
				return $(this).is(':visible');
			}).length > 0;

			$child.toggleClass('dec-filter-dropdown-active', isOpen);
			$child.find('.dec-filter-bar').toggleClass('dec-filter-dropdown-active', isOpen);
		});
	}

	function decm_tagEventFilterDateRangePicker() {
		var drp = $('#reportrange').data('daterangepicker');
		if (drp && drp.container) {
			drp.container.addClass('decm-event-filter-daterangepicker');
			decm_syncDateRangeDropdownStyles(drp);
		}
	}

	/**
	 * Copy Category Filters Dropdown styles onto Date Range presets (PHP frontend).
	 * Item styles remain after Custom Range (show-calendar).
	 */
	function decm_syncDateRangeDropdownStyles(drp) {
		if (!drp || !drp.container) {
			return;
		}
		var $container = jQuery(drp.container);
		$container.addClass('decm-event-filter-daterangepicker');

		var $item = jQuery('.decm_event_filter_parent .dec-filter-list li').first();
		if (!$item.length) {
			$item = jQuery('.dec-filter-list li').first();
		}
		if (!$item.length) {
			return;
		}

		var $panel = $item.closest('.dec-filter-list');
		var itemCs = window.getComputedStyle($item.get(0));
		var props = [
			'font-size', 'line-height', 'font-family', 'font-weight', 'letter-spacing', 'color',
			'background-color',
			'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
			'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
			'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
			'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
			'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'
		];

		$container.find('.ranges li').each(function () {
			var node = this;
			props.forEach(function (prop) {
				var val = itemCs.getPropertyValue(prop);
				if (val) {
					node.style.setProperty(prop, val, 'important');
				}
			});
		});

		if ($panel.length) {
			var root = $container.get(0);
			var panelCs = window.getComputedStyle($panel.get(0));
			var showCalendar = $container.hasClass('show-calendar');
			var panelBgProps = [
				'background-color',
				'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
				'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
				'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
				'border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius',
				'box-shadow'
			];
			panelBgProps.forEach(function (prop) {
				var val = panelCs.getPropertyValue(prop);
				if (val && root) {
					root.style.setProperty(prop, val, 'important');
				}
			});
			if (!showCalendar) {
				var panelProps = props.concat(['box-shadow']);
				panelProps.forEach(function (prop) {
					var val = panelCs.getPropertyValue(prop);
					if (val && root) {
						root.style.setProperty(prop, val, 'important');
					}
				});
			} else if (root) {
				root.style.setProperty('padding', '0', 'important');
			}
		}
	}

	function translateMoreInfoButtonText(text) {
		var normalized = (text || '').trim().toLowerCase();
		if (!normalized || normalized === 'more info') {
			return __t('More Info');
		}
		if (normalized === 'view more') {
			return __t('View More');
		}
		return text;
	}

	var htmlLocale = (document.documentElement && document.documentElement.lang) ? document.documentElement.lang : '';
	var normalizedLocale = (htmlLocale || 'en').replace('_', '-').toLowerCase();
	var normalizedLocaleShort = normalizedLocale.split('-')[0];

	function setMomentLocaleSafe() {
		if (typeof moment === 'undefined' || typeof moment.locale !== 'function') {
			return;
		}
		var active = moment.locale(normalizedLocale);
		if (normalizedLocaleShort && active !== normalizedLocale) {
			moment.locale(normalizedLocaleShort);
		}
	}

	function isFeatureImageOn(showFeatureImage) {
		return showFeatureImage === 'on' || showFeatureImage === 'true';
	}

	function isCoverOverlayOn(coverOverlayVal) {
		return coverOverlayVal === 'on' || coverOverlayVal === 'true' || coverOverlayVal === true ||
			coverOverlayVal === 1 || coverOverlayVal === '1';
	}

	function normalizeListLayoutColumnWidth(value, fallback) {
		var parsed = parseInt(value, 10);
		if (isNaN(parsed) || parsed < 1 || parsed > 12) {
			parsed = parseInt(fallback, 10);
		}
		if (isNaN(parsed) || parsed < 1 || parsed > 12) {
			parsed = 4;
		}
		return Math.max(1, Math.min(12, parsed));
	}

	function buildListLayoutGridColumns(layoutType, params) {
		var orders = {
			image_detail: ['image', 'details'],
			detail_image: ['details', 'image'],
			calloutOnImage_Datail: ['image', 'details'],
			callout_image_detail: ['callout', 'image', 'details'],
			callout_detail_image: ['callout', 'details', 'image'],
			callout_image_detail_button: ['callout', 'image', 'details', 'button'],
			callout_detail_image_button: ['callout', 'details', 'image', 'button'],
			calloutOnImage_Datail_button: ['image', 'details', 'button']
		};
		var defaults = {
			image_detail: { image: '4', details: '8' },
			detail_image: { details: '8', image: '4' },
			calloutOnImage_Datail: { image: '4', details: '8' },
			callout_image_detail: { callout: '2', image: '4', details: '6' },
			callout_detail_image: { callout: '2', details: '6', image: '4' },
			callout_image_detail_button: { callout: '2', image: '3', details: '5', button: '2' },
			callout_detail_image_button: { callout: '2', details: '5', image: '3', button: '2' },
			calloutOnImage_Datail_button: { image: '4', details: '6', button: '2' }
		};
		var order = orders[layoutType] || ['image', 'details'];
		var layoutDefaults = defaults[layoutType] || { image: '4', details: '8' };

		return order.map(function (column) {
			var paramKey = 'list_' + column + '_column_width';
			var fallback = layoutDefaults[column] || '4';
			var value = params && params[paramKey] !== undefined && params[paramKey] !== '' ? params[paramKey] : fallback;
			return normalizeListLayoutColumnWidth(value, fallback) + 'fr';
		}).join(' ');
	}

	function isShowTitleOn(showTitle) {
		return showTitle === 'on' || showTitle === 'true';
	}

	function getTitleHeadingLevel(params) {
		var level = (params && (params.title_level || params.header_level)) || 'h2';
		if (typeof level !== 'string') {
			return 'h2';
		}
		level = level.toLowerCase();
		return /^h[1-6]$/.test(level) ? level : 'h2';
	}

	function getButtonIconClassSuffix(params, buttonType) {
		var key = buttonType === 'load_more' ? 'load_more_button_icon_classes' : 'more_info_button_icon_classes';
		var classes = params && params[key] ? String(params[key]).trim() : '';
		return classes ? ' ' + classes : '';
	}

	function getCalloutBoxClass(layout, event, showFeatureImage, layoutType) {
		var layoutKey = (layout || '').toString().toLowerCase();
		var hasImage = !!(event && event.image && /src=["'][^"']+["']/.test(event.image));
		var featureOn = isFeatureImageOn(showFeatureImage);
		var classClout = 'callout-box-cover';
		if (layoutKey === 'cover') {
			classClout = 'callout-box-cover';
		} else if (layoutKey === 'list') {
			classClout = 'callout-box-list';
			if (['calloutOnImage_Datail', 'calloutOnImage_Datail_button'].indexOf(layoutType || '') !== -1 && hasImage && featureOn) {
				classClout += ' callout-box-list-on-Image';
			}
		} else if (layoutKey === 'grid') {
			classClout = (hasImage && featureOn) ? 'callout_box' : 'callout-box-cover';
		}
		return classClout;
	}

	$('#dec-filter-search__input').on('keyup', function () {
		if ($(this).val()) {
			$(".close-icon").css({ "display": "block" });
		} else {
			$(".close-icon").css({ "display": "none" });
		}
	});

	var eventFilterHide = jQuery("input[name='filter-css-class_hide']").val();
	var eventFilterShow = jQuery("input[name='filter-css-class_show']").val();

	$("#dec-event-filters-icon").on("click", function () {

		$(".dec-search-filter").toggle();

		if ($(".dec-search-filter").is(':visible')) {
			$(".dec_collapse_filters_events").html(eventFilterHide);
		} else {
			$(".dec_collapse_filters_events").html(eventFilterShow);
		}

	});

	$('.dec-filter-bar .dec-filter-label').attr('tabindex', '0');
	//	$(".dec-filter-bar").parent().parent().css({ "display": "inline-block" });
	$(".dec-filter-bar").css({ "display": "flex" });
	$(".dec-filter-cost").parent().css({ "position": "relative" });

	//$(".decm_event_filter_child").show();
	//$("#dec-filter-remove").show();
	// $(window).on('resize', function() {
	// if ($(window).width() < 600) {
	//	$(".dec-search-filter").addClass("decem-icon-filters");
	// Set tabindex for the element

	//	$(".events-empty-results").parent().removeClass('row_equal');
	$(".dec-filter-header").parent().parent().css({ "display": "block" });
	//$(".dec-filter-header-search").css({ "display": "flex" });


	$('.dec-recurring-list').on("click", function () {
		//alert("Recurring Click");
		$('.dec-recurring-filter-list').toggle();
	});

	$('.decm-filter-catrgory-list').on("click", function () {
		$('.dec-event-category-filter-list').toggle();
	});
	$('.dec-tag-list').on("click", function () {
		$('.dec-tag-filter-list').toggle();
	});
	$('.dec-location-list').on("click", function () {
		$('.dec-location-filter-list').toggle();
	});

	$('.dec-time-list').on("click", function () {
		$('.dec-time-filter-list').toggle();
	});

	$('.dec-organizer-list').on("click", function () {
		$('.dec-organizer-filter-list').toggle();
	});

	$('.dec-venue-list').on("click", function () {
		$('.dec-venue-filter-list').toggle();
	});


	$('.dec-country-list').on("click", function () {
		$('.dec-country-filter-list').toggle();
	});

	$('.dec-city-list').on("click", function () {
		$('.dec-city-filter-list').toggle();
	});
	$('.dec-state-list').on("click", function () {
		$('.dec-state-filter-list').toggle();
	});
	$('.dec-years-list').on("click", function () {
		$('.dec-year-filter-list').toggle();
	});

	$('.dec-months-list').on("click", function () {
		$('.dec-month-filter-list').toggle();
	});
	$('.dec-days-list').on("click", function () {
		$('.dec-day-filter-list').toggle();
	});

	$('.dec-status-list').on("click", function () {
		$('.dec-status-filter-list').toggle();
	});

	$('.dec-order-list').on("click", function () {
		$('.dec-order-filter-list').toggle();
	});
	$('.dec-future-past-list').on("click", function () {
		$('.dec-future-past-filter-list').toggle();
	});
	$(".show_collapse_show").show();
	$(".show_collapse_hide").hide();
	// 	}
	//    });

	let module_css_filter = jQuery("input[name='module-css-filter']").val();

	var mainClass = "";

	// Try to find the main class for event display containers
	$('.decm_event_display').each(function (i, item) {
		var classfilter = jQuery(item).attr('class').split(/\s+/);

		jQuery.each(classfilter, function (index, item) {
			if (module_css_filter != '' && item != '') {
				if (item == module_css_filter) {
					mainClass = "." + item;
				}
			} else if (item.match(/decm_event_display_/g) || item.match(/event-display_\d+/g)) {
				mainClass = "." + item;
				("Found mainClass by event display order class:", mainClass);
			}
		});
	});

	// Fallback: if no mainClass found, use a generic selector
	if (mainClass === "") {
		mainClass = ".decm_event_display";
		("Using fallback mainClass:", mainClass);
	}

	// Helper function to find filter elements with multiple fallback selectors
	function findFilterElement(elementName) {
		var element = $(mainClass + ' #dec-eventfeed-' + elementName);
		if (element.length === 0) {
			element = $('#dec-eventfeed-' + elementName);
		}
		if (element.length === 0) {
			element = $('input[name="dec-eventfeed-' + elementName + '"]');
		}
		if (element.length === 0) {
			element = $('.hidden-data-field[name="dec-eventfeed-' + elementName + '"]');
		}
		if (elementName === 'search') {
			element = $('.hidden-data-field[name="dec-filter-search"]');
		}
		return element;
	}

	/**
	 * Collect checked category IDs from the filter that was just used, write them
	 * as a comma-separated list, then fetch events once.
	 *
	 * @param {jQuery} $source Checkbox or dropdown item that triggered the change.
	 */
	function decm_apply_category_filter($source) {
		var selectedCategory = [];
		var selectedCategoryId = [];
		var $scope = $source.closest('.decm_event_filter_parent');
		if (!$scope.length) {
			$scope = $(document);
		}

		$scope.find("input[name='dec_filter_category']:checked").each(function () {
			selectedCategory.push(' ' + this.value);
			selectedCategoryId.push(this.id);
			$(this).closest('.custom__li_filter').addClass('dec-filter-select');
		});
		$scope.find("input[name='dec_filter_category']:not(:checked)").each(function () {
			$(this).closest('.custom__li_filter').removeClass('dec-filter-select');
		});

		if (selectedCategory.length > 0) {
			findFilterElement('category').val(selectedCategoryId.join(','));
			$('.event-category-filter-selection-list').html("<span class='event-category-filter-selection'>" + selectedCategory + '</span>');
			$('#dec-event-current-select').html(': ' + selectedCategory);
			$('#dec-event-current-select').parent().addClass('dec-filter-select');
			$('.dec-category-remove').css({ display: 'initial' });
		} else if ($source.is('.decm-filter-catrgory-list') && $.trim($source.text()) !== '') {
			var text = $source.text();
			var dataId = $source.data('id');
			findFilterElement('category').val(dataId);
			$('.event-category-filter-selection-list').html("<span class='event-category-filter-selection'>" + text + '</span>');
			$('#dec-event-current-select').html(': ' + text);
			$('#dec-event-current-select').parent().addClass('dec-filter-select');
			$('.dec-category-remove').css({ display: 'initial' });
		} else {
			$('#dec-event-current-select').parent().removeClass('dec-filter-select');
			$('.dec-category-remove').css({ display: 'none' });
			$('#dec-event-current-select').html('');
			findFilterElement('category').val('');
		}

		decm_get_event($source);
	}

	/**
	 * Clear date-range values everywhere they are stored (feed hidden fields + globals).
	 * @param {jQuery} [eventDisplayContainer] Optional connected Events Feed container.
	 */
	function clearEventDateRangeFields(eventDisplayContainer) {
		jQuery('input[name="EventstartDate"], input[name="EventendDate"]').val('');
		jQuery('#EventstartDate, #EventendDate').val('');
		if (mainClass) {
			jQuery(mainClass + " input[name='EventstartDate']").val('');
			jQuery(mainClass + " input[name='EventendDate']").val('');
			jQuery(mainClass + ' #EventstartDate, ' + mainClass + ' #EventendDate').val('');
		}
		if (eventDisplayContainer && eventDisplayContainer.length) {
			eventDisplayContainer.find('input[name="EventstartDate"], input[name="EventendDate"]').val('');
			eventDisplayContainer.find('#EventstartDate, #EventendDate').val('');
		}
	}

	/**
	 * Reset date-range picker UI label, selection state, and widget internal dates.
	 */
	function resetDateRangePickerUI() {
		jQuery('#dec-date-current-select').html('<span>' + decDateRange + '</span>');
		jQuery('#reportrange').removeClass('dec-filter-select');
		jQuery('.dec-date-range-remove').css({ display: 'none' });
		var $reportrange = jQuery('#reportrange');
		if (typeof jQuery.fn.daterangepicker !== 'undefined' && $reportrange.length && typeof moment !== 'undefined') {
			var drp = $reportrange.data('daterangepicker');
			if (drp) {
				drp.setStartDate(moment());
				drp.setEndDate(moment());
			}
		}
	}

	("Final mainClass:", mainClass);

	$('.dec-filter-event-inline li').on("click", function () {
		$('li.dec-filter-select ').removeClass('dec-filter-select ');
		$(this).addClass('dec-filter-select');
		var dataId = $(this).data("id");
		findFilterElement('category').val(dataId);
		decm_get_event($(this));
	});

	// Inline multi-select chips: do not fetch here. A click on the label bubbles to this
	// div, then the browser synthesizes a checkbox click that bubbles back up — that
	// used to fire three AJAX requests, and the last one overwrote all selected IDs
	// with only the clicked chip.
	$('.custom__ul_boxes .custom__li_filter').on('click', function (e) {
		if ($(e.target).closest('label, input').length) {
			return;
		}
		var $checkbox = $(this).find('input[name="dec_filter_category"]');
		if ($checkbox.length) {
			$checkbox.prop('checked', !$checkbox.prop('checked')).trigger('change');
		}
	});

	$('#dec-filter-remove').click(function () {
		$('.dec-filter-select').removeClass('dec-filter-select');
	});




	$(document).on('mouseup', function (e) {

		var container = new Array();
		container.push($('.dec-organizer-filter-list'));
		container.push($('.dec-event-category-filter-list'));
		container.push($('.dec-price-filter-list'));
		container.push($('.dec-month-filter-list'));
		container.push($('.dec-tag-filter-list'));
		container.push($('.dec-venue-filter-list'));
		container.push($('.dec-day-filter-list'));
		container.push($('.dec-time-filter-list'));
		container.push($('.dec-year-filter-list'));
		container.push($('.dec-city-filter-list'));
		container.push($('.dec-country-filter-list'));
		container.push($('.dec-state-filter-list'));
		container.push($('.dec-location-filter-list'));
		container.push($('.dec-order-filter-list'));
		container.push($('.dec-recurring-filter-list'));
		container.push($('.dec-status-filter-list'));
		container.push($('.dec-future-past-filter-list'));

		jQuery.each(container, function (key, value) {
			if (!$(value).is(e.target)
				&& $(value).has(e.target).length === 0) {
				$(value).fadeOut(decm_syncFilterDropdownStacking);
			}
		});

		decm_syncFilterDropdownStacking();

	});


	var Today = jQuery("input[name='dec-daterange-today-text']").val();
	var Tomorrow = jQuery("input[name='dec-daterange-tomorrow-text']").val();
	var Next_7_days = jQuery("input[name='dec-daterange-next-7-days-text']").val();
	var Next_30_days = jQuery("input[name='dec-daterange-next-30-days-text']").val();
	var This_month = jQuery("input[name='dec-daterange-this-month-text']").val();
	var Next_month = jQuery("input[name='dec-daterange-next-month-text']").val();
	var Custom_range = jQuery("input[name='dec-daterange-custom-range-text']").val();
	//	var Custom = jQuery("input[name='dec-daterange-custom-range-text']").val();

	var dec_month_january = jQuery("input[name='dec-month-january-text']").val();
	var dec_month_february = jQuery("input[name='dec-month-february-text']").val();
	var dec_month_march = jQuery("input[name='dec-month-march-text']").val();
	var dec_month_april = jQuery("input[name='dec-month-april-text']").val();
	var dec_month_may = jQuery("input[name='dec-month-may-text']").val();
	var dec_month_june = jQuery("input[name='dec-month-june-text']").val();
	var dec_month_july = jQuery("input[name='dec-month-july-text']").val();
	var dec_month_august = jQuery("input[name='dec-month-august-text']").val();
	var dec_month_september = jQuery("input[name='dec-month-september-text']").val();
	var dec_month_october = jQuery("input[name='dec-month-october-text']").val();
	var dec_month_november = jQuery("input[name='dec-month-november-text']").val();
	var dec_month_december = jQuery("input[name='dec-month-december-text']").val();

	var dec_day_sunday = jQuery("input[name='dec-day-sunday-text']").val();
	var dec_day_monday = jQuery("input[name='dec-day-monday-text']").val();
	var dec_day_tuesday = jQuery("input[name='dec-day-tuesday-text']").val();
	var dec_day_wednesday = jQuery("input[name='dec-day-wednesday-text']").val();
	var dec_day_thursday = jQuery("input[name='dec-day-thursday-text']").val();
	var dec_day_friday = jQuery("input[name='dec-day-friday-text']").val();
	var dec_day_saturday = jQuery("input[name='dec-day-saturday-text']").val();

	var decCancelButton = jQuery("input[name='dec-cancel-button-text']").val();
	var decApplyButton = jQuery("input[name='dec-apply-button-text']").val();
	var decDateRange = jQuery("input[name='dec-date-range-text']").val();
	var decDateRangeCase = jQuery("input[name='dec-date-range-format']").val();
	var decDateRangeFormat = typeof decDateRangeCase === 'string' ? decDateRangeCase.toUpperCase() : 'MMMM D, YYYY';
	// var decDateRangeFormat = decDateRangeCase.toUpperCase();


	moment.updateLocale("de", {
		months: [
			dec_month_january,
			dec_month_february,
			dec_month_march,
			dec_month_april,
			dec_month_may,
			dec_month_june,
			dec_month_july,
			dec_month_august,
			dec_month_september,
			dec_month_october,
			dec_month_november,
			dec_month_december
		],
		//	monthsShort : ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Juni', 'Juli', 'Aug', 'Sept', 'Okt', 'Nov', 'Dez']
	});


	// Check if daterangepicker is available before using it
	if (typeof $.fn.daterangepicker !== 'undefined') {
		$('#reportrange').daterangepicker({
			"locale": {
				format: decDateRangeFormat,
				cancelLabel: decCancelButton,
				applyLabel: decApplyButton,
				"daysOfWeek": [
					dec_day_sunday,
					dec_day_monday,
					dec_day_tuesday,
					dec_day_wednesday,
					dec_day_thursday,
					dec_day_friday,
					dec_day_saturday
				],
				"monthNames": [
					dec_month_january,
					dec_month_february,
					dec_month_march,
					dec_month_april,
					dec_month_may,
					dec_month_june,
					dec_month_july,
					dec_month_august,
					dec_month_september,
					dec_month_october,
					dec_month_november,
					dec_month_december
				],
			},
			autoUpdateInput: false,
			ranges: {
				[Today]: [moment(), moment()],
				[Tomorrow]: [moment().add(1, 'days'), moment().add(1, 'days')],
				[Next_7_days]: [moment(), moment().add(6, 'days')],
				[Next_30_days]: [moment(), moment().add(29, 'days')],
				[This_month]: [moment().startOf('month'), moment().endOf('month')],
				[Next_month]: [moment().add(1, 'month').startOf('month'), moment().add(1, 'month').endOf('month')]
			}
		});
		decm_tagEventFilterDateRangePicker();
	} else {
		// console.warn('DateRangePicker library not loaded. Date range functionality will be limited.');
	}

	$('#reportrange').on('show.daterangepicker', function () {
		decm_tagEventFilterDateRangePicker();
	});

	$('#reportrange').on('showCalendar.daterangepicker', function (_ev, picker) {
		decm_tagEventFilterDateRangePicker();
		if (picker) {
			decm_syncDateRangeDropdownStyles(picker);
		}
	});

	$('#reportrange').on('hideCalendar.daterangepicker', function (_ev, picker) {
		if (picker) {
			decm_syncDateRangeDropdownStyles(picker);
		} else {
			decm_tagEventFilterDateRangePicker();
		}
	});

	jQuery('[data-range-key="Custom Range"]').text(Custom_range);


	// Only bind daterangepicker events if the library is available
	if (typeof $.fn.daterangepicker !== 'undefined') {
		$('#reportrange').on('apply.daterangepicker', function (ev, picker) {
			$('#dec-date-current-select').html(picker.startDate.format(decDateRangeFormat) + ' - ' + picker.endDate.format(decDateRangeFormat));
			var startVal = picker.startDate.format('YYYY-MM-DD');
			var endVal = picker.endDate.format('YYYY-MM-DD');
			jQuery(mainClass + " input[name='EventstartDate']").val(startVal);
			jQuery(mainClass + " input[name='EventendDate']").val(endVal);
			jQuery("input.hidden-data-field[name='EventstartDate']").val(startVal);
			jQuery("input.hidden-data-field[name='EventendDate']").val(endVal);
			jQuery('#reportrange').addClass("dec-filter-select");
			jQuery('.dec-date-range-remove').css({ "display": "initial" });
			decm_get_event(jQuery('#reportrange'));
		});

		$(' #reportrange').on('cancel.daterangepicker', function (ev, picker) {
			clearEventDateRangeFields();
			resetDateRangePickerUI();
			decm_get_event(jQuery('#reportrange'));
		});
	}


	let maxCost = jQuery("input[name='EventcostValue']").val();
	let EventCurrencySymbol = jQuery("input[name='EventCurrencySymbol']").val();


	// Check if jQuery UI slider is available before using it
	if (typeof $.fn.slider !== 'undefined') {
		$("#eventCostslider").slider({
			range: true,
			min: 0,
			max: maxCost,
			values: [0, maxCost],
			slide: function (event, ui) {
				$("#Eventprice").val(EventCurrencySymbol + ui.values[0] + " - " + EventCurrencySymbol + ui.values[1]);
				jQuery(mainClass + " input[name='EventcostMax']").val(ui.values[1]);
				jQuery(mainClass + " input[name='EventcostMin']").val(ui.values[0]);
			}
		});

		$("#Eventprice").val(EventCurrencySymbol + $("#eventCostslider").slider("values", 0) +
			" - " + EventCurrencySymbol + $("#eventCostslider").slider("values", 1));
	} else {
		// console.warn('jQuery UI Slider not loaded. Price range functionality will be limited.');
		// Set default values
		$("#Eventprice").val(EventCurrencySymbol + "0 - " + EventCurrencySymbol + maxCost);
	}


	// Stacking is handled in CSS (event-filter-parent/module.scss + child-module/module.scss).
	// loadFilter.js only toggles .dec-filter-dropdown-active — never inline z-index.
	$(document).on('click', '.dec-filter-bar, .dec-filter-label', function () {
		setTimeout(decm_syncFilterDropdownStacking, 0);
	});

	jQuery('input[name=\'dec_filter_organizer\'], .dec-organizer-list').on("click", function () {

		var selectedOrganizer = new Array();
		var selectedOrganizerId = new Array();
		$(" input[name='dec_filter_organizer']:checked").each(function () {
			selectedOrganizer.push(" " + this.value);
			selectedOrganizerId.push(this.id);
		});

		if (selectedOrganizer.length > 0) {
			findFilterElement('organizer').val(selectedOrganizerId.join(','));
			$('#dec-organizer-current-select').html(": " + selectedOrganizer);
			$('#dec-organizer-current-select').parent().addClass("dec-filter-select");
			$('.dec-organizer-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('organizer').val(dataId);
			//	$('.organizer-filter-selection-list' ).html("<span class='organizer-filter-selection'>"+ text +"</span>");	
			$('#dec-organizer-current-select').html(": " + text);
			$('#dec-organizer-current-select').parent().addClass("dec-filter-select");
			$('.dec-organizer-remove').css({ "display": "initial" });
		} else {
			findFilterElement('organizer').val("");
			$('#dec-organizer-current-select').html("");
			$('#dec-organizer-current-select').parent().removeClass("dec-filter-select");
			$('.dec-organizer-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

	});

	function decm_run_keyword_search() {
		var filter_search = $('#dec-filter-search__input').val();
		findFilterElement('search').val(filter_search);
		decm_get_event($('#dec-find-events'));
	}

	$('#dec-filter-search__input').on('keydown', function (event) {
		if (event.which === 13) {
			event.preventDefault();
			decm_run_keyword_search();
		}
	});

	$('#dec-find-events').on('click', function (event) {
		event.preventDefault();
		decm_run_keyword_search();
	});

	jQuery("input[name='dec_filter_category']").on('change', function () {
		decm_apply_category_filter($(this));
	});

	jQuery('.decm-filter-catrgory-list').on('click', function () {
		decm_apply_category_filter($(this));
	});

	jQuery('input[name=\'dec_filter_tag\'], .dec-tag-list').on("click", function () {

		var selectedTag = new Array();
		var selectedTagId = new Array();
		$(" input[name='dec_filter_tag']:checked").each(function () {
			selectedTag.push(" " + this.value);
			selectedTagId.push(this.id);
		});

		if (selectedTag.length > 0) {
			findFilterElement('tag').val(selectedTagId);
			$('#dec-tag-current-select').html(": " + selectedTag);
			$('#dec-tag-current-select').parent().addClass("dec-filter-select");
			$('.dec-tag-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('tag').val(dataId);
			$('#dec-tag-current-select').html(": " + text);
			$('#dec-tag-current-select').parent().addClass("dec-filter-select");
			$('.dec-tag-remove').css({ "display": "initial" });
		} else {
			findFilterElement('tag').val("");
			$('#dec-tag-current-select').html("");
			$('#dec-tag-current-select').parent().removeClass("dec-filter-select");
			$('.dec-tag-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

		(jQuery(this).text(), "Tag click");
	});


	jQuery('input[name=\'dec_filter_venue\'], .dec-venue-list').on("click", function () {

		var selectedVenue = new Array();
		var selectedId = new Array();
		$(" input[name='dec_filter_venue']:checked").each(function () {
			selectedVenue.push(" " + this.value);
			selectedId.push(this.id);
		});


		if (selectedVenue.length > 0) {

			findFilterElement('venue').val(selectedId);
			//$('.dec-venue-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ selectedVenue +"</span>");
			$('#dec-venue-current-select').html(": " + selectedVenue);
			$('#dec-venue-current-select').parent().addClass("dec-filter-select");
			$('.dec-venue-remove').css({ "display": "initial" });

		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('venue').val(dataId);
			//$('.dec-venue-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ text +"</span>");
			$('#dec-venue-current-select').html(": " + text);
			$('#dec-venue-current-select').parent().addClass("dec-filter-select");
			$('.dec-venue-remove').css({ "display": "initial" });
		} else {
			findFilterElement('venue').val("");
			//$('.dec-venue-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ selectedVenue +"</span>");
			$('#dec-venue-current-select').html(" ");
			$('#dec-venue-current-select').parent().removeClass("dec-filter-select");
			$('.dec-venue-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);
		(jQuery(this).text(), "Venue click");

	});

	jQuery('input[name=\'dec_filter_location\'], .dec-location-list').on("click", function () {

		var selectedLocation = new Array();
		//var selectedCityId = new Array();
		$(" input[name='dec_filter_location']:checked").each(function () {
			selectedLocation.push(" " + this.value);
			//	selectedCityId.push(this.id);
		});

		if (selectedLocation.length > 0) {
			findFilterElement('address').val(selectedLocation);
			$('#dec-location-current-select').html(": " + selectedLocation);
			$('#dec-location-current-select').parent().addClass("dec-filter-select");
			$('.dec-location-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			//	var dataId = $(this).data("id");
			findFilterElement('address').val(text);
			$('.dec-location-filter-selection-list').html("<span class='location-filter-selection'>" + text + "</span>");
			$('#dec-location-current-select').html(": " + text);
			$('#dec-location-current-select').parent().addClass("dec-filter-select");
			$('.dec-location-remove').css({ "display": "initial" });
		} else {
			$('#dec-eventfeed-address').val('');
			$('#dec-location-current-select').html("");
			$('#dec-location-current-select').parent().removeClass("dec-filter-select");
			$('.dec-location-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

	});


	jQuery('.dec-time-filter-list li').on("click", function () {
		var selectedTime = new Array();
		var selectedTimeId = new Array();
		$(" input[name='dec_filter_time']:checked").each(function () {
			selectedTime.push(" " + this.value);
			selectedTimeId.push(this.id);
		});


		if (selectedTime.length > 0) {
			findFilterElement('time').val(selectedTimeId);
			$('#dec-time-current-select').html(": " + selectedTime);
			$('#dec-time-current-select').parent().addClass("dec-filter-select");
			$('.dec-time-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('time').val(dataId);
			// $('#event-time').val(selectedTime);
			$('#dec-time-current-select').html(": " + text);
			$('#dec-time-current-select').parent().addClass("dec-filter-select");
			$('.dec-time-remove').css({ "display": "initial" });
		} else {
			findFilterElement('time').val("");
			$('#dec-time-current-select').html("");
			$('#dec-time-current-select').parent().removeClass("dec-filter-select");
			$('.dec-time-remove').css({ "display": "none" });
		}
		(jQuery(this).text(), "time click");
		let button_here = $(this);
		decm_get_event(button_here);

	});


	jQuery('input[name=\'dec_filter_days\'], .dec-days-list').on("click", function () {
		var selectedDays = new Array();
		var selectedDaysids = new Array();
		$(" input[name='dec_filter_days']:checked").each(function () {
			selectedDays.push(" " + this.value);
			selectedDaysids.push(" " + this.id);
		});

		if (selectedDays.length > 0) {
			findFilterElement('day').val(selectedDaysids.map(function (id) { return String(id).trim(); }).join(','));
			$('#dec-day-current-select').html(": " + selectedDays);
			$('#dec-day-current-select').parent().addClass("dec-filter-select");
			$('.dec-day-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('day').val(dataId);
			$('#dec-day-current-select').html(": " + text);
			$('#dec-day-current-select').parent().addClass("dec-filter-select");
			$('.dec-day-remove').css({ "display": "initial" });
		} else {
			findFilterElement('day').val("");
			$('#dec-day-current-select').html("");
			$('#dec-day-current-select').parent().removeClass("dec-filter-select");
			$('.dec-day-remove').css({ "display": "none" });
		}

		(jQuery(this).text(), "Day click");
		let button_here = $(this);
		decm_get_event(button_here);
	});


	jQuery('input[name=\'dec_filter_city\'], .dec-city-list').on("click", function () {

		var selectedCity = new Array();
		//var selectedCityId = new Array();
		$(" input[name='dec_filter_city']:checked").each(function () {
			selectedCity.push(" " + this.value);
			//	selectedCityId.push(this.id);
		});

		if (selectedCity.length > 0) {
			findFilterElement('city').val(selectedCity);
			$('#dec-city-current-select').html(": " + selectedCity);
			$('#dec-city-current-select').parent().addClass("dec-filter-select");
			$('.dec-city-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			//	var dataId = $(this).data("id");
			findFilterElement('city').val(text);
			$('#dec-city-current-select').html(": " + text);
			$('#dec-city-current-select').parent().addClass("dec-filter-select");
			$('.dec-city-remove').css({ "display": "initial" });
		} else {
			findFilterElement('city').val("");
			$('#dec-city-current-select').html("");
			$('#dec-city-current-select').parent().removeClass("dec-filter-select");
			$('.dec-city-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);


	});

	jQuery('input[name=\'dec_filter_state\'], .dec-state-list').on("click", function () {

		var selectedState = new Array();
		//var selectedCityId = new Array();
		$(" input[name='dec_filter_state']:checked").each(function () {
			selectedState.push(" " + this.value);
			//	selectedCityId.push(this.id);
		});

		if (selectedState.length > 0) {
			findFilterElement('state').val(selectedState);
			$('#dec-state-current-select').html(": " + selectedState);
			$('#dec-state-current-select').parent().addClass("dec-filter-select");
			$('.dec-state-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			//	var dataId = $(this).data("id");
			findFilterElement('state').val(text);
			$('#dec-state-current-select').html(": " + text);
			$('#dec-state-current-select').parent().addClass("dec-filter-select");
			$('.dec-state-remove').css({ "display": "initial" });
		} else {
			findFilterElement('state').val("");
			$('#dec-state-current-select').html("");
			$('#dec-state-current-select').parent().removeClass("dec-filter-select");
			$('.dec-state-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

	});


	jQuery('input[name=\'dec_filter_country\'], .dec-country-list').on("click", function () {

		var selectedCountry = new Array();
		$("input[name='dec_filter_country']:checked").each(function () {
			selectedCountry.push(" " + this.value);
		});

		if (selectedCountry.length > 0) {
			findFilterElement('country').val(selectedCountry);
			$('#dec-country-current-select').html(": " + selectedCountry);
			$('#dec-country-current-select').parent().addClass("dec-filter-select");
			$('.dec-country-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			findFilterElement('country').val(text);
			$('#dec-country-current-select').html(": " + text);
			$('#dec-country-current-select').parent().addClass("dec-filter-select");
			$('.dec-country-remove').css({ "display": "initial" });
		} else {
			findFilterElement('country').val("");
			$('#dec-country-current-select').html("");
			$('#dec-country-current-select').parent().removeClass("dec-filter-select");
			$('.dec-country-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

	});


	jQuery('input[name=\'dec_filter_months\'], .dec-months-list').on("click", function () {

		var selectedMonths = new Array();
		var selectedMonthsId = new Array();
		$("input[name='dec_filter_months']:checked").each(function () {
			selectedMonths.push(" " + this.value);
			selectedMonthsId.push(this.id);
		});

		if (selectedMonths.length > 0) {
			findFilterElement('month').val(selectedMonthsId);
			$('#dec-month-current-select').html(": " + selectedMonths);
			$('#dec-month-current-select').parent().addClass("dec-filter-select");
			$('.dec-month-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('month').val(dataId);
			$('#dec-month-current-select').html(": " + text);
			$('#dec-month-current-select').parent().addClass("dec-filter-select");
			$('.dec-month-remove').css({ "display": "initial" });
		} else {
			findFilterElement('month').val("");
			$('#dec-month-current-select').html("");
			$('#dec-month-current-select').parent().removeClass("dec-filter-select");
			$('.dec-month-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);
		//$('.dec-month-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ text +"</span>");
	});



	jQuery('input[name=\'dec_filter_status\'], .dec-status-list').on("click", function () {

		var selectedStatus = new Array();
		var selectedStatusId = new Array();
		$("input[name='dec_filter_status']:checked").each(function () {
			selectedStatus.push(" " + this.value);
			selectedStatusId.push(this.id);
		});

		if (selectedStatus.length > 0) {
			findFilterElement('status').val(selectedStatusId);
			$('#dec-status-current-select').html(": " + selectedStatus);
			$('#dec-status-current-select').parent().addClass("dec-filter-select");
			$('.dec-status-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('status').val(dataId);
			$('#dec-status-current-select').html(": " + text);
			$('#dec-status-current-select').parent().addClass("dec-filter-select");
			$('.dec-status-remove').css({ "display": "initial" });
		} else {
			findFilterElement('status').val("");
			$('#dec-status-current-select').html("");
			$('#dec-status-current-select').parent().removeClass("dec-filter-select");
			$('.dec-status-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);
		//$('.dec-month-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ text +"</span>");
	});


	jQuery('.dec-order-filter-list li').on("click", function () {

		var text = jQuery(this).text();
		var dataId = $(this).data("id");

		findFilterElement('order').val(dataId);
		$('#dec-order-current-select').html(": " + text);

		$('#dec-order-current-select').parent().addClass("dec-filter-select");
		$('.dec-order-remove').css({ "display": "initial" });
		let button_here = $(this);
		decm_get_event(button_here);
	});


	jQuery('.dec-recurring-filter-list li').on("click", function () {

		var text = jQuery(this).text();
		var dataId = $(this).data("id");
		findFilterElement('recurring').val(dataId);
		$('#dec-recurring-current-select').html(": " + text);


		$('#dec-recurring-current-select').parent().addClass("dec-filter-select");
		$('.dec-recurring-remove').css({ "display": "initial" });

		let button_here = $(this);
		decm_get_event(button_here);
	});
	jQuery('input[name=\'dec_filter_future_past\'], .dec-future-past-list').on("click", function () {

		var selectedStatus = new Array();
		var selectedStatusId = new Array();
		$("input[name='dec_filter_future_past']:checked").each(function () {
			selectedStatus.push(" " + this.value);
			selectedStatusId.push(this.id);
		});

		if (selectedStatus.length > 0) {
			findFilterElement('future-past').val(selectedStatusId);
			$('#dec-future-past-current-select').html(": " + selectedStatus);
			$('#dec-future-past-current-select').parent().addClass("dec-filter-select");
			$('.dec-future-past-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('future-past').val(dataId);
			$('#dec-future-past-current-select').html(": " + text);
			$('#dec-future-past-current-select').parent().addClass("dec-filter-select");
			$('.dec-future-past-remove').css({ "display": "initial" });
		} else {
			findFilterElement('future-past').val("");
			$('#dec-future-past-current-select').html("");
			$('#dec-future-past-current-select').parent().removeClass("dec-filter-select");
			$('.dec-future-past-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);
		//$('.dec-month-filter-selection-list' ).html("<span class='venue-filter-selection'>"+ text +"</span>");
	});
	jQuery('input[name=\'dec_filter_years\'], .dec-years-list').on("click", function () {
		var selectedYear = new Array();
		var selectedYearId = new Array();
		$(" input[name='dec_filter_years']:checked").each(function () {
			selectedYear.push(" " + this.value);
			selectedYearId.push(this.id);
		});

		if (selectedYear.length > 0) {
			findFilterElement('year').val(selectedYearId);
			$('#dec-year-current-select').html(": " + selectedYear);
			$('#dec-year-current-select').parent().addClass("dec-filter-select");
			$('.dec-year-remove').css({ "display": "initial" });
		} else if (jQuery(this).text() != '') {
			var text = jQuery(this).text();
			var dataId = $(this).data("id");
			findFilterElement('year').val(dataId);
			$('#dec-year-current-select').html(": " + text);
			$('#dec-year-current-select').parent().addClass("dec-filter-select");
			$('.dec-year-remove').css({ "display": "initial" });
		} else {
			findFilterElement('year').val("");
			$('#dec-year-current-select').html("");
			$('#dec-year-current-select').parent().removeClass("dec-filter-select");
			$('.dec-year-remove').css({ "display": "none" });
		}
		let button_here = $(this);
		decm_get_event(button_here);

	});


	// Only bind slider click events if slider is available
	if (typeof $.fn.slider !== 'undefined') {
		jQuery('#eventCostslider, #eventCostslider .ui-slider-range, #eventCostslider > .ui-slider-handle').on("click", function () {
			var EventcostMax = jQuery('#EventcostMax').val();
			var EventcostMin = jQuery('#EventcostMin').val();
			//	$('#dec-price-current-select' ).html("<span class='price-filter-selection'>"+ EventcostMin +"- " + EventcostMax +"</span>");
			$('#dec-price-current-select').html("(" + EventCurrencySymbol + "): " + EventcostMin + "-" + EventcostMax);
			$('#dec-price-current-select').parent().addClass("dec-filter-select");
			$('.dec-price-remove').css({ "display": "initial" });
			let button_here = $(this);
			decm_get_event(button_here);
		});
	}


	$('.dec-city-filter').on("click", function () {
		$('.dec-city-filter-list').toggle();
	});

	$('.dec-country-filter').on("click", function () {
		$('.dec-country-filter-list').toggle();
	});

	$('.dec-state-filter').on("click", function () {
		$('.dec-state-filter-list').toggle();
	});

	$('.dec-filter-order-by').on("click", function () {
		$('.dec-order-filter-list').toggle();

	});

	$('.dec-organizer-filter').on("click", function () {
		$('.dec-organizer-filter-list').toggle();
	});

	$('.dec-filter-cost').on("click", function () {
		$('.dec-price-filter-list').toggle();

	});

	$('.dec-filter-year').on("click", function () {
		$('.dec-year-filter-list').toggle();
	});

	$('.dec-filter-event-category').on("click", function () {
		$('.dec-event-category-filter-list').toggle();
	});

	// Keep selection clicks inside dropdown panels from bubbling to bar toggles / stacking handlers.
	$('.dec-event-category-filter-list, .dec-organizer-filter-list, .dec-venue-filter-list, .dec-tag-filter-list, .dec-month-filter-list, .dec-day-filter-list, .dec-time-filter-list, .dec-year-filter-list, .dec-city-filter-list, .dec-country-filter-list, .dec-state-filter-list, .dec-location-filter-list, .dec-order-filter-list, .dec-recurring-filter-list, .dec-status-filter-list, .dec-future-past-filter-list, .dec-price-filter-list').on('click', function (e) {
		e.stopPropagation();
	});


	$('.dec-filter-month').on("click", function () {
		$('.dec-month-filter-list').toggle();
	});
	$('.dec-filter-future-past-by').on("click", function () {
		$('.dec-future-past-filter-list').toggle();

	});

	$('.dec-filter-location').on("click", function () {
		$('.dec-location-filter-list').toggle();
	});


	$('.dec-filter-tag').on("click", function () {
		$('.dec-tag-filter-list').toggle();
	});


	$('.dec-venue-filter').on("click", function () {
		$('.dec-venue-filter-list').toggle();
	});


	$('.dec-filter-time').on("click", function () {
		$('.dec-time-filter-list').toggle();

	});

	$('.dec-filter-status').on("click", function () {
		$('.dec-status-filter-list').toggle();

	});

	$('.dec-filter-day').on("click", function () {
		$('.dec-day-filter-list').toggle();
	});

	$('.dec-filter-recurring').on("click", function () {
		$('.dec-recurring-filter-list').toggle();
	});


	jQuery('.dec-date-range-remove').on("click", function () {
		clearEventDateRangeFields();
		resetDateRangePickerUI();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-organizer-remove').on("click", function () {
		$("input[name='dec_filter_organizer']").prop('checked', false);
		$('#dec-organizer-current-select').html("");
		findFilterElement('organizer').val("");
		$('.organizer-filter-selection-list').html("");
		$('#dec-organizer-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-venue-filter-list').hide();
		$('.dec-month-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-venue-remove').on("click", function () {
		$("input[name='dec_filter_venue']").prop('checked', false);
		$('#dec-venue-current-select').html("");
		findFilterElement('venue').val("");
		$('.dec-venue-filter-selection-list').html("");
		$('#dec-venue-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-venue-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-year-remove').on("click", function () {
		$("input[name='dec_filter_years']").prop('checked', false);
		$('#dec-year-current-select').html("");
		findFilterElement('year').val("");
		$('.dec-year-filter-selection-list').html("");
		$('#dec-year-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-year-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-price-remove').on("click", function () {
		$('#dec-price-current-select').html("");
		$(mainClass + ' #EventcostMax').val("");
		$(mainClass + ' #EventcostMin').val("");
		$('#dec-price-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-price-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-month-remove').on("click", function () {
		$("input[name='dec_filter_months']").prop('checked', false);
		$('#dec-month-current-select').html("");
		findFilterElement('month').val("");
		$('.dec-month-filter-selection-list').html("");
		$('#dec-month-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-month-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-day-remove').on("click", function () {
		$("input[name='dec_filter_days']").prop('checked', false);
		$('#dec-day-current-select').html("");
		findFilterElement('day').val("");
		$('.dec-day-filter-selection-list').html("");
		$('#dec-day-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-day-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});


	jQuery('.dec-time-remove').on("click", function () {
		$("input[name='dec_filter_time']").prop('checked', false);
		$('#dec-time-current-select').html("");
		findFilterElement('time').val("");
		$('.dec-time-filter-selection-list').html("");
		$('#dec-time-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-time-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-tag-remove').on("click", function () {
		$("input[name='dec_filter_tag']").prop('checked', false);
		$('#dec-tag-current-select').html("");
		$('.tag-filter-selection-list').html("");
		findFilterElement('tag').val("");
		$('#dec-tag-current-select').parent().removeClass("dec-filter-select");
		$(this).css({ "display": "none" });
		$('.dec-tag-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-category-remove').on("click", function () {
		$("input[name='dec_filter_category']").prop('checked', false);
		$('.custom__li_filter').removeClass('dec-filter-select');
		$('.dec-filter-event-inline li').removeClass('dec-filter-select');
		$('#dec-event-current-select').html("");
		findFilterElement('category').val("");
		$('.event-category-filter-selection-list').html("");
		$(this).css({ "display": "none" });
		$('#dec-event-current-select').parent().removeClass("dec-filter-select");
		$('.dec-event-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-city-remove').on("click", function () {
		$("input[name='dec_filter_city']").prop('checked', false);
		$('#dec-city-current-select').html("");
		findFilterElement('city').val("");
		$(this).css({ "display": "none" });
		$('#dec-city-current-select').parent().removeClass("dec-filter-select");
		$('.dec-city-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-country-remove').on("click", function () {
		$("input[name='dec_filter_country']").prop('checked', false);
		$('#dec-country-current-select').html("");
		findFilterElement('country').val("");
		$(this).css({ "display": "none" });
		$('#dec-country-current-select').parent().removeClass("dec-filter-select");
		$('.dec-country-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});


	jQuery('.dec-location-remove').on("click", function () {
		$("input[name='dec_filter_location']").prop('checked', false);
		$('#dec-location-current-select').html("");
		findFilterElement('address').val("");
		$(this).css({ "display": "none" });
		$('#dec-location-current-select').parent().removeClass("dec-filter-select");
		$('.dec-location-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-state-remove').on("click", function () {
		$("input[name='dec_filter_state']").prop('checked', false);
		$('#dec-state-current-select').html("");
		findFilterElement('state').val("");
		$(this).css({ "display": "none" });
		$('#dec-state-current-select').parent().removeClass("dec-filter-select");
		$('.dec-state-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-order-remove').on("click", function () {
		$("input[name='dec_filter_order']").prop('checked', false);
		$('#dec-order-current-select').html("");
		findFilterElement('order').val("");
		$(this).css({ "display": "none" });
		$('#dec-order-current-select').parent().removeClass("dec-filter-select");
		$('.dec-order-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});
	jQuery('.dec-future-past-remove').on("click", function () {
		$("input[name='dec_filter_future_past']").prop('checked', false);
		$('#dec-future-past-current-select').html("");
		findFilterElement('future-past').val("");
		$(this).css({ "display": "none" });
		$('#dec-future-past-current-select').parent().removeClass("dec-filter-select");
		$('.dec-future-past-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});
	jQuery('.dec-status-remove').on("click", function () {
		$("input[name='dec_filter_status']").prop('checked', false);
		$('#dec-status-current-select').html("");
		findFilterElement('status').val("");
		$(this).css({ "display": "none" });
		$('#dec-status-current-select').parent().removeClass("dec-filter-select");
		$('.dec-status-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('.dec-recurring-remove').on("click", function () {
		$("input[name='dec_filter_recurring']").prop('checked', false);
		$('#dec-recurring-current-select').html("");
		findFilterElement('recurring').val("");
		$(this).css({ "display": "none" });
		$('#dec-recurring-current-select').parent().removeClass("dec-filter-select");
		$('.dec-recurring-category-filter-list').hide();
		let button_here = $(this);
		decm_get_event(button_here);
	});

	jQuery('#dec-filter-remove').on("click", function () {
		$('li.dec-filter-select ').removeClass('dec-filter-select ');
		$(".dec-filter-label > button").hide();
		$("input[name='dec_filter_venue']").prop('checked', false);
		$("input[name='dec_filter_tag']").prop('checked', false);
		$("input[name='dec_filter_city']").prop('checked', false);
		$("input[name='dec_filter_future_past']").prop('checked', false);
		$("input[name='dec_filter_country']").prop('checked', false);
		$("input[name='dec_filter_location']").prop('checked', false);
		$("input[name='dec_filter_category']").prop('checked', false);
		$("input[name='dec_filter_organizer']").prop('checked', false);
		$("input[name='dec_filter_order']").prop('checked', false);
		$("input[name='dec_filter_months']").prop('checked', false);
		$("input[name='dec_filter_status']").prop('checked', false);
		$("input[name='dec_filter_time']").prop('checked', false);
		$("input[name='dec_filter_days']").prop('checked', false);
		$("input[name='dec_filter_years']").prop('checked', false);
		$("input[name='dec_filter_state']").prop('checked', false);
		$('#dec-tag-current-select').html("");
		$('#dec-order-current-select').html("");
		$('#dec-future-past-current-select').html("");
		$('#dec-venue-current-select').html("");
		$('#dec-event-current-select').html("");
		$('#dec-organizer-current-select').html("");
		$('#dec-month-current-select').html("");
		$('#dec-year-current-select').html("");
		$('#dec-price-current-select').html("");
		$('#dec-time-current-select').html("");
		$('#dec-day-current-select').html("");
		$('#dec-city-current-select').html("");
		$('#dec-state-current-select').html("");
		$('#dec-country-current-select').html("");
		$('#dec-location-current-select').html("");
		$('#dec-status-current-select').html("");
		$('#dec-recurring-current-select').html("");
		$('#dec-eventfeed-future-past').html("");
		$('#dec-filter-search__input').val("");
		findFilterElement('search').val("");
		findFilterElement('location').val("");
		findFilterElement('country').val("");
		findFilterElement('city').val("");
		findFilterElement('order').val("");
		findFilterElement('tag').val("");
		findFilterElement('day').val("");
		findFilterElement('category').val("");
		findFilterElement('time').val("");
		findFilterElement('venue').val("");
		findFilterElement('organizer').val("");
		findFilterElement('month').val("");
		findFilterElement('year').val("");
		findFilterElement('state').val("");
		findFilterElement('address').val("");
		$(mainClass + ' #EventcostMax').val("");
		$(mainClass + ' #EventcostMin').val("");
		clearEventDateRangeFields();
		resetDateRangePickerUI();
		findFilterElement('search').val("");
		findFilterElement('status').val("");
		findFilterElement('recurring').val("");
		findFilterElement('future-past').val("");


		//	$(mainClass +' #eventfeed_current_page').val("0");

		$('#dec-event-current-select').parent().removeClass("dec-filter-select");
		$('#dec-tag-current-select').parent().removeClass("dec-filter-select");
		$('#dec-month-current-select').parent().removeClass("dec-filter-select");
		$('#dec-year-current-select').parent().removeClass("dec-filter-select");
		$('#dec-venue-current-select').parent().removeClass("dec-filter-select");
		$('#dec-price-current-select').parent().removeClass("dec-filter-select");
		$('#dec-organizer-current-select').parent().removeClass("dec-filter-select");
		$('#dec-day-current-select').parent().removeClass("dec-filter-select");
		$('#dec-time-current-select').parent().removeClass("dec-filter-select");
		$('#dec-city-current-select').parent().removeClass("dec-filter-select");
		$('#dec-country-current-select').parent().removeClass("dec-filter-select");
		$('#dec-state-current-select').parent().removeClass("dec-filter-select");
		$('#dec-location-current-select').parent().removeClass("dec-filter-select");
		$('#dec-order-current-select').parent().removeClass("dec-filter-select");
		$('#dec-status-current-select').parent().removeClass("dec-filter-select");
		$('#dec-recurring-current-select').parent().removeClass("dec-filter-select");
		$('#dec-future-past-current-select').parent().removeClass("dec-filter-select");
		$('#reportrange').removeClass("dec-filter-select");
		$('.dec-filter-event-category-inline').removeClass("active");
		let button_here = $(this);
		decm_get_event(button_here);

	});

	var countOrganizer = $(".dec-organizer-filter-list").find("li").length;
	var countTag = $(".dec-tag-filter-list").find("li").length;
	var countVenue = $(".dec-venue-filter-list").find("li").length;
	var countCategory = $(".dec-event-category-filter-list").find("li").length;
	var countCity = $(".dec-city-filter-list").find("li").length;
	var countState = $(".dec-state-filter-list").find("li").length;
	var countCountry = $(".dec-country-filter-list").find("li").length;
	var countLocation = $(".dec-location-filter-list").find("li").length;

	// var countMonth = $(".dec-month-filter-list").find("li").length;
	// var countYear = $(".dec-year-filter-list").find("li").length;

	if (countOrganizer > 12) {
		$(".dec-organizer-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}
	if (countTag > 12) {
		$(".dec-tag-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}
	if (countVenue > 12) {
		$(".dec-venue-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}
	if (countCategory > 12) {
		$(".dec-event-category-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}

	if (countCity > 12) {
		$(".dec-city-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}
	if (countState > 12) {
		$(".dec-state-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}

	if (countCountry > 12) {
		$(".dec-country-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}

	if (countLocation > 12) {
		$(".dec-location-filter-list").find("li").parent().addClass("dec-filter-scroll");
	}


	// event filter fucntion 
	function buildNumericPaginationIconSpan(iconChar, iconFont, position) {
		if (!iconChar) {
			return '';
		}
		var fontClass = (iconFont === 'FontAwesome') ? 'dec-numeric-icon-font-fa' : 'dec-numeric-icon-font-et';
		var posClass = position === 'first' ? 'dec-numeric-icon-first' : 'dec-numeric-icon-last';
		return '<span class="dec-numeric-icon-inline ' + posClass + ' ' + fontClass + '" aria-hidden="true">' + escapeHtml(iconChar) + '</span>';
	}

	function buildPagedPaginationIconSpan(iconChar, iconFont, position) {
		if (!iconChar) {
			return '';
		}
		var fontClass = (iconFont === 'FontAwesome') ? 'dec-paged-icon-font-fa' : 'dec-paged-icon-font-et';
		var posClass = position === 'prev' ? 'dec-paged-icon-prev' : 'dec-paged-icon-next';
		return '<span class="dec-paged-icon-inline ' + posClass + ' ' + fontClass + '" aria-hidden="true">' + escapeHtml(iconChar) + '</span>';
	}

	function findPagedPaginationHiddenFields($paginationContainer) {
		var $hidden = $paginationContainer.siblings('.events-main__container').find('.hidden_feild');
		if ($hidden.length) {
			return $hidden;
		}
		$hidden = $paginationContainer.closest('.event_calendar_module__inner, .decm_event_display, [class*="event-display_"]').find('.hidden_feild').first();
		return $hidden;
	}

	function normalizePagedButtonAlign(align, defaultAlign) {
		var value = (align || '').toString().trim().toLowerCase();
		if (value === 'left' || value === 'center' || value === 'right') {
			return value;
		}
		return defaultAlign || 'left';
	}

	function getPagedPaginationAlignClasses(prevAlign, nextAlign, hasPrev, hasNext) {
		var prev = normalizePagedButtonAlign(prevAlign, 'left');
		var next = normalizePagedButtonAlign(nextAlign, 'right');
		var classes = ['dec-paged-prev-align-' + prev, 'dec-paged-next-align-' + next];

		if (hasPrev && hasNext) {
			if (prev === next) {
				classes.push('dec-paged-group-' + prev);
			} else if (prev === 'left' && next === 'right') {
				classes.push('dec-paged-split-lr');
			} else if (prev === 'right' && next === 'left') {
				classes.push('dec-paged-split-rl');
			} else {
				classes.push('dec-paged-split-mixed');
			}
		} else if (hasNext && !hasPrev) {
			classes.push('dec-paged-single', 'dec-paged-single-next', 'dec-paged-single-' + next);
		} else if (hasPrev && !hasNext) {
			classes.push('dec-paged-single', 'dec-paged-single-prev', 'dec-paged-single-' + prev);
		}

		return classes.join(' ');
	}

	function getPagedPaginationLayoutMode(prevAlign, nextAlign, hasPrev, hasNext) {
		var prev = normalizePagedButtonAlign(prevAlign, 'left');
		var next = normalizePagedButtonAlign(nextAlign, 'right');

		if (hasPrev && hasNext) {
			if (prev === next) {
				return 'group-' + prev;
			}
			if (prev === 'left' && next === 'right') {
				return 'split-lr';
			}
			if (prev === 'right' && next === 'left') {
				return 'split-rl';
			}
			return 'split-mixed';
		}
		if (hasNext && !hasPrev) {
			return 'single-' + next;
		}
		if (hasPrev && !hasNext) {
			return 'single-' + prev;
		}
		return 'empty';
	}

	function getPagedPaginationContainerStyle(prevAlign, nextAlign, hasPrev, hasNext) {
		var mode = getPagedPaginationLayoutMode(prevAlign, nextAlign, hasPrev, hasNext);
		var styles = ['width:100%', 'gap:1em', 'align-items:center', 'float:none', 'clear:both'];

		switch (mode) {
			case 'group-left':
				styles.push('display:flex !important', 'flex-wrap:wrap', 'justify-content:flex-start');
				break;
			case 'group-center':
				styles.push('display:flex !important', 'flex-wrap:wrap', 'justify-content:center');
				break;
			case 'group-right':
				styles.push('display:flex !important', 'flex-wrap:wrap', 'justify-content:flex-end');
				break;
			case 'split-lr':
				styles.push('display:flex !important', 'flex-wrap:wrap', 'justify-content:space-between');
				break;
			case 'split-rl':
				styles.push('display:flex !important', 'flex-wrap:wrap', 'justify-content:space-between', 'flex-direction:row-reverse');
				break;
			case 'split-mixed':
				styles.push('display:grid !important', 'grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)');
				break;
			case 'single-left':
				styles.push('display:flex !important', 'justify-content:flex-start');
				break;
			case 'single-center':
				styles.push('display:flex !important', 'justify-content:center');
				break;
			case 'single-right':
				styles.push('display:flex !important', 'justify-content:flex-end');
				break;
			default:
				break;
		}

		return styles.join(';');
	}

	function getPagedPaginationLinkStyle(align) {
		var normalized = normalizePagedButtonAlign(align, 'left');
		var col = normalized === 'left' ? '1' : (normalized === 'center' ? '2' : '3');
		var self = normalized === 'left' ? 'start' : (normalized === 'center' ? 'center' : 'end');
		return 'grid-column:' + col + ';grid-row:1;justify-self:' + self + ';float:none !important;clear:none !important;margin:0 !important;';
	}

	function getPagedPaginationLayoutAttributes(prevAlign, nextAlign, hasPrev, hasNext) {
		var prev = normalizePagedButtonAlign(prevAlign, 'left');
		var next = normalizePagedButtonAlign(nextAlign, 'right');
		var mode = getPagedPaginationLayoutMode(prev, next, hasPrev, hasNext);
		var baseLinkStyle = 'float:none !important;clear:none !important;margin:0 !important;';

		return {
			className: getPagedPaginationAlignClasses(prev, next, hasPrev, hasNext),
			containerStyle: getPagedPaginationContainerStyle(prev, next, hasPrev, hasNext),
			prevStyle: mode === 'split-mixed' && hasPrev ? getPagedPaginationLinkStyle(prev) : baseLinkStyle,
			nextStyle: mode === 'split-mixed' && hasNext ? getPagedPaginationLinkStyle(next) : baseLinkStyle,
			prevData: prev,
			nextData: next
		};
	}

	function escapeHtml(text) {
		if (!text) return '';
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, function(m) { return map[m]; });
	}

	function phpToMomentFormat(format) {
		// A basic mapping from PHP date tokens to Moment.js tokens.
		var replacements = {
			'd': 'DD',
			'D': 'ddd',
			'j': 'D',
			'l': 'dddd',
			'N': 'E',
			'S': '', // Suffix like "st", "nd", "rd", "th" (not directly supported)
			'w': 'e',
			'z': 'DDD',
			'W': 'W',
			'F': 'MMMM',
			'm': 'MM',
			'M': 'MMM',
			'n': 'M',
			'Y': 'YYYY',
			'y': 'YY',
			'a': 'a',
			'A': 'A',
			'g': 'h',
			'G': 'H',
			'h': 'hh',
			'H': 'HH',
			'i': 'mm',
			's': 'ss'
		};

		var momentFormat = '';
		for (var i = 0; i < format.length; i++) {
			var char = format.charAt(i);
			momentFormat += (replacements[char] !== undefined ? replacements[char] : char);
		}
		return momentFormat;
	}

	function deriveShortenedStartMomentFormat(dateDetailsFormat, includeYear) {
		var format = (dateDetailsFormat || '').trim() || 'F d, Y';
		if (includeYear) {
			if (format.indexOf('F') !== -1) {
				return 'MMMM D, YYYY';
			}
			if (format.indexOf('M') !== -1) {
				return 'MMM D, YYYY';
			}
			if (format.indexOf('m') !== -1) {
				return 'MM/DD/YYYY';
			}
			return phpToMomentFormat(format.replace(/,?\s*[Yy]/g, '')) + ', YYYY';
		}
		if (format.indexOf('F') !== -1) {
			return 'MMMM D';
		}
		if (format.indexOf('M') !== -1) {
			return 'MMM D';
		}
		if (format.indexOf('m') !== -1) {
			return 'M/D';
		}
		return phpToMomentFormat(format.replace(/,?\s*[Yy]/g, '') || 'M j');
	}

	function updatePagination(paginationData, params, $paginationContainer) {
		var paginationHtml = '';
		switch (paginationData.pagination_type) {
			case 'paged': {
				const $hidden = findPagedPaginationHiddenFields($paginationContainer);
				const prevIconChar = ($hidden.find('input[name="paged_prev_button_icon"]').val() || '').trim();
				const prevIconFont = $hidden.find('input[name="paged_prev_button_icon_font"]').val() || 'ETmodules';
				const nextIconChar = ($hidden.find('input[name="paged_next_button_icon"]').val() || '').trim();
				const nextIconFont = $hidden.find('input[name="paged_next_button_icon_font"]').val() || 'ETmodules';
				const prevIconClass = prevIconChar ? ' dec-paged-custom-icon dec-paged-inline-icon' : '';
				const nextIconClass = nextIconChar ? ' dec-paged-custom-icon dec-paged-inline-icon' : '';
				const prevIconSpan = buildPagedPaginationIconSpan(prevIconChar, prevIconFont, 'prev');
				const nextIconSpan = buildPagedPaginationIconSpan(nextIconChar, nextIconFont, 'next');
				const hasPrev = paginationData.current_page > 1;
				const hasNext = paginationData.current_page < paginationData.total_pages;
				const prevAlign = $hidden.find('input[name="paged_prev_button_align"]').val() || 'left';
				const nextAlign = $hidden.find('input[name="paged_next_button_align"]').val() || 'right';
				const pagedLayout = getPagedPaginationLayoutAttributes(prevAlign, nextAlign, hasPrev, hasNext);

				paginationHtml = `
                <div class="dec-pagination dec-prev-next ${pagedLayout.className}" style="${pagedLayout.containerStyle}" data-paged-prev-align="${pagedLayout.prevData}" data-paged-next-align="${pagedLayout.nextData}">
                    ${hasPrev ?
						`<a href="#" class="prev${prevIconClass}" style="${pagedLayout.prevStyle}" data-page="${paginationData.current_page - 1}">${prevIconSpan}${__t(params.prv_link_btn)}</a>` : ''}
                    ${hasNext ?
						`<a href="#" class="next${nextIconClass}" style="${pagedLayout.nextStyle}" data-page="${paginationData.current_page + 1}">${__t(params.next_link_btn)}${nextIconSpan}</a>` : ''}
                </div>`;
				break;
			}

			case 'numeric_pagination': {
				const total = Number(paginationData.total_pages) || 1;
				const cur = Math.min(total, Math.max(1, Number(paginationData.current_page) || 1));
				const $hidden = $paginationContainer.siblings('.events-main__container').find('.hidden_feild');
				const firstText = $hidden.find('input[name="dec-eventfeed-first-translation"]').val() || __t('First');
				const lastText = $hidden.find('input[name="dec-eventfeed-last-translation"]').val() || __t('Last');
				const firstIconChar = ($hidden.find('input[name="numeric_first_button_icon"]').val() || '').trim();
				const firstIconFont = $hidden.find('input[name="numeric_first_button_icon_font"]').val() || 'ETmodules';
				const lastIconChar = ($hidden.find('input[name="numeric_last_button_icon"]').val() || '').trim();
				const lastIconFont = $hidden.find('input[name="numeric_last_button_icon_font"]').val() || 'ETmodules';
				const firstIconClass = firstIconChar ? ' dec-numeric-custom-icon dec-numeric-inline-icon' : '';
				const lastIconClass = lastIconChar ? ' dec-numeric-custom-icon dec-numeric-inline-icon' : '';
				const firstIconSpan = buildNumericPaginationIconSpan(firstIconChar, firstIconFont, 'first');
				const lastIconSpan = buildNumericPaginationIconSpan(lastIconChar, lastIconFont, 'last');

				let html = '<div class="dec-pagination dec-numeric">';

				// Page X of Y
				html += `<span class="dec-page-text-container">
					  <span class="dec-page-text-display">${__t('Page')}</span> ${cur} ${__t('of')} ${total}
					</span>`;

				// "First" when not on first page
				if (cur > 1) {
					html += `<a href="#" data-page="1" class="dec-page-text-first dec-page-text-display ecs-page-numbers${firstIconClass}">${firstIconSpan}${firstIconChar ? '' : '« '}${firstText}</a>`;
				}

				const addPage = (p) => {
					html += `<a href="#" class="ecs-page-numbers ${p === cur ? 'current' : ''}" data-page="${p}">${p}</a>`;
				};
				const addEllipsis = () => {
					html += `<span class="dec-ellipsis" aria-hidden="true">…</span>`;
				};

				// Build the set of pages to show:
				// - first 3 pages
				// - left neighbor, current, right neighbor
				// - last page
				const pagesSet = new Set([1, 2, 3, total, cur - 1, cur, cur + 1]);
				// keep only valid range
				const pages = [...pagesSet].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);

				// Render with ellipses for gaps
				let prev = null;
				for (const p of pages) {
					if (prev !== null && p - prev > 1) addEllipsis();
					addPage(p);
					prev = p;
				}

				// "Last" when not on last page
				if (cur < total) {
					html += `<a href="#" data-page="${total}" class="dec-page-text-last dec-page-text-display ecs-page-numbers${lastIconClass}">${lastText}${lastIconSpan}${lastIconChar ? '' : ' »'}</a>`;
				}

				html += '</div>';
				paginationHtml = html;
				break;
			}


			case 'load_more':
				if (paginationData.current_page < paginationData.total_pages) {
					// Build Load More button icon data attributes
					let loadMoreIconDataAttrs = '';
					if (params.load_more_button_icon_desktop) {
						loadMoreIconDataAttrs += ' data-icon="' + escapeHtml(params.load_more_button_icon_desktop) + '"';
					}
					if (params.load_more_button_icon_tablet) {
						loadMoreIconDataAttrs += ' data-icon-tablet="' + escapeHtml(params.load_more_button_icon_tablet) + '"';
					}
					if (params.load_more_button_icon_phone) {
						loadMoreIconDataAttrs += ' data-icon-phone="' + escapeHtml(params.load_more_button_icon_phone) + '"';
					}

					paginationHtml = `
                    <div class="dec-load-more ecs-showdetail et_pb_button_wrapper   mb-2">
                        <a href="#" role="button" class="load-more-btn ecs-ajax_load_more act-view-more et_pb_button${getButtonIconClassSuffix(params, 'load_more')}"${loadMoreIconDataAttrs}
                            data-page="${paginationData.current_page + 1}"
                            data-per-page="3">
                            ${__t(params.load_more_text)}
                        </a>
                    </div>`;
				}
				break;
		}

		$paginationContainer.find('.dec-pagination').remove();
		$paginationContainer.html(paginationHtml);
		if (window.decmEventDisplayResponsiveLayout && typeof window.decmEventDisplayResponsiveLayout.applyPagedPaginationLayout === 'function') {
			window.decmEventDisplayResponsiveLayout.applyPagedPaginationLayout($paginationContainer.find('.dec-pagination.dec-prev-next'));
		}

	}

	/**
	 * Resolve the Events Feed root from a matched element (module wrapper or inner node).
	 *
	 * @param {jQuery} $candidates Candidate element(s).
	 * @return {jQuery}
	 */
	function decmResolveEventDisplayContainer($candidates) {
		if (!$candidates || !$candidates.length) {
			return jQuery();
		}

		var $container = $candidates.filter('.decm_event_display, [class*="event-display_"]').first();
		if ($container.length) {
			return $container;
		}

		$container = $candidates.find('.event_calendar_module__inner').first();
		if ($container.length) {
			return $container.closest('.decm_event_display, [class*="event-display_"]').length
				? $container.closest('.decm_event_display, [class*="event-display_"]').first()
				: $container;
		}

		$container = $candidates.find('.events-main__container, .hidden_feild').first().closest('.decm_event_display, [class*="event-display_"], .event_calendar_module__inner');
		if ($container.length) {
			return $container.first();
		}

		return $candidates.first();
	}

	function decm_get_event(button_here) {
		// console.log('=== decm_get_event CALLED ===');
		// console.log('Button here:', button_here);
		("decm_get_event called with button:", button_here);

		// Try multiple methods to find the correct event display container
		var contss = null;
		var connectionIdFound = false;

		// Method 1: PRIORITY - Try to find by connection ID from filter parent
		var class_id_pick = $(button_here).parents(".decm_event_filter_parent").attr("class");
		("class_id_pick:", class_id_pick);

		if (class_id_pick) {
			let con = class_id_pick;
			let match = con.match(/connectionID[+]\w+/);
			if (match) {
				let connectionId = match[0].replace('+', '\\+'); // Escape '+' for jQuery class selector
				let connectionIdValue = connectionId.split('\\+')[1] || connectionId.split('+')[1];
				var $connected = jQuery(`[class*="connectionID+${connectionIdValue}"], [data-connection-id="${connectionIdValue}"]`);

				contss = decmResolveEventDisplayContainer($connected);
				if (contss && contss.length > 0) {
					connectionIdFound = true;
					("Found container by connection ID:", contss.length);
				}
			}
		}

		// Method 2: Try to find by data-connection-id attribute in siblings (only if connection ID not found)
		if (!connectionIdFound && (!contss || contss.length === 0)) {
			var filterParent = $(button_here).parents(".decm_event_filter_parent");
			if (filterParent && filterParent.length > 0) {
				var connectionId = filterParent.attr("data-connection-id") || filterParent.find("[data-connection-id]").first().attr("data-connection-id");
				if (connectionId) {
					contss = decmResolveEventDisplayContainer(jQuery(`[data-connection-id="${connectionId}"]`));
					if (contss && contss.length > 0) {
						connectionIdFound = true;
						("Found container by data-connection-id:", contss.length);
					}
				}
			}
		}

		// Method 3: FALLBACK - If no connection ID match, try to find by event-display_0 pattern
		if (!connectionIdFound && (!contss || contss.length === 0)) {
			contss = decmResolveEventDisplayContainer(jQuery('[class*="event-display_"]'));
			("Found container by event-display_ pattern:", contss ? contss.length : 0);
		}

		// Method 4: Try parent/next sibling approach (same section layouts only)
		if (!contss || contss.length === 0) {
			var filterParent = $(button_here).parents(".decm_event_filter_parent");
			if (filterParent && filterParent.length > 0) {
				var $siblingCandidates = filterParent.parent().next("div").add(filterParent.parent().nextAll("div")).add(filterParent.next("div"));
				contss = decmResolveEventDisplayContainer($siblingCandidates);
			}
			("Found container by parent/next:", contss ? contss.length : 0);
		}

		// Method 5: Try to find any event display container (Divi 5 block class)
		if (!contss || contss.length === 0) {
			contss = decmResolveEventDisplayContainer($(".wp-block-decm-event-display"));
			("Found container by Divi 5 block class:", contss ? contss.length : 0);
		}

		// Method 6: Try to find any event display container
		if (!contss || contss.length === 0) {
			contss = decmResolveEventDisplayContainer($(".decm_event_display, [class*='event-display_']"));
			("Found container by first event-display:", contss ? contss.length : 0);
		}

		// Method 7: Try to find by event calendar module inner class
		if (!contss || contss.length === 0) {
			contss = $(".event_calendar_module__inner").first();
			("Found container by event_calendar_module__inner:", contss ? contss.length : 0);
		}

		if (!contss || contss.length === 0) {
			console.error("Could not find event display container!");
			return;
		}

		("Using container:", contss);

		// const e = button;
		var params = {
			'event_selection': '',
			'date_format': '',
			'show_feature_image': '',
			'show_recurring_event': '',
			'show_postponed_canceled_event': '',
			'show_virtual_events': '',
			'show_hybrid_event': '',
			'show_title': '',
			'show_more_info': '',
			'show_more_info_btn_text': '',
			'button_make_fullwidth': 'off',
			'button_align': '',
			'button_align_tablet': '',
			'button_align_phone': '',
			'limit_recurring_count': '',
			'show_past': '',
			'cutoff_ongoing_events': 'cut_end_date_reached',
			'event_order': '',
			'event_ofset_number': '',
			'events_count': '',
			'events_count_tablet': '',
			'events_count_phone': '',
			'show_callout_box': '',
			'show_callout_box_date': '',
			'show_callout_box_date_range': '',
			'show_callout_box_month': '',
			'show_callout_month_range': '',
			'callout_month_format': '',
			'callout_day_of_the_week': '',
			'show_callout_day_of_week_range': '',
			'callout_week_format': '',
			'show_callout_box_year': '',
			'callout_year_format': '',
			'show_callout_year_range': '',
			'callout_time_format': '',
			'show_callout_time_range': '',
			'show_date_details': '',
			'show_end_date_details': '',
			'date_detail_label': '',
			'date_details_format': '',
			'shorten_multidate': 'on',
			'start_date_format': '',
			'show_time_details': '',
			'details_time_label': '',
			'details_time_format': '',
			'show_end_time_details': '',
			'show_venue_details': '',
			'show_organizer_details': '',
			'venue_detail_label': '',
			'organizer_detail_label': '',
			'Show_purchase_now': '',
			'show_place_left': '',
			'show_rsvp': '',
			'rsvp_label': '',
			'show_respond_now': '',
			'show_cat': '',
			'cat_label': '',
			'hide_coma_cat': '',
			'show_tags': '',
			'tags_label': '',
			'hide_coma_tag': '',
			'show_website': '',
			'website_label': '',
			'show_preposition_dividr': '',
			'show_callout_box_class': '',
			'stack_event_d': '',
			'show_label_icon': '',
			'stack_label_icon': '',
			'show_price_ticket': '',
			'show_price': '',
			'price_detail_label': '',
			'show_location': '',
			'location_detail_label': '',
			'location_street_address': '',
			'location_locality': '',
			'show_location_state': '',
			'location_postal_code': '',
			'location_country': '',
			'location_street_comma': '',
			'location_locality_comma': '',
			'show_location_state_comma': '',
			'location_postal_code_comma': '',
			'location_country_comma': '',
			'show_postal_code_before_locality': '',
			// Button icon data from D5 button groups
			'more_info_button_icon_desktop': '',
			'more_info_button_icon_tablet': '',
			'more_info_button_icon_phone': '',
			'load_more_button_icon_desktop': '',
			'load_more_button_icon_tablet': '',
			'load_more_button_icon_phone': '',
			'more_info_button_icon_classes': '',
			'load_more_button_icon_classes': '',
			// 'Show_purchase_now': '',
			'columns': '',
			'list_columns': '',
			'list_columns_desktop': '',
			'list_columns_tablet': '',
			'list_columns_phone': '',
			'list_callout_column_width': '',
			'list_image_column_width': '',
			'list_details_column_width': '',
			'list_button_column_width': '',
			'pagination_type': '',
			'prv_link_btn': 'Previous',
			'next_link_btn': 'Next',
			'load_more_text': 'Load More',
			'excerpt_length': '27',
			'show_excerpt': 'off',
			'excerpt_content': 'show_excerpt',
			'show_pagination': 'off',
			'page': '',
			'per_page': '3',
			'layout': 'grid',
			'layout_desktop': '',
			'layout_tablet': '',
			'layout_phone': '',
			'layout_type': '',
			'layout_type_desktop': '',
			'layout_type_tablet': '',
			'layout_type_phone': '',
			'show_callout_box_starttime': '',
			'show_colon_label': '',
			'show_timezone': 'off',
			'month_with_heading': '',
			'month_separator_heading_format': '',
			'dec-eventfeed-category': '',
			'dec-eventfeed-tag': '',
			'dec-eventfeed-venue': '',
			'dec-eventfeed-year': '',
			'dec-eventfeed-month': '',
			'dec-eventfeed-day': '',
			'dec-eventfeed-time': '',
			'EventstartDate': '',
			'EventendDate': '',
			'dec-eventfeed-city': '',        // Filter by city (e.g. "Lahore,Islamabad")
			'dec-eventfeed-state': '',       // Filter by state (e.g. "Punjab,Sindh")
			'dec-eventfeed-country': '',       // Filter by state (e.g. "Punjab,Sindh")
			'dec-eventfeed-address': '',     // Filter by address type ("physical,virtual,hybrid")
			'EventcostMin': '',              // Minimum event cost (integer)
			'EventcostMax': '',              // Maximum event cost (integer)
			'dec-eventfeed-future-past': '',
			'dec-eventfeed-organizer': '',
			'dec-eventfeed-order': '',
			'dec-eventfeed-status': '',
			'dec-filter-search': '',
			'search_search_criteria': 'search_content_title',
			'search_description_logic': 'or',
			'dec-eventfeed-recurring': '',
			'org_link_target': '',
			'enable_org_link': '',
			'enable_venue_link': '',
			'venue_link_target': '',
			'enable_cat_link': '',
			'category_link_target': '',
			'enable_tag_link': '',
			'tag_link_target': '',
			'single_event_link': '',
			'custome_single_event_link': '',
			'entire_event_clickable': '',
			'website_link': '',
			'website_link_target': '',
			'custom_web_link': '',
			'event_selection_cat': '',
			'event_selection_tag': '',
			'event_selection_org': '',
			'event_selection_series': '',
			'disable_title_link': '',
			'disable_button_link': '',
			'disable_image_link': '',
			'custom_event_link': '',
			// Add these when constructing params (in decm_get_event)
			'feature_image_overlay': $(contss).find('input.hidden-data-field[name="feature_image_overlay"]').val() || '',
			'feature_image_overlay_icon': $(contss).find('input.hidden-data-field[name="feature_image_overlay_icon"]').val() || '',
			'feature_image_overlay_icon_color': $(contss).find('input.hidden-data-field[name="feature_image_overlay_icon_color"]').val() || '#fff',
			'feature_image_overlay_background': $(contss).find('input.hidden-data-field[name="feature_image_overlay_background"]').val() || 'rgba(0,0,0,0.4)',
			'cover_feature_image_overlay_on': $(contss).find('input.hidden-data-field[name="cover_feature_image_overlay_on"]').val() || '',
		};

		// Loop through each key and get the value from the hidden input field
		("Container found:", contss);
		("Hidden fields in container:", $(contss).find('input.hidden-data-field').length);

		jQuery.each(params, function (key) {
			// Try to get value from container's hidden fields first
			var value = $(contss).find('input.hidden-data-field[name="' + key + '"]').val();
			
			// For organizer_detail_label, try multiple fallback locations (important for pagination)
			if (key === 'organizer_detail_label' && (value === undefined || value === null || value === '')) {
				// Try mainClass container
				if (mainClass && mainClass !== '') {
					value = $(mainClass).find('input.hidden-data-field[name="organizer_detail_label"]').first().val();
				}
				// Try document-wide search
				if ((value === undefined || value === null || value === '')) {
					value = $('input.hidden-data-field[name="organizer_detail_label"]').first().val();
				}
				// Try parent containers
				if ((value === undefined || value === null || value === '')) {
					value = $(contss).closest('.decm_event_display, .event-display').find('input.hidden-data-field[name="organizer_detail_label"]').first().val();
				}
			}
			
			// Ensure undefined/null values are converted to empty string for consistency
			params[key] = (value === undefined || value === null) ? '' : value;
		});

		// Also try to get filter values from the current page
		var filterParams = {
			'dec-eventfeed-category': $('#dec-eventfeed-category').val() || '',
			'dec-eventfeed-tag': $('#dec-eventfeed-tag').val() || '',
			'dec-eventfeed-venue': $('#dec-eventfeed-venue').val() || '',
			'dec-eventfeed-organizer': $('#dec-eventfeed-organizer').val() || '',
			'dec-eventfeed-order': $('#dec-eventfeed-order').val() || '',
			'dec-eventfeed-city': $('#dec-eventfeed-city').val() || '',
			'dec-eventfeed-state': $('#dec-eventfeed-state').val() || '',
			'dec-eventfeed-country': $('#dec-eventfeed-country').val() || '',
			'dec-eventfeed-time': $('#dec-eventfeed-time').val() || '',
			'dec-eventfeed-day': $('#dec-eventfeed-day').val() || '',
			'dec-eventfeed-month': $('#dec-eventfeed-month').val() || '',
			'dec-eventfeed-year': $('#dec-eventfeed-year').val() || '',
			'dec-eventfeed-recurring': $('#dec-eventfeed-recurring').val() || '',
			'dec-eventfeed-status': $('#dec-eventfeed-status').val() || '',
			'dec-filter-search': $('#dec-filter-search').val() || '',
			'search_search_criteria': $('input[name="search_search_criteria"]').val() || 'search_content_title',
			'search_description_logic': $('input[name="search_description_logic"]').val() || 'or',
			'filter_combination_logic': $('input[name="filter_combination_logic"]').val() || 'and',
			'EventstartDate': $('#EventstartDate').val() || '',
			'EventendDate': $('#EventendDate').val() || '',
			'EventcostMin': $('#EventcostMin').val() || '',
			'EventcostMax': $('#EventcostMax').val() || '',
			// 'Show_purchase_now': $('#Show_purchase_now').val() || '',
		};

		// Also try to get filter values from hidden fields as fallback
		var hiddenFilterParams = {
			'dec-eventfeed-category': $(contss).find('input.hidden-data-field[name="dec-eventfeed-category"]').val() || '',
			'dec-eventfeed-tag': $(contss).find('input.hidden-data-field[name="dec-eventfeed-tag"]').val() || '',
			'dec-eventfeed-venue': $(contss).find('input.hidden-data-field[name="dec-eventfeed-venue"]').val() || '',
			'dec-eventfeed-organizer': $(contss).find('input.hidden-data-field[name="dec-eventfeed-organizer"]').val() || '',
			'dec-eventfeed-order': $(contss).find('input.hidden-data-field[name="dec-eventfeed-order"]').val() || '',
			'dec-eventfeed-city': $(contss).find('input.hidden-data-field[name="dec-eventfeed-city"]').val() || '',
			'dec-eventfeed-state': $(contss).find('input.hidden-data-field[name="dec-eventfeed-state"]').val() || '',
			'dec-eventfeed-country': $(contss).find('input.hidden-data-field[name="dec-eventfeed-country"]').val() || '',
			'dec-eventfeed-time': $(contss).find('input.hidden-data-field[name="dec-eventfeed-time"]').val() || '',
			'dec-eventfeed-day': $(contss).find('input.hidden-data-field[name="dec-eventfeed-day"]').val() || '',
			'dec-eventfeed-month': $(contss).find('input.hidden-data-field[name="dec-eventfeed-month"]').val() || '',
			'dec-eventfeed-year': $(contss).find('input.hidden-data-field[name="dec-eventfeed-year"]').val() || '',
			'dec-eventfeed-recurring': $(contss).find('input.hidden-data-field[name="dec-eventfeed-recurring"]').val() || '',
			'dec-eventfeed-status': $(contss).find('input.hidden-data-field[name="dec-eventfeed-status"]').val() || '',
			'dec-filter-search': $(contss).find('input.hidden-data-field[name="dec-filter-search"]').val() || '',
			'search_search_criteria': $('input[name="search_search_criteria"]').val() || 'search_content_title',
			'search_description_logic': $('input[name="search_description_logic"]').val() || 'or',
			'filter_combination_logic': $('input[name="filter_combination_logic"]').val() || 'and',
			'EventstartDate': $(contss).find('input.hidden-data-field[name="EventstartDate"]').val() || '',
			'EventendDate': $(contss).find('input.hidden-data-field[name="EventendDate"]').val() || '',
			'EventcostMin': $(contss).find('input.hidden-data-field[name="EventcostMin"]').val() || '',
			'EventcostMax': $(contss).find('input.hidden-data-field[name="EventcostMax"]').val() || '',
			'Show_purchase_now': $(contss).find('input.hidden-data-field[name="Show_purchase_now"]').val() || '',
		};

		// Merge filter params: globals first, then hidden fields on this event display so the
		// correct module wins when duplicate ids exist (e.g. #dec-eventfeed-month).
		$.extend(params, filterParams);
		$.extend(params, hiddenFilterParams);

		// Filter-bar fields must stay empty until the visitor applies a filter control.
		// Module included categories/tags/etc. are sent via event_selection_* only.
		(function decmClearMirroredFilterBarParams(filterParams) {
			function normalizeIdList(val) {
				if (!val || typeof val !== 'string') {
					return '';
				}
				return val.split(',').map(function (s) {
					return s.trim();
				}).filter(Boolean).sort().join(',');
			}
			var mirrors = [
				['dec-eventfeed-category', 'event_selection_cat'],
				['dec-eventfeed-tag', 'event_selection_tag'],
				['dec-eventfeed-organizer', 'event_selection_org'],
				['dec-eventfeed-venue', 'event_selection_venue'],
				['dec-eventfeed-instructor', 'event_selection_instructor'],
			];
			mirrors.forEach(function (pair) {
				var filterKey = pair[0];
				var moduleKey = pair[1];
				if (
					filterParams[filterKey] &&
					filterParams[moduleKey] &&
					normalizeIdList(filterParams[filterKey]) === normalizeIdList(filterParams[moduleKey])
				) {
					filterParams[filterKey] = '';
				}
			});
		})(params);

		// Filter bar "Order By" overrides the Events Feed module default.
		if (params['dec-eventfeed-order']) {
			params.event_order = params['dec-eventfeed-order'];
		}

		// If user switches back to "All Events" (or any non-custom selection),
		// clear custom selection filters so stale values don't keep filtering results.
		if (params.event_selection !== 'custom_event') {
			params.event_selection_cat = '';
			params.event_selection_tag = '';
			params.event_selection_org = '';
			params.event_selection_venue = '';
			params.event_selection_series = '';
		}

		// Filter parameters are now properly collected from both form elements and hidden fields
		// var connectionId = jQuery('.event-display').find('[data-connection-id]').data('connection-id');
		var thiscontainer = $(contss).find('.events-main__container');
		const originalHiddenDiv = $(contss).find('.hidden_feild').clone(true);

		params['action'] = 'decm_get_events_action';
		params['security'] = (typeof ajax_object !== 'undefined' && ajax_object.ajax_nonce) ? ajax_object.ajax_nonce : '';
		// Reset pagination to page 1 when filters change
		params['page'] = '1';
		// Use responsive events_count for per_page
		params['per_page'] = getResponsiveEventsCount(params);
		if (window.decmEventDisplayResponsiveLayout) {
			window.decmEventDisplayResponsiveLayout.applyResponsiveLayoutParams(params);
		} else if (params.layout == 'grid' || params.layout == 'cover') {
			params.layout_type = '';
		}
		var data = params;

		function getEventTitleLink(event, params) {
			let url = event.event_url || '#';
			let target = '';
			let showLink = true;

			// Match PHP: only conditionally disable when single_event_link is disable_link.
			// Link is disabled when disable_title_link is set AND not exactly 'off'.
			if (params.single_event_link === 'disable_link') {
				showLink = !(params.disable_title_link && params.disable_title_link !== 'off');
				return { url, target, showLink };
			}

			// If single_event_link has other settings and link is not force-disabled:
			if (params.single_event_link === 'custom_link_replace') {
				url = params.custom_event_link || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			} else if (params.single_event_link === 'redirect_website_link') {
				url = event.event_website || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			}

			// Default case: show link
			return { url, target, showLink };
		}
		function getEventImageLink(event, params) {
			let url = event.event_url || '#';
			let target = '';
			let showLink = true;

			// Match PHP: only conditionally disable when single_event_link is disable_link.
			// Link is disabled when disable_image_link is set AND not exactly 'off'.
			if (params.single_event_link === 'disable_link') {
				showLink = !(params.disable_image_link && params.disable_image_link !== 'off');
				return { url, target, showLink };
			}

			if (params.single_event_link === 'custom_link_replace') {
				url = params.custom_event_link || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			} else if (params.single_event_link === 'redirect_website_link') {
				url = event.event_website || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			}

			return { url, target, showLink };
		}
		function getEventButtonLink(event, params) {
			let url = event.event_url || '#';
			let target = '';
			let showLink = true;

			// Match PHP: only conditionally disable when single_event_link is disable_link.
			// Link is disabled when disable_button_link is set AND not exactly 'off'.
			if (params.single_event_link === 'disable_link') {
				showLink = !(params.disable_button_link && params.disable_button_link !== 'off');
			} else if (params.single_event_link === 'custom_link_replace') {
				url = params.custom_event_link || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			} else if (params.single_event_link === 'redirect_website_link') {
				url = event.event_website || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			}
			return { url, target, showLink };
		}

		function getWebsiteLinkTarget(params) {
			return params.website_link_target === 'new_tab' ? ' target="_blank" rel="noopener noreferrer"' : '';
		}

		function getWebsiteLinkText(event, params) {
			if (params.website_link === 'show_url') {
				return event.event_website;
			}
			if (params.website_link === 'custom_text' && params.custom_web_link) {
				return params.custom_web_link;
			}
			return __t('View Events Website');
		}

		// Function to get responsive button_align value
		// Use document.documentElement.clientWidth instead of window.innerWidth to avoid console width issues
		function getResponsiveButtonAlign(params) {
			// Use clientWidth which is more stable and doesn't change with console
			var screenWidth = document.documentElement.clientWidth || window.innerWidth || screen.width;
			// Breakpoints aligned with CSS grid: phone <= 767px, tablet 768-1024px, desktop > 1024px
			if (screenWidth <= 767) {
				// Phone
				return params.button_align_phone !== '' ? params.button_align_phone : params.button_align;
			} else if (screenWidth >= 768 && screenWidth <= 1024) {
				// Tablet
				return params.button_align_tablet !== '' ? params.button_align_tablet : params.button_align;
			} else {
				// Desktop
				return params.button_align;
			}
		}

		// Function to get responsive events_count value
		// Use document.documentElement.clientWidth instead of window.innerWidth to avoid console width issues
		function getResponsiveEventsCount(params) {
			// Use clientWidth which is more stable and doesn't change with console
			var screenWidth = document.documentElement.clientWidth || window.innerWidth || screen.width;
			// Breakpoints aligned with CSS grid: phone <= 767px, tablet 768-1024px, desktop > 1024px
			
			// Get values and convert to numbers, handling empty strings
			var eventsCountDesktop = parseInt(params.events_count || params.per_page || '6', 10) || 6;
			var eventsCountTablet = params.events_count_tablet !== '' && params.events_count_tablet !== undefined && params.events_count_tablet !== null 
				? parseInt(params.events_count_tablet, 10) : null;
			var eventsCountPhone = params.events_count_phone !== '' && params.events_count_phone !== undefined && params.events_count_phone !== null 
				? parseInt(params.events_count_phone, 10) : null;
			
			var deviceType = 'desktop';
			var finalCount = eventsCountDesktop;
			
			if (screenWidth <= 767) {
				// Phone: use phone value, fallback to tablet, then desktop
				deviceType = 'phone';
				finalCount = eventsCountPhone !== null ? eventsCountPhone : 
				       (eventsCountTablet !== null ? eventsCountTablet : eventsCountDesktop);
			} else if (screenWidth >= 768 && screenWidth <= 1024) {
				// Tablet: use tablet value, fallback to desktop
				deviceType = 'tablet';
				finalCount = eventsCountTablet !== null ? eventsCountTablet : eventsCountDesktop;
			} else {
				// Desktop: use desktop value
				deviceType = 'desktop';
				finalCount = eventsCountDesktop;
			}
			
			return finalCount;
		}

		// Function to calculate and set equal heights for event containers when button_align is enabled
		// This now works per row: each row of events gets its own max height
		function calculateEqualHeights(containerSelector) {
			var container = $(containerSelector);
			if (!container.length) return;

			// Only calculate if button-align-enabled class is present
			if (!container.hasClass('button-align-enabled')) return;

			// Only calculate for grid and cover layouts
			if (!container.hasClass('grid-container') && !container.hasClass('cover-container')) return;

			// Reset heights first to get natural heights
			var eventContainers = container.find('.event-container.button-align-enabled');
			if (eventContainers.length === 0) return;

			eventContainers.css('height', 'auto');

			// Force a reflow to ensure heights are calculated
			container[0].offsetHeight;

			// Group containers by their row (top position)
			var rows = {};
			var rowKeys = [];
			eventContainers.each(function () {
				var $el = $(this);
				var top = Math.round($el.position().top); // position relative to container
				if (rows[top] === undefined) {
					rows[top] = [];
					rowKeys.push(top);
				}
				rows[top].push($el);
			});

			// For each row, find max height and apply it only to that row
			rowKeys.forEach(function (top) {
				var group = rows[top];
				var maxHeight = 0;
				group.forEach(function ($el) {
					var height = $el.outerHeight(true); // include margins
					if (height > maxHeight) {
						maxHeight = height;
					}
				});
				if (maxHeight > 0) {
					group.forEach(function ($el) {
						$el.css('height', maxHeight + 'px');
					});
				}
			});
		}

		function getEventLinkSettings(event, params) {
			let url = event.event_url || '#';
			let target = '';
			let showLink = true;

			if (params.single_event_link === 'disable_link') {
				showLink = (params.disable_entire_event_link !== 'on'); // You can add a disable_entire_event_link option if needed
			} else if (params.single_event_link === 'custom_link_replace') {
				url = params.custom_event_link || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			} else if (params.single_event_link === 'redirect_website_link') {
				url = event.event_website || url;
				if (params.custome_single_event_link === 'new_tab') {
					target = ' target="_blank" rel="noopener noreferrer"';
				}
			}
			return { url, target, showLink };
		}


		// console.log('=== AJAX REQUEST STARTING ===');
		// console.log('AJAX URL:', (typeof ajax_object !== 'undefined' && ajax_object.ajax_url) ? ajax_object.ajax_url : window.location.origin + '/wp-admin/admin-ajax.php');
		// console.log('params.organizer_detail_label BEFORE AJAX:', params.organizer_detail_label);
		
		$.ajax({
			type: "POST",
			url: (typeof ajax_object !== 'undefined' && ajax_object.ajax_url) ? ajax_object.ajax_url : window.location.origin + '/wp-admin/admin-ajax.php',
			data: data,
			success: function (response) {
				// console.log('=== AJAX SUCCESS - Response received ===');
				var events = response.data.events;
				var container = thiscontainer;

				if (window.decmEventDisplayResponsiveLayout) {
					window.decmEventDisplayResponsiveLayout.applyResponsiveLayoutParams(params);
					window.decmEventDisplayResponsiveLayout.updateContainerLayoutClasses(container, params.layout, params);
				}

				// Re-retrieve organizer_detail_label from hidden fields before rendering (CRITICAL for pagination)
				// This ensures the label value is always available even if params weren't set correctly
				// console.log('=== Organizer Label Debug - Start of Success Callback ===');
				// console.log('Initial params.organizer_detail_label:', params.organizer_detail_label);
				// console.log('contss exists:', contss && contss.length > 0);
				// console.log('mainClass:', mainClass);
				
				var retrievedOrganizerLabel = '';
				
				// Try container first
				if (contss && contss.length > 0) {
					retrievedOrganizerLabel = $(contss).find('input.hidden-data-field[name="organizer_detail_label"]').val() || '';
					// console.log('Retrieved from contss:', retrievedOrganizerLabel);
				}
				
				// Try mainClass if still empty
				if ((!retrievedOrganizerLabel || retrievedOrganizerLabel === '' || retrievedOrganizerLabel === 'undefined') && mainClass && mainClass !== '') {
					retrievedOrganizerLabel = $(mainClass).find('input.hidden-data-field[name="organizer_detail_label"]').first().val() || '';
					// console.log('Retrieved from mainClass:', retrievedOrganizerLabel);
				}
				
				// Try document-wide search
				if (!retrievedOrganizerLabel || retrievedOrganizerLabel === '' || retrievedOrganizerLabel === 'undefined') {
					retrievedOrganizerLabel = $('input.hidden-data-field[name="organizer_detail_label"]').first().val() || '';
					// console.log('Retrieved from document-wide:', retrievedOrganizerLabel);
				}
				
				// Try parent containers
				if ((!retrievedOrganizerLabel || retrievedOrganizerLabel === '' || retrievedOrganizerLabel === 'undefined') && contss && contss.length > 0) {
					retrievedOrganizerLabel = $(contss).closest('.decm_event_display, .event-display').find('input.hidden-data-field[name="organizer_detail_label"]').first().val() || '';
					// console.log('Retrieved from parent containers:', retrievedOrganizerLabel);
				}
				
				// ALWAYS set params.organizer_detail_label - use retrieved value or default to 'Organizer'
				if (retrievedOrganizerLabel && retrievedOrganizerLabel !== '' && retrievedOrganizerLabel !== 'undefined' && String(retrievedOrganizerLabel).trim() !== '') {
					params.organizer_detail_label = retrievedOrganizerLabel;
					// console.log('Final params.organizer_detail_label (from retrieved):', params.organizer_detail_label);
				} else {
					// Always default to 'Organizer' if nothing found - this ensures label always shows
					params.organizer_detail_label = 'Organizer';
					// console.log('Final params.organizer_detail_label (defaulted to Organizer):', params.organizer_detail_label);
				}
				// console.log('=== End Organizer Label Debug ===');

				if (response.data.pagination.pagination_type === 'load_more') {
				} else {
					container.empty();
				}
				var alevent = '';
				jQuery.each(events, function (i, event) {
					if (event.month_separator) {
						if (params.layout === 'list') {
							var existingMonths = container.find('.month-heading').map(function () {
								return $(this).text();
							}).get();

							if (!existingMonths.includes(event.month_heading_format)) {
								var $monthDiv = $('<h2>', {
									'class': 'ecs-events-list-separator-month'
								}).append(
									$('<span>', {
										'class': 'month-heading ecs-events-calendar-list__month-separator-text',
										'text': event.month_heading_format
									}),
									$('<span>', {
										'class': 'ecs-events-list-separator-month__line',
										'aria-hidden': 'true'
									})
								);
								container.append($monthDiv);
							}
						}
						return true;
					}

					// -------------------------------
					// Format Dates & Times using Moment.js (ISO-aware)
					// -------------------------------
					setMomentLocaleSafe();

					// helpers
					const toMoment = iso => (iso ? moment.parseZone(iso) : null); // preserve timezone offset
					const fmt = (m, f) => {
						if (!m || !m.isValid()) return '';
						const r = m.format(f);
						return (r && r.indexOf('undefined') === -1) ? r : '';
					};

					// Prefer ISO coming from backend (callout_* are ISO 8601 in your PHP)
					const parsedDate = toMoment(event.callout_start_date || event.start_time);
					const parsedEndDate = toMoment(event.callout_end_date || event.end_time);

					// -------------------------------
					// Call out date format (PHP 'd')
					var momentFormat = phpToMomentFormat(params.date_format || 'd');
					var formattedDate_startDate = fmt(parsedDate, momentFormat) || (event.callout_start_date || '');
					var formattedDate_endDate = fmt(parsedEndDate, momentFormat) || (event.callout_end_date || '');

					// -------------------------------
					// Call out Month format (PHP 'F')
					var momentFormat_month = phpToMomentFormat(params.callout_month_format || 'F');
					var parsedDate_month = parsedDate;
					var parsedEndMonth = parsedEndDate;
					var formattedDate_startMonth =
						fmt(parsedDate_month, momentFormat_month) ||
						(event.start_month ? fmt(toMoment(event.start_month), momentFormat_month) : '') ||
						(event.month || '');
					var formattedDate_endMonth =
						fmt(parsedEndMonth, momentFormat_month) ||
						(event.end_month ? fmt(toMoment(event.end_month), momentFormat_month) : '') ||
						(event.month || '');

					// -------------------------------
					// Call out Year format (PHP 'Y')
					var momentFormat_year = phpToMomentFormat(params.callout_year_format || 'Y');
					var parsedDate_year = parsedDate;
					var parsedEndYear = parsedEndDate;
					var formattedDate_startYear = fmt(parsedDate_year, momentFormat_year) || (event.year || '');
					var formattedDate_endYear = fmt(parsedEndYear, momentFormat_year) || (event.year || '');

					// -------------------------------
					// Call out Time format (PHP 'g:i a')
					var momentFormat_time = phpToMomentFormat(params.callout_time_format || 'g:i a');
					var formattedDate_startTime = fmt(parsedDate_month, momentFormat_time) || (event.callout_start_time || '');
					var formattedDate_endTime = fmt(parsedEndMonth, momentFormat_time) || (event.callout_end_time || '');

					// -------------------------------
					// Call out Day/Week format (PHP 'D' -> moment 'ddd' via converter)
					var DayFormat = phpToMomentFormat(params.callout_week_format || 'D');
					var formattedDate_startDay = fmt(parsedDate, DayFormat);
					var formattedDate_endDay = fmt(parsedEndDate, DayFormat);

					// -------------------------------
					// Call out Date Details (PHP 'F d, Y')
					var momentFormatDetails = phpToMomentFormat(params.date_details_format || 'F d, Y');
					var shortenOn = params.shorten_multidate === 'on' || params.shorten_multidate === 'true';
					var isMultidayDetails = parsedDate && parsedEndDate && parsedDate.isValid() && parsedEndDate.isValid() && !parsedDate.isSame(parsedEndDate, 'day');
					var formattedDate_startDate_Details = fmt(parsedDate, momentFormatDetails) || (event.date || event.callout_start_date || '');
					var formattedDate_endDate_Details = fmt(parsedEndDate, momentFormatDetails) || (event.callout_end_date || '');
					if (shortenOn && isMultidayDetails) {
						if (params.start_date_format) {
							formattedDate_startDate_Details = fmt(parsedDate, phpToMomentFormat(params.start_date_format));
						} else if (parsedDate.year() === parsedEndDate.year()) {
							formattedDate_startDate_Details = fmt(parsedDate, deriveShortenedStartMomentFormat(params.date_details_format || 'F d, Y', false));
						} else {
							formattedDate_startDate_Details = fmt(parsedDate, deriveShortenedStartMomentFormat(params.date_details_format || 'F d, Y', true));
						}
						if (parsedDate.format('MMM YYYY') === parsedEndDate.format('MMM YYYY')) {
							formattedDate_endDate_Details = fmt(parsedEndDate, params.date_details_format ? phpToMomentFormat(params.date_details_format) : 'D, YYYY');
						} else {
							formattedDate_endDate_Details = fmt(parsedEndDate, params.date_details_format ? phpToMomentFormat(params.date_details_format) : 'MMM D, YYYY');
						}
					}

					// -------------------------------
					// Call out Time Details (PHP 'g:i a')
					var momentFormat_timeDetails = phpToMomentFormat(params.details_time_format || 'g:i a');
					var formattedDate_startTimeDetails = fmt(parsedDate_month, momentFormat_timeDetails) || (event.callout_start_time || '');
					var formattedDate_endTimeDetails = fmt(parsedEndMonth, momentFormat_timeDetails) || (event.callout_end_time || '');


					var classClout = getCalloutBoxClass(params.layout, event, params.show_feature_image, params.layout_type);
					var isAllDay = event.is_all_day || false;
					var allDayText = event.all_day_text || __t('All Day Event');
					
					// Check if dates and times are the same
					var isSameDate = false;
					var isSameTime = false;
					if (parsedDate && parsedEndDate && parsedDate.isValid() && parsedEndDate.isValid()) {
						isSameDate = parsedDate.format('YYYY-MM-DD') === parsedEndDate.format('YYYY-MM-DD');
						if (isSameDate && formattedDate_startTimeDetails && formattedDate_endTimeDetails) {
							isSameTime = formattedDate_startTimeDetails === formattedDate_endTimeDetails && formattedDate_startTimeDetails !== '';
						}
					}

					// -------------------------------
					// Build HTML String with Layout Handling
					// -------------------------------
					var layoutType = params.layout_type || 'default';
					var eventHtml = '';

					// Get responsive columns based on current screen width
					var screenWidth = document.documentElement.clientWidth || window.innerWidth || screen.width;
					var isListLayout = (params.layout || '').toString().toLowerCase() === 'list';
					var columnsDesktop;
					var columnsTablet;
					var columnsPhone;
					if (isListLayout) {
						columnsDesktop = params.list_columns_desktop || params.list_columns || '1';
						columnsTablet = params.list_columns_tablet || columnsDesktop;
						columnsPhone = params.list_columns_phone || columnsTablet;
					} else {
						columnsDesktop = params.columns_desktop || params.columns || '3';
						columnsTablet = params.columns_tablet || columnsDesktop;
						columnsPhone = params.columns_phone || columnsTablet;
					}

					// Determine current column value based on screen width
					var currentColumns;
					if (screenWidth <= 767) {
						currentColumns = columnsPhone;
					} else if (screenWidth >= 768 && screenWidth <= 1024) {
						currentColumns = columnsTablet;
					} else {
						currentColumns = columnsDesktop;
					}

					// Use current responsive column value for cs-col- class
					var columns = currentColumns;

					const buttonAlign = getResponsiveButtonAlign(params);
					const buttonAlignEnabledClass = (buttonAlign === 'on') ? 'button-align-enabled' : '';
					var coverOverlayOn = false;
					var coverHasImageSrc = false;
					if (params.layout === 'cover') {
						coverOverlayOn = isCoverOverlayOn(params.cover_feature_image_overlay_on);
						coverHasImageSrc = isFeatureImageOn(params.show_feature_image) && event.image &&
							(event.image.match(/src=["']([^"']+)["']/) || event.image.match(/src=([^\s>]+)/));
					}
					eventHtml += '<div class="event-container ' + layoutType + ' cs-col-' + columns + ' ' + buttonAlignEnabledClass + '" ' +
						'data-columns-desktop="' + columnsDesktop + '" ' +
						'data-columns-tablet="' + columnsTablet + '" ' +
						'data-columns-phone="' + columnsPhone + '">';
					if (params.layout === 'cover') {
						if (coverOverlayOn) {
							eventHtml += '<div class="cover_overlayop"></div>';
						}
						if (coverHasImageSrc) {
							if ((event.image || '').indexOf('tribe-events-event-image') !== -1) {
								eventHtml += (event.image || '').replace(/<img([^>]*)>/, '<img$1 style="position: relative; z-index: 1;">');
							} else {
								eventHtml += '<div class="tribe-events-event-image">' +
									(event.image || '').replace(/<img/, '<img style="position: relative; z-index: 1;"') +
									'</div>';
							}
						}
					}
					
					var mainLayoutStyle = '';
					if (params.layout === 'cover') {
						mainLayoutStyle = ' style="position: relative; z-index: 3;"';
					} else if (params.layout === 'list') {
						mainLayoutStyle = ' style="grid-template-columns: ' + buildListLayoutGridColumns(layoutType, params) + ';"';
					}
					eventHtml += '<div class="main-layout-container"' + mainLayoutStyle + '>';
					var linkSettings = getEventLinkSettings(event, params);

					if (params.entire_event_clickable === 'on' && linkSettings.showLink) {
						eventHtml += '<a class="ecs_event_clickable" href="' + linkSettings.url + '" rel="bookmark"' + linkSettings.target + ' style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;"></a>';
					}


					// Callout Column (when separate)
					if (['callout_image_detail', 'callout_image_detail_button', 'callout_detail_image', 'callout_detail_image_button'].includes(layoutType)) {
						if (params.show_callout_box === 'on') {
							eventHtml += '<div class="callout-column seprate_col">';
							eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';

							// Date
							if (params.show_callout_box_date === 'on') {
							eventHtml += '<div class="event-day ' + params.show_callout_box_date_class + '">';
							if (params.show_callout_box_date_range === 'off') {
								eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
							} else {
								if (isAllDay) {
									eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
								} else {
									if (!isSameDate) {
										eventHtml += params.date_format ?
											formattedDate_startDate + ' - ' + formattedDate_endDate :
											new Date(event.callout_start_date).getDate() + ' - ' + new Date(event.callout_end_date).getDate();
									} else {
										eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
									}
								}
							}
							eventHtml += '</div>';
						}

						// Month
						if (params.show_callout_box_month === 'on') {
							eventHtml += '<div class="event-month">';
							if (params.show_callout_month_range === 'off') {
								eventHtml += params.callout_month_format ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth();
							} else {
								if (isAllDay) {
									eventHtml += params.callout_month_format ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth();
								} else {
									eventHtml += params.callout_month_format ?
										formattedDate_startMonth + ' - ' + formattedDate_endMonth :
										new Date(event.callout_start_date).getMonth() + ' - ' + new Date(event.callout_end_date).getMonth();
								}
							}
							eventHtml += '</div>';
						}

						// Day of Week
						if (params.callout_day_of_the_week === 'on') {
							eventHtml += '<div class="event-day-of-week">';
							if (params.show_callout_day_of_week_range === 'off') {
								eventHtml += params.callout_week_format ? formattedDate_startDay : new Date(event.callout_start_date).getDay();
							} else {
								if (isAllDay) {
									eventHtml += params.callout_week_format ? formattedDate_startDay : new Date(event.callout_start_date).getDay();
								} else {
									eventHtml += params.callout_week_format ?
										formattedDate_startDay + ' - ' + formattedDate_endDay :
										new Date(event.callout_start_date).getDay() + ' - ' + new Date(event.callout_end_date).getDay();
								}
							}
							eventHtml += '</div>';
						}

						// Year
						if (params.show_callout_box_year === 'on') {
							eventHtml += '<div class="event-year">';
							if (params.show_callout_year_range === 'off') {
								eventHtml += params.callout_year_format ? formattedDate_startYear : event.year;
							} else {
								if (isAllDay) {
									eventHtml += params.callout_year_format ? formattedDate_startYear : event.year;
								} else {
									eventHtml += params.callout_year_format ?
										formattedDate_startYear + ' - ' + formattedDate_endYear :
										event.year + ' - ' + event.year;
								}
							}
							eventHtml += '</div>';
						}

						// Time - only show if not all-day event
						if (params.show_callout_box_starttime === 'on' && !isAllDay) {
							eventHtml += '<div class="event-time">';
							if (params.show_callout_time_range === 'off') {
								eventHtml += params.callout_time_format ? formattedDate_startTime : event.callout_start_time;
							} else {
								if (!(isSameDate && isSameTime)) {
									eventHtml += params.callout_time_format ?
										formattedDate_startTime + ' - ' + formattedDate_endTime :
										event.callout_start_time + ' - ' + event.callout_end_time;
								} else {
									eventHtml += params.callout_time_format ? formattedDate_startTime : event.callout_start_time;
								}
							}
							eventHtml += '</div>';
						}

							eventHtml += '</div></div>';
						}
					}

					// Image Column
					(event.event_url)
					const imageColumnClass = layoutType.includes('calloutOnImage') ? 'with-callout-overlay' : 'image-only';
					eventHtml += '<div class="image-column ' + imageColumnClass + '">';
					// Check if image has src attribute for grid and list layouts only
					const hasImageSrc = event.image && (event.image.match(/src=["']([^"']+)["']/) || event.image.match(/src=([^\s>]+)/));
					const isGridOrList = params.layout === 'grid' || params.layout === 'list';
					const hasImage = event.image && isFeatureImageOn(params.show_feature_image) && (isGridOrList ? hasImageSrc : true);
					const imageAlignClass = (hasImage && params.layout !== 'cover') ? 'image-align ' : '';
					eventHtml += '<div class="' + imageAlignClass + 'img-width decm-show-image-left imge_callout">';
					const imageLink = getEventImageLink(event, params);
					if (imageLink.showLink && hasImage) {
						eventHtml += '<a class="dec-image-overlay-url" href="' + imageLink.url + '"' + imageLink.target + '>';
					}
					if (!isFeatureImageOn(params.show_feature_image) || params.layout == 'cover' || !hasImage) {
						// Skip feature-image when no image - avoids empty tribe-events-event-image div
					} else {
						eventHtml += '<div class="feature-image">';

						if ((event.image || '').indexOf('tribe-events-event-image') !== -1) {

							// Parse the icon object safely (supports both object or JSON string)
							let iconObj = {};
							if (typeof params.feature_image_overlay_icon === 'string') {
								try {
									iconObj = JSON.parse(params.feature_image_overlay_icon);
								} catch (e) {
									iconObj = {};
								}
							} else if (typeof params.feature_image_overlay_icon === 'object' && params.feature_image_overlay_icon !== null) {
								iconObj = params.feature_image_overlay_icon;
							}

							const iconUnicode = iconObj.unicode || '';

							eventHtml += (event.image || '').replace(
								'</div>', // before the closing .tribe-events-event-image
								(params.feature_image_overlay === 'on'
									? '<div class="feature-image-overlay overlayop event-overlay-background">'
									+ (iconUnicode ? ('<span class="event-overlay-icon" style="font-family:ETmodules;">' + iconUnicode + '</span>') : '')
									+ '</div>'
									: '') + '</div>'
							);

						} else {

							let iconObj = {};
							if (typeof params.feature_image_overlay_icon === 'string') {
								try {
									iconObj = JSON.parse(params.feature_image_overlay_icon);
								} catch (e) {
									iconObj = {};
								}
							} else if (typeof params.feature_image_overlay_icon === 'object' && params.feature_image_overlay_icon !== null) {
								iconObj = params.feature_image_overlay_icon;
							}

							const iconUnicode = iconObj.unicode || '';

							eventHtml += '<div class="tribe-events-event-image">' +
								(event.image || '') +
									(params.feature_image_overlay === 'on'
									? '<div class="feature-image-overlay overlayop event-overlay-background">'
									+ (iconUnicode ? ('<span class="event-overlay-icon" style="font-family:ETmodules;">' + iconUnicode + '</span>') : '')
									+ '</div>'
									: '') +
								'</div>';
						}

						eventHtml += '</div>';
						// closes .feature-image
					}

					// In-image callout
					if (['calloutOnImage_Datail', 'calloutOnImage_Datail_button'].includes(layoutType)) {
						if (params.show_callout_box === 'on') {
							eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';

							if (params.show_callout_box_date === 'on' && params.show_callout_box_date_range === 'off') {
							eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
							eventHtml += (params.date_format !== '' ? formattedDate_startDate : new Date(event.callout_start_date).getDate());
							eventHtml += '</div>';
						}
						if (params.show_callout_box_date === 'on' && params.show_callout_box_date_range === 'on') {
							eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
							if (isAllDay) {
								eventHtml += (params.date_format !== '' ? formattedDate_startDate : new Date(event.callout_start_date).getDate());
							} else {
								if (!isSameDate) {
									eventHtml += (params.date_format !== '' ? formattedDate_startDate + '-' + formattedDate_endDate : new Date(event.callout_start_date).getDate() + '-' + new Date(event.callout_end_date).getDate());
								} else {
									eventHtml += (params.date_format !== '' ? formattedDate_startDate : new Date(event.callout_start_date).getDate());
								}
							}
							eventHtml += '</div>';
						}

						// Callout Month (single or range)
						if (params.show_callout_box_month === 'on' && params.show_callout_month_range === 'off') {
							eventHtml += '<div class="event-month ' + (params.show_callout_box_month_class || '') + '">';
							eventHtml += (params.callout_month_format !== '' ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth());
							eventHtml += '</div>';
						}
						if (params.show_callout_box_month === 'on' && params.show_callout_month_range === 'on') {
							eventHtml += '<div class="event-month ' + (params.show_callout_box_month_class || '') + '">';
							if (isAllDay) {
								eventHtml += (params.callout_month_format !== '' ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth());
							} else {
								eventHtml += (params.callout_month_format !== '' ? formattedDate_startMonth + '-' + formattedDate_endMonth : new Date(event.callout_start_date).getMonth() + '-' + new Date(event.callout_end_date).getMonth());
							}
							eventHtml += '</div>';
						}

						// Callout Day of Week (single or range)
						if (params.callout_day_of_the_week === 'on' && params.show_callout_day_of_week_range === 'off') {
							eventHtml += '<div class="event-day-of-week">';
							eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : new Date(event.callout_start_date).getDay());
							eventHtml += '</div>';
						}
						if (params.callout_day_of_the_week === 'on' && params.show_callout_day_of_week_range === 'on') {
							eventHtml += '<div class="event-day-of-week">';
							if (isAllDay) {
								eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : new Date(event.callout_start_date).getDay());
							} else {
								eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay + '-' + formattedDate_endDay : new Date(event.callout_start_date).getDay() + '-' + new Date(event.callout_end_date).getDay());
							}
							eventHtml += '</div>';
						}

						// Callout Year (single or range)
						if (params.show_callout_box_year === 'on' && params.show_callout_year_range === 'off') {
							eventHtml += '<div class="event-year">';
							eventHtml += (params.callout_year_format !== '' ? formattedDate_startYear : event.year);
							eventHtml += '</div>';
						}
						if (params.show_callout_box_year === 'on' && params.show_callout_year_range === 'on') {
							eventHtml += '<div class="event-year">';
							if (isAllDay) {
								eventHtml += (params.callout_year_format !== '' ? formattedDate_startYear : event.year);
							} else {
								eventHtml += (params.callout_year_format !== '' ? formattedDate_startYear + '-' + formattedDate_endYear : event.year + '-' + event.year);
							}
							eventHtml += '</div>';
						}

						// Callout Time - only show if not all-day event
						if (params.show_callout_box_Stime === 'on' && !isAllDay) {
							if (params.show_callout_time_range === 'off') {
								eventHtml += '<div class="event-time">';
								eventHtml += (params.callout_time_format !== '' ? formattedDate_startTime : event.callout_start_time);
								eventHtml += '</div>';
							}
							if (params.show_callout_box_Stime === 'on' && params.show_callout_time_range === 'on') {
								eventHtml += '<div class="event-time">';
								if (!(isSameDate && isSameTime)) {
									eventHtml += (params.callout_time_format !== '' ? formattedDate_startTime + '-' + formattedDate_endTime : event.callout_start_time + '-' + event.callout_end_time);
								} else {
									eventHtml += (params.callout_time_format !== '' ? formattedDate_startTime : event.callout_start_time);
								}
								eventHtml += '</div>';
							}
							}

							eventHtml += '</div>';
						}
					} else {
						if (params.layout === 'grid' || params.layout == 'cover') {
							if (params.show_callout_box === 'on') {
								if (params.layout === 'cover') {
									eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';
								} else {
									eventHtml += '<div class="callout-column">';
									eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';
								}

								// Date
								if (params.show_callout_box_date === 'on') {
								eventHtml += '<div class="event-day ' + params.show_callout_box_date_class + '">';
								if (params.show_callout_box_date_range === 'off') {
									eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
								} else {
									if (isAllDay) {
										eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
									} else {
										if (!isSameDate) {
											eventHtml += params.date_format ?
												formattedDate_startDate + ' - ' + formattedDate_endDate :
												new Date(event.callout_start_date).getDate() + ' - ' + new Date(event.callout_end_date).getDate();
										} else {
											eventHtml += params.date_format ? formattedDate_startDate : new Date(event.callout_start_date).getDate();
										}
									}
								}
								eventHtml += '</div>';
							}

							// Month
							if (params.show_callout_box_month === 'on') {
								eventHtml += '<div class="event-month">';
								if (params.show_callout_month_range === 'off') {
									eventHtml += params.callout_month_format ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth();
								} else {
									if (isAllDay) {
										eventHtml += params.callout_month_format ? formattedDate_startMonth : new Date(event.callout_start_date).getMonth();
									} else {
										eventHtml += params.callout_month_format ?
											formattedDate_startMonth + ' - ' + formattedDate_endMonth :
											new Date(event.callout_start_date).getMonth() + ' - ' + new Date(event.callout_end_date).getMonth();
									}
								}
								eventHtml += '</div>';
							}

							// Day of Week
							if (params.callout_day_of_the_week === 'on') {
								eventHtml += '<div class="event-day-of-week">';
								if (params.show_callout_day_of_week_range === 'off') {
									eventHtml += params.callout_week_format ? formattedDate_startDay : new Date(event.callout_start_date).getDay();
								} else {
									if (isAllDay) {
										eventHtml += params.callout_week_format ? formattedDate_startDay : new Date(event.callout_start_date).getDay();
									} else {
										eventHtml += params.callout_week_format ?
											formattedDate_startDay + ' - ' + formattedDate_endDay :
											new Date(event.callout_start_date).getDay() + ' - ' + new Date(event.callout_end_date).getDay();
									}
								}
								eventHtml += '</div>';
							}

							// Year
							if (params.show_callout_box_year === 'on') {
								eventHtml += '<div class="event-year">';
								if (params.show_callout_year_range === 'off') {
									eventHtml += params.callout_year_format ? formattedDate_startYear : event.year;
								} else {
									if (isAllDay) {
										eventHtml += params.callout_year_format ? formattedDate_startYear : event.year;
									} else {
										eventHtml += params.callout_year_format ?
											formattedDate_startYear + ' - ' + formattedDate_endYear :
											event.year + ' - ' + event.year;
									}
								}
								eventHtml += '</div>';
							}

							// Time - only show if not all-day event
							if (params.show_callout_box_starttime === 'on' && !isAllDay) {
								eventHtml += '<span class="event-time">';
								if (params.show_callout_time_range === 'off') {
									eventHtml += params.callout_time_format ? formattedDate_startTime : event.callout_start_time;
								} else {
									if (!(isSameDate && isSameTime)) {
										eventHtml += params.callout_time_format ?
											formattedDate_startTime + ' - ' + formattedDate_endTime :
											event.callout_start_time + ' - ' + event.callout_end_time;
									} else {
										eventHtml += params.callout_time_format ? formattedDate_startTime : event.callout_start_time;
									}
								}
								eventHtml += '</span>';
							}

								eventHtml += params.layout === 'cover' ? '</div>' : '</div></div>';
							}
						}
					}

					if (imageLink.showLink && hasImage) {
						eventHtml += '</a>';
					}
					eventHtml += '</div></div>';

					// Details Column
					const detailsClass = layoutType.includes('_button') ? 'with-button' : '';
					var buttonAlignEnabledClassDetails = (buttonAlign === 'on') ? 'button-align-enabled' : '';
					eventHtml += '<div class="details-column ' + detailsClass + ' ' + buttonAlignEnabledClassDetails + '">';
					eventHtml += '<div class="decm-show-detail-center ' + buttonAlignEnabledClassDetails + '">';

					// Title
					const titleLink = getEventTitleLink(event, params);

						if (isShowTitleOn(params.show_title)) {
							var titleTag = getTitleHeadingLevel(params);
							eventHtml += '<div class="event__title_box">';
							if (titleLink.showLink) {
								eventHtml += '<' + titleTag + ' class="event__title"><a href="' + titleLink.url + '"' + titleLink.target + '>' + event.title + '</a></' + titleTag + '>';
							} else {
								eventHtml += '<' + titleTag + ' class="event__title">' + event.title + '</' + titleTag + '>';
							}
							eventHtml += '</div>';
						}

					if (params.stack_event_d === 'off') {
						eventHtml += '<div class="event__details_inline">';
					}

					// Date Details
					if (params.show_date_details === "on" && formattedDate_startDate_Details) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__date_value">' + ' ';
							if (isAllDay) {
								// For all-day events: only hide end date if dates are the same (single day event)
								eventHtml += (isSameDate 
									? formattedDate_startDate_Details
									: (params.show_end_date_details === 'on' && formattedDate_endDate_Details
										? formattedDate_startDate_Details + ' - ' + formattedDate_endDate_Details
										: formattedDate_startDate_Details));
							} else {
								eventHtml += (params.show_end_date_details === 'on' && formattedDate_endDate_Details && !isSameDate ? formattedDate_startDate_Details + ' - ' + formattedDate_endDate_Details : formattedDate_startDate_Details);
							}
							eventHtml += '</span>';
						} else {
							eventHtml += '<div class="event__date ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
								const dateLabel = (params.date_detail_label === '' || params.date_detail_label === 'Date') ? 'Date' : params.date_detail_label;
								eventHtml += '<span class="event__date_label ecs-detail-label">' + __t(dateLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
							}
							eventHtml += '</div>';
							eventHtml += '<span class="event__date_value">' + ' ';
							if (isAllDay) {
								// For all-day events: only hide end date if dates are the same (single day event)
								eventHtml += (isSameDate 
									? formattedDate_startDate_Details
									: (params.show_end_date_details === 'on' && formattedDate_endDate_Details
										? formattedDate_startDate_Details + ' - ' + formattedDate_endDate_Details
										: formattedDate_startDate_Details));
							} else {
								eventHtml += (params.show_end_date_details === 'on' && formattedDate_endDate_Details && !isSameDate ? formattedDate_startDate_Details + ' - ' + formattedDate_endDate_Details : formattedDate_startDate_Details);
							}
							eventHtml += '</span>';
							eventHtml += '</div>';
						}
					}

					// Time Details
					if (params.show_time_details === 'on' && (formattedDate_startTimeDetails || isAllDay)) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__time_value">' + ' ';
							if (isAllDay || (!formattedDate_startTimeDetails && !formattedDate_endTimeDetails)) {
								eventHtml += allDayText;
							} else {
								eventHtml += (params.show_end_time_details === 'on' && formattedDate_endTimeDetails && !(isSameDate && isSameTime) ?
									((params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_startTimeDetails +
										' - ' +
										(params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_endTimeDetails) :
									(params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_startTimeDetails) +
									// Add timezone display
									(params.show_timezone === 'on' && event.timeZone ? ' ' + event.timeZone : '');
							}
							eventHtml += '</span>';
						} else {
							var timeIconClass = (params.show_label_icon === 'icon' || params.show_label_icon === 'label_icon') ? 'event-time-decm-icon' : '';
							eventHtml += '<div class="event__time ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (!isAllDay ? (params.show_label_icon || '') : '') + ' ' + (!isAllDay ? timeIconClass : '') + '">';
							if (!isAllDay) {
								eventHtml += '<div class="label-icon-line">';
								if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
									const timeLabel = (params.details_time_label === '' || params.details_time_label === 'Time') ? 'Time' : params.details_time_label;
									eventHtml += '<span class="event__time_label ecs-detail-label">' + __t(timeLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
								}
								eventHtml += '</div>';
							}
							eventHtml += '<span class="event__time_value">' + ' ';
							if (isAllDay || (!formattedDate_startTimeDetails && !formattedDate_endTimeDetails)) {
								eventHtml += allDayText;
							} else {
								eventHtml += (params.show_end_time_details === 'on' && formattedDate_endTimeDetails && !(isSameDate && isSameTime) ?
									((params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_startTimeDetails +
										' - ' +
										(params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_endTimeDetails) :
									(params.show_preposition_dividr === 'on' ? ' @ ' : '') + formattedDate_startTimeDetails) +
									// Add timezone display
									(params.show_timezone === 'on' && event.timeZone ? ' ' + event.timeZone : '');
							}
							eventHtml += '</span>';
							eventHtml += '</div>';
						}
					}

					// Venue Details
					if (params.show_venue_details === "on" && event.venues && event.venues.length > 0) {
						// Process venues with links
						let venueContent = '';
						const venueNames = [];
						const venueLinks = [];

						event.venues.forEach(venue => {
							venueNames.push(venue.name);

							if (params.enable_venue_link === 'on' && venue.url) {
								const target = params.venue_link_target === 'new_tab' ? ' target="_blank" rel="noopener noreferrer"' : '';
								venueLinks.push('<a href="' + venue.url + '"' + target + '>' + venue.name + '</a>');
							} else {
								venueLinks.push(venue.name);
							}
						});

						const preposition = params.show_preposition_dividr === 'on' ? ' at ' : '';
						venueContent = '<em>' + preposition + '</em>' + venueLinks.join(', ');

						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__venue_value">' + venueContent + '</span>';
						} else {
							eventHtml += '<div class="event__venue ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
								const venueLabel = (params.venue_detail_label === '' || params.venue_detail_label === 'Venue') ? 'Venue' : params.venue_detail_label;
								const label = __t(venueLabel);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								eventHtml += `<span class="event__venue_label ecs-detail-label">${label}${sep}</span>`;
							}

							eventHtml += '</div>';
							eventHtml += '<span class="event__venue_value">' + venueContent + '</span>';
							eventHtml += '</div>';
						}
					}

					// location
					if (params.show_location === "on" && event.location) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__location_value"><em>' +
								(params.show_preposition_dividr === 'on' ? ' in ' : '') + '</em>' +
								event.location + '</span>';
						} else {
							eventHtml += '<div class="event__location ' +
								(params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' +
								(params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (
								params.show_label_icon === 'label' ||
								params.show_label_icon === 'label_icon' ||
								params.show_label_icon !== 'none'
							) {
								const locationLabel = (params.location_detail_label === '' || params.location_detail_label === 'Location' || params.location_detail_label === 'location') ? 'Location' : params.location_detail_label;
								const label = __t(locationLabel);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								eventHtml += `<span class="event__location_label ecs-detail-label">${label}${sep}</span>`;
							}
							eventHtml += '</div>';
							eventHtml += '<span class="event__location_value"><em>' +
								(params.show_preposition_dividr === 'on' ? ' at ' : '') + '</em>' +
								event.location + '</span>';
							eventHtml += '</div>';
						}
					}


					// Organizer Details
					if (params.show_organizer_details === "on" && event.organizers && event.organizers.length > 0) {
						// Process organizers with links
						let organizerContent = '';
						const organizerLinks = [];
						params.org_link_target
						event.organizers.forEach(organizer => {
							if (params.enable_org_link === 'on' && organizer.url) {
								const target = params.org_link_target === 'new_tab' ? ' target="_blank"' : '';
								organizerLinks.push('<a href="' + organizer.url + '"' + target + '>' + organizer.name + '</a>');
							} else {
								organizerLinks.push(organizer.name);
							}
						});

						organizerContent = organizerLinks.join(', ');

						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__organizer_value">' + organizerContent + '</span>';
						} else {
							eventHtml += '<div class="event__organizer ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
								// Get organizer label from params (already set at start of success callback)
								// Always default to 'Organizer' if value is missing/empty (final safety check)
								let organizerLabel = params.organizer_detail_label;
								// console.log('=== Organizer Label Rendering Debug ===');
								// console.log('params.show_label_icon:', params.show_label_icon);
								// console.log('params.organizer_detail_label before check:', organizerLabel);
								// console.log('organizerLabel type:', typeof organizerLabel);
								// console.log('organizerLabel value:', organizerLabel);
								
								// Final safety check - ALWAYS ensure we have a valid label value
								if (!organizerLabel || organizerLabel === '' || organizerLabel === 'undefined' || String(organizerLabel).trim() === '') {
									console.log('Organizer label is empty/missing, defaulting to Organizer');
									organizerLabel = 'Organizer';
								}
								
								// console.log('Final organizerLabel before translation:', organizerLabel);
								
								// Translate and render the label - it will NEVER be empty at this point
								const label = __t(organizerLabel);
								// console.log('Translated label:', label);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								// console.log('Final HTML to add:', `<span class="event__organizer_label ecs-detail-label">${label}${sep}</span>`);
								eventHtml += `<span class="event__organizer_label ecs-detail-label">${label}${sep}</span>`;
								// console.log('=== End Organizer Label Rendering Debug ===');
							} else {
								console.log('Organizer label NOT showing - show_label_icon is:', params.show_label_icon);
							}

							eventHtml += '</div>';
							eventHtml += '<span class="event__organizer_value">' + organizerContent + '</span>';
							eventHtml += '</div>';
						}
					}
					// Category
					if (params.show_cat === "on" && event.categories && event.categories.length > 0) {
						const categoryLinks = [];
						const categoryNames = [];

						event.categories.forEach(category => {
							categoryNames.push(category.name);

							if (params.enable_cat_link === 'on' && category.url) {
								const target = params.category_link_target === 'new_tab' ? ' target="_blank"' : '';
								categoryLinks.push('<a href="' + category.url + '"' + target + '>' + category.name + '</a>');
							} else {
								categoryLinks.push(category.name);
							}
						});

						const categoryValue = params.hide_coma_cat === 'on'
							? categoryLinks.join(', ').replace(/,/g, ' ')
							: categoryLinks.join(', ');

						const preposition = params.show_preposition_dividr === 'on' ? ' | ' : '';

						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__category_value"><em>' +
								preposition + '</em>' +
								categoryValue + '</span>';
						} else {
							eventHtml += '<div class="event__category ' +
								(params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' +
								(params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
								const catLabel = (params.cat_label === '' || params.cat_label === 'Category') ? 'Category' : params.cat_label;
								const label = __t(catLabel);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								eventHtml += `<span class="event__category_label ecs-detail-label">${label}${sep}</span>`;
							}

							eventHtml += '</div>';
							eventHtml += '<span class="event__category_value"><em>' +
								preposition + '</em>' +
								categoryValue + '</span>';
							eventHtml += '</div>';
						}
					}

					// Tags
					if (params.show_tags === "on" && event.tags && event.tags.length > 0) {
						const tagLinks = [];
						const tagNames = [];

						event.tags.forEach(tag => {
							tagNames.push(tag.name);

							if (params.enable_tag_link === 'on' && tag.url) {
								const target = params.tag_link_target === 'new_tab' ? ' target="_blank"' : '';
								tagLinks.push('<a href="' + tag.url + '"' + target + '>' + tag.name + '</a>');
							} else {
								tagLinks.push(tag.name);
							}
						});

						const tagValue = params.hide_coma_tag === 'on'
							? tagLinks.join(', ').replace(/,/g, ' ')
							: tagLinks.join(', ');

						const preposition = params.show_preposition_dividr === 'on' ? ' | ' : '';

						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__tag_value"><em>' +
								preposition + '</em>' +
								tagValue + '</span>';
						} else {
							eventHtml += '<div class="event__tag ' +
								(params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' +
								(params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
								const tagsLabel = (params.tags_label === '' || params.tags_label === 'Tags') ? 'Tag' : params.tags_label;
								const label = __t(tagsLabel);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								eventHtml += `<span class="event__tag_label ecs-detail-label">${label}${sep}</span>`;
							}

							eventHtml += '</div>';
							eventHtml += '<span class="event__tag_value"><em>' +
								preposition + '</em>' +
								tagValue + '</span>';
							eventHtml += '</div>';
						}
					}

					// Ticket
					if (params.show_price_ticket === "on" && event.ticket) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__ticket_value">' + ' ' + event.ticket + '</span>';
						} else {
							eventHtml += '<div class="event__ticket ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
								const ticketLabel = (!params.price_ticket_label || params.price_ticket_label === '' || params.price_ticket_label === 'Ticket') ? 'Ticket' : params.price_ticket_label;
								eventHtml += '<span class="event__ticket_label ecs-detail-label">' + __t(ticketLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
							}
							eventHtml += '</div>';
							eventHtml += '<span class="event__ticket_value">' + ' ' + event.ticket + '</span>';
							eventHtml += '</div>';
						}
					}

					// RSVP
					if (params.show_rsvp === "on" && event.rsvp) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__rsvp_value">' + ' ' + event.rsvp + '</span>';
						} else {
							eventHtml += '<div class="event__rsvp ' + (params.show_label_icon || '') + ' ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
								const rsvpLabel = (params.rsvp_label === '' || params.rsvp_label === 'RSVP') ? 'RSVP' : params.rsvp_label;
								eventHtml += '<span class="event__rsvp_label ecs-detail-label">' + __t(rsvpLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
							}
							eventHtml += '</div>';
							eventHtml += '<span class="event__rsvp_value">' + ' ' + event.rsvp + '</span>';
							eventHtml += '</div>';
						}
					}

					// Price
					if (params.show_price === "on" && event.price) {
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__price_value">' + ' ' + event.price + '</span>';
						} else {
							eventHtml += '<div class="event__price ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
								const priceLabel = (!params.price_detail_label || params.price_detail_label === '' || params.price_detail_label === 'Price') ? 'Price' : params.price_detail_label;
								eventHtml += '<span class="event__price_label ecs-detail-label">' + __t(priceLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
							}
							eventHtml += '</div>';
							eventHtml += '<span class="event__price_value">' + ' ' + event.price + '</span>';
							eventHtml += '</div>';
						}
					}

					// Website
					if (params.show_website === "on" && event.event_website) {
						var websiteTarget = getWebsiteLinkTarget(params);
						var websiteText = getWebsiteLinkText(event, params);
						if (params.stack_event_d === 'off') {
							eventHtml += '<span class="event__website_value"><a href="' + event.event_website + '"' + websiteTarget + '>' + websiteText + '</a></span>';
						} else {
							eventHtml += '<div class="event__website ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
							eventHtml += '<div class="label-icon-line">';
							if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
								const websiteLabel = (params.website_label === '' || params.website_label === 'Website') ? 'Website' : params.website_label;
								const label = __t(websiteLabel);
								const sep = params.show_colon_label === 'on' ? ':&nbsp;' : '&nbsp;';
								eventHtml += `<span class="event__website_label ecs-detail-label">${label}${sep}</span>`;
							}


							eventHtml += '</div>';
							eventHtml += '<span class="event__website_value"><a href="' + event.event_website + '"' + websiteTarget + '>' + websiteText + '</a></span>';
							eventHtml += '</div>';
						}
					}

					// TEC Pro Additional Fields
					if (Array.isArray(event.additional_fields) && event.additional_fields.length) {
						var afSettings = {};
						try {
							if (params.additional_field_settings) {
								afSettings = typeof params.additional_field_settings === 'string'
									? JSON.parse(params.additional_field_settings)
									: params.additional_field_settings;
							}
						} catch (e) {
							afSettings = {};
						}

						event.additional_fields.forEach(function (field) {
							var displayValue = field.html || field.value;
							if (!displayValue && displayValue !== '0') {
								return;
							}
							var slug = field.slug || field.label;
							var fieldKey = field.key || slug;
							var setting = afSettings[fieldKey] || {};
							var fieldLabel = setting.label || field.label || '';
							var showIcons = params.show_label_icon === 'icon' || params.show_label_icon === 'label_icon';
							var customIconChar = '';
							if (showIcons && setting.icon && setting.icon.unicode) {
								var iconTextarea = document.createElement('textarea');
								iconTextarea.innerHTML = setting.icon.unicode;
								customIconChar = iconTextarea.value;
							}
							var hasCustomIcon = showIcons && !!customIconChar;
							var iconFontClass = (setting.icon && setting.icon.type === 'fa') ? 'decm-af-icon-font-fa' : 'decm-af-icon-font-et';

							if (params.stack_event_d === 'off') {
								eventHtml += '<span class="event__additional_field_value event__additional_field_value--' + slug + '">' + displayValue + '</span>';
							} else {
								var additionalIconClass = (showIcons && !hasCustomIcon) ? ' event-additional-field-decm-icon' : '';
								var customIconClass = hasCustomIcon ? ' has-custom-icon' : '';
								eventHtml += '<div class="event__additional_field event__additional_field--' + slug + ' ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + additionalIconClass + customIconClass + '">';
								if (hasCustomIcon) {
									eventHtml += '<span class="decm-additional-field-custom-icon ' + iconFontClass + '" aria-hidden="true">' + customIconChar + '</span>';
								}
								if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
									const labelSuffix = params.show_colon_label === 'on' ? ':' : '';
									eventHtml += '<span class="event__additional_field_label ecs-detail-label">' + fieldLabel + labelSuffix + '</span>';
								}
								eventHtml += '<span class="event__additional_field_value event__additional_field_value--' + slug + '"> ' + displayValue + '</span>';
								eventHtml += '</div>';
							}
						});
					}

					if (params.stack_event_d === 'off') {
						eventHtml += '</div>';
					}

					// Event description excerpt
					if (params.show_excerpt === 'on') {
						let t = '';
						if (params.excerpt_content === 'show_desc' && event.post_description) {
							t = String(event.post_description).replace(/<[^>]*>/g, '');
						} else if (event.post_excerpt) {
							t = event.post_excerpt;
						}
						if (typeof params.excerpt_length !== 'undefined' && params.excerpt_length > 0 && t) {
							t = t.substring(0, params.excerpt_length) + '...';
						}
						if (t) {
							eventHtml += '<div class="event__des_excer"><p class="ecs-excerpt">' + t + '</p></div>';
						}
					}

					// more info button 
					if (params.show_more_info === 'on') {
						// Check for custom meta field first, then fall back to module setting
						const buttonText = event.more_info_button_text || translateMoreInfoButtonText(params.show_more_info_btn_text);
						const buttonAlignClass = (buttonAlign === 'on') ? 'button-align-bottom' : '';
						if ([
							'image_detail',
							'detail_image',
							'calloutOnImage_Datail',
							'callout_detail_image',
							'callout_image_detail'
						].includes(layoutType)) {
							eventHtml += '<div class="event__show_more_if ' + buttonAlignClass + '" data-button-align-desktop="' + (params.button_align || 'off') + '" data-button-align-tablet="' + (params.button_align_tablet || '') + '" data-button-align-phone="' + (params.button_align_phone || '') + '">';
							eventHtml += '<div class="ecs-showdetail dec-more-info-button et_pb_button_wrapper mb-2 ' + buttonAlignClass + '">';
							const buttonLink = getEventButtonLink(event, params);
							// Build icon data attributes
							let iconDataAttrs = '';
							if (params.more_info_button_icon_desktop) {
								iconDataAttrs += ' data-icon="' + escapeHtml(params.more_info_button_icon_desktop) + '"';
							}
							if (params.more_info_button_icon_tablet) {
								iconDataAttrs += ' data-icon-tablet="' + escapeHtml(params.more_info_button_icon_tablet) + '"';
							}
							if (params.more_info_button_icon_phone) {
								iconDataAttrs += ' data-icon-phone="' + escapeHtml(params.more_info_button_icon_phone) + '"';
							}
							var moreInfoBtnClass = 'act-view-more et_pb_button' + (params.button_make_fullwidth === 'on' ? ' act-view-more-fullwidth' : '') + getButtonIconClassSuffix(params, 'more_info');
							if (buttonLink.showLink) {
								eventHtml += '<a href="' + buttonLink.url + '" rel="bookmark" class="' + moreInfoBtnClass + '"' + buttonLink.target + iconDataAttrs + '>' +
									buttonText + '</a>';
							} else {
								eventHtml += '<span class="' + moreInfoBtnClass + ' disabled"' + iconDataAttrs + '>' + buttonText + '</span>';
							}
							eventHtml += '</div></div>';
						} else {
							if (params.layout === 'grid' || params.layout == 'cover') {
								eventHtml += '<div class="event__show_more_if ' + buttonAlignClass + '" data-button-align-desktop="' + (params.button_align || 'off') + '" data-button-align-tablet="' + (params.button_align_tablet || '') + '" data-button-align-phone="' + (params.button_align_phone || '') + '">';
								eventHtml += '<div class="ecs-showdetail dec-more-info-button et_pb_button_wrapper mb-2 ' + buttonAlignClass + '">';
								const buttonLink = getEventButtonLink(event, params);
								// Build icon data attributes
								let iconDataAttrs = '';
								if (params.more_info_button_icon_desktop) {
									iconDataAttrs += ' data-icon="' + escapeHtml(params.more_info_button_icon_desktop) + '"';
								}
								if (params.more_info_button_icon_tablet) {
									iconDataAttrs += ' data-icon-tablet="' + escapeHtml(params.more_info_button_icon_tablet) + '"';
								}
								if (params.more_info_button_icon_phone) {
									iconDataAttrs += ' data-icon-phone="' + escapeHtml(params.more_info_button_icon_phone) + '"';
								}
								var moreInfoBtnClassGrid = 'act-view-more et_pb_button' + (params.button_make_fullwidth === 'on' ? ' act-view-more-fullwidth' : '') + getButtonIconClassSuffix(params, 'more_info');
								if (buttonLink.showLink) {
									eventHtml += '<a href="' + buttonLink.url + '" rel="bookmark" class="' + moreInfoBtnClassGrid + '"' + buttonLink.target + iconDataAttrs + '>' +
										buttonText + '</a>';
								} else {
									eventHtml += '<span class="' + moreInfoBtnClassGrid + ' disabled"' + iconDataAttrs + '>' + buttonText + '</span>';
								}
								eventHtml += '</div></div>';
							}
						}
					}

					eventHtml += '</div></div>'; // Close details column

					// Separate Button Column
					if (params.show_more_info === 'on' && [
						'callout_image_detail_button',
						'callout_detail_image_button',
						'calloutOnImage_Datail_button'
					].includes(layoutType)) {
						// Build icon data attributes for separate button column
						let iconDataAttrsSeparate = '';
						if (params.more_info_button_icon_desktop) {
							iconDataAttrsSeparate += ' data-icon="' + escapeHtml(params.more_info_button_icon_desktop) + '"';
						}
						if (params.more_info_button_icon_tablet) {
							iconDataAttrsSeparate += ' data-icon-tablet="' + escapeHtml(params.more_info_button_icon_tablet) + '"';
						}
						if (params.more_info_button_icon_phone) {
							iconDataAttrsSeparate += ' data-icon-phone="' + escapeHtml(params.more_info_button_icon_phone) + '"';
						}
						// Check for custom meta field first, then fall back to module setting
						const buttonText = event.more_info_button_text || translateMoreInfoButtonText(params.show_more_info_btn_text);
						const buttonAlignClass = (buttonAlign === 'on') ? 'button-align-bottom' : '';
						var buttonAlignEnabledClassButton = (buttonAlign === 'on') ? 'button-align-enabled' : '';
						eventHtml += '<div class="button-column ' + buttonAlignEnabledClassButton + '">';
						eventHtml += '<div class="event__show_more_if ' + buttonAlignClass + '" data-button-align-desktop="' + (params.button_align || 'off') + '" data-button-align-tablet="' + (params.button_align_tablet || '') + '" data-button-align-phone="' + (params.button_align_phone || '') + '">';
						eventHtml += '<div class="ecs-showdetail dec-more-info-button et_pb_button_wrapper ' + buttonAlignClass + '">';
						const buttonLink = getEventButtonLink(event, params);
						var moreInfoBtnClassSep = 'act-view-more et_pb_button' + (params.button_make_fullwidth === 'on' ? ' act-view-more-fullwidth' : '') + getButtonIconClassSuffix(params, 'more_info');
						if (buttonLink.showLink) {
							eventHtml += '<a href="' + buttonLink.url + '" rel="bookmark" class="' + moreInfoBtnClassSep + '"' + buttonLink.target + iconDataAttrsSeparate + '>' +
								buttonText + '</a>';
						} else {
							eventHtml += '<span class="' + moreInfoBtnClassSep + ' disabled"' + iconDataAttrsSeparate + '>' + buttonText + '</span>';
						}
						eventHtml += '</div></div></div>';

					}
					// allEventHtml += eventHtml;
					eventHtml += '</div></div>'; // Close main layout and container

					// Append to container
					// if (response.data.pagination.pagination_type === 'load_more') {
					//     container.html(eventHtml);
					// } else {
					//     container.html(eventHtml);
					// }
					alevent += eventHtml;


				});

				// Handle no results message - Outside Container (like React version)
				var noResultsMessage = '';
				if (events.length === 0) {
					// Get the results message from hidden fields (PHP already translates the default)
					var resultsMessage = container.siblings('.events-main__container').find('input.hidden-data-field[name="results_message"]').val() ||
						'There are no upcoming events at this time.'; // Fallback (shouldn't happen if PHP works correctly)

					noResultsMessage = '<div class="ecs-event-list event-display_stylecover">' +
						'<div class="events-results-message">' + resultsMessage + '</div>' +
						'</div>';
				}

				// alevent+=originalHiddenDiv;
				container.html(alevent);
				container.append(originalHiddenDiv);

				// Replace (not stack) any existing no-results message outside the container
				container.siblings('.ecs-event-list.event-display_stylecover').remove();
				if (noResultsMessage) {
					container.after(noResultsMessage);
				}

				// Calculate equal heights for button align
				setTimeout(function() {
					calculateEqualHeights(container);
				}, 200);

				updatePagination(response.data.pagination, params, $(contss).find('.pagination-container'));
				(response.data.pagination);
			},
			error: function (xhr, status, error) {
				console.error('=== AJAX ERROR ===');
				console.error('Status:', status);
				console.error('Error:', error);
				console.error('Response:', xhr.responseText);
				alert("AJAX error occurred! Check console for details.");
			}
		});
	}

	// Global resize listener for equal heights calculation
	var resizeTimeout;
	$(window).on('resize', function() {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(function() {
			$('.events-main__container.button-align-enabled').each(function() {
				calculateEqualHeights($(this));
			});
		}, 150);
	});

});
