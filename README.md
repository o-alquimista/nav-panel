# Navigation Panel
A collapsible navigation panel for web pages.

## How it works
The mechanism for showing and hiding the panel works similarly to Bootstrap's Collapse component. When showing, the panel is made visible with the `display` CSS property, then it transitions to the target width or height. When hiding, it transitions to width or height `0`, then it is hidden with the `display` property.

### Configurability
Speaking of transitions, there is a special transition mode: the `fullscreen` mode. When enabled, the panel will transition to and from `100%`, otherwise it will calculate the original width or height of the panel and transition to and from that value.

Transition orientation can also be configured through the `verticalTransition`. The value of `true` makes it use the height for the transition, while `false` makes it use the width.

To have your panel close whenever the browser window is resized, enable the option `closeOnResize`.

### Accessibility
This plugin toggles `aria-expanded`, provides keyboard navigation with the arrow keys, performs focus monitoring to close the panel when it is no longer in focus, plus other keyboard and pointer interactions. The code snippets here include the necessary ARIA attributes. Currently, only anchor elements `<a>` are supported as focusable panel items.

Wanna see it in action? I use it on my [portfolio page](https://dougsilva.me/) and on a [demo project](https://kabum.dougsilva.me/) on smaller viewport sizes.

## Installation and Usage
Install the [npm package](https://www.npmjs.com/package/nav-panel) using your preferred package manager.
```
npm install nav-panel
yarn add nav-panel
```

Then import the module.
```js
const NavigationPanel = require('nav-panel');
```

Now create an instance of `NavigationPanel` and configure it. The first argument is the selector for the toggle button that we will create.
```js
var navPanel = new NavigationPanel('.np-toggle', {
    fullscreen: true,
    verticalTransition: false,
    closeOnResize: false
});
```

### Creating the elements
We're going to need some CSS for the next steps. They enable the collapsible behavior and the transitioning effect.
```css
@import "~nav-panel/css/nav-panel.css";
```

Create the toggle button.
```html
<button class="np-toggle" data-target="#nav-menu" aria-label="" aria-expanded="false" aria-controls="nav-menu" aria-haspopup="true">
  Menu
</button>
```
Make sure `data-target` points to the collapsible panel we'll create next. To meet accessibility requirements, you should also set `aria-label` and `aria-controls` accordingly. We're using the `nav-menu` id attribute for this example.

Now create the collapsible element (the panel itself).
```html
<nav id="nav-menu" class="np-collapsible">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>
```

That's it. Give it a try!

### CSS
This plugin does not apply any decorative CSS. Styling these elements is up to you. You'll probably want to manage `z-index`, set `position: fixed` on the panel and give it a `background-color`, among other things.

- Feel free to hide the panel and its toggle button with `display: none` on specific viewport breakpoints, if that's what you need. The script will ignore events when they're hidden.
- You can change from which edge of the screen the panel will appear to come from by using positioning properties such as `right: 0` and `bottom: 0`.
- You can make the panel contents scrollable with `overflow-y: auto`.

### Synthetic events
To allow you to hook into the plugin's functionality, synthetic events are fired from the panel element on certain conditions.

| Event type      | Fired when                                    |
| --------------- | --------------------------------------------- |
| `np-show`       | The panel is expanded (waits for transition)  |
| `np-hide`       | The panel is collapsed (waits for transition) |

One common use for this is to alternate between 'open' and 'close' icons on the toggle button.

```js
document.querySelector('#nav-menu').addEventListener('np-show', function(event) {
  // Do something
}, false);
```

### Controlling the panel from external scripts
You may call `show()`, `hide()` and `toggle()` on any instance of `NavigationPanel`.
