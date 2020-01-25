# Navigation Panel
A collapsible navigation panel for web pages.

The mechanism for showing and hiding the panel works similarly to Bootstrap's Collapse component. When showing, the panel is made visible with the `display` CSS property, then it transitions to the target width or height. When hiding, it transitions to width or height `0`, then it is hidden with the `display` property.

Speaking of transitions, there is a special transition mode: the _fullscreen_ mode. When enabled, the panel will transition to and from `100%`, otherwise it will calculate the original width or height of the panel and transition to and from that value. This is controlled through the `data-fullscreen` attribute.

Transition orientation is configurable through the `data-vertical-transition` attribute. The value of `true` makes it use the height for the transition, while `false` makes it use the width.

This plugin toggles `aria-expanded`, provides keyboard navigation with the arrow keys and performs focus monitoring to close the panel when it is no longer in focus. Currently, only anchor elements `<a>` are supported as focusable panel items.

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
<button class="np-toggle" data-target="#nav-menu" data-fullscreen="false" data-vertical-transition="false" aria-label="" aria-expanded="false" aria-controls="nav-menu" aria-haspopup="true">
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

### Custom events
To allow you to hook into the plugin's functionality, custom events are fired on certain conditions.

| Event type      | Fired when                                    |
| --------------- | --------------------------------------------- |
| `show.navpanel` | The panel is expanded (waits for transition)  |
| `hide.navpanel` | The panel is collapsed (waits for transition) |

One common use for this is to alternate between 'open' and 'close' icons on the toggle button.

```
$('#nav-menu').on('show.navpanel', function() {
  // Do something
});
```

### CSS
- This plugin does not apply any decorative CSS. Styling these elements is up to you. You'll probably want to manage z-index, set `position: fixed` on the panel and give it a background color, among other things.
- Feel free to hide the panel and its toggle button on specific viewport breakpoints, if that's what you need. The script will ignore events when they're hidden.
- You can change from which edge of the screen the panel will appear to come from by using positioning properties such as `right: 0` and `bottom: 0`.
- You can make the panel contents scrollable with `overflow-y: auto`.
