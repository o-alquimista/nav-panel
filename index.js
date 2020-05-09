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

class NavigationPanel {
    constructor() {
        /**
         * All toggle buttons on the current page.
         */
        this.buttons = document.querySelectorAll('.np-toggle');

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

        /**
         * Close on window resize.
         *
         * An optional feature that causes the panel to close when the browser
         * window is resized.
         */
        this.closeOnResize;

        this.keycode = {
            escape: 27,
            tab: 9,
            arrowUp: 38,
            arrowDown: 40
        };

        this.handler = {
            buttonClick: undefined,
            transitionShowEnd: undefined,
            transitionHideEnd: undefined,
            documentClick: undefined,
            escapeKey: undefined,
            arrowsOnButton: undefined,
            keyboardNavigation: undefined,
            panelItemsClick: undefined,
            documentKeyUp: undefined,
            documentKeyDown: undefined,
            windowOnResize: undefined
        };
    }

    setup() {
        this.handler.buttonClick = (event) => {
            event.stopPropagation();

            // If another navigation panel was left open, this will close it
            if (this.initialized === true && this.isExpanded()) {
                this.hide();
            }

            this.button = document.querySelector(event.target);
            this.target = document.querySelector(this.button.dataset.target);
            this.fullscreen = this.button.dataset.fullscreen;
            this.verticalTransition = this.button.dataset.verticalTransition;
            this.closeOnResize = this.button.dataset.closeOnResize;
            this.panelItems = this.target.querySelectorAll('a');

            if (this.initialized === false) {
                this.initialized = true;
            }

            this.toggle();
        }

        this.buttons.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.addEventListener('click', this.handler.buttonClick, false);
            }
        );
    }

    toggle() {
        if (this.isExpanded()) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Check if the navigation panel is activated/expanded.
     */
    isExpanded() {
        if (this.target.classList.contains('np-expanded')) {
            return true;
        }

        return false;
    }

    show() {
        if (this.isTransitioning()) {
            return;
        }

        var targetSize;

        if (this.fullscreen) {
            targetSize = '100%';
        } else {
            // Get the collapsible element's size
            if (this.verticalTransition) {
                targetSize = this.target.offsetHeight + 'px';
            } else {
                targetSize = this.target.offsetWidth + 'px';
            }
        }

        // Restore target element visibility
        this.target.classList.remove('np-collapsible');

        // Apply transition
        if (this.verticalTransition) {
            this.target.classList.add('np-transitioning-height');
        } else {
            this.target.classList.add('np-transitioning-width');
        }

        // Set the width or height to trigger the transition effect
        if (this.verticalTransition) {
            this.target.style.height = targetSize;
        } else {
            this.target.style.width = targetSize;
        }

        this.handler.transitionShowEnd = (event) => {
            if (this.verticalTransition) {
                this.target.classList.remove('np-transitioning-height');
            } else {
                this.target.classList.remove('np-transitioning-width');
            }

            this.target.classList.add('np-collapsible');
            this.target.classList.add('np-expanded');
            this.button.setAttribute('aria-expanded', true);

            // Create and fire custom 'show' event
            var showEvent = new Event('show');
            this.target.dispatchEvent(showEvent);
        }

        this.target.addEventListener('transitionend', this.handler.transitionShowEnd, {once: true});
        this.addEphemeralEvents();
    }

    hide() {
        /*
         * The panel may be hidden with CSS at certain viewport sizes. In those
         * conditions our CSS transition should never fire. If it does, the panel
         * will be locked in a 'transition' state and it will not work until the
         * user reloads the page. This prevents that from ever happening.
         */
        var visibility = getComputedStyle(this.target).display;

        if (visibility == 'none') {
            return;
        }

        if (this.isTransitioning()) {
            return;
        }

        // Add the transition effect
        if (this.verticalTransition) {
            this.target.classList.add('np-transitioning-height');
        } else {
            this.target.classList.add('np-transitioning-width');
        }

        // Maintain visibility of the item during transition
        this.target.classList.remove('np-collapsible');
        this.target.classList.remove('np-expanded');

        // Reset the width or height so the 'np-transitioning' classes can set it to zero
        if (this.verticalTransition) {
            this.target.style.height = '';
        } else {
            this.target.style.width = '';
        }

        this.handler.transitionHideEnd = (event) => {
            if (this.verticalTransition) {
                this.target.classList.remove('np-transitioning-height');
            } else {
                this.target.classList.remove('np-transitioning-width');
            }

            this.target.classList.add('np-collapsible');
            this.button.setAttribute('aria-expanded', false);

            // Create and fire custom 'hide' event
            var hideEvent = new Event('hide');
            this.target.dispatchEvent(hideEvent);
        }

        this.target.addEventListener('transitionend', this.handler.transitionHideEnd, {once: true});
        this.removeEphemeralEvents();
    }

    /**
     * Detect a CSS transition in progress.
     *
     * This can be used to prevent glitchy behavior.
     */
    isTransitioning() {
        if (this.target.classList.contains('np-transitioning-height') || this.target.classList.contains('np-transitioning-width')) {
            return true;
        }

        return false;
    }

    addEphemeralEvents() {
        this.handler.documentClick = (event) => {
            /*
             * Any clicks that bubble up to the document will cause the panel
             * to collapse.
             */
            this.hide();
        }

        this.handler.escapeKey = (event) => {
            if (event.which != this.keycode.escape) {
                return;
            }

            this.hide();

            // Return focus to the button when the panel collapses
            this.button.focus();
        }

        this.handler.arrowsOnButton = (event) => {
            if (event.which != this.keycode.arrowUp && event.which != this.keycode.arrowDown) {
                return;
            }

            event.preventDefault();

            // Focus on the first panel item
            this.panelItems.item(0).focus();
        }

        this.handler.keyboardNavigation = (event) => {
            /*
             * Keyboard navigation through panel items using arrow keys.
             */
            var index;

            // Determine index of currently focused item
            this.panelItems.forEach(
                (currentValue, currentIndex, listObj) => {
                    if (currentValue == document.activeElement) {
                        index = currentIndex;
                    }
                }
            );

            if (event.which == this.keycode.arrowUp) {
                event.preventDefault();

                if (index == 0) {
                    return;
                }

                index--;
                this.panelItems.item(index).focus();
            }

            if (event.which == this.keycode.arrowDown) {
                event.preventDefault();

                if (index == this.panelItems.length) {
                    return;
                }

                index++;
                this.panelItems.item(index).focus();
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
            if (event.which != this.keycode.tab) {
                return;
            }

            if (document.activeElement == this.button || document.activeElement == this.target) {
                return;
            }

            var isPanelItemFocused = false;

            this.panelItems.forEach(
                (currentValue, currentIndex, listObj) => {
                    if (currentValue == document.activeElement) {
                        isPanelItemFocused = true;
                    }
                }
            );

            if (isPanelItemFocused === true) {
                return;
            }

            this.hide();
        }

        this.handler.documentKeyDown = (event) => {
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
        }

        this.handler.windowOnResize = (event) => {
            this.hide();
        }

        document.addEventListener('click', this.handler.documentClick, false);
        this.button.addEventListener('keydown', this.handler.escapeKey, false);
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.addEventListener('keydown', this.handler.escapeKey, false);
            }
        );
        this.button.addEventListener('keydown', this.handler.arrowsOnButton, false);
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.addEventListener('keydown', this.handler.keyboardNavigation, false);
            }
        );
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.addEventListener('click', this.handler.panelItemsClick, false);
            }
        );
        document.addEventListener('keyup', this.handler.documentKeyUp, false);
        document.addEventListener('keydown', this.handler.documentKeyDown, false);
        if (this.closeOnResize) {
            window.addEventListener('resize', this.handler.windowOnResize, false);
        }
    }

    removeEphemeralEvents() {
        document.removeEventListener('click', this.handler.documentClick);
        this.button.removeEventListener('keydown', this.handler.escapeKey);
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.removeEventListener('keydown', this.handler.escapeKey);
            }
        );
        this.button.removeEventListener('keydown', this.handler.arrowsOnButton);
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.removeEventListener('keydown', this.handler.keyboardNavigation);
            }
        );
        this.panelItems.forEach(
            (currentValue, currentIndex, listObj) => {
                currentValue.removeEventListener('click', this.handler.panelItemsClick);
            }
        );
        document.removeEventListener('keyup', this.handler.documentKeyUp);
        document.removeEventListener('keydown', this.handler.documentKeyDown);
        if (this.closeOnResize) {
            window.removeEventListener('resize', this.handler.windowOnResize);
        }
    }
}

module.exports = NavigationPanel;

