## UserUtils
Library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, modify the DOM more easily and more.  
Contains builtin TypeScript declarations.

<br>

## Table of Contents:
- [Installation](#installation)
- [Features](#features)
  - [onSelector()](#onselector) - call a listener once a selector is found in the DOM
  - [initOnSelector()](#initonselector) - needs to be called once to be able to use `onSelector()`
  - [getSelectorMap()](#getselectormap) - returns all currently registered selectors, listeners and options
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
Usage:  
```ts
onSelector<TElement = HTMLElement>(selector: string, options: {
  listener: (elements: TElement | NodeListOf<TElement>) => void,
  all?: boolean,
  continuous?: boolean,
}): void
```
  
Registers a listener to be called whenever the element(s) behind a selector is/are found in the DOM.  
If the selector already exists, the listener will be called immediately.  
  
If `all` is set to `true`, querySelectorAll() will be used instead and the listener will return a NodeList of matching elements.  
This will also include elements that were already found in a previous listener call.  
If set to `false` (default), querySelector() will be used and only the first matching element will be returned.  
  
If `continuous` is set to `true`, the listener will not be deregistered after it was called once (defaults to false).  
  
When using TypeScript, the generic `TElement` can be used to specify the type of the element(s) that the listener will return.  
  
⚠️ In order to use this function, [`initOnSelector()`](#initonselector) has to be called as soon as possible.  
This initialization function has to be called after `DOMContentLoaded` is fired (or immediately if `@run-at document-end` is set).  
  
Calling onSelector() before `DOMContentLoaded` is fired will not throw an error, but it also won't trigger listeners until the DOM is accessible.
  
<details><summary><b>Example - click to view</b></summary>

```ts
document.addEventListener("DOMContentLoaded", initOnSelector);

// Continuously checks if `div` elements are added to the DOM, then returns all of them (even previously detected ones) in a NodeList
onSelector<HTMLDivElement>("div", {
  listener: (elements) => {
    console.log("Elements found:", elements); // type = NodeListOf<HTMLDivElement>
  },
  all: true,
  continuous: true,
});

// Checks if an input element with a value attribute of "5" is added to the DOM, then returns it and deregisters the listener
onSelector<HTMLInputElement>("input[value=\"5\"]", {
  listener: (element) => {
    console.log("Element found:", element); // type = HTMLInputElement
  },
});
```

</details>

<br>

### initOnSelector()
Usage:  
```ts
initOnSelector(options?: {
  attributes?: boolean,
  characterData?: boolean,
}): void
```

Initializes the MutationObserver that is used by [`onSelector()`](#onselector) to check for the registered selectors whenever a DOM change occurs on the `<body>`  
By default, this only checks if elements are added or removed (at any depth).  
  
Set `attributes` to `true` to also check for attribute changes on every single descendant of the `<body>` (defaults to false).  
Set `characterData` to `true` to also check for character data changes on every single descendant of the `<body>` (defaults to false).  
  
⚠️ Using these extra options can have a performance impact on larger sites or sites with a constantly changing DOM.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
document.addEventListener("DOMContentLoaded", () => {
  initOnSelector({
    attributes: true,
    characterData: true,
  });
});
```

</details>

<br>

### getSelectorMap()
Usage: `getSelectorMap(): Map<string, OnSelectorOptions[]>`  
  
Returns a Map of all currently registered selectors and their options, including listener function.  
Since multiple listeners can be registered for the same selector, the value of the Map is an array of `OnSelectorOptions` objects.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
document.addEventListener("DOMContentLoaded", initOnSelector);

onSelector<HTMLDivElement>("div", {
  listener: (elements) => void 0,
  all: true,
  continuous: true,
});

onSelector<HTMLDivElement>("div", {
  listener: (elements) => void 0,
});

const selectorMap = getSelectorMap();
// Map(1) {
//   "div" => [
//     {
//       listener: (elements) => void 0,
//       all: true,
//       continuous: true,
//     },
//     {
//       listener: (elements) => void 0,
//     },
//   ]
// }
```

</details>

<br>

### autoPlural()
Usage: `autoPlural(str: string, num: number | Array | NodeList): string`  
  
Automatically pluralizes a string if the given number is not 1.  
If an array or NodeList is passed, the length of it will be used.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
autoPlural("apple", 0); // "apples"
autoPlural("apple", 1); // "apple"
autoPlural("apple", 2); // "apples"

autoPlural("apple", [1]);    // "apple"
autoPlural("apple", [1, 2]); // "apples"

const items = [1, 2, 3, 4, "foo", "bar"];
console.log(`Found ${items.length} ${autoPlural("item", items)}`); // "Found 6 items"
```

</details>

<br>

### clamp()
Usage: `clamp(num: number, min: number, max: number): number`  
  
Clamps a number between a min and max value.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
clamp(5, 0, 10);        // 5
clamp(-1, 0, 10);       // 0
clamp(7, 0, 10);        // 7
clamp(Infinity, 0, 10); // 10
```

</details>

<br>

### pauseFor()
Usage: `pauseFor(ms: number): Promise<void>`  
  
Pauses async execution for a given amount of time.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
async function run() {
  console.log("Hello");
  await pauseFor(3000); // waits for 3 seconds
  console.log("World");
}
```

</details>

<br>

### debounce()
Usage: `debounce(func: Function, timeout?: number): Function`  
  
Debounces a function, meaning that it will only be called once after a given amount of time.  
This is very useful for functions that are called repeatedly, like event listeners, to remove extraneous calls.  
The timeout will default to 300ms if left undefined.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
window.addEventListener("resize", debounce((event) => {
  console.log("Window was resized:", event);
}, 500)); // 500ms timeout
```

</details>

<br>

### getUnsafeWindow()
Usage: `getUnsafeWindow(): Window`  
  
Returns the unsafeWindow object or falls back to the regular window object if the `@grant unsafeWindow` is not given.  
Userscripts are sandboxed and do not have access to the regular window object, so this function is useful for websites that reject some events that were dispatched by the userscript.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
// trick the site into thinking the mouse was moved:
const mouseEvent = new MouseEvent("mousemove", {
  view: getUnsafeWindow(),
  screenY: 69,
  screenX: 420,
  movementX: 10,
  movementY: 0,
});
document.body.dispatchEvent(mouseEvent);
```

</details>

<br>

### insertAfter()
Usage: `insertAfter(beforeElement: HTMLElement, afterElement: HTMLElement): HTMLElement`  
  
Inserts the element passed as `afterElement` as a sibling after the passed `beforeElement`.  
The passed `afterElement` will be returned.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
// insert a <div> as a sibling next to an element
const beforeElement = document.querySelector("#before");
const afterElement = document.createElement("div");
afterElement.innerText = "After";
insertAfter(beforeElement, afterElement);
```

</details>

<br>

### addParent()
Usage: `addParent(element: HTMLElement, newParent: HTMLElement): HTMLElement`  
  
Adds a parent element around the passed `element` and returns the new parent.  
Previously registered event listeners are kept intact.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
// add an <a> around an element
const element = document.querySelector("#element");
const newParent = document.createElement("a");
newParent.href = "https://example.org/";
addParent(element, newParent);
```

</details>

<br>

### addGlobalStyle()
Usage: `addGlobalStyle(css: string): void`  
  
Adds a global style to the page in form of a `<style>` element that's inserted into the `<head>`.  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
document.addEventListener("DOMContentLoaded", () => {
  addGlobalStyle(`
    body {
      background-color: red;
    }
  `);
});
```

</details>

<br>

### preloadImages()
Usage: `preloadImages(urls: string[], rejects?: boolean): Promise<void>`  
  
Preloads images into browser cache by creating an invisible `<img>` element for each URL passed.  
The images will be loaded in parallel and the returned Promise will only resolve once all images have been loaded.  
The resulting PromiseSettledResult array will contain the image elements if resolved, or an ErrorEvent if rejected, but only if `rejects` is set to true.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
preloadImages([
  "https://example.org/image1.png",
  "https://example.org/image2.png",
  "https://example.org/image3.png",
], true)
  .then((results) => {
    console.log("Images preloaded. Results:", results);
  });
```

</details>

<br>

### fetchAdvanced()
Usage:  
```ts
fetchAdvanced(url: string, options?: {
  timeout?: number,
  // any other options from fetch() except for signal
}): Promise<Response>
```
  
A wrapper around the native `fetch()` function that adds options like a timeout property.  
The timeout will default to 10 seconds if left undefined.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
fetchAdvanced("https://api.example.org/data", {
  timeout: 5000,
  // also accepts any other fetch options like headers:
  headers: {
    "Accept": "application/json",
  },
}).then(async (response) => {
  console.log("Data:", await response.json());
});
```

</details>

<br>

### openInNewTab()
Usage: `openInNewTab(url: string): void`  
  
Creates an invisible anchor with a `_blank` target and clicks it.  
Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
This function has to be run in relatively quick succession in response to a user interaction event, else the browser might reject it.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
document.querySelector("#my-button").addEventListener("click", () => {
  openInNewTab("https://example.org/");
});
```

</details>

<br>

### interceptEvent()
Usage: `interceptEvent(eventObject: EventTarget, eventName: string, predicate: () => boolean): void`  
  
Intercepts all events dispatched on the `eventObject` and prevents the listeners from being called as long as the predicate function returns a truthy value.  
Calling this function will set the `Error.stackTraceLimit` to 1000 (if it's not already higher) to ensure the stack trace is preserved.  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
interceptEvent(document.body, "click", () => {
  return true; // prevent all click events on the body element
});
```

</details>

<br>

### interceptWindowEvent()
Usage: `interceptWindowEvent(eventName: string, predicate: () => boolean): void`  
  
Intercepts all events dispatched on the `window` object and prevents the listeners from being called as long as the predicate function returns a truthy value.  
This is essentially the same as [`interceptEvent()`](#interceptevent), but automatically uses the `unsafeWindow` (or falls back to regular `window`).  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
interceptWindowEvent("beforeunload", () => {
  return true; // prevent the pesky "Are you sure you want to leave this page?" popup
});
```

</details>


<br><br>

## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
