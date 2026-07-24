// import { _x } from "@wordpress/i18n";

// import { __ } from '@wordpress/i18n';
jQuery(document).ready(function ($) {
    var __t = (window.wp && wp.i18n && typeof wp.i18n.__ === 'function')
        ? function (s) { return wp.i18n.__(s, 'decm-divi-event-calendar-module'); }
        : function (s) { return s; };
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

    function translateStaticLabel($elements, sourceText, translatedText) {
        $elements.each(function () {
            var $el = $(this);
            var raw = $el.text() || '';
            var hasColon = /:\s*$/.test(raw);
            var normalized = raw.replace(/:\s*$/, '').trim().toLowerCase();
            if (normalized === sourceText.toLowerCase()) {
                $el.text(translatedText + (hasColon ? ':' : ''));
            }
        });
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

    function translateInitialServerRenderedContent() {
        var modules = $('.decm_event_display');
        if (!modules.length) {
            return;
        }

        modules.each(function () {
            var $module = $(this);

            translateStaticLabel($module.find('.event__date_label'), 'Date', __t('Date'));
            translateStaticLabel($module.find('.event__time_label'), 'Time', __t('Time'));
            translateStaticLabel($module.find('.event__venue_label'), 'Venue', __t('Venue'));
            translateStaticLabel($module.find('.event__location_label'), 'Location', __t('Location'));
            translateStaticLabel($module.find('.event__organizer_label'), 'Organizer', __t('Organizer'));
            translateStaticLabel($module.find('.event__category_label'), 'Category', __t('Category'));
            translateStaticLabel($module.find('.event__tags_label'), 'Tag', __t('Tag'));
            translateStaticLabel($module.find('.event__ticket_label'), 'Ticket', __t('Ticket'));
            translateStaticLabel($module.find('.event__rsvp_label'), 'RSVP', __t('RSVP'));
            translateStaticLabel($module.find('.event__price_label'), 'Price', __t('Price'));
            translateStaticLabel($module.find('.event__website_label'), 'Website', __t('Website'));

            $module.find('.event__website_value a').each(function () {
                var $link = $(this);
                if (($link.text() || '').trim().toLowerCase() === 'view events website') {
                    $link.text(__t('View Events Website'));
                }
            });

            $module.find('.load-more-btn').each(function () {
                var $btn = $(this);
                if (($btn.text() || '').trim().toLowerCase() === 'load more') {
                    $btn.text(__t('Load More'));
                }
            });

            $module.find('.dec-more-info-button .act-view-more').each(function () {
                var $btn = $(this);
                var current = ($btn.text() || '').trim();
                var translated = translateMoreInfoButtonText(current);
                if (translated !== current) {
                    $btn.text(translated);
                }
            });
        });
    }

    translateInitialServerRenderedContent();

    function isFeatureImageOn(showFeatureImage) {
        return showFeatureImage === 'on' || showFeatureImage === 'true';
    }

    function isCoverOverlayOn(coverOverlayVal) {
        return coverOverlayVal === 'on' || coverOverlayVal === 'true' || coverOverlayVal === true ||
            coverOverlayVal === 1 || coverOverlayVal === '1';
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

    /**
     * D4-compatible icon classes from hidden params (precomputed in PHP).
     */
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

    function setPaginationLoading($btn, isLoading) {
        var $pagination = $btn && $btn.length ? $btn.closest('.pagination-container') : $();
        if (!$pagination.length && $btn && $btn.jquery) {
            $pagination = $btn;
        }
        if (!$pagination.length || !$pagination.hasClass('pagination-container')) {
            return;
        }

        var $events = $pagination.siblings('.events-main__container');
        if (!$events.length) {
            $events = $pagination.closest('.event_calendar_module__inner, .decm_event_display, [class*="event-display_"]').find('.events-main__container').first();
        }

        $pagination.toggleClass('dec-pagination-is-loading', !!isLoading);
        $events.toggleClass('dec-events-is-loading', !!isLoading);
    }

    function decm_get_event(button, page, per_page, hiddenF) {

        const e = button;

        var $clicked = $(e);
        var $paginationContainer = $clicked.closest('.pagination-container');
        if ($paginationContainer.hasClass('dec-pagination-is-loading')) {
            return;
        }
        setPaginationLoading($paginationContainer, true);

        var params = {
            'disable_title_link': '',
            'disable_button_link': '',
            'show_recurring_event': '',
            'disable_image_link': '',
            'custom_event_link': '',
            'event_selection': '',
            'date_format': '',
            'show_feature_image': '',
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
            // More Info button icons (from MoreInfoButton.decoration.button.*.icon)
            'more_info_button_icon_desktop': '',
            'more_info_button_icon_tablet': '',
            'more_info_button_icon_phone': '',
            // Load More button icons (from LoadMoreButton.decoration.button.*.icon)
            'load_more_button_icon_desktop': '',
            'load_more_button_icon_tablet': '',
            'load_more_button_icon_phone': '',
            'more_info_button_icon_classes': '',
            'load_more_button_icon_classes': '',
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
            'show_price': '',
            'price_detail_label': '',
            'show_price_ticket': '',
            'columns': '',
            'columns_desktop': '',
            'columns_tablet': '',
            'columns_phone': '',
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
            'title_level': 'h2',
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
            'dec-eventfeed-category': '', // comma-separated category slugs
            'dec-eventfeed-tag': '',     // comma-separated tag slugs
            'dec-eventfeed-venue': '',    // comma-separated venue names or IDs
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
            'dec-eventfeed-status': '',
            'dec-filter-search': '',
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
            'feature_image_overlay': '',
            'feature_image_overlay_icon': '',
            'feature_image_overlay_icon_color': '#fff',
            'feature_image_overlay_background': 'rgba(0,0,0,0.4)',
            'cover_feature_image_overlay_on': '',
        };

        // Loop through each key and get the value from the hidden input field
        var hiddenFieldsContainer = $(e).closest('.pagination-container')
            .siblings('.events-main__container');
        $.each(params, function (key) {
            var value = hiddenFieldsContainer
                .find('input.hidden-data-field[name="' + key + '"]')
                .val();

            // For label/link settings, try multiple fallback locations (important for pagination)
            var fallbackFields = ['organizer_detail_label', 'website_link', 'website_link_target', 'custom_web_link'];
            if (fallbackFields.indexOf(key) !== -1 && (value === undefined || value === null || value === '')) {
                value = $('input.hidden-data-field[name="' + key + '"]').first().val();
                if ((value === undefined || value === null || value === '')) {
                    value = hiddenFieldsContainer.closest('.decm_event_display, .event-display')
                        .find('input.hidden-data-field[name="' + key + '"]').first().val();
                }
            }

            // Ensure undefined/null values are converted to empty string for consistency
            params[key] = (value === undefined || value === null) ? '' : value;
        });
        
        // Special handling for organizer_detail_label - ensure it's always set
        // console.log('=== LoadMore - Organizer Label Debug ===');
        // console.log('organizer_detail_label from hidden field:', params.organizer_detail_label);
        if (!params.organizer_detail_label || params.organizer_detail_label === '' || params.organizer_detail_label === 'undefined') {
            // Try alternative locations
            var altValue = $('input.hidden-data-field[name="organizer_detail_label"]').first().val();
            if (altValue && altValue !== '' && altValue !== 'undefined') {
                params.organizer_detail_label = altValue;
                // console.log('organizer_detail_label from document-wide search:', params.organizer_detail_label);
            } else {
                params.organizer_detail_label = 'Organizer';
                // console.log('organizer_detail_label defaulted to Organizer');
            }
        }
        // console.log('Final organizer_detail_label:', params.organizer_detail_label);
        // console.log(params);

        // If user switches back to "All Events" (or any non-custom selection),
        // clear custom selection filters so stale values don't keep filtering results.
        if (params.event_selection !== 'custom_event') {
            params.event_selection_cat = '';
            params.event_selection_tag = '';
            params.event_selection_org = '';
            params.event_selection_venue = '';
            params.event_selection_series = '';
        }

        var thiscontainer = $(e).closest('.pagination-container')
            .siblings('.events-main__container');
        // var data_page = 2;
        params['action'] = 'decm_get_events_action';  // Example action key
        params['security'] = ajax_object.ajax_nonce;
        if (page != '' && page != undefined) {
            params['page'] = page;
            // For load more, use the per_page value passed (from load_more_per_page setting)
            // Convert to number to ensure it's used correctly
            params['per_page'] = per_page ? parseInt(per_page, 10) : parseInt(params['per_page'] || '3', 10);
            // console.log(per_page, params['per_page']);
        } else {
            // For initial load, use responsive events_count
            params['per_page'] = getResponsiveEventsCount(params);
        }
        if (window.decmEventDisplayResponsiveLayout) {
            window.decmEventDisplayResponsiveLayout.applyResponsiveLayoutParams(params);
        } else if (params.layout == 'grid' || params.layout == 'cover') {
            params.layout_type = '';
        }
        // console.log(params);
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



        $.ajax({
            type: "POST",
            url: ajax_object.ajax_url, // The AJAX URL from localized script
            data: data,
            success: function (response) {
                var events = response.data.events;
                var container = thiscontainer;

                if (window.decmEventDisplayResponsiveLayout) {
                    window.decmEventDisplayResponsiveLayout.applyResponsiveLayoutParams(params);
                    window.decmEventDisplayResponsiveLayout.updateContainerLayoutClasses(container, params.layout, params);
                }

                // Re-retrieve website link settings before rendering (CRITICAL for pagination)
                ['website_link', 'website_link_target', 'custom_web_link'].forEach(function (fieldName) {
                    var retrievedValue = hiddenFieldsContainer.find('input.hidden-data-field[name="' + fieldName + '"]').val() || '';
                    if (!retrievedValue || retrievedValue === 'undefined') {
                        retrievedValue = $('input.hidden-data-field[name="' + fieldName + '"]').first().val() || '';
                    }
                    if ((!retrievedValue || retrievedValue === 'undefined')) {
                        retrievedValue = hiddenFieldsContainer.closest('.decm_event_display, .event-display')
                            .find('input.hidden-data-field[name="' + fieldName + '"]').first().val() || '';
                    }
                    if (retrievedValue && retrievedValue !== 'undefined' && String(retrievedValue).trim() !== '') {
                        params[fieldName] = retrievedValue;
                    }
                });

                if (response.data.pagination.pagination_type === 'load_more') {
                } else {
                    container.empty();
                }
                var allEventHtml = '';
                var existingMonths = new Set(
                    container.find('.month-heading').map(function () {
                        return $(this).text();
                    }).get()
                );
                $.each(events, function (i, event) {
                    // console.log(i, event);

                    if (event.month_separator) {
                        // Only render separator when enabled and in list layout.
                        if (params.month_with_heading === 'on' && params.layout === 'list') {
                            var monthHeading = event.month_heading_format || event.month_heading || '';

                            // Keep separator order aligned with events and avoid duplicates across loaded pages.
                            if (monthHeading && !existingMonths.has(monthHeading)) {
                                existingMonths.add(monthHeading);
                                allEventHtml += '<h2 class="ecs-events-list-separator-month">' +
                                    '<span class="month-heading ecs-events-calendar-list__month-separator-text">' +
                                    escapeHtml(monthHeading) +
                                    '</span><span class="ecs-events-list-separator-month__line" aria-hidden="true"></span></h2>';
                            }
                        }
                        // Always skip marker rows so they never render as event cards.
                        return true;
                    }

                    // -------------------------------
                    // Format Dates & Times using Moment.js (ISO-aware)
                    // -------------------------------
                    setMomentLocaleSafe();

                    // helpers
                    const toMoment = iso => (iso ? moment.parseZone(iso) : null); // keep timezone offset
                    const fmt = (m, format) => {
                        if (!m || !m.isValid()) return '';
                        const r = m.format(format);
                        return (r && r.indexOf('undefined') === -1) ? r : '';
                    };

                    // Prefer ISO coming from backend
                    const startM = toMoment(event.callout_start_date || event.start_time);
                    const endM = toMoment(event.callout_end_date || event.end_time);

                    // -------------------------------
                    // Call out date (day-of-month, PHP 'd')
                    const momentFormat = phpToMomentFormat(params.date_format || 'd');
                    const formattedDate_startDate = fmt(startM, momentFormat) || (event.callout_start_date || '');
                    const formattedDate_endDate = fmt(endM, momentFormat) || (event.callout_end_date || '');

                    // Fallback helpers aligned to PHP
                    const fallbackStartDay = event.callout_date
                        ? moment.unix(event.callout_date).format('DD')
                        : fmt(startM, 'DD');

                    const fallbackEndDay = fmt(endM, 'DD') ||
                        (event.callout_end_date ? moment.parseZone(event.callout_end_date).format('DD') : '');

                    // -------------------------------
                    // Call out Month (PHP 'F')
                    const momentFormat_month = phpToMomentFormat(params.callout_month_format || 'F');
                    const formattedDate_startMonth =
                        fmt(startM, momentFormat_month) ||
                        (event.start_month ? fmt(toMoment(event.start_month), momentFormat_month) : '') ||
                        (event.month || '');

                    const formattedDate_endMonth =
                        fmt(endM, momentFormat_month) ||
                        (event.end_month ? fmt(toMoment(event.end_month), momentFormat_month) : '') ||
                        (event.month || '');

                    // -------------------------------
                    // Call out Year (PHP 'Y')
                    const momentFormat_year = phpToMomentFormat(params.callout_year_format || 'Y');
                    const formattedDate_startYear = fmt(startM, momentFormat_year) || (event.year || '');
                    const formattedDate_endYear = fmt(endM, momentFormat_year) || (event.year || '');

                    // -------------------------------
                    // Call out Time (PHP 'g:i a')
                    const momentFormat_time = phpToMomentFormat(params.callout_time_format || 'g:i a');
                    const formattedDate_startTime = fmt(startM, momentFormat_time) || (event.callout_start_time || '');
                    const formattedDate_endTime = fmt(endM, momentFormat_time) || (event.callout_end_time || '');

                    // -------------------------------
                    // Call out Day-of-week (PHP 'D' -> moment 'ddd' via phpToMomentFormat)
                    const DayFormat = phpToMomentFormat(params.callout_week_format || 'D');
                    const formattedDate_startDay = fmt(startM, DayFormat);
                    const formattedDate_endDay = fmt(endM, DayFormat);

                    // -------------------------------
                    // Date Details (PHP 'F d, Y')
                    const momentFormatDetails = phpToMomentFormat(params.date_details_format || 'F d, Y');
                    const shortenOn = params.shorten_multidate === 'on' || params.shorten_multidate === 'true';
                    const isMultidayDetails = startM && endM && startM.isValid() && endM.isValid() && !startM.isSame(endM, 'day');
                    let formattedDate_startDate_Details = fmt(startM, momentFormatDetails) || (event.date || event.callout_start_date || '');
                    let formattedDate_endDate_Details = fmt(endM, momentFormatDetails) || (event.callout_end_date || '');
                    if (shortenOn && isMultidayDetails) {
                        if (params.start_date_format) {
                            formattedDate_startDate_Details = fmt(startM, phpToMomentFormat(params.start_date_format));
                        } else if (startM.year() === endM.year()) {
                            formattedDate_startDate_Details = fmt(startM, deriveShortenedStartMomentFormat(params.date_details_format || 'F d, Y', false));
                        } else {
                            formattedDate_startDate_Details = fmt(startM, deriveShortenedStartMomentFormat(params.date_details_format || 'F d, Y', true));
                        }
                        if (startM.format('MMM YYYY') === endM.format('MMM YYYY')) {
                            formattedDate_endDate_Details = fmt(endM, params.date_details_format ? phpToMomentFormat(params.date_details_format) : 'D, YYYY');
                        } else {
                            formattedDate_endDate_Details = fmt(endM, params.date_details_format ? phpToMomentFormat(params.date_details_format) : 'MMM D, YYYY');
                        }
                    }

                    // -------------------------------
                    // Time Details (PHP 'g:i a')
                    const momentFormat_timeDetails = phpToMomentFormat(params.details_time_format || 'g:i a');
                    const formattedDate_startTimeDetails = fmt(startM, momentFormat_timeDetails) || (event.callout_start_time || '');
                    const formattedDate_endTimeDetails = fmt(endM, momentFormat_timeDetails) || (event.callout_end_time || '');

                    var newSss = wp.i18n._x('Organizer', 'decm-divi-event-calendar-module');
                    // console.log(newSss);
                    var classClout = getCalloutBoxClass(params.layout, event, params.show_feature_image, params.layout_type);
                    var isAllDay = event.is_all_day || false;
                    var allDayText = event.all_day_text || __t('All Day Event');
                    
                    // Check if dates and times are the same
                    var isSameDate = false;
                    var isSameTime = false;
                    if (startM && endM && startM.isValid() && endM.isValid()) {
                        isSameDate = startM.format('YYYY-MM-DD') === endM.format('YYYY-MM-DD');
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

                    // Get column values - handle empty strings properly (empty string should not fallback)
                    var columnsDesktop;
                    var columnsTablet;
                    var columnsPhone;
                    if (isListLayout) {
                        columnsDesktop = (params.list_columns_desktop && params.list_columns_desktop !== '' && params.list_columns_desktop !== undefined)
                            ? params.list_columns_desktop
                            : ((params.list_columns && params.list_columns !== '' && params.list_columns !== undefined) ? params.list_columns : '1');
                        columnsTablet = (params.list_columns_tablet && params.list_columns_tablet !== '' && params.list_columns_tablet !== undefined)
                            ? params.list_columns_tablet
                            : columnsDesktop;
                        columnsPhone = (params.list_columns_phone && params.list_columns_phone !== '' && params.list_columns_phone !== undefined)
                            ? params.list_columns_phone
                            : columnsTablet;
                    } else {
                        columnsDesktop = (params.columns_desktop && params.columns_desktop !== '' && params.columns_desktop !== undefined)
                            ? params.columns_desktop
                            : ((params.columns && params.columns !== '' && params.columns !== undefined) ? params.columns : '3');
                        columnsTablet = (params.columns_tablet && params.columns_tablet !== '' && params.columns_tablet !== undefined)
                            ? params.columns_tablet
                            : columnsDesktop;
                        columnsPhone = (params.columns_phone && params.columns_phone !== '' && params.columns_phone !== undefined)
                            ? params.columns_phone
                            : columnsTablet;
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
                    const { __ } = wp.i18n;
                    var mainLayoutStyle = '';
                    if (params.layout === 'cover') {
                        mainLayoutStyle = ' style="position: relative; z-index: 3;"';
                    } else if (params.layout === 'list') {
                        mainLayoutStyle = ' style="grid-template-columns: ' + buildListLayoutGridColumns(layoutType, params) + ';"';
                    }
                    eventHtml += '<div class="main-layout-container"' + mainLayoutStyle + '>';

                    // eventHtml += '<span>' + __t(datee, 'decm-divi-event-calendar-module') + '</span>';
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
                                eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
                                if (params.show_callout_box_date_range === 'off') {
                                    eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                                } else {
                                    if (isAllDay) {
                                        eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                                    } else {
                                        if (!isSameDate) {
                                            eventHtml += (params.date_format !== ''
                                                ? ((formattedDate_startDate || fallbackStartDay) + ' - ' + (formattedDate_endDate || fallbackEndDay))
                                                : (fallbackStartDay + ' - ' + fallbackEndDay));
                                        } else {
                                            eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                                        }
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Month
                            if (params.show_callout_box_month === 'on') {
                                eventHtml += '<div class="event-month">';
                                if (params.show_callout_month_range === 'off') {
                                    eventHtml += (params.callout_month_format !== '' ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth));
                                } else {
                                    if (isAllDay) {
                                        eventHtml += (params.callout_month_format !== '' ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth));
                                    } else {
                                        eventHtml += (params.callout_month_format !== ''
                                            ? ((formattedDate_startMonth || event.month || '') + ' - ' + (formattedDate_endMonth || event.month || ''))
                                            : (event.month_range || ((formattedDate_startMonth || '') + ' - ' + (formattedDate_endMonth || ''))));
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Day of Week
                            if (params.callout_day_of_the_week === 'on') {
                                eventHtml += '<div class="event-day-of-week">';
                                if (params.show_callout_day_of_week_range === 'off') {
                                    eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : formattedDate_startDay);
                                } else {
                                    if (isAllDay) {
                                        eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : formattedDate_startDay);
                                    } else {
                                        eventHtml += (params.callout_week_format !== ''
                                            ? (formattedDate_startDay + ' - ' + formattedDate_endDay)
                                            : (formattedDate_startDay + ' - ' + formattedDate_endDay));
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Year
                            if (params.show_callout_box_year === 'on') {
                                eventHtml += '<div class="event-year">';
                                if (params.show_callout_year_range === 'off') {
                                    eventHtml += (params.callout_year_format !== '' ? formattedDate_startYear : (event.year || formattedDate_startYear));
                                } else {
                                    if (isAllDay) {
                                        eventHtml += (params.callout_year_format !== '' ? formattedDate_startYear : (event.year || formattedDate_startYear));
                                    } else {
                                        eventHtml += (params.callout_year_format !== ''
                                            ? (formattedDate_startYear + ' - ' + formattedDate_endYear)
                                            : ((event.year || formattedDate_startYear) + ' - ' + (event.year || formattedDate_endYear)));
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Time - only show if not all-day event
                            if (params.show_callout_box_starttime === 'on' && !isAllDay) {
                                eventHtml += '<div class="event-time">';
                                if (params.show_callout_time_range === 'off') {
                                    eventHtml += (params.callout_time_format !== '' ? formattedDate_startTime : (event.callout_start_time || formattedDate_startTime));
                                } else {
                                    if (!(isSameDate && isSameTime)) {
                                        eventHtml += (params.callout_time_format !== ''
                                            ? (formattedDate_startTime + ' - ' + formattedDate_endTime)
                                            : ((event.callout_start_time || formattedDate_startTime) + ' - ' + (event.callout_end_time || formattedDate_endTime)));
                                    } else {
                                        eventHtml += (params.callout_time_format !== '' ? formattedDate_startTime : (event.callout_start_time || formattedDate_startTime));
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            eventHtml += '</div></div>';
                        }
                    }

                    // Image Column
                    // console.log(event.event_url)
                    const imageColumnClass = layoutType.includes('calloutOnImage') ? 'with-callout-overlay' : 'image-only';
                    eventHtml += '<div class="image-column ' + imageColumnClass + '">';
                    // Check if image has src attribute for grid and list layouts only
                    const hasImageSrc = event.image && (event.image.match(/src=["']([^"']+)["']/) || event.image.match(/src=([^\s>]+)/));
                    const isGridOrList = params.layout === 'grid' || params.layout === 'list';
                    const hasImage = event.image && isFeatureImageOn(params.show_feature_image) && (isGridOrList ? hasImageSrc : true);
                    const imageAlignClass = hasImage ? 'image-align ' : '';
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
                    }

                    // In-image callout
                    if (['calloutOnImage_Datail', 'calloutOnImage_Datail_button'].includes(layoutType)) {
                        if (params.show_callout_box === 'on') {
                            eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';

                            if (params.show_callout_box_date === 'on' && params.show_callout_box_date_range === 'off') {
                            eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
                            eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                            eventHtml += '</div>';
                        }
                        if (params.show_callout_box_date === 'on' && params.show_callout_box_date_range === 'on') {
                            eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
                            if (isAllDay) {
                                eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                            } else {
                                if (!isSameDate) {
                                    eventHtml += (params.date_format !== '' ? ((formattedDate_startDate || fallbackStartDay) + '-' + (formattedDate_endDate || fallbackEndDay)) : (fallbackStartDay + '-' + fallbackEndDay));
                                } else {
                                    eventHtml += (params.date_format !== '' ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay);
                                }
                            }
                            eventHtml += '</div>';
                        }

                        // Callout Month (single or range)
                        if (params.show_callout_box_month === 'on' && params.show_callout_month_range === 'off') {
                            eventHtml += '<div class="event-month ' + (params.show_callout_box_month_class || '') + '">';
                            eventHtml += (params.callout_month_format !== '' ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth));
                            eventHtml += '</div>';
                        }
                        if (params.show_callout_box_month === 'on' && params.show_callout_month_range === 'on') {
                            eventHtml += '<div class="event-month ' + (params.show_callout_box_month_class || '') + '">';
                            if (isAllDay) {
                                eventHtml += (params.callout_month_format !== '' ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth));
                            } else {
                                eventHtml += (params.callout_month_format !== '' ? ((formattedDate_startMonth || event.month || '') + '-' + (formattedDate_endMonth || event.month || '')) : (event.month_range || ((formattedDate_startMonth || '') + '-' + (formattedDate_endMonth || ''))));
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
                                eventHtml += '<div class="callout-column">';
                                eventHtml += '<div class="' + params.show_callout_box_class + ' ' + classClout + '">';

                                // Date
                                if (params.show_callout_box_date === 'on') {
                                eventHtml += '<div class="event-day ' + (params.show_callout_box_date_class || '') + '">';
                                if (params.show_callout_box_date_range === 'off') {
                                    eventHtml += params.date_format ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay;
                                } else {
                                    if (isAllDay) {
                                        eventHtml += params.date_format ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay;
                                    } else {
                                        if (!isSameDate) {
                                            eventHtml += params.date_format ?
                                                ((formattedDate_startDate || fallbackStartDay) + ' - ' + (formattedDate_endDate || fallbackEndDay)) :
                                                (fallbackStartDay + ' - ' + fallbackEndDay);
                                        } else {
                                            eventHtml += params.date_format ? (formattedDate_startDate || fallbackStartDay) : fallbackStartDay;
                                        }
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Month
                            if (params.show_callout_box_month === 'on') {
                                eventHtml += '<div class="event-month">';
                                if (params.show_callout_month_range === 'off') {
                                    eventHtml += params.callout_month_format ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth);
                                } else {
                                    if (isAllDay) {
                                        eventHtml += params.callout_month_format ? (formattedDate_startMonth || event.month || '') : (event.month || formattedDate_startMonth);
                                    } else {
                                        eventHtml += params.callout_month_format ?
                                            ((formattedDate_startMonth || event.month || '') + ' - ' + (formattedDate_endMonth || event.month || '')) :
                                            (event.month_range || ((formattedDate_startMonth || '') + ' - ' + (formattedDate_endMonth || '')));
                                    }
                                }
                                eventHtml += '</div>';
                            }

                            // Day of Week
                            if (params.callout_day_of_the_week === 'on') {
                                eventHtml += '<div class="event-day-of-week">';
                                if (params.show_callout_day_of_week_range === 'off') {
                                    eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : formattedDate_startDay);
                                } else {
                                    if (isAllDay) {
                                        eventHtml += (params.callout_week_format !== '' ? formattedDate_startDay : formattedDate_startDay);
                                    } else {
                                        eventHtml += (params.callout_week_format !== ''
                                            ? (formattedDate_startDay + ' - ' + formattedDate_endDay)
                                            : (formattedDate_startDay + ' - ' + formattedDate_endDay));
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
                                            (formattedDate_startYear + ' - ' + formattedDate_endYear)
                                            : (event.year + ' - ' + event.year);
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
                                    eventHtml += params.callout_time_format ?
                                        (formattedDate_startTime + ' - ' + formattedDate_endTime)
                                        : (event.callout_start_time + ' - ' + event.callout_end_time);
                                }
                                eventHtml += '</span>';
                            }

                                eventHtml += '</div></div>';
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
                                eventHtml += '<span class="event__date_label ecs-detail-label"> ' + __t(dateLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
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
                    if (params.show_venue_details === "on" && event.venue) {
                        if (params.stack_event_d === 'off') {
                            eventHtml += '<span class="event__venue_value"> <em>' + (params.show_preposition_dividr === 'on' ? ' at ' : '') + '</em>' + event.venue + '</span>';
                        } else {
                            eventHtml += '<div class="event__venue ' + (params.stack_label_icon === 'on' ? 'stacked' : '') + ' ' + (params.show_label_icon || '') + '">';
                            eventHtml += '<div class="label-icon-line">';
                            if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon' || params.show_label_icon !== 'none') {
                                const venueLabel = (params.venue_detail_label === '' || params.venue_detail_label === 'Venue') ? 'Venue' : params.venue_detail_label;
                                eventHtml += '<span class="event__venue_label ecs-detail-label">' + __t(venueLabel) + (params.show_colon_label === 'on' ? ': ' : ' ') + '</span>';
                            }
                            eventHtml += '</div>';
                            eventHtml += '<span class="event__venue_value"> <em>' + (params.show_preposition_dividr === 'on' ? ' at ' : '') + '</em>' + event.venue + '</span>';
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
                            eventHtml += '<span class="event__location_value"> <em>' +
                                (params.show_preposition_dividr === 'on' ? ' at ' : '') + '</em>' +
                                event.location + '</span>';
                            eventHtml += '</div>';
                        }
                    }

                    // Organizer Details
                    // ---------- helpers ----------
                    function escHtml(s) {
                        return String(s ?? '')
                            .replace(/&/g, '&amp;')
                            .replace(/</g, '&lt;')
                            .replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;')
                            .replace(/'/g, '&#039;');
                    }

                    function isOn(v) {
                        return v === true || v === 'on' || v === 1 || v === '1' || v === 'yes' || v === 'true';
                    }

                    // normalize flags (supports a few possible param names you might be using)
                    const showOrganizerDetails = isOn(params.show_organizer_details);
                    const allowOrganizerLink =
                        isOn(params.organizer_link) ||
                        isOn(params.enable_org_link) ||
                        isOn(params.link_organizer); // any of these turn linking ON

                    const linkNewTab =
                        isOn(params.organizer_link_target_blank) ||
                        isOn(params.open_organizer_link_new_tab);

                    const linkNofollow = isOn(params.organizer_link_nofollow);

                    // returns display HTML for a single organizer object/string
                    function renderOrganizer(o) {
                        if (!o) return '';
                        if (typeof o === 'string') return escHtml(o);

                        // object form: { id, name, url }
                        const name = escHtml(o.name || '');
                        if (!name) return '';

                        // Only make it a link if linking is allowed AND we have a URL
                        if (allowOrganizerLink && o.url) {
                            const href = escHtml(o.url);
                            const target = linkNewTab ? ' target="_blank"' : '';
                            const rel =
                                linkNewTab || linkNofollow ? ` rel="${linkNofollow ? 'nofollow' : 'noopener noreferrer'}"` : '';
                            return `<a href="${href}" class="event__organizer_link"${target}${rel}>${name}</a>`;
                        }

                        // plain text when linking is off or url missing
                        return name;
                    }

                    // ---------- Organizer Details ----------
                    if (showOrganizerDetails) {
                        let organizerValue = '';

                        if (Array.isArray(event.organizers)) {
                            organizerValue = event.organizers.map(renderOrganizer).filter(Boolean).join(', ');
                        } else if (event.organizers && typeof event.organizers === 'object') {
                            organizerValue = renderOrganizer(event.organizers);
                        } else if (typeof event.organizers === 'string') {
                            organizerValue = escHtml(event.organizers);
                        }

                        const hasOrganizerValue = organizerValue && organizerValue.trim() !== '';
                        if (hasOrganizerValue) {
                            if (params.stack_event_d === 'off') {
                                eventHtml += `<span class="event__organizer_value"> ${organizerValue}</span>`;
                            } else {
                                const stackedClass = isOn(params.stack_label_icon) ? 'stacked' : '';
                                const labelIconClass = params.show_label_icon || '';
                                eventHtml += `<div class="event__organizer ${stackedClass} ${labelIconClass}">`;

                                // label row
                                eventHtml += `<div class="label-icon-line">`;
                                if (params.show_label_icon === 'label' || params.show_label_icon === 'label_icon') {
                                    // Get organizer label from params, always default to 'Organizer' if missing/empty
                                    let organizerLabel = params.organizer_detail_label || '';
                                    // console.log('=== LoadMore - Rendering Organizer Label ===');
                                    // console.log('params.show_label_icon:', params.show_label_icon);
                                    // console.log('organizerLabel before check:', organizerLabel);
                                    
                                    // Final safety check - ALWAYS ensure we have a valid label value
                                    if (!organizerLabel || organizerLabel === '' || organizerLabel === 'undefined' || String(organizerLabel).trim() === '') {
                                        organizerLabel = 'Organizer';
                                        // console.log('organizerLabel defaulted to Organizer');
                                    }
                                    
                                    const labelText = __t(organizerLabel);
                                    // console.log('Translated labelText:', labelText);
                                    const label = `${escHtml(labelText)}${params.show_colon_label === 'on' ? ':' : ''}`;
                                    // console.log('Final label HTML:', label);
                                    eventHtml += `<span class="event__organizer_label ecs-detail-label">${label}</span>`;
                                } else {
                                    // console.log('Organizer label NOT showing - show_label_icon is:', params.show_label_icon);
                                }
                                eventHtml += `</div>`;

                                // value
                                eventHtml += `<span class="event__organizer_value"> ${organizerValue}</span>`;
                                eventHtml += `</div>`;
                            }
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
                        const hasCategoryValue = categoryValue && categoryValue.trim() !== '';

                        if (hasCategoryValue) {
                            if (params.stack_event_d === 'off') {
                                eventHtml += '<span class="event__category_value"> <em>' +
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
                        const hasTagValue = tagValue && tagValue.trim() !== '';

                        if (hasTagValue) {
                            if (params.stack_event_d === 'off') {
                                eventHtml += '<span class="event__tag_value"> <em>' +
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

                    // Default Button
                    if (params.show_more_info === 'on') {
                        // Check for custom meta field first, then fall back to module setting
                        const buttonText = event.more_info_button_text || translateMoreInfoButtonText(params.show_more_info_btn_text);
                        const buttonAlign = getResponsiveButtonAlign(params);
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
                    allEventHtml += eventHtml;
                    // Append to container



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

                if (response.data.pagination.pagination_type === 'load_more') {
                    container.append(allEventHtml);
                } else {
                    container.html(allEventHtml);
                    container.append(hiddenF);
                    // Replace (not stack) any existing no-results message outside the container
                    container.siblings('.ecs-event-list.event-display_stylecover').remove();
                    if (noResultsMessage) {
                        container.after(noResultsMessage);
                    }
                }

                // Calculate equal heights for button align
                setTimeout(function() {
                    calculateEqualHeights(thiscontainer);
                }, 200);
                updatePagination(response.data.pagination, params, $(e).closest('.pagination-container'));
                responsiveLayoutSyncInProgress = false;
                if (responsiveLayoutSyncQueued) {
                    responsiveLayoutSyncQueued = false;
                    scheduleResponsiveLayoutSync(true);
                }
                // console.log(response.data.pagination);
            },
            error: function () {
                responsiveLayoutSyncInProgress = false;
                responsiveLayoutSyncQueued = false;
                alert(__t("AJAX error occurred!"));
            },
            complete: function () {
                // Use stored container — clicked button is replaced after updatePagination.
                setPaginationLoading($paginationContainer, false);
            }
        });
    }

    $(document).on('click', '.prev, .next, .dec-numeric a, .load-more-btn', function (e) {
        e.preventDefault();
        const button = $(this);
        if (button.closest('.pagination-container').hasClass('dec-pagination-is-loading')) {
            return;
        }
        if (button.hasClass('current') || button.attr('aria-current') === 'page') {
            return;
        }
        const hiddenF = $(this).closest('.pagination-container').siblings('.events-main__container').find('.hidden_feild');
        var page = $(this).data('page');
        
        // Get per_page from button data attribute, or from hidden field, or default to 3
        var per_page = $(this).data('per-page') || $(hiddenF).find('input[name="per_page"]').val() || 3;
        decm_get_event(button, page, per_page, hiddenF);
    });

    // Add this function to handle pagination
    function updatePagination(paginationData, params, $paginationContainer) {
        // Get the original per_page value from hidden fields (load_more_per_page setting)
        // This ensures we always use the correct value, not the modified params.per_page
        var container = $paginationContainer.siblings('.events-main__container');
        var hiddenFields = container.find('.hidden_feild');
        var originalPerPage = hiddenFields.find('input[name="per_page"]').val() || params.per_page || '3';
        
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
                    // Use the original per_page value from hidden fields (load_more_per_page setting)
                    // This ensures consistency across all load more clicks
                    // console.log('=== Update Pagination - Load More Per Page ===');
                    // console.log('originalPerPage (from hidden field):', originalPerPage);
                    // console.log('params.per_page:', params.per_page);
                    // console.log('Using:', originalPerPage);
                    // console.log('============================================');
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
                            data-per-page="${originalPerPage}">
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

    // Global listeners for responsive layout switching (resize + matchMedia for DevTools).
    var responsiveLayoutResizeTimeout;
    var responsiveLayoutSyncInProgress = false;
    var responsiveLayoutSyncQueued = false;

    function syncResponsiveEventFeedLayouts(forceRerender) {
        if (!window.decmEventDisplayResponsiveLayout) {
            return;
        }

        if (responsiveLayoutSyncInProgress) {
            responsiveLayoutSyncQueued = true;
            return;
        }

        var responsive = window.decmEventDisplayResponsiveLayout;
        var breakpoint = responsive.getScreenBreakpoint();
        var needsRerender = false;

        $('.decm_event_display, .event-display').each(function () {
            var $module = $(this);
            var $container = $module.find('.events-main__container').first();
            if (!$container.length) {
                return;
            }

            var params = responsive.readLayoutParamsFromContainer
                ? responsive.readLayoutParamsFromContainer($container)
                : {};

            if (!responsive.readLayoutParamsFromContainer) {
                $container.find('input.hidden-data-field').each(function () {
                    var $field = $(this);
                    params[$field.attr('name')] = $field.val() || '';
                });
            }

            responsive.applyResponsiveLayoutParams(params, breakpoint);
            var expectedLayout = params.layout;
            var currentLayout = responsive.getLayoutFromContainer($container);

            if (currentLayout !== expectedLayout || $container.attr('data-active-layout') !== expectedLayout) {
                var $paginationContainer = $module.find('.pagination-container').first();
                if ($paginationContainer.length) {
                    responsiveLayoutSyncInProgress = true;
                    needsRerender = true;
                    var hiddenF = $container.find('.hidden_feild');
                    decm_get_event($paginationContainer, 1, '', hiddenF);
                }
            }
        });

        if (!needsRerender) {
            responsiveLayoutSyncQueued = false;
        }
    }

    function scheduleResponsiveLayoutSync(forceRerender) {
        clearTimeout(responsiveLayoutResizeTimeout);
        responsiveLayoutResizeTimeout = setTimeout(function () {
            syncResponsiveEventFeedLayouts(forceRerender);
        }, 150);
    }

    syncResponsiveEventFeedLayouts(false);

    if (window.decmEventDisplayResponsiveLayout && window.decmEventDisplayResponsiveLayout.onBreakpointChange) {
        window.decmEventDisplayResponsiveLayout.onBreakpointChange(function () {
            scheduleResponsiveLayoutSync(true);
        });
    }

    $(window).on('resize orientationchange', function() {
        scheduleResponsiveLayoutSync(true);
    });

    var equalHeightsResizeTimeout;
    $(window).on('resize', function() {
        clearTimeout(equalHeightsResizeTimeout);
        equalHeightsResizeTimeout = setTimeout(function() {
            $('.events-main__container.button-align-enabled').each(function() {
                if (typeof calculateEqualHeights === 'function') {
                    calculateEqualHeights($(this));
                }
            });
        }, 150);
    });

});
