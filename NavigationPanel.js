/**
 * Copyright (c) 2020-2021 Douglas Silva
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

function NavigationPanel(buttonSelector, options) {
    this.button = document.querySelector(buttonSelector);
    this.panel = document.querySelector(this.button.dataset.target);
    this.options = options;
    this.handler = {};

    this.button.addEventListener('click', (event) => {
        event.stopPropagation();

        if (this.isExpanded()) {
            this.hide();
        } else {
            this.show();
        }
    });
}

NavigationPanel.prototype.show = function() {
    if (this.isTransitioning()) {
        return false;
    }

    this.panel.classList.add('np-expanded');

    var targetSize;

    if (this.options.fullscreen === true) {
        targetSize = '100%';
    } else {
        // Get the target element's size
        if (this.options.verticalTransition === true) {
            targetSize = this.panel.offsetHeight + 'px';
        } else {
            targetSize = this.panel.offsetWidth + 'px';
        }
    }

    // Enable the transition and set height to 0
    if (this.options.verticalTransition === true) {
        this.panel.classList.add('np-transitioning-height');
    } else {
        this.panel.classList.add('np-transitioning-width');
    }

    // Force a reflow
    this.panel.offsetHeight;

    // Set the target width or height to trigger the transition effect
    if (this.options.verticalTransition === true) {
        this.panel.style.height = targetSize;
    } else {
        this.panel.style.width = targetSize;
    }

    this.panel.addEventListener('transitionend', () => {
        if (this.options.verticalTransition === true) {
            this.panel.classList.remove('np-transitioning-height');
        } else {
            this.panel.classList.remove('np-transitioning-width');
        }

        this.button.setAttribute('aria-expanded', true);

        // Create and fire custom 'show' event
        var showEvent = new Event('np-show');
        this.panel.dispatchEvent(showEvent);
    }, {once: true});

    this.addEphemeralEvents();
};

NavigationPanel.prototype.hide = function() {
    /*
     * Both the panel and the button can be hidden with CSS at certain viewport sizes. Under that
     * condition our CSS transition should never fire. If it does, the panel
     * will be locked forever in a 'transition' state and it will not work until
     * the user reloads the page. This prevents that from ever happening.
     */
    var panelVisibility = getComputedStyle(this.panel).display;
    var buttonVisibility = getComputedStyle(this.button).display;

    if (panelVisibility === 'none' || buttonVisibility === 'none') {
        return false;
    }

    if (this.isTransitioning()) {
        return false;
    }

    // Add the transition effect
    if (this.options.verticalTransition === true) {
        this.panel.classList.add('np-transitioning-height');
    } else {
        this.panel.classList.add('np-transitioning-width');
    }

    // Remove inline styles so the 'np-transitioning' classes can trigger a transition to 0
    if (this.options.verticalTransition === true) {
        this.panel.style.height = '';
    } else {
        this.panel.style.width = '';
    }

    this.panel.addEventListener('transitionend', () => {
        if (this.options.verticalTransition === true) {
            this.panel.classList.remove('np-transitioning-height');
        } else {
            this.panel.classList.remove('np-transitioning-width');
        }

        this.panel.classList.remove('np-expanded');
        this.button.setAttribute('aria-expanded', false);

        // Create and fire custom 'hide' event
        var hideEvent = new Event('np-hide');
        this.panel.dispatchEvent(hideEvent);
    }, {once: true});

    this.removeEphemeralEvents();
};

/**
 * Enables event listeners used when the panel is expanded.
 */
