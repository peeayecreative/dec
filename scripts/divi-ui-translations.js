/**
 * Divi 5 UI Translation Fix
 * 
 * This script translates Divi 5 UI elements that are not properly
 * translated by React components. It uses wp.i18n with the 'et_builder_5' domain.
 * 
 * Based on the temporary fix that successfully translates UI elements.
 * 
 * @since ??
 */

(function() {
  'use strict';

  /**
   * Translate a single text node
   * 
   * @param {Text} textNode - The text node to translate
   * @param {string} domain - The text domain (defaults to 'et_builder_5')
   */
  function translateTextNode(textNode, domain) {
    domain = domain || 'et_builder_5';
    
    if (!textNode || !textNode.textContent || !window.wp?.i18n) {
      return;
    }

    const originalText = textNode.textContent.trim();
    if (!originalText) {
      return;
    }

    const translated = window.wp.i18n.__(originalText, domain);
    
    // Only update if translation is different from original
    if (translated !== originalText) {
      textNode.textContent = translated;
    }
  }

  /**
   * Translate all text nodes within an element
   * 
   * @param {HTMLElement} element - The element to translate
   * @param {string} domain - The text domain (defaults to 'et_builder_5')
   */
  function translateElement(element, domain) {
    domain = domain || 'et_builder_5';
    
    if (!element || !window.wp?.i18n) {
      return;
    }

    // Create a tree walker to find all text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes = [];
    let node;
    
    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
        textNodes.push(node);
      }
    }

    // Translate each text node
    textNodes.forEach(function(textNode) {
      translateTextNode(textNode, domain);
    });
  }

  /**
   * Translate element attributes (title, aria-label, placeholder, etc.)
   * 
   * @param {HTMLElement} element - The element to translate
   * @param {string[]} attributes - Array of attribute names to translate
   * @param {string} domain - The text domain (defaults to 'et_builder_5')
   */
  function translateElementAttributes(element, attributes, domain) {
    domain = domain || 'et_builder_5';
    attributes = attributes || ['title', 'aria-label', 'placeholder', 'alt', 'data-tooltip'];
    
    if (!element || !window.wp?.i18n) {
      return;
    }

    attributes.forEach(function(attr) {
      const value = element.getAttribute(attr);
      if (value && value.trim()) {
        const translated = window.wp.i18n.__(value, domain);
        if (translated !== value) {
          element.setAttribute(attr, translated);
        }
      }
    });
  }

  /**
   * Translate all Divi UI elements in the document
   * 
   * @param {string} domain - The text domain (defaults to 'et_builder_5')
   */
  function translateDiviUI(domain) {
    domain = domain || 'et_builder_5';
    
    if (!window.wp?.i18n) {
      return;
    }

    // Selectors for common Divi UI elements that need translation
    const selectors = [
      '[data-et-module]',
      '.et-fb-module',
      '.et-fb-option',
      '.et-fb-tooltip',
      '.et-fb-menu-item',
      '.et-fb-button',
      '[class*="et-fb"]',
      '[class*="et-builder"]'
    ];

    selectors.forEach(function(selector) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function(el) {
          translateElement(el, domain);
          translateElementAttributes(el, null, domain);
        });
      } catch (e) {
        // Silently ignore selector errors
        console.warn('Translation selector error:', e);
      }
    });
  }

  /**
   * Initialize translation observer for dynamically added content
   */
  function initTranslationObserver() {
    if (!window.MutationObserver || !window.wp?.i18n) {
      return;
    }

    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Translate the new element
            translateElement(node, 'et_builder_5');
            translateElementAttributes(node, null, 'et_builder_5');
          } else if (node.nodeType === Node.TEXT_NODE) {
            // Translate text nodes directly
            translateTextNode(node, 'et_builder_5');
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return observer;
  }

  /**
   * Initialize translations when DOM is ready
   */
  function init() {
    // Wait for wp.i18n to be available
    if (!window.wp?.i18n) {
      // Try again after a short delay
      setTimeout(init, 100);
      return;
    }

    // Translate existing content
    if (document.body) {
      translateDiviUI('et_builder_5');
    } else {
      // Wait for body to be available
      document.addEventListener('DOMContentLoaded', function() {
        translateDiviUI('et_builder_5');
        initTranslationObserver();
      });
    }

    // Set up observer for dynamic content
    if (document.body) {
      initTranslationObserver();
    }
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

  // Also run on window load to catch late-rendered content
  window.addEventListener('load', function() {
    setTimeout(function() {
      translateDiviUI('et_builder_5');
    }, 100);
  });

})();

