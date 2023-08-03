## UserUtils
Library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, modify the DOM more easily and more.  
Contains builtin TypeScript definitions.

<br>

## Table of Contents:
- [Installation](#installation)
- [Features](#features)
  - [onSelector()](#onselector) - call a listener once a selector is found in the DOM
  - [autoPlural()](#autoplural) - automatically pluralize a string
  - [clamp()](#clamp) - clamp a number between a min and max value
  - [pauseFor()](#pausefor) - pause the execution of a function for a given amount of time
  - [debounce()](#debounce) - call a function only once, after a given amount of time
  - [getUnsafeWindow()](#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
  - [insertAfter()](#insertafter) - insert an element as a sibling after another element
  - [addParent()](#addparent) - add a parent element around another element
  - [addGlobalStyle()](#addglobalstyle) - add a global style to the page
  - [preloadImages()](#preloadimages) - preload images into the browser cache for faster loading later on
  - [fetchAdvanced()](#fetchadvanced) - wrapper around the fetch API with a timeout option
  - [openInNewTab()](#openinnewtab) - open a link in a new tab
  - [interceptEvent()](#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
  - [interceptWindowEvent()](#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
- [License](#license)

<br><br>

## Installation:
- If you are using a bundler like webpack, you can install this package using npm:
  ```
  npm i @sv443-network/userutils
  ```
  Then, import it in your script as usual:
  ```ts
  import { addGlobalStyle } from "@sv443-network/userutils";
  // or
  import * as userUtils from "@sv443-network/userutils";
  ```
  Shameless plug: I also have a [webpack-based template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly.

<br>

- If you are not using a bundler, you can include the latest release from GreasyFork by adding this directive to the userscript header:
  ```
  // @require https://greasyfork.org/scripts/TODO
  ```

<br>

If you like using this library, please consider [supporting development](https://github.com/sponsors/Sv443)

<br><br>

## Features:

### onSelector()
\- UNFINISHED -  
  
Registers a listener to be called whenever the element(s) behind a selector is/are found in the DOM.  
In order to use this function, the MutationObservers have to be initialized with `initOnSelector()` first.  
  
Example:
```ts
// TODO
```

<br>

### autoPlural()
Usage: `autoPlural(str: string, num: number | Array | NodeList): string`  
  
Automatically pluralizes a string if the given number is not 1.  
If an array or NodeList is passed, the length of it will be used.  
  
Example:
```ts
autoPlural("apple", 0); // "apples"
autoPlural("apple", 1); // "apple"
autoPlural("apple", 2); // "apples"

autoPlural("apple", [1]);    // "apple"
autoPlural("apple", [1, 2]); // "apples"
```

<br>

### clamp()
Usage: `clamp(num: number, min: number, max: number): number`  
  
Clamps a number between a min and max value.  
  
Example:
```ts
clamp(5, 0, 10);        // 5
clamp(-1, 0, 10);       // 0
clamp(Infinity, 0, 10); // 10
```

<br>

### pauseFor()
Usage: `pauseFor(ms: number): Promise<void>`  
  
Pauses async execution for a given amount of time.  
  
Example:
```ts
async function run() {
  console.log("Hello");
  await pauseFor(3000); // waits for 3 seconds
  console.log("World");
}
```

<br>

### debounce()
Usage: `debounce(func: Function, timeout?: number): Function`  
  
Debounces a function, meaning that it will only be called once after a given amount of time.  
This is very useful for functions that are called repeatedly, like event listeners, to remove extraneous calls.  
The timeout will default to 300ms if left undefined.  
  
Example:
```ts
window.addEventListener("resize", debounce((event) => {
  console.log("Window was resized:", event);
}, 500)); // 500ms timeout
```

<br>

### getUnsafeWindow()
Usage: `getUnsafeWindow(): Window`  
  
Returns the unsafeWindow object or falls back to the regular window object if the `@grant unsafeWindow` is not given.  
Userscripts are sandboxed and do not have access to the regular window object, so this function is useful for websites that reject some events that were dispatched by the userscript.  
  
Example:
```ts
const mouseEvent = new MouseEvent("click", {
  view: getUnsafeWindow(),
});
document.body.dispatchEvent(mouseEvent);
```

<br>

### insertAfter()
Usage: `insertAfter(beforeElement: HTMLElement, afterElement: HTMLElement): HTMLElement`  
  
Inserts the element passed as `afterElement` as a sibling after the passed `beforeElement`.  
The `afterElement` will be returned.  
  
Example:
```ts
const beforeElement = document.querySelector("#before");
const afterElement = document.createElement("div");
afterElement.innerText = "After";
insertAfter(beforeElement, afterElement);
```

<br>

### addParent()
Usage: `addParent(element: HTMLElement, newParent: HTMLElement): HTMLElement`  
  
Adds a parent element around the passed `element` and returns the new parent.  
Previously registered event listeners should be kept intact.  
  
Example:
```ts
const element = document.querySelector("#element");
const newParent = document.createElement("a");
newParent.href = "https://example.org/";
addParent(element, newParent);
```

<br>

### addGlobalStyle()
Usage: `addGlobalStyle(css: string): void`  
  
Adds a global style to the page in form of a `<style>` element that's inserted into the `<head>`.  
This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
Example:
```ts
document.addEventListener("DOMContentLoaded", () => {
  addGlobalStyle(`
    body {
      background-color: red;
    }
  `);
});
```

<br>

### preloadImages()
Usage: `preloadImages(...urls: string[]): Promise<void>`  
  
Preloads images into browser cache by creating an invisible `<img>` element for each URL passed.  
The images will be loaded in parallel and the returned Promise will only resolve once all images have been loaded.  
The resulting PromiseSettledResult array will contain the image elements if resolved, or an ErrorEvent if rejected.  
  
Example:
```ts
preloadImages(
  "https://example.org/image1.png",
  "https://example.org/image2.png",
  "https://example.org/image3.png",
).then((results) => {
  console.log("Images preloaded. Results:", results);
});
```

<br>

### fetchAdvanced()
Usage: `fetchAdvanced(url: string, options?: FetchAdvancedOptions): Promise<Response>`  
  
A wrapper around the native `fetch()` function that adds options like a timeout property.  
The timeout will default to 10 seconds if left undefined.  
  
Example:
```ts
fetchAdvanced("https://example.org/", {
  timeout: 5000,
}).then((response) => {
  console.log("Response:", response);
});
```

<br>

### openInNewTab()
Usage: `openInNewTab(url: string): void`  
  
Creates an invisible anchor with a `_blank` target and clicks it.  
Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
This function has to be run in relatively quick succession in response to a user interaction event, else the browser might reject it.  
  
Example:
```ts
document.querySelector("#button").addEventListener("click", () => {
  openInNewTab("https://example.org/");
});
```

<br>

### interceptEvent()
Usage: `interceptEvent(eventObject: EventTarget, eventName: string, predicate: () => boolean): void`  
  
Intercepts all events dispatched on the `eventObject` and prevents the listeners from being called as long as the predicate function returns a truthy value.  
This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
Calling this function will set the `Error.stackTraceLimit` to 1000 to ensure the stack trace is preserved.  
  
Example:
```ts
interceptEvent(document.body, "click", () => {
  return true; // prevent all click events on the body
});
```

<br>

### interceptWindowEvent()
Usage: `interceptWindowEvent(eventName: string, predicate: () => boolean): void`  
  
Intercepts all events dispatched on the `window` object and prevents the listeners from being called as long as the predicate function returns a truthy value.  
This is essentially the same as [`interceptEvent()`](#interceptevent), but automatically uses the `unsafeWindow` (or falls back to regular `window`).  
  
Example:
```ts
interceptWindowEvent("beforeunload", () => {
  return true; // prevent the pesky "Are you sure you want to leave this page?" popup
});
```


<br><br>

## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