NavigationPanel.prototype.addEphemeralEvents = function() {
    this.handler.documentClick = (event) => {
        /*
         * Any clicks that bubble up to the document will cause the panel
         * to collapse.
         */
        this.hide();
    }

    this.handler.escapeKey = (event) => {
        if (event.key !== 'Escape') {
            return false;
        }

        this.hide();

        // Return focus to the button when the panel collapses
        this.button.focus();
    }

    this.handler.arrowsOnButton = (event) => {
        let panelItems = this.panel.querySelectorAll('a');

        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
            return false;
        }

        event.preventDefault();

        // Focus on the first panel item
        panelItems.item(0).focus();
    }

    this.handler.keyboardNavigation = (event) => {
        let panelItems = this.panel.querySelectorAll('a');
        var pointer;

        // Set the pointer to the index of the currently focused item
        panelItems.forEach((item, index) => {
            if (item === document.activeElement) {
                pointer = index;
            }
        });

        if (event.key === 'ArrowUp') {
            event.preventDefault();

            // Can't go up any further if this is the first item
            if (pointer === 0) {
                return false;
            }

            pointer--;
            panelItems.item(pointer).focus();
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();

            // Can't go down any further if this is the last item
            if (pointer === panelItems.length - 1) {
                return false;
            }

            pointer++;
            panelItems.item(pointer).focus();
        }
    }

    this.handler.panelItemsClick = (event) => {
        event.stopPropagation();
    }

    this.handler.documentKeyUp = (event) => {
        /*
         * TAB key events.
         *
         * This is responsible for collapsing the panel when keyboard focus
         * leaves any of the navigation panel elements.
         */
        let panelItems = this.panel.querySelectorAll('a');

        if (event.key !== 'Tab') {
            return false;
        }

        if (document.activeElement === this.button || document.activeElement === this.panel) {
            return false;
        }

        var isPanelItemFocused = false;

        panelItems.forEach((item) => {
            if (item === document.activeElement) {
                isPanelItemFocused = true;
            }
        });

        if (isPanelItemFocused) {
            return false;
        }

        this.hide();
    }

    this.handler.documentKeyDown = (event) => {
        /*
         * Ignore TAB key events during a transition.
         *
         * Since a 'keyup' event is too late for preventDefault() to make any
         * difference, this handler should be bound to a keydown listener.
         */
        if (event.key !== 'Tab') {
            return false;
        }

        if (!this.isTransitioning()) {
            return false;
        }

        event.preventDefault();
    }

    this.handler.windowOnResize = (event) => {
        this.hide();
    }

    document.addEventListener('click', this.handler.documentClick);
    this.button.addEventListener('keydown', this.handler.escapeKey);
    this.panel.addEventListener('keydown', this.handler.escapeKey);
    this.button.addEventListener('keydown', this.handler.arrowsOnButton);
    this.panel.addEventListener('keydown', this.handler.keyboardNavigation);
    this.panel.addEventListener('click', this.handler.panelItemsClick);
    document.addEventListener('keyup', this.handler.documentKeyUp);
    document.addEventListener('keydown', this.handler.documentKeyDown);

    if (this.options.closeOnResize === true) {
        window.addEventListener('resize', this.handler.windowOnResize);
    }
};

/**
 * Disables event listeners added by addEphemeralEvents.
 */
NavigationPanel.prototype.removeEphemeralEvents = function() {
    document.removeEventListener('click', this.handler.documentClick);
    this.button.removeEventListener('keydown', this.handler.escapeKey);
    this.panel.removeEventListener('keydown', this.handler.escapeKey);
    this.button.removeEventListener('keydown', this.handler.arrowsOnButton);
    this.panel.removeEventListener('keydown', this.handler.keyboardNavigation);
    this.panel.removeEventListener('click', this.handler.panelItemsClick);
    document.removeEventListener('keyup', this.handler.documentKeyUp);
    document.removeEventListener('keydown', this.handler.documentKeyDown);

    if (this.options.closeOnResize === true) {
        window.removeEventListener('resize', this.handler.windowOnResize);
    }
};

NavigationPanel.prototype.isExpanded = function() {
    if (this.panel.classList.contains('np-expanded')) {
        return true;
    }

    return false;
};

/**
 * Detect a CSS transition in progress.
 */
NavigationPanel.prototype.isTransitioning = function() {
    if (this.panel.classList.contains('np-transitioning-height') || this.panel.classList.contains('np-transitioning-width')) {
        return true;
    }

    return false;
};

export { NavigationPanel };

