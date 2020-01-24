# Navigation Panel
A collapsible navigation panel for web pages.

The mechanism of showing and hiding the panel works similarly to Bootstrap's Collapse component. When showing, the panel is made visible with the `display` CSS property, then it transitions to the target width. When hiding, it transitions to `width: 0`, then it is hidden with the `display` property.

Speaking of target width, there are two transition modes: _full width_ and _calculated width_. In full width mode the panel will transition to and from `width: 100%`, while in calculated width mode it will calculate the width of the panel and transition to and from that value. This is configured through the `data-fullwidth` attribute.

This plugin toggles `aria-expanded`, provides keyboard navigation with the arrow keys and performs focus monitoring to close the panel when it is no longer in focus.

## Installation and Usage
Install the [npm package](https://www.npmjs.com/package/nav-panel) using your preferred package manager.
```
npm install nav-panel
yarn add nav-panel
```

Then import the module.
```
const NavigationPanel = require('nav-panel');
```

Now create an instance of `NavigationPanel` and run `setup()` to initialize it.
```
var navPanel = new NavigationPanel();
navPanel.setup();
```

### Creating the elements
We're going to need some CSS for the next steps. They enable the collapsible behavior and the transitioning effect.
```
@import "~nav-panel/css/nav-panel.css";
```

Create the toggle button.
```
<button class="collapsible-toggle" data-target="#nav-menu" data-fullwidth="false" aria-label="" aria-expanded="false" aria-controls="nav-menu" aria-haspopup="true">
  Menu
</button>
```
Make sure `data-target` points to the collapsible panel we'll create next. To meet accessibility requirements, you should also set `aria-label` and `aria-controls` accordingly. We're using the `nav-menu` id attribute for this example.

Now create the collapsible element (the panel itself).
```
<nav id="nav-menu" class="np-collapsible">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>
```

That's it. Give it a try!

### Tips
- This plugin does not apply any decorative CSS. Styling these elements is up to you. You'll probably want to manage z-index, set `position: fixed` on the panel and give it a background color, among other things.
- Feel free to hide the panel and its toggle button on specific viewport breakpoints, if that's what you need. The script will ignore events when it's hidden.
- By default, the panel will transition from left to right. To get the opposite of this, set `right: 0` on it.
- You can make the panel contents scrollable with `overflow-y: auto`.
