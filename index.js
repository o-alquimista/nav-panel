/**
 * Copyright (c) 2020 Douglas Silva
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

const $ = require('jquery');

/**
 * A collapsible navigation panel for web pages.
 */
class NavigationPanel {
  constructor() {
    /**
     * All toggle buttons on the current page.
     */
    this.buttons = $('.np-toggle');

    /**
     * The currently selected toggle button.
     */
    this.button;

    /**
     * The target collapsible element of the currently selected toggle.
     */
    this.target;

    /**
     * All focusable items within the panel corresponding to the current target.
     */
    this.panelItems;

    /**
     * This boolean indicates whether the navigation panel was ever toggled.
     *
     * This is useful to prevent access to properties such as 'button' and
     * 'target', which are undefined until the first toggle is made.
     */
    this.initialized = false;

    /**
     * Fullscreen mode.
     *
     * If true, the target width or height will be set to 100%. If false, that
     * will be determined from the original dimensions of the target element.
     */
    this.fullscreen;

    /**
     * Vertical transition mode.
     *
     * If true, height will be used for the transitions. If false, width is
     * used.
     */
    this.verticalTransition;

    this.keycode = {
      escape: 27,
      tab: 9,
      arrowUp: 38,
      arrowDown: 40
    };

    this.event = {
      namespace: '.navpanel',
      get click() {
        return 'click' + this.namespace;
      },
      get keyup() {
        return 'keyup' + this.namespace;
      },
      get keydown() {
        return 'keydown' + this.namespace;
      }
    };
  }

  setup() {
    var navPanel = this;

    this.buttons.each(function() {
      $(this).click(function(event) {
        event.stopPropagation();

        // If another navigation panel was left open, this will close it
        if (navPanel.initialized === true && navPanel.isExpanded()) {
          navPanel.hide();
        }

        let target = $(this).data('target');
        let fullscreen = $(this).data('fullscreen');
        let verticalTransition = $(this).data('verticalTransition');

        navPanel.target = $(target);
        navPanel.fullscreen = fullscreen;
        navPanel.verticalTransition = verticalTransition;
        navPanel.panelItems = navPanel.target.find('a');
        navPanel.button = $(this);

        if (navPanel.initialized === false) {
          navPanel.initialized = true;
        }

        navPanel.toggle();
      });
    });
  }

  toggle() {
    if (this.isTransitioning()) {
      return;
    }

    if (this.isExpanded()) {
      this.hide();
    } else {
      this.show();
    }
  }

  hide() {
    /*
     * The panel may be hidden via CSS at certain viewport sizes. In those
     * situations, our CSS transition will never fire. If the event listener
     * for 'transitionend' below is never executed, the panel will be locked
     * in a 'transition' state and it will not work until the user reloads
     * the page. This prevents that from ever happening.
     */
    if (this.target.is(':hidden')) {
      return;
    }

    // Add the transition effect
    if (this.verticalTransition) {
      this.target.addClass('np-transitioning-height');
    } else {
      this.target.addClass('np-transitioning-width');
    }

    // Maintain visibility of the item during transition
    this.target.removeClass('np-collapsible');
    this.target.removeClass('np-expanded');

    // Reset the width or height so the 'np-transitioning' classes can set it to zero
    if (this.verticalTransition) {
      this.target.height('');
    } else {
      this.target.width('');
    }

    this.target.one("transitionend", () => {
      if (this.verticalTransition) {
        this.target.removeClass('np-transitioning-height');
      } else {
        this.target.removeClass('np-transitioning-width');
      }

      this.target.addClass('np-collapsible');
      this.button.attr('aria-expanded', false);
    });

    this.removeEphemeralEvents();
  }

  show() {
    var targetSize;

    if (this.fullscreen) {
      targetSize = '100%';
    } else {
      // Get the collapsible element's size in pixels and convert it to rem units
      if (this.verticalTransition) {
        targetSize = this.target.height() / 16 + 'rem';
      } else {
        targetSize = this.target.width() / 16 + 'rem';
      }
    }

    // Restore target element visibility
    this.target.removeClass('np-collapsible');

    // Apply transition
    if (this.verticalTransition) {
      this.target.addClass('np-transitioning-height');
    } else {
      this.target.addClass('np-transitioning-width');
    }

    // Set the width or height to trigger the transition effect
    if (this.verticalTransition) {
      this.target.height(targetSize);
    } else {
      this.target.width(targetSize);
    }

    this.target.one("transitionend", () => {
      if (this.verticalTransition) {
        this.target.removeClass('np-transitioning-height');
      } else {
        this.target.removeClass('np-transitioning-width');
      }

      this.target.addClass('np-collapsible');
      this.target.addClass('np-expanded');
      this.button.attr('aria-expanded', true);
    });

    this.addEphemeralEvents();
  }

  addEphemeralEvents() {
    $(document).on(this.event.click, () => {
      /*
       * Any clicks that bubble up to the document will cause the panel
       * to collapse.
       */
      if (this.isTransitioning()) {
        return;
      }

      this.hide();
    });

    this.button.add(this.panelItems).keydown((event) => {
      if (event.which != this.keycode.escape) {
        return;
      }

      if (this.isTransitioning()) {
        return;
      }

      this.hide();

      // Return focus to the button when the panel collapses
      this.button.focus();
    });

    this.button.keydown((event) => {
      if (event.which != this.keycode.arrowUp && event.which != this.keycode.arrowDown) {
        return;
      }

      event.preventDefault();
      this.panelItems.first().focus();
    });

    this.panelItems.keydown((event) => {
      /*
       * Keyboard navigation through panel items using arrow keys.
       */
      var index;
      var navPanel = this;

      this.panelItems.each(function() {
        var item = $(this);

        // Determine index of currently focused item
        if (item.is(document.activeElement)) {
          index = navPanel.panelItems.index(item);
        }
      });

      if (event.which == this.keycode.arrowUp) {
        event.preventDefault();

        if (index === 0) {
          return;
        }

        index--;
        this.panelItems.eq(index).focus();
      }

      if (event.which == this.keycode.arrowDown) {
        event.preventDefault();

        if (index === this.panelItems.length) {
          return;
        }

        index++;
        this.panelItems.eq(index).focus();
      }
    });

    this.panelItems.click(function(event) {
      event.stopPropagation();
    });

    $(document).on(this.event.keyup, (event) => {
      /*
       * TAB key events.
       *
       * This is responsible for collapsing the panel when keyboard focus
       * leaves any of the navigation panel elements.
       */
      if (event.which != this.keycode.tab) {
        return;
      }

      if (this.isTransitioning()) {
        return;
      }

      var focused = $(document.activeElement);

      if (focused.is(this.button) || focused.is(this.panelItems) || focused.is(this.target)) {
        return;
      }

      this.hide();
    });

    $(document).on(this.event.keydown, (event) => {
      /*
       * TAB key events that prevent the default action during a transition.
       *
       * Since a 'keyup' event is too late for preventDefault() to make any
       * difference, this handler should be bound to a keydown listener.
       */
      if (event.which != this.keycode.tab) {
        return;
      }

      if (!this.isTransitioning()) {
        return;
      }

      event.preventDefault();
    });
  }

  removeEphemeralEvents() {
    $(document).off(this.event.namespace);
    this.button.off('keydown');
    this.panelItems.off('keydown click');
  }

  /**
   * Detect a CSS transition in progress.
   *
   * This can be used to prevent glitchy behavior.
   */
  isTransitioning() {
    if (this.target.hasClass('np-transitioning-height') || this.target.hasClass('np-transitioning-width')) {
      return true;
    }

    return false;
  }

  /**
   * Check if the navigation panel is activated/expanded.
   */
  isExpanded() {
    if (this.target.hasClass('np-expanded')) {
      return true;
    }

    return false;
  }
}

module.exports = NavigationPanel;
