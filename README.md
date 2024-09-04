<div style="text-align: center;" align="center">

<!-- #region Description -->
## UserUtils
Lightweight library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, create persistent & synchronous data stores, modify the DOM more easily and more.  
  
Contains builtin TypeScript declarations. Supports ESM and CJS imports via a bundler and global declaration via `@require`  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>
<sup>
View the documentation of previous major releases:
</sup>
<sub>

<a href="https://github.com/Sv443-Network/UserUtils/blob/v7.3.0/README.md" rel="noopener noreferrer">7.3.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v6.3.0/README.md" rel="noopener noreferrer">6.3.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v5.0.1/README.md" rel="noopener noreferrer">5.0.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v4.2.1/README.md" rel="noopener noreferrer">4.2.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v3.0.0/README.md" rel="noopener noreferrer">3.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v2.0.1/README.md" rel="noopener noreferrer">2.0.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v1.2.0/README.md" rel="noopener noreferrer">1.2.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v0.5.3/README.md" rel="noopener noreferrer">0.5.3</a>

</sub>
</div>
<br>

<!-- #region Table of Contents -->
## Table of Contents:
- [**Installation**](#installation)
- [**Preamble** (info about the documentation)](#preamble)
- [**License**](#license)
- [**Features**](#features)
  - [**DOM:**](#dom)
    - [`SelectorObserver`](#selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - [`getUnsafeWindow()`](#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [`addParent()`](#addparent) - add a parent element around another element
    - [`addGlobalStyle()`](#addglobalstyle) - add a global style to the page
    - [`preloadImages()`](#preloadimages) - preload images into the browser cache for faster loading later on
    - [`openInNewTab()`](#openinnewtab) - open a link in a new tab
    - [`interceptEvent()`](#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [`interceptWindowEvent()`](#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [`isScrollable()`](#isscrollable) - check if an element has a horizontal or vertical scroll bar
    - [`observeElementProp()`](#observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - [`getSiblingsFrame()`](#getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
    - [`setInnerHtmlUnsafe()`](#setinnerhtmlunsafe) - set the innerHTML of an element using a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) without sanitizing or escaping it
  - [**Math:**](#math)
    - [`clamp()`](#clamp) - constrain a number between a min and max value
    - [`mapRange()`](#maprange) - map a number from one range to the same spot in another range
    - [`randRange()`](#randrange) - generate a random number between a min and max boundary
  - [**Misc:**](#misc)
    - [`DataStore`](#datastore) - class that manages a hybrid sync & async persistent JSON database, including data migration
    - [`DataStoreSerializer`](#datastoreserializer) - class for importing & exporting data of multiple DataStore instances, including compression, checksumming and running migrations
    - [`Dialog`](#dialog) - class for creating custom modal dialogs with a promise-based API and a generic, default style
    - [`NanoEmitter`](#nanoemitter) - tiny event emitter class with a focus on performance and simplicity (based on [nanoevents](https://npmjs.com/package/nanoevents))
    - [`autoPlural()`](#autoplural) - automatically pluralize a string
    - [`pauseFor()`](#pausefor) - pause the execution of a function for a given amount of time
    - [`debounce()`](#debounce) - call a function only once in a series of calls, after or before a given timeout
    - [`fetchAdvanced()`](#fetchadvanced) - wrapper around the fetch API with a timeout option
    - [`insertValues()`](#insertvalues) - insert values into a string at specified placeholders
    - [`compress()`](#compress) - compress a string with Gzip or Deflate
    - [`decompress()`](#decompress) - decompress a previously compressed string
    - [`computeHash()`](#computehash) - compute the hash / checksum of a string or ArrayBuffer
    - [`randomId()`](#randomid) - generate a random ID of a given length and radix
  - [**Arrays:**](#arrays)
    - [`randomItem()`](#randomitem) - returns a random item from an array
    - [`randomItemIndex()`](#randomitemindex) - returns a tuple of a random item and its index from an array
    - [`takeRandomItem()`](#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [`randomizeArray()`](#randomizearray) - returns a copy of the array with its items in a random order
  - [**Translation:**](#translation)
    - [`tr()`](#tr) - simple translation of a string to another language
    - [`tr.forLang()`](#trforlang) - specify a language besides the currently set one for the translation
    - [`tr.addLanguage()`](#traddlanguage) - add a language and its translations
    - [`tr.setLanguage()`](#trsetlanguage) - set the currently active language for translations
    - [`tr.getLanguage()`](#trgetlanguage) - returns the currently active language
    - [`tr.getTranslations()`](#trgettranslations) - returns the translations for the given language or the currently active one
  - [**Colors:**](#colors)
    - [`hexToRgb()`](#hextorgb) - convert a hex color string to an RGB or RGBA value tuple
    - [`rgbToHex()`](#rgbtohex) - convert RGB or RGBA values to a hex color string
    - [`lightenColor()`](#lightencolor) - lighten a CSS color string (hex, rgb or rgba) by a given percentage
    - [`darkenColor()`](#darkencolor) - darken a CSS color string (hex, rgb or rgba) by a given percentage
  - [**Utility types for TypeScript:**](#utility-types)
    - [`Stringifiable`](#stringifiable) - any value that is a string or can be converted to one (implicitly or explicitly)
    - [`NonEmptyArray`](#nonemptyarray) - any array that should have at least one item
    - [`NonEmptyString`](#nonemptystring) - any string that should have at least one character
    - [`LooseUnion`](#looseunion) - a union that gives autocomplete in the IDE but also allows any other value of the same type

<br><br>

<!-- #region Installation -->
## Installation:
Shameless plug: I made a [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
  
- If you are using a bundler (like webpack, rollup, vite, etc.), you can install this package using npm:
  ```
  npm i @sv443-network/userutils
  ```
  <sup>For other package managers, check out the respective install command on the [JavaScript Registry](https://jsr.io/@sv443-network/userutils)</sup>  
  Then, import it in your script as usual:
  ```ts
  import { addGlobalStyle } from "@sv443-network/userutils";

  // or just import everything (not recommended because of worse treeshaking support):

  import * as UserUtils from "@sv443-network/userutils";
  ```

<br>

- If you are not using a bundler or want to reduce the size of your userscript, you can include the latest release by adding one of these directives to the userscript header, depending on your preferred CDN:
  ```
  // @require https://greasyfork.org/scripts/472956-userutils/code/UserUtils.js
  ```
  ```
  // @require https://openuserjs.org/src/libs/Sv443/UserUtils.js
  ```
  (in order for your userscript not to break on a major library update, instead use the versioned URL at the top of the [GreasyFork page](https://greasyfork.org/scripts/472956-userutils))  
    
  Then, access the functions on the global variable `UserUtils`:
  ```ts
  UserUtils.addGlobalStyle("body { background-color: red; }");

  // or using object destructuring:

  const { clamp } = UserUtils;
  console.log(clamp(1, 5, 10)); // 5
  ```
  If you're using TypeScript and it complains about the missing global variable `UserUtils`, install the library using the package manager of your choice and add the following inside a `.d.ts` file somewhere in your project:
  ```ts
  declare global {
    const UserUtils: typeof import("@sv443-network/userutils");
  }
  ```

<br><br>

<!-- #region Preamble -->
## Preamble:
This library is written in TypeScript and contains builtin TypeScript declarations.  
  
Each feature has example code that can be expanded by clicking on the text "Example - click to view".  
The usages and examples are written in TypeScript and use ESM import syntax, but the library can also be used in plain JavaScript after removing the type annotations (and changing the imports if you are using CommonJS or the global declaration).  
If the usage section contains multiple usages of the function, each occurrence represents an overload and you can choose which one you want to use.  
  
Some features require the `@run-at` or `@grant` directives to be tweaked in the userscript header or have other requirements.  
Their documentation will contain a section marked by a warning emoji (⚠️) that will go into more detail.

<br><br>

<!-- #region License -->
## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

<!-- #region Features -->
## Features:

<br>

<!-- #region DOM -->
## DOM:

### SelectorObserver
Usage:  
```ts
new SelectorObserver(baseElement: Element, options?: SelectorObserverOptions)
new SelectorObserver(baseElementSelector: string, options?: SelectorObserverOptions)
```

A class that manages listeners that are called when elements at given selectors are found in the DOM.  
It is useful for userscripts that need to wait for elements to be added to the DOM at an indeterminate point in time before they can be interacted with.  
By default, it uses the MutationObserver API to observe for any element changes, and as such is highly customizable, but can also be configured to run on a fixed interval.  
  
The constructor takes a `baseElement`, which is a parent of the elements you want to observe.  
If a selector string is passed instead, it will be used to find the element.  
If you want to observe the entire document, you can pass `document.body` - ⚠️ you should only use this to initialize other SelectorObserver instances, and never run continuous listeners on this instance, as the performance impact can be massive!  
  
The `options` parameter is optional and will be passed to the MutationObserver that is used internally.  
The MutationObserver options present by default are `{ childList: true, subtree: true }` - you may see the [MutationObserver.observe() documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options) for more information and a list of options.  
For example, if you want to trigger the listeners when certain attributes change, pass `{ attributeFilter: ["class", "data-my-attribute"] }`  
  
Additionally, there are the following extra options:
- `disableOnNoListeners` - whether to disable the SelectorObserver when there are no listeners left (defaults to false)
- `enableOnAddListener` - whether to enable the SelectorObserver when a new listener is added (defaults to true)
- `defaultDebounce` - if set to a number, this debounce will be applied to every listener that doesn't have a custom debounce set (defaults to 0)
- `defaultDebounceEdge` - can be set to "falling" (default) or "rising", to call the function at (rising) on the very first call and subsequent times after the given debounce time or (falling) the very last call after the debounce time passed with no new calls - [see `debounce()` for more info and a diagram](#debounce)
- `checkInterval` - if set to a number, the checks will be run on interval instead of on mutation events - in that case all MutationObserverInit props will be ignored
  
⚠️ Make sure to call `enable()` to actually start observing. This will need to be done after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired) **and** as soon as the `baseElement` or `baseElementSelector` is available.

<br>

#### Methods:
`addListener<TElement = HTMLElement>(selector: string, options: SelectorListenerOptions): void`  
Adds a listener (specified in `options.listener`) for the given selector that will be called once the selector exists in the DOM. It will be passed the element(s) that match the selector as the only argument.  
The listener will be called immediately if the selector already exists in the DOM.  

> `options.listener` is the only required property of the `options` object.  
> It is a function that will be called once the selector exists in the DOM.  
> It will be passed the found element or NodeList of elements, depending on if `options.all` is set to true or false.
  
> If `options.all` is set to true, querySelectorAll() will be used instead and the listener will be passed a `NodeList` of matching elements.  
> This will also include elements that were already found in a previous listener call.  
> If set to false (default), querySelector() will be used and only the first matching element will be returned.
  
> If `options.continuous` is set to true, this listener will not be deregistered after it was called once (defaults to false).  
>   
> ⚠️ You should keep usage of this option to a minimum, as it will cause this listener to be called every time the selector is *checked for and found* and this can stack up quite quickly.  
> ⚠️ You should try to only use this option on SelectorObserver instances that are scoped really low in the DOM tree to prevent as many selector checks as possible from being triggered.  
> ⚠️ I also recommend always setting a debounce time (see constructor or below) if you use this option.
  
> If `options.debounce` is set to a number above 0, this listener will be debounced by that amount of milliseconds (defaults to 0).  
> E.g. if the debounce time is set to 200 and the selector is found twice within 100ms, only the last call of this listener will be executed.

> `options.debounceEdge` is set to "falling" by default, which means the debounce timer will start after the last call of this listener.  
> If set to "rising", the debounce timer will start after the first call of this listener.
  
> When using TypeScript, the generic `TElement` can be used to specify the type of the element(s) that this listener will return.  
> It will default to HTMLElement if left undefined.
  
<br>

`enable(immediatelyCheckSelectors?: boolean): boolean`  
Enables the observation of the child elements for the first time or if it was disabled before.  
`immediatelyCheckSelectors` is set to true by default, which means all previously registered selectors will be checked. Set to false to only check them on the first detected mutation.  
Returns true if the observation was enabled, false if it was already enabled or the passed `baseElementSelector` couldn't be found.  
  
<br>

`disable(): void`  
Disables the observation of the child elements.  
If selectors are currently being checked, the current selector will be finished before disabling.  
  
<br>

`isEnabled(): boolean`  
Returns whether the observation of the child elements is currently enabled.  
  
<br>

`clearListeners(): void`  
Removes all listeners for all selectors.  
  
<br>

`removeAllListeners(selector: string): boolean`  
Removes all listeners for the given selector.  
  
<br>

`removeListener(selector: string, options: SelectorListenerOptions): boolean`  
Removes a specific listener for the given selector and options.  
  
<br>

`getAllListeners(): Map<string, SelectorListenerOptions[]>`  
Returns a Map of all selectors and their listeners.  
  
<br>

`getListeners(selector: string): SelectorListenerOptions[] | undefined`  
Returns all listeners for the given selector or undefined if there are none.  

<br>

<details><summary><b>Examples - click to view</b></summary>

#### Basic usage:

```ts
import { SelectorObserver } from "@sv443-network/userutils";

// adding a single-shot listener before the element exists:
const fooObserver = new SelectorObserver("body");

fooObserver.addListener("#my-element", {
  listener: (element) => {
    console.log("Element found:", element);
  },
});

document.addEventListener("DOMContentLoaded", () => {
  // starting observation after the <body> element is available:
  fooObserver.enable();


  // adding custom observer options:

  const barObserver = new SelectorObserver(document.body, {
    // only check if the following attributes change:
    attributeFilter: ["class", "style", "data-whatever"],
    // debounce all listeners by 100ms unless specified otherwise:
    defaultDebounce: 100,
    // "rising" means listeners are called immediately and use the debounce as a timeout between subsequent calls - see the debounce() function for a better explanation
    defaultDebounceEdge: "rising",
    // other settings from the MutationObserver API can be set here too - see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options
  });

  barObserver.addListener("#my-element", {
    listener: (element) => {
      console.log("Element's attributes changed:", element);
    },
  });

  barObserver.addListener("#my-other-element", {
    // set the debounce higher than provided by the defaultDebounce property:
    debounce: 250,
    // adjust the debounceEdge back to the default "falling" for this specific listener:
    debounceEdge: "falling",
    listener: (element) => {
      console.log("Other element's attributes changed:", element);
    },
  });

  barObserver.enable();


  // using custom listener options:

  const bazObserver = new SelectorObserver(document.body);

  // for TypeScript, specify that input elements are returned by the listener:
  const unsubscribe = bazObserver.addListener<HTMLInputElement>("input", {
    all: true,        // use querySelectorAll() instead of querySelector()
    continuous: true, // don't remove the listener after it was called once
    debounce: 50,     // debounce the listener by 50ms
    listener: (elements) => {
      // type of `elements` is NodeListOf<HTMLInputElement>
      console.log("Input elements found:", elements);
    },
  });

  bazObserver.enable();

  window.addEventListener("something", () => {
    // remove the listener after the event "something" was dispatched:
    unsubscribe();
  });


  // use a different element as the base:

  const myElement = document.querySelector("#my-element");
  if(myElement) {
    const quxObserver = new SelectorObserver(myElement);

    quxObserver.addListener("#my-child-element", {
      listener: (element) => {
        console.log("Child element found:", element);
      },
    });

    quxObserver.enable();
  }
});
```

<br>

#### Get and remove listeners:

```ts
import { SelectorObserver } from "@sv443-network/userutils";

document.addEventListener("DOMContentLoaded", () => {
  const observer = new SelectorObserver(document.body);

  observer.addListener("#my-element-foo", {
    continuous: true,
    listener: (element) => {
      console.log("Element found:", element);
    },
  });

  observer.addListener("#my-element-bar", {
    listener: (element) => {
      console.log("Element found again:", element);
    },
  });

  observer.enable();


  // get all listeners:

  console.log(observer.getAllListeners());
  // Map(2) {
  //   '#my-element-foo' => [ { listener: [Function: listener] } ],
  //   '#my-element-bar' => [ { listener: [Function: listener] } ]
  // }


  // get listeners for a specific selector:

  console.log(observer.getListeners("#my-element-foo"));
  // [ { listener: [Function: listener], continuous: true } ]


  // remove all listeners for a specific selector:

  observer.removeAllListeners("#my-element-foo");
  console.log(observer.getAllListeners());
  // Map(1) {
  //   '#my-element-bar' => [ { listener: [Function: listener] } ]
  // }
});
```

<br>

#### Chaining:

```ts
import { SelectorObserver } from "@sv443-network/userutils";
import type { SelectorObserverOptions } from "@sv443-network/userutils";

// apply a default debounce to all SelectorObserver instances:
const defaultOptions: SelectorObserverOptions = {
  defaultDebounce: 100,
};

document.addEventListener("DOMContentLoaded", () => {
  // initialize generic observer that in turn initializes "sub-observers":
  const fooObserver = new SelectorObserver(document.body, {
    ...defaultOptions,
    // define any other specific options here
  });

  const myElementSelector = "#my-element";

  // this relatively expensive listener (as it is in the full <body> scope) will only fire once:
  fooObserver.addListener(myElementSelector, {
    listener: (element) => {
      // only enable barObserver once its baseElement exists:
      barObserver.enable();
    },
  });

  // barObserver is created at the same time as fooObserver, but only enabled once #my-element exists
  const barObserver = new SelectorObserver(element, {
    ...defaultOptions,
    // define any other specific options here
  });

  // this selector will be checked for immediately after `enable()` is called
  // and on each subsequent mutation because `continuous` is set to true.
  // however it is much less expensive as it is scoped to a lower element which will receive less DOM updates
  barObserver.addListener(".my-child-element", {
    all: true,
    continuous: true,
    listener: (elements) => {
      console.log("Child elements found:", elements);
    },
  });

  // immediately enable fooObserver as the <body> is available as soon as "DOMContentLoaded" fires:
  fooObserver.enable();
});
```
</details>

<br>

### getUnsafeWindow()
Usage:  
```ts
getUnsafeWindow(): Window
```
  
Returns the unsafeWindow object or falls back to the regular window object if the `@grant unsafeWindow` is not given.  
Userscripts are sandboxed and do not have access to the regular window object, so this function is useful for websites that reject some events that were dispatched by the userscript, or userscripts that need to interact with other userscripts, and more.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { getUnsafeWindow } from "@sv443-network/userutils";

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

### addParent()
Usage:  
```ts
addParent(element: Element, newParent: Element): Element
```
  
Adds a parent element around the passed `element` and returns the new parent.  
Previously registered event listeners are kept intact.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { addParent } from "@sv443-network/userutils";

// add an <a> around an element
const element = document.querySelector("#element");
const newParent = document.createElement("a");
newParent.href = "https://example.org/";

addParent(element, newParent);
```
</details>

<br>

### addGlobalStyle()
Usage:  
```ts
addGlobalStyle(css: string): HTMLStyleElement
```
  
Adds a global style to the page in form of a `<style>` element that's inserted into the `<head>`.  
Returns the style element that was just created.  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { addGlobalStyle } from "@sv443-network/userutils";

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
Usage:  
```ts
preloadImages(urls: string[], rejects?: boolean): Promise<Array<PromiseSettledResult<HTMLImageElement>>>
```
  
Preloads images into browser cache by creating an invisible `<img>` element for each URL passed.  
The images will be loaded in parallel and the returned Promise will only resolve once all images have been loaded.  
The resulting PromiseSettledResult array will contain the image elements if resolved, or an ErrorEvent if rejected, but only if `rejects` is set to true.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { preloadImages } from "@sv443-network/userutils";

preloadImages([
  "https://example.org/image1.png",
  "https://example.org/image2.png",
  "https://example.org/image3.png",
], true)
  .then((results) => {
    console.log("Images preloaded. Results:", results);
  })
  .catch((results) => {
    console.error("Couldn't preload all images. Results:", results);
  });
```
</details>

<br>

### openInNewTab()
Usage:  
```ts
openInNewTab(url: string, background?: boolean): void
```
  
Tries to use `GM.openInTab` to open the given URL in a new tab, or as a fallback if the grant is not given, creates an invisible anchor element and clicks it.  
If `background` is set to true, the tab will be opened in the background. Leave `undefined` to use the browser's default behavior.  
  
⚠️ Needs the `@grant GM.openInTab` directive, otherwise only the fallback behavior will be used and the warning below is extra important:  
⚠️ For the fallback to work, this function needs to be run in response to a user interaction event, else the browser might reject it.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { openInNewTab } from "@sv443-network/userutils";

document.querySelector("#my-button").addEventListener("click", () => {
  // open in background:
  openInNewTab("https://example.org/", true);
});
```
</details>

<br>

### interceptEvent()
Usage:  
```ts
interceptEvent(
  eventObject: EventTarget,
  eventName: string,
  predicate?: (event: Event) => boolean
): void
```
  
Intercepts all events dispatched on the `eventObject` and prevents the listeners from being called as long as the predicate function returns a truthy value.  
If no predicate is specified, all events will be discarded.  
Calling this function will set the `Error.stackTraceLimit` to 100 (if it's not already higher) to ensure the stack trace is preserved.  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { interceptEvent } from "@sv443-network/userutils";

interceptEvent(document.body, "click", (event) => {
  // prevent all click events on <a> elements within the entire <body>
  if(event.target instanceof HTMLAnchorElement) {
    console.log("Intercepting click event:", event);
    return true;
  }
  return false; // allow all other click events through
});
```
</details>

<br>

### interceptWindowEvent()
Usage:  
```ts
interceptWindowEvent(
  eventName: string,
  predicate?: (event: Event) => boolean
): void
```
  
Intercepts all events dispatched on the `window` object and prevents the listeners from being called as long as the predicate function returns a truthy value.  
If no predicate is specified, all events will be discarded.  
This is essentially the same as [`interceptEvent()`](#interceptevent), but automatically uses the `unsafeWindow` (or falls back to regular `window`).  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
⚠️ In order for all events to be interceptable, the directive `@grant unsafeWindow` should be set.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { interceptWindowEvent } from "@sv443-network/userutils";

// prevent the pesky "Are you sure you want to leave this page?" popup
// as no predicate is specified, all events will be discarded by default
interceptWindowEvent("beforeunload");
```
</details>

<br>

### isScrollable()
Usage:  
```ts
isScrollable(element: Element): { horizontal: boolean, vertical: boolean }
```
  
Checks if an element has a horizontal or vertical scroll bar.  
This uses the computed style of the element, so it will also work if the element is hidden.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { isScrollable } from "@sv443-network/userutils";

const element = document.querySelector("#element");
const { horizontal, vertical } = isScrollable(element);

console.log("Element has a horizontal scroll bar:", horizontal);
console.log("Element has a vertical scroll bar:", vertical);
```
</details>

<br>

### observeElementProp()
Usage:  
```ts
observeElementProp(
  element: Element,
  property: string,
  callback: (oldValue: any, newValue: any) => void
): void
```
  
This function observes changes to the given property of a given element.  
While regular HTML attributes can be observed using a MutationObserver, this is not always possible for properties that are assigned on the JS object.  
This function shims the setter of the provided property and calls the callback function whenever it is changed through any means.  
  
When using TypeScript, the types for `element`, `property` and the arguments for `callback` will be automatically inferred.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { observeElementProp } from "@sv443-network/userutils";

const myInput = document.querySelector("input#my-input");

let value = 0;

setInterval(() => {
  value += 1;
  myInput.value = String(value);
}, 1000);


const observer = new MutationObserver((mutations) => {
  // will never be called:
  console.log("MutationObserver mutation:", mutations);
});

// one would think this should work, but "value" is a JS object *property*, not a DOM *attribute*
observer.observe(myInput, {
  attributes: true,
  attributeFilter: ["value"],
});


observeElementProp(myInput, "value", (oldValue, newValue) => {
  // will be called every time the value changes:
  console.log("Value changed from", oldValue, "to", newValue);
});
```
</details>

<br>

### getSiblingsFrame()
Usage:  
```ts
getSiblingsFrame<
  TSiblingType extends Element = HTMLElement
>(
  refElement: Element,
  siblingAmount: number,
  refElementAlignment: "center-top" | "center-bottom" | "top" | "bottom" = "center-top",
  includeRef = true
): TSiblingType[]
```
Returns a "frame" of the closest siblings of the reference element, based on the passed amount of siblings and element alignment.  
The returned type is an array of `HTMLElement` by default but can be changed by specifying the `TSiblingType` generic in TypeScript.  
  
These are the parameters:
- The `refElement` parameter is the reference element to return the relative closest siblings from.
- The `siblingAmount` parameter is the amount of siblings to return in total (including or excluding the `refElement` based on the `includeRef` parameter).
- The `refElementAlignment` parameter can be set to `center-top` (default), `center-bottom`, `top`, or `bottom`, which will determine where the relative location of the provided `refElement` is in the returned array.  
  `center-top` (default) will try to keep the `refElement` in the center of the returned array, but can shift around by one element. In those cases it will prefer the top spot.  
  Same goes for `center-bottom` in reverse.  
  `top` will keep the `refElement` at the top of the returned array, and `bottom` will keep it at the bottom.
- If `includeRef` is set to `true` (default), the provided `refElement` will be included in the returned array at its corresponding position.
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { getSiblingsFrame } from "@sv443-network/userutils";

const refElement = document.querySelector("#ref");
// ^ structure of the elements:
// <div id="parent">
//     <div>1</div>
//     <div>2</div>
//     <div id="ref">3</div>
//     <div>4</div>
//     <div>5</div>
//     <div>6</div>
// </div>

// ref element aligned to the top of the frame's center positions and included in the result:
const siblingsFoo = getSiblingsFrame(refElement, 4, "center-top", true);
// <div>1</div>
// <div>2</div>        ◄──┐
// <div id="ref">3</div>  │ returned         <(ref is here because refElementAlignment = "center-top")
// <div>4</div>           │ frame
// <div>5</div>        ◄──┘
// <div>6</div>

// ref element aligned to the bottom of the frame's center positions and included in the result:
const siblingsBar = getSiblingsFrame(refElement, 4, "center-bottom", true);
// <div>1</div>        ◄──┐
// <div>2</div>           │ returned
// <div id="ref">3</div>  │ frame            <(ref is here because refElementAlignment = "center-bottom")
// <div>4</div>        ◄──┘
// <div>5</div>
// <div>6</div>

// ref element aligned to the bottom of the frame's center positions, but excluded from the result:
const siblingsBaz = getSiblingsFrame(refElement, 3, "center-bottom", false);
// <div>1</div>        ◄──┐
// <div>2</div>        ◄──┘ returned...
// <div id="ref">3</div>                     <(skipped because includeRef = false)
// <div>4</div>        ◄─── ...frame
// <div>5</div>
// <div>6</div>

// ref element aligned to the top of the frame, but excluded from the result:
const siblingsQux = getSiblingsFrame(refElement, 3, "top", false);
// <div>1</div>
// <div>2</div>
// <div id="ref">3</div>                     <(skipped because includeRef = false)
// <div>4</div>        ◄──┐ returned
// <div>5</div>           │ frame
// <div>6</div>        ◄──┘

// ref element aligned to the top of the frame, but this time included in the result:
const siblingsQuux = getSiblingsFrame(refElement, 3, "top", true);
// <div>1</div>
// <div>2</div>
// <div id="ref">3</div>  ◄──┐ returned      <(not skipped because includeRef = true)
// <div>4</div>              │ frame
// <div>5</div>           ◄──┘
// <div>6</div>
```

More useful examples:

```ts
const refElement = document.querySelector("#ref");
// ^ structure of the elements:
// <div id="parent">
//     <div>1</div>
//     <div>2</div>
//     <div id="ref">3</div>
//     <div>4</div>
//     <div>5</div>
//     <div>6</div>
// </div>

// get all elements above and include the reference element:
const allAbove = getSiblingsFrame(refElement, Infinity, "top", true);
// <div>1</div>          ◄──┐ returned
// <div>2</div>             │ frame
// <div id="ref">3</div> ◄──┘
// <div>4</div>
// <div>5</div>
// <div>6</div>

// get all elements below and exclude the reference element:
const allBelowExcl = getSiblingsFrame(refElement, Infinity, "bottom", false);
// <div>1</div>
// <div>2</div>
// <div id="ref">3</div>
// <div>4</div>          ◄──┐ returned
// <div>5</div>             │ frame
// <div>6</div>          ◄──┘
```
</details>

<br>

### setInnerHtmlUnsafe()
Usage:  
```ts
setInnerHtmlUnsafe(element: Element, html: string): Element
```
  
Sets the innerHTML property of the provided element without any sanitation or validation.  
Makes use of the [Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) to trick the browser into thinking the HTML is safe.  
Use this function if the page makes use of the CSP directive `require-trusted-types-for 'script'` and throws a "This document requires 'TrustedHTML' assignment" error on Chromium-based browsers.  
If the browser doesn't support Trusted Types, this function will fall back to regular innerHTML assignment.  
  
⚠️ This function does not perform any sanitization, it only tricks the browser into thinking the HTML is safe and should thus be used with utmost caution, as it can easily cause XSS vulnerabilities!  
A much better way of doing this is by using the [DOMPurify](https://github.com/cure53/DOMPurify#what-about-dompurify-and-trusted-types) library to create your own Trusted Types policy that *actually* sanitizes the HTML and prevents (most) XSS attack vectors.  
You can also find more info [here.](https://web.dev/articles/trusted-types#library)  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { setInnerHtmlUnsafe } from "@sv443-network/userutils";

const myElement = document.querySelector("#my-element");
setInnerHtmlUnsafe(myElement, "<img src='https://picsum.photos/100/100' />");   // hardcoded value, so no XSS risk

const myXssElement = document.querySelector("#my-xss-element");
const userModifiableVariable = `<img onerror="alert('XSS!')" src="invalid" />`; // let's pretend this came from user input
setInnerHtmlUnsafe(myXssElement, userModifiableVariable);                       // <- uses a user-modifiable variable, so big XSS risk!
```
</details>

<br><br>

<!-- #region Math -->
## Math:

### clamp()
Usage:  
```ts
clamp(num: number, min: number, max: number): number
```
  
Clamps a number between a min and max boundary (inclusive).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { clamp } from "@sv443-network/userutils";

clamp(7, 0, 10);     // 7
clamp(-1, 0, 10);    // 0
clamp(5, -5, 0);     // 0
clamp(99999, 0, 10); // 10

// clamp without a min or max boundary:
clamp(-99999, -Infinity, 0); // -99999
clamp(99999, 0, Infinity);   // 99999
```
</details>

<br>

### mapRange()
Usage:  
```ts
mapRange(
  value: number,
  range1min: number,
  range1max: number,
  range2min: number,
  range2max: number
): number
```
  
Maps a number from one range to the spot it would be in another range.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { mapRange } from "@sv443-network/userutils";

mapRange(5, 0, 10, 0, 100); // 50
mapRange(5, 0, 10, 0, 50);  // 25

// to calculate a percentage from arbitrary values, use 0 and 100 as the second range
// for example, if 4 files of a total of 13 were downloaded:
mapRange(4, 0, 13, 0, 100); // 30.76923076923077
```
</details>

<br>

### randRange()
Usages:  
```ts
randRange(min: number, max: number): number
randRange(max: number): number
```
  
Returns a random number between `min` and `max` (inclusive).  
If only one argument is passed, it will be used as the `max` value and `min` will be set to 0.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { randRange } from "@sv443-network/userutils";

randRange(0, 10);  // 4
randRange(10, 20); // 17
randRange(10);     // 7
```
</details>

<br><br>

<!-- #region Misc -->
## Misc:

### DataStore
Usage:  
```ts
new DataStore(options: DataStoreOptions)
```
  
A class that manages a sync & async JSON database that is persistently saved to and loaded from GM storage, localStorage or sessionStorage.  
Also supports automatic migration of outdated data formats via provided migration functions.  
You may create as many instances as you like as long as they have different IDs.  
  
The class' internal methods are all declared as protected, so you can extend this class and override them if you need to add your own functionality, like changing the location data is stored.  
  
If you have multiple DataStore instances and you want to be able to easily and safely export and import their data, take a look at the [DataStoreSerializer](#datastoreserializer) class.  
It combines the data of multiple DataStore instances into a single object that can be exported and imported as a whole by the end user.  
  
⚠️ The data is stored as a JSON string, so only JSON-compatible data can be used. Circular structures and complex objects will throw an error on load and save or cause otherwise unexpected behavior.  
⚠️ The directives `@grant GM.getValue` and `@grant GM.setValue` are required if the storageMethod is left as the default of `"GM"`  
  
The options object has the following properties:
| Property | Description |
| :-- | :-- |
| `id` | A unique internal identification string for this instance. If two DataStores share the same ID, they will overwrite each other's data. Choose wisely because if it is changed, the previously saved data will not be able to be loaded anymore. |
| `defaultData` | The default data to use if no data is saved in persistent storage yet. Until the data is loaded from persistent storage, this will be the data returned by `getData()`. For TypeScript, the type of the data passed here is what will be used for all other methods of the instance. |
| `formatVersion` | An incremental version of the data format. If the format of the data is changed in any way, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively. Never decrement this number or skip numbers. |
| `migrations?` | (Optional) A dictionary of functions that can be used to migrate data from older versions of the data to newer ones. The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value. The values should be functions that take the data in the old format and return the data in the new format. The functions will be run in order from the oldest to the newest version. If the current format version is not in the dictionary, no migrations will be run. |
| `storageMethod?` | (Optional) The method that is used to store the data. Can be `"GM"` (default), `"localStorage"` or `"sessionStorage"`. If you want to store the data in a different way, you can override the methods of the DataStore class. |
| `encodeData?` | (Optional, but required when `decodeData` is set) Function that encodes the data before saving - you can use [compress()](#compress) here to save space at the cost of a little bit of performance |
| `decodeData?` | (Optional, but required when `encodeData` is set) Function that decodes the data when loading - you can use [decompress()](#decompress) here to decode data that was previously compressed with [compress()](#compress) |

<br>

#### Methods:
`loadData(): Promise<TData>`  
Asynchronously loads the data from persistent storage and returns it.  
If no data was saved in persistent storage before, the value of `options.defaultData` will be returned and written to persistent storage.  
If the formatVersion of the saved data is lower than the current one and the `options.migrations` property is present, the data will be migrated to the latest format before the Promise resolves.  
  
`getData(): TData`  
Synchronously returns the current data that is stored in the internal cache.  
If no data was loaded from persistent storage yet using `loadData()`, the value of `options.defaultData` will be returned.  
  
`setData(data: TData): Promise<void>`  
Writes the given data synchronously to the internal cache and asynchronously to persistent storage.  
  
`saveDefaultData(): Promise<void>`  
Writes the default data given in `options.defaultData` synchronously to the internal cache and asynchronously to persistent storage.  
  
`deleteData(): Promise<void>`  
Fully deletes the data from persistent storage only.  
The internal cache will be left untouched, so any subsequent calls to `getData()` will return the data that was last loaded.  
If `loadData()` or `setData()` are called after this, the persistent storage will be populated with the value of `options.defaultData` again.  
This is why you should either immediately repopulate the cache and persistent storage or the page should probably be reloaded or closed after this method is called.  
⚠️ If you want to use this method, the additional directive `@grant GM.deleteValue` is required.  
  
`runMigrations(oldData: any, oldFmtVer: number, resetOnError?: boolean): Promise<TData>`  
Runs all necessary migration functions to migrate the given `oldData` to the latest format.  
If `resetOnError` is set to `false`, the migration will be aborted if an error is thrown and no data will be committed. If it is set to `true` (default) and an error is encountered, it will be suppressed and the `defaultData` will be saved to persistent storage and returned.  
  
`encodingEnabled(): boolean`  
Returns `true` if both `options.encodeData` and `options.decodeData` are set, else `false`.  
Uses TypeScript's type guard notation for easier use in conditional statements.

<br>

<details><summary><b>Example - click to view</b></summary>

```ts
import { DataStore, compress, decompress } from "@sv443-network/userutils";

/** Example: Userscript configuration data */
interface MyConfig {
  foo: string;
  bar: number;
  baz: string;
  qux: string;
}

/** Default data returned by getData() calls until setData() is used and also fallback data if something goes wrong */
const defaultData: MyConfig = {
  foo: "hello",
  bar: 42,
  baz: "xyz",
  qux: "something",
};
/** If any properties are added to, removed from, or renamed in the MyConfig type, increment this number */
const formatVersion = 2;
/** These are functions that migrate outdated data to the latest format - make sure a function exists for every previously used formatVersion and that no numbers are skipped! */
const migrations = {
  // migrate from format version 0 to 1
  1: (oldData: Record<string, unknown>) => {
    return {
      foo: oldData.foo,
      bar: oldData.bar,
      baz: "world",
    };
  },
  // asynchronously migrate from format version 1 to 2
  2: async (oldData: Record<string, unknown>) => {
    // using arbitrary async operations for the new format:
    const qux = await grabQuxDataAsync();
    return {
      foo: oldData.foo,
      bar: oldData.bar,
      baz: oldData.baz,
      qux,
    };
  },
};

// You probably want to export this instance (or helper functions) so you can use it anywhere in your script:
export const manager = new DataStore({
  /** A unique ID for this instance - choose wisely as changing it is not supported and will result in data loss! */
  id: "my-userscript-config",
  /** Default, initial and fallback data */
  defaultData,
  /** The current version of the data format */
  formatVersion,
  /** Data format migration functions called when the formatVersion is increased */
  migrations,
  /**
   * Where the data should be stored.  
   * For example, you could use `"sessionStorage"` to make the data be automatically deleted after the browser session is finished, or use `"localStorage"` if you don't have access to GM storage for some reason.
   */
  storageMethod: "localStorage",

  // Compression example:
  // Adding the following will save space at the cost of a little bit of performance (only for the initial loading and every time new data is saved)
  // Feel free to use your own functions here, as long as they take in the stringified JSON and return another string, either synchronously or asynchronously
  // Either both of these properties or none of them should be set

  /** Compresses the data using the "deflate" algorithm and digests it as a string */
  encodeData: (data) => compress(data, "deflate", "string"),
  /** Decompresses the "deflate" encoded data as a string */
  decodeData: (data) => decompress(data, "deflate", "string"),
});

/** Entrypoint of the userscript */
async function init() {
  // wait for the data to be loaded from persistent storage
  // if no data was saved in persistent storage before or getData() is called before loadData(), the value of options.defaultData will be returned
  // if the previously saved data needs to be migrated to a newer version, it will happen inside this function call
  const configData = await manager.loadData();

  console.log(configData.foo); // "hello"

  // update the data
  configData.foo = "world";
  configData.bar = 123;

  // save the updated data - synchronously to the cache and asynchronously to persistent storage
  manager.saveData(configData).then(() => {
    console.log("Data saved to persistent storage!");
  });

  // the internal cache is updated synchronously, so the updated data can be accessed before the Promise resolves:
  console.log(manager.getData().foo); // "world"
}

init();
```
</details>

<br>

### DataStoreSerializer
Usage:  
```ts
new DataStoreSerializer(stores: DataStore[], options?: DataStoreSerializerOptions)
```

A class that manages serializing and deserializing (exporting and importing) one to infinite DataStore instances.  
The serialized data is a JSON string that can be saved to a file, copied to the clipboard, or stored in any other way.  
Each DataStore instance's settings like data encoding are respected and saved next to the exported data.  
Also, by default a checksum is calculated and importing data with a mismatching checksum will throw an error.  
  
The class' internal methods are all declared as protected, so you can extend this class and override them if you need to add your own functionality.  
  
⚠️ Needs to run in a secure context (HTTPS) due to the use of the SubtleCrypto API.  
  
The options object has the following properties:  
| Property | Description |
| :-- | :-- |
| `addChecksum?` | (Optional) If set to `true` (default), a SHA-256 checksum will be calculated and saved with the serialized data. If set to `false`, no checksum will be calculated and saved. |
| `ensureIntegrity?` | (Optional) If set to `true` (default), the checksum will be checked when importing data and an error will be thrown if it doesn't match. If set to `false`, the checksum will not be checked and no error will be thrown. If no checksum property exists on the imported data (for example because it wasn't enabled in a previous data format version), the checksum check will be skipped regardless of this setting. |

<br>

#### Methods:
`constructor(stores: DataStore[], options?: DataStoreSerializerOptions)`  
Creates a new DataStoreSerializer instance with the given DataStore instances and options.  
If no options are passed, the defaults will be used.  
  
`serialize(): Promise<string>`  
Serializes all DataStore instances passed in the constructor and returns the serialized data as a JSON string.  
<details><summary>Click to view the structure of the returned data.</summary>  

```jsonc
[
  {
    "id": "foo-data",                               // the ID property given to the DataStore instance
    "data": "eJyrVkrKTFeyUkrOKM1LLy1WqgUAMvAF6g==", // serialized data (may be compressed / encoded or not)
    "formatVersion": 2,                             // the format version of the data
    "encoded": true,                                // only set to true if both encodeData and decodeData are set in the DataStore instance
    "checksum": "420deadbeef69",                    // property will be missing if addChecksum is set to false
  },
  {
    // ...
  }
]
```
</details>  
  
`deserialize(data: string): Promise<void>`  
Deserializes the given JSON string and imports the data into the DataStore instances.  
In the process of importing the data, the migrations will be run, if the `formatVersion` property is lower than the one set on the DataStore instance.
  
If `ensureIntegrity` is set to `true` and the checksum doesn't match, an error will be thrown.  
If `ensureIntegrity` is set to `false`, the checksum check will be skipped entirely.  
If the `checksum` property is missing on the imported data, the checksum check will also be skipped.  
If `encoded` is set to `true`, the data will be decoded using the `decodeData` function set on the DataStore instance.  

<br>

<details><summary><b>Example - click to view</b></summary>

```ts
import { DataStore, DataStoreSerializer, compress, decompress } from "@sv443-network/userutils";

/** This store doesn't have migrations to run and also has no encodeData and decodeData functions */
const fooStore = new DataStore({
  id: "foo-data",
  defaultData: {
    foo: "hello",
  },
  formatVersion: 1,
});

/** This store has migrations to run and also has encodeData and decodeData functions */
const barStore = new DataStore({
  id: "bar-data",
  defaultData: {
    foo: "hello",
  },
  formatVersion: 2,
  migrations: {
    2: (oldData) => ({
      ...oldData,
      bar: "world",
    }),
  },
  encodeData: (data) => compress(data, "deflate", "string"),
  decodeData: (data) => decompress(data, "deflate", "string"),
});

const serializer = new DataStoreSerializer([fooStore, barStore], {
  addChecksum: true,
  ensureIntegrity: true,
});

async function exportMyDataPls() {
  // first, make sure the persistent data of the stores is loaded into their caches:
  await fooStore.loadData();
  await barStore.loadData();

  // now serialize the data:
  const serializedData = await serializer.serialize();
  // create a file and download it:
  const blob = new Blob([serializedData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `data_export-${new Date().toISOString()}.json`;
  a.click();
  a.remove();

  // `serialize()` exports a stringified object that looks similar to this:
  // [
  //   {
  //     "id": "foo-data",
  //     "data": "{\"foo\":\"hello\"}", // not compressed or encoded because encodeData and decodeData are not set
  //     "formatVersion": 1,
  //     "encoded": false,
  //     "checksum": "420deadbeef69"
  //   },
  //   {
  //     "id": "bar-data",
  //     "data": "eJyrVkrKTFeyUkrOKM1LLy1WqgUAMvAF6g==", // compressed because encodeData and decodeData are set
  //     "formatVersion": 2,
  //     "encoded": true,
  //     "checksum": "69beefdead420"
  //   }
  // ]
}

async function importMyDataPls() {
  // grab the data from the file by using the system file picker or any other method
  const data = await getDataFromSomewhere();

  try {
    // import the data
    await serializer.deserialize(data);
  }
  catch(err) {
    console.error(err);
    alert(`Data import failed: ${err}`);
  }
}
```
</details>

<br>

### Dialog
Usage:  
```ts
new Dialog(options: DialogOptions)
```  
  
A class that creates a customizable modal dialog with a title (optional), body and footer (optional).  
There are tons of options for customization, like changing the close behavior, translating strings and more.  
  
The options object has the following properties:  
| Property | Description |
| :-- | :-- |
| `id: string` | A unique internal identification string for this instance. If two Dialogs share the same ID, they will overwrite each other. |
| `width: number` | The target and maximum width of the dialog in pixels. |
| `height: number` | The target and maximum height of the dialog in pixels. |
| `renderBody: () => HTMLElement \| Promise<HTMLElement>` | Called to render the body of the dialog. |
| `renderHeader?: () => HTMLElement \| Promise<HTMLElement>` | (Optional) Called to render the header of the dialog. Leave undefined for a blank header. |
| `renderFooter?: () => HTMLElement \| Promise<HTMLElement>` | (Optional) Called to render the footer of the dialog. Leave undefined for no footer. |
| `closeOnBgClick?: boolean` | (Optional) Whether the dialog should close when the background is clicked. Defaults to `true`. |
| `closeOnEscPress?: boolean` | (Optional) Whether the dialog should close when the escape key is pressed. Defaults to `true`. |
| `destroyOnClose?: boolean` | (Optional) Whether the dialog should be destroyed when it's closed. Defaults to `false`. |
| `unmountOnClose?: boolean` | (Optional) Whether the dialog should be unmounted when it's closed. Defaults to `true`. Superseded by `destroyOnClose`. |
| `removeListenersOnDestroy?: boolean` | (Optional) Whether all listeners should be removed when the dialog is destroyed. Defaults to `true`. |
| `small?: boolean` | (Optional) Whether the dialog should have a smaller overall appearance. Defaults to `false`. |
| `verticalAlign?: "top" \| "center" \| "bottom"` | (Optional) Where to align or anchor the dialog vertically. Defaults to `"center"`. |
| `strings?: Partial<typeof defaultStrings>` | (Optional) Strings used in the dialog (used for translations). Defaults to the default English strings (importable with the name `defaultStrings`). |
| `dialogCss?: string` | (Optional) CSS to apply to the dialog. Defaults to the default (importable with the name `defaultDialogCss`). |
  
Methods:  
`open(): Promise<void>`  
Opens the dialog.  
  
`close(): void`  
Closes the dialog.  
  
`mount(): Promise<void>`  
Mounts the dialog to the DOM by calling the render functions provided in the options object.  
Can be done before opening the dialog to avoid a delay.  
  
`unmount(): void`  
Unmounts the dialog from the DOM.  
  
`remount(): Promise<void>`  
Unmounts and mounts the dialog again.  
The render functions in the options object will be called again.  
May cause a flickering effect due to the rendering delay.  
  
`isOpen(): boolean`  
Returns `true` if the dialog is open, else `false`.  
  
`isMounted(): boolean`  
Returns `true` if the dialog is mounted, else `false`.  
  
`destroy(): void`  
Destroys the dialog.  
Removes all listeners and unmounts the dialog by default.  
  
`static getCurrentDialogId(): string`  
Static method that returns the ID of the currently open dialog.  
Needs to be called without creating an instance of the class.  
  
`static getOpenDialogs(): string[]`  
Static method that returns an array of the IDs of all open dialogs.  
Needs to be called without creating an instance of the class.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { Dialog } from "@sv443-network/userutils";

const fooDialog = new Dialog({
  id: "foo-dialog",
  width: 400,
  height: 300,
  renderHeader() {
    const header = document.createElement("div");
    header.textContent = "This is the header";
    return header;
  },
  renderBody() {
    const body = document.createElement("div");
    body.textContent = "This is the body";
    return body;
  },
  renderFooter() {
    const footer = document.createElement("div");
    footer.textContent = "This is the footer";
    return footer;
  },
  closeOnBgClick: true,
  closeOnEscPress: true,
  destroyOnClose: false,
  unmountOnClose: true,
  removeListenersOnDestroy: true,
  small: false,
  verticalAlign: "center",
  strings: {
    closeDialogTooltip: "Click to close",
  },
  dialogCss: getMyCustomDialogCss(),
});

fooDialog.on("close", () => {
  console.log("Dialog closed");
});

fooDialog.open();
```
</details>

<br>

### NanoEmitter
Usage:  
```ts
new NanoEmitter<TEventMap = EventsMap>(options?: NanoEmitterOptions): NanoEmitter<TEventMap>
```  
  
A class that provides a minimalistic event emitter with a tiny footprint powered by [nanoevents.](https://npmjs.com/package/nanoevents)  
The `TEventMap` generic is used to define the events that can be emitted and listened to.  
  
The main intention behind this class is to extend it in your own classes to provide a simple event system directly built into the class.  
However in a functional environment you can also just create instances for use as standalone event emitters throughout your project.  
  
The options object has the following properties:
| Property | Description |
| :-- | :-- |
| `publicEmit?: boolean` | (Optional) If set to true, allows emitting events through the public method `emit()` (`false` by default). |
  
Methods:  
`on<K extends keyof TEventMap>(event: K, listener: TEventMap[K]): void`  
Registers a listener function for the given event.  
May be called multiple times for the same event.  
  
`once<K extends keyof TEventMap>(event: K, listener: TEventMap[K]): void`  
Registers a listener function for the given event that will only be called once.
  
`emit<K extends keyof TEventMap>(event: K, ...args: Parameters<TEventMap[K]>): boolean`  
Emits an event with the given arguments from outside the class instance if `publicEmit` is set to `true`.  
If `publicEmit` is set to `true`, this method will return `true` if the event was emitted.  
If it is set to `false`, it will always return `false` and you will need to use `this.events.emit()` from inside the class instead.  
  
`unsubscribeAll(): void`  
Removes all listeners from all events.  
  
<br>
  
<details><summary><b>Object oriented example - click to view</b></summary>

```ts
import { NanoEmitter } from "@sv443-network/userutils";

// map of events for strong typing - the functions always return void
interface MyEventMap {
  foo: (bar: string) => void;
  baz: (qux: number) => void;
}

class MyClass extends NanoEmitter<MyEventMap> {
  constructor() {
    super({
      // allow emitting events from outside the class
      publicEmit: true,
    });

    this.once("baz", (qux) => {
      console.log("baz event (inside, once):", qux);
    });
  }

  public doStuff() {
    this.emit("foo", "hello");
    this.emit("baz", 42);
    this.emit("foo", "world");
    this.emit("baz", 69);
  }
}

const myInstance = new MyClass();
myInstance.doStuff();

myInstance.on("foo", (bar) => {
  console.log("foo event (outside):", bar);
});

myInstance.emit("baz", "hello from the outside");

myInstance.unsubscribeAll();
```
</details>

<br>

<details><summary><b>Functional example - click to view</b></summary>

```ts
import { NanoEmitter } from "@sv443-network/userutils";

// map of events for strong typing - the functions always return void
interface MyEventMap {
  foo: (bar: string) => void;
  baz: (qux: number) => void;
}

const myEmitter = new NanoEmitter<MyEventMap>({
  // allow emitting events from outside the class
  publicEmit: true,
});

myEmitter.on("foo", (bar) => {
  console.log("foo event:", bar);
});

myEmitter.once("baz", (qux) => {
  console.log("baz event (once):", qux);
});

function doStuff() {
  myEmitter.emit("foo", "hello");
  myEmitter.emit("baz", 42);
  myEmitter.emit("foo", "world");
  myEmitter.emit("baz", 69);

  myEmitter.emit("foo", "hello from the outside");

  myEmitter.unsubscribeAll();
}

doStuff();
```
</details>

<br>

### autoPlural()
Usage:  
```ts
autoPlural(str: string, num: number | Array | NodeList): string
```
  
Automatically pluralizes a string if the given number is not 1.  
If an array or NodeList is passed, the amount of contained items will be used.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { autoPlural } from "@sv443-network/userutils";

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

### pauseFor()
Usage:  
```ts
pauseFor(ms: number): Promise<void>
```
  
Pauses async execution for a given amount of time.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { pauseFor } from "@sv443-network/userutils";

async function run() {
  console.log("Hello");
  await pauseFor(3000); // waits for 3 seconds
  console.log("World");
}
```
</details>

<br>

### debounce()
Usage:  
```ts
debounce(func: Function, timeout?: number, edge?: "falling" | "rising"): Function
```
  
Returns a debounced wrapper function, meaning that the given `func` will only be called once after or before a given amount of time.  
This is very useful for functions that are called repeatedly, like event listeners, to remove a substantial amount of unnecessary calls.  
All parameters passed to the returned function will be passed along to the input `func`  
  
The `timeout` will default to 300ms if left undefined.  
  
The `edge` ("falling" by default) determines if the function should be called after the timeout has passed or before it.  
In simpler terms, this results in "falling" edge functions being called once at the very end of a sequence of calls, and "rising" edge functions being called once at the beginning and possibly multiple times following that, but at the very least they're spaced apart by what's passed in `timeout`.  
  
This diagram can hopefully help bring the difference across:  
<details><summary><b>Click to view the diagram</b></summary>

![debounce function edge diagram](./.github/assets/debounce.png)

</details>

<br>
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { debounce } from "@sv443-network/userutils";

// uses "falling" edge by default:
window.addEventListener("resize", debounce((event) => {
  console.log("Window was resized:", event);
}, 500)); // 500ms timeout

// using "rising" edge:
const myFunc = debounce((event) => {
  console.log("Body was scrolled:", event);
}, 100, "rising"); // 100ms timeout

document.body.addEventListener("scroll", myFunc);
```
</details>

<br>

### fetchAdvanced()
Usage:  
```ts
fetchAdvanced(input: string | Request | URL, options?: {
  timeout?: number,
  // any other options from fetch() except for signal
}): Promise<Response>
```
  
A drop-in replacement for the native `fetch()` function that adds options like a timeout property.  
The timeout will default to 10 seconds if left undefined. Set it to a negative number to disable the timeout.  
Note that the `signal` option will be overwritten if passed.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { fetchAdvanced } from "@sv443-network/userutils";

fetchAdvanced("https://jokeapi.dev/joke/Any?safe-mode", {
  timeout: 5000,
  // also accepts any other fetch options like headers:
  headers: {
    "Accept": "text/plain",
  },
}).then(async (response) => {
  console.log("Fetch data:", await response.text());
}).catch((err) => {
  console.error("Fetch error:", err);
});
```
</details>

<br>

### insertValues()
Usage:  
```ts
insertValues(input: string, ...values: Stringifiable[]): string
```
  
Inserts values into a string in the format `%n`, where `n` is the number of the value, starting at 1.  
The values will be stringified using `toString()` (see [Stringifiable](#stringifiable)) before being inserted into the input string.  
If not enough values are passed, the remaining placeholders will be left untouched.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { insertValues } from "@sv443-network/userutils";

insertValues("Hello, %1!", "World");                        // "Hello, World!"
insertValues("Hello, %1! My name is %2.", "World", "John"); // "Hello, World! My name is John."
insertValues("Testing %1", { toString: () => "foo" });      // "Testing foo"

// using an array for the values and not passing enough arguments:
const values = ["foo", "bar", "baz"];
insertValues("Testing %1, %2, %3 and %4", ...values); // "Testing foo, bar and baz and %4"
```
</details>

<br>

### compress()
Usage:  
```ts
compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType?: "base64"): Promise<string>
compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "arrayBuffer"): Promise<ArrayBuffer>
```
  
Compresses a string or ArrayBuffer using the specified compression format. Most browsers should support at least `gzip` and `deflate`  
The `outputType` dictates which format the output will be in. It will default to `base64` if left undefined.  
  
⚠️ You need to provide the `@grant unsafeWindow` directive if you are using the `base64` output type or you will get a TypeError.  
⚠️ Not all browsers might support compression. Please check [on this page](https://developer.mozilla.org/en-US/docs/Web/API/CompressionStream#browser_compatibility) for compatibility and supported compression formats.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { compress } from "@sv443-network/userutils";

// using gzip:

const fooGz = await compress("Hello, World!", "gzip");
const barGz = await compress("Hello, World!".repeat(20), "gzip");

// not as efficient with short strings but can save quite a lot of space with larger strings:
console.log(fooGz); // "H4sIAAAAAAAAE/NIzcnJ11EIzy/KSVEEANDDSuwNAAAA"
console.log(barGz); // "H4sIAAAAAAAAE/NIzcnJ11EIzy/KSVH0GJkcAKOPcmYEAQAA"

// depending on the type of data you might want to use a different compression format like deflate:

const fooDeflate = await compress("Hello, World!", "deflate");
const barDeflate = await compress("Hello, World!".repeat(20), "deflate");

// again, it's not as efficient initially but gets better with longer inputs:
console.log(fooDeflate); // "eJzzSM3JyddRCM8vyklRBAAfngRq"
console.log(barDeflate); // "eJzzSM3JyddRCM8vyklR9BiZHAAIEVg1"
```
</details>

<br>

### decompress()
Usage:  
```ts
decompress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType?: "string"): Promise<string>
decompress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "arrayBuffer"): Promise<ArrayBuffer>
```
  
Decompresses a string or ArrayBuffer that has been previously [compressed](#compress) using the specified compression format. Most browsers should support at least `gzip` and `deflate`  
The `outputType` dictates which format the output will be in. It will default to `string` if left undefined.  
  
⚠️ You need to provide the `@grant unsafeWindow` directive if you are using the `string` output type or you will get a TypeError.  
⚠️ Not all browsers might support decompression. Please check [on this page](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream#browser_compatibility) for compatibility and supported compression formats.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { compress, decompress } from "@sv443-network/userutils";

const compressed = await compress("Hello, World!".repeat(20), "gzip");

console.log(compressed); // "H4sIAAAAAAAAE/NIzcnJ11EIzy/KSVH0GJkcAKOPcmYEAQAA"

const decompressed = await decompress(compressed, "gzip");

console.log(decompressed); // "Hello, World!"
```
</details>

<br>

### computeHash()
Usage:  
```ts
computeHash(input: string | ArrayBuffer, algorithm?: string): Promise<string>
```
  
Computes a hash / checksum of a string or ArrayBuffer using the specified algorithm ("SHA-256" by default).  
The algorithm must be supported by the [SubtleCrypto API](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest).  
  
⚠️ This function needs to be called in a secure context (HTTPS) due to the use of the SubtleCrypto API.  
⚠️ If you use this for cryptography, make sure to use a secure algorithm (under no circumstances use SHA-1) and to [salt](https://en.wikipedia.org/wiki/Salt_(cryptography)) your input data.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { computeHash } from "@sv443-network/userutils";

async function run() {
  const hash1 = await computeHash("Hello, World!");
  const hash2 = await computeHash("Hello, World!");

  console.log(hash1);           // dffd6021bb2bd5b0af676290809ec3a53191dd81c7f70a4b28688a362182986f
  console.log(hash1 === hash2); // true (same input = same output)

  const hash3 = await computeHash("Hello, world!"); // lowercase "w"
  console.log(hash3); // 315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3
}

run();
```
</details>

<br>

### randomId()
Usage:  
```ts
randomId(length?: number, radix?: number, enhancedEntropy?: boolean): string
```
  
Generates a random ID of a given length and [radix (base).](https://en.wikipedia.org/wiki/Radix)  
  
The default length is 16 and the default radix is 16 (hexadecimal).  
You may change the radix to get digits from different numerical systems.  
Use 2 for binary, 8 for octal, 10 for decimal, 16 for hexadecimal and 36 for alphanumeric.  
  
If `enhancedEntropy` is set to true (false by default), the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) is used for generating the random numbers.  
Note that this takes MUCH longer, but the generated IDs will have a higher entropy.  
  
⚠️ Not suitable for generating anything related to cryptography! Use [SubtleCrypto's `generateKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey) for that instead.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { randomId } from "@sv443-network/userutils";

randomId();       // "1bda419a73629d4f" (length 16, radix 16)
randomId(10);     // "f86cd354a4"       (length 10, radix 16)
randomId(10, 2);  // "1010001101"       (length 10, radix 2)
randomId(10, 10); // "0183428506"       (length 10, radix 10)
randomId(10, 36); // "z46jfpa37r"       (length 10, radix 36)
```
</details>

<br><br>

<!-- #region Arrays -->
## Arrays:

### randomItem()
Usage:  
```ts
randomItem(array: Array): any
```
  
Returns a random item from an array.  
Returns undefined if the array is empty.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { randomItem } from "@sv443-network/userutils";

randomItem(["foo", "bar", "baz"]); // "bar"
randomItem([ ]);                   // undefined
```
</details>

<br>

### randomItemIndex()
Usage:  
```ts
randomItemIndex(array: Array): [item: any, index: number]
```
  
Returns a tuple of a random item and its index from an array.  
If the array is empty, it will return undefined for both values.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { randomItemIndex } from "@sv443-network/userutils";

randomItemIndex(["foo", "bar", "baz"]); // ["bar", 1]
randomItemIndex([ ]);                   // [undefined, undefined]

// using array destructuring:
const [item, index] = randomItemIndex(["foo", "bar", "baz"]); // ["bar", 1]
// or if you only want the index:
const [, index] = randomItemIndex(["foo", "bar", "baz"]); // 1
```
</details>

<br>

### takeRandomItem()
Usage:  
```ts
takeRandomItem(array: Array): any
```
  
Returns a random item from an array and mutates the array by removing the item.  
Returns undefined if the array is empty.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { takeRandomItem } from "@sv443-network/userutils";

const arr = ["foo", "bar", "baz"];
takeRandomItem(arr); // "bar"
console.log(arr);    // ["foo", "baz"]
```
</details>

<br>

### randomizeArray()
Usage:  
```ts
randomizeArray(array: Array): Array
```
  
Returns a copy of an array with its items in a random order.  
If the array is empty, a new, empty array will be returned.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { randomizeArray } from "@sv443-network/userutils";

const foo = [1, 2, 3, 4, 5, 6];

console.log(randomizeArray(foo)); // [3, 1, 5, 2, 4, 6]
console.log(randomizeArray(foo)); // [4, 5, 2, 1, 6, 3]

console.log(foo); // [1, 2, 3, 4, 5, 6] - original array is not mutated
```
</details>

<br><br>

<!-- #region Translation -->
## Translation:
This is a very lightweight translation function that can be used to translate simple strings.  
Pluralization is not supported but can be achieved manually by adding variations to the translations, identified by a different suffix. See the example section of [`tr.addLanguage()`](#traddlanguage) for an example on how this might be done.

<br>

### tr()
Usage:  
```ts
tr(key: string, ...values: Stringifiable[]): string
```
  
The function returns the translation of the passed key in the language added by [`tr.addLanguage()`](#traddlanguage) and set by [`tr.setLanguage()`](#trsetlanguage)  
Should the translation contain placeholders in the format `%n`, where `n` is the number of the value starting at 1, they will be replaced with the respective item of the `values` rest parameter.  
The items of the `values` rest parameter will be stringified using `toString()` (see [Stringifiable](#stringifiable)) before being inserted into the translation.
  
If the key is not found or no language has been added or set before calling this function, it will return the key itself.  
If the key is found and the translation contains placeholders but no values are passed, it will return the translation as-is, including unmodified placeholders.  
If the key is found, the translation doesn't contain placeholders but values are still passed, they will be ignored and the translation will be returned as-is.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addLanguage("en", {
  "welcome": "Welcome",
  "welcome_name": "Welcome, %1",
});
tr.addLanguage("de", {
  "welcome": "Willkommen",
  "welcome_name": "Willkommen, %1",
});

// this has to be called at least once before calling tr()
tr.setLanguage("en");

console.log(tr("welcome"));              // "Welcome"
console.log(tr("welcome_name", "John")); // "Welcome, John"
console.log(tr("non_existent_key"));     // "non_existent_key"

// language can be changed at any time, synchronously
tr.setLanguage("de");

console.log(tr("welcome"));              // "Willkommen"
console.log(tr("welcome_name", "John")); // "Willkommen, John"
```
</details>

<br>

### tr.forLang()
Usage:  
```ts
tr.forLang(language: string, key: string, ...values: Stringifiable[]): string
```  
  
Returns the translation of the passed key in the specified language. Otherwise behaves exactly like [`tr()`](#tr)  
This function does not change the currently active language set by [`tr.setLanguage()`](#trsetlanguage)  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addLanguage("en", {
  "welcome_name": "Welcome, %1",
});

tr.addLanguage("de", {
  "welcome_name": "Willkommen, %1",
});

// the language is set to "en"
tr.setLanguage("en");

console.log(tr("welcome_name", "John"));               // "Welcome"
// the language doesn't need to be changed:
console.log(tr.forLang("de", "welcome_name", "John")); // "Willkommen, John"
```
</details>

<br>

### tr.addLanguage()
Usage:  
```ts
tr.addLanguage(language: string, translations: Record<string, string>): void
```

Adds a language and its associated translations to the translation function.  
The passed language can be any unique identifier, though I recommend sticking to the [ISO 639-1 standard.](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)  
The passed translations should be an object where the key is the translation key used in `tr()` and the value is the translation itself.  
If `tr.addLanguage()` is called multiple times with the same language, the previous translations of that language will be overwritten.  
  
The translation values may contain placeholders in the format `%n`, where `n` is the number of the value starting at 1.  
These can be used to inject values into the translation when calling `tr()`  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

// add a language with associated translations:

tr.addLanguage("de", {
  "color": "Farbe",
});


// with placeholders:

tr.addLanguage("en", {
  "welcome_generic": "Welcome!",
  "welcome_name": "Welcome, %1!",
  "welcome_extended": "Welcome, %1!\nYour last login was on %2\nYou have %3 unread messages",
});


// can be used for different locales too:

tr.addLanguage("en-US", {
  "fries": "french fries",
});
tr.addLanguage("en-GB", {
  "fries": "chips",
});


// apply default values for different locales to reduce redundancy in shared translation values:

const translation_de = {
  "greeting": "Guten Tag!",
  "foo": "Foo",
};
tr.addLanguage("de-DE", translation_de);
tr.addLanguage("de-CH", {
  ...translation_de,
  // overwrite the "greeting" but keep other keys as they are
  "greeting": "Grüezi!",
});
tr.addLanguage("de-AT", {
  ...translation_de,
  // overwrite "greeting" again but keep other keys as they are
  "greeting": "Grüß Gott!",
});


// example for custom pluralization:

tr.addLanguage("en", {
  "cart_items_added-0": "No items were added to the cart",
  "cart_items_added-1": "Added %1 item to the cart",
  "cart_items_added-n": "Added %1 items to the cart",
});

/** Returns the translation key with a custom pluralization identifier added to it for the given number of items (or size of Array/NodeList or anything else with a `length` property) */
function pl(key: string, num: number | Array<unknown> | NodeList | { length: number }) {
  if(typeof num !== "number")
    num = num.length;

  if(num === 0)
    return `${key}-0`;
  else if(num === 1)
    return `${key}-1`;
  else
    return `${key}-n`;
};

const items = [];
console.log(tr(pl("cart_items_added", items), items.length)); // "No items were added to the cart"

items.push("foo");
console.log(tr(pl("cart_items_added", items), items.length)); // "Added 1 item to the cart"

items.push("bar");
console.log(tr(pl("cart_items_added", items), items.length)); // "Added 2 items to the cart"
```
</details>

<br>

### tr.setLanguage()
Usage:  
```ts
tr.setLanguage(language: string): void
```

Synchronously sets the language that will be used for translations.  
No validation is done on the passed language, so make sure it is correct and it has been added with `tr.addLanguage()` before calling `tr()`  
  
For an example, see [`tr()`](#tr)

<br>

### tr.getLanguage()
Usage:  
```ts
tr.getLanguage(): string | undefined
```

Returns the currently active language set by [`tr.setLanguage()`](#trsetlanguage)  
If no language has been set yet, it will return undefined.

<br>

### tr.getTranslations()
Usage:  
```ts
tr.getTranslations(language?: string): Record<string, string> | undefined
```  
  
Returns the translations of the specified language.  
If no language is specified, it will return the translations of the currently active language set by [`tr.setLanguage()`](#trsetlanguage)  
If no translations are found, it will return undefined.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addLanguage("en", {
  "welcome": "Welcome",
});

console.log(tr.getTranslations());     // undefined
tr.setLanguage("en");
console.log(tr.getTranslations());     // { "welcome": "Welcome" }

console.log(tr.getTranslations("en")); // { "welcome": "Welcome" }

console.log(tr.getTranslations("de")); // undefined
```
</details>

<br><br>

## Colors:
The color functions are used to manipulate and convert colors in various formats.  

### hexToRgb()
Usage:  
```ts
hexToRgb(hex: string): [red: number, green: number, blue: number, alpha?: number]
```  
  
Converts a hex color string to an RGB or RGBA color tuple array.  
The values of R, G and B will be in the range of 0-255, while the alpha value will be in the range of 0-1.  
Accepts the formats `#RRGGBB`, `#RRGGBBAA`, `#RGB` and `#RGBA`, with or without the hash symbol.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { hexToRgb } from "@sv443-network/userutils";

hexToRgb("#aaff85aa"); // [170, 255, 133, 0.6666666666666666]
hexToRgb("#ff0000");   // [255, 0, 0, undefined]
hexToRgb("0032ef");    // [0, 50, 239, undefined]
hexToRgb("#0f0");      // [0, 255, 0, undefined]
hexToRgb("0f0f");      // [0, 255, 0, 1]
```
</details>

<br>

### rgbToHex()
Usage:  
```ts
rgbToHex(red: number, green: number, blue: number, alpha?: number, withHash?: boolean, upperCase?: boolean): string
```  
  
Converts RGB or RGBA color values to a hex color string.  
The `withHash` parameter determines if the hash symbol should be included in the output (true by default).  
The `upperCase` parameter determines if the output should be in uppercase (false by default).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { rgbToHex } from "@sv443-network/userutils";

rgbToHex(255, 0, 0);                        // "#ff0000" (with hash symbol, lowercase)
rgbToHex(255, 0, 0, 0.5, false);            // "ff000080" (with alpha, no hash symbol, lowercase)
rgbToHex(255, 0, 0, undefined, true, true); // "#FF0000" (no alpha, with hash symbol, uppercase)
```
</details>

<br>

### lightenColor()
Usage:  
```ts
lightenColor(color: string, percent: number, upperCase?: boolean): string
```  
  
Lightens a CSS color value (in hex, RGB or RGBA format) by a given percentage.  
Will not exceed the maximum range (00-FF or 0-255).  
If the `upperCase` parameter is set to true (default is false), the output will be in uppercase.  
Throws an error if the color format is invalid or not supported.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { lightenColor } from "@sv443-network/userutils";

lightenColor("#ff0000", 20);              // "#ff3333"
lightenColor("#ff0000", 20, true);        // "#FF3333"
lightenColor("rgb(0, 255, 0)", 50);       // "rgb(128, 255, 128)"
lightenColor("rgba(0, 255, 0, 0.5)", 50); // "rgba(128, 255, 128, 0.5)"
```
</details>

<br>

### darkenColor()
Usage:  
```ts
darkenColor(color: string, percent: number, upperCase?: boolean): string
```  
  
Darkens a CSS color value (in hex, RGB or RGBA format) by a given percentage.  
Will not exceed the maximum range (00-FF or 0-255).  
If the `upperCase` parameter is set to true (default is false), the output will be in uppercase.  
Throws an error if the color format is invalid or not supported.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { darkenColor } from "@sv443-network/userutils";

darkenColor("#ff0000", 20);              // "#cc0000"
darkenColor("#ff0000", 20, true);        // "#CC0000"
darkenColor("rgb(0, 255, 0)", 50);       // "rgb(0, 128, 0)"
darkenColor("rgba(0, 255, 0, 0.5)", 50); // "rgba(0, 128, 0, 0.5)"
```
</details>

<br><br>

<!-- #region Utility types -->
## Utility types:
UserUtils also offers some utility types that can be used in TypeScript projects.  
They don't alter the runtime behavior of the code, but they can be used to make the code more readable and to prevent errors.

### Stringifiable
This type describes any value that either is a string itself or can be converted to a string.  
To be considered stringifiable, the object needs to have a `toString()` method that returns a string.  
Most primitives have this method, but something like undefined or null does not (they can only be used in the `String()` constructor or string interpolation).  
Having this method allows not just explicit conversion by calling it, but also implicit conversion by passing it into the `String()` constructor or by interpolating it in a template string.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import type { Stringifiable } from "@sv443-network/userutils";

function logSomething(value: Stringifiable) {
  console.log(`Log: ${value}`); // implicit conversion to a string
}

const fooObject = {
  toString: () => "hello world",
};

const barObject = {
  baz: "",
};

logSomething("foo");     // "Log: foo"
logSomething(42);        // "Log: 42"
logSomething(true);      // "Log: true"
logSomething(Symbol(1)); // "Log: Symbol(1)"
logSomething(fooObject); // "Log: hello world"

logSomething(barObject); // Type error
```
</details>

<br>

## NonEmptyArray
Usage:
```ts
NonEmptyArray<TItem = unknown>
```
  
This type describes an array that has at least one item.  
Use the generic parameter to specify the type of the items in the array.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import type { NonEmptyArray } from "@sv443-network/userutils";

function logFirstItem(array: NonEmptyArray<string>) {
  console.log(parseInt(array[0]));
}

function somethingElse(array: NonEmptyArray) {
  // array is typed as NonEmptyArray<unknown> when not passing a
  // generic parameter, so this throws a TS error:
  console.log(parseInt(array[0])); // Argument of type 'unknown' is not assignable to parameter of type 'string'
}

logFirstItem(["04abc", "69"]); // 4
```
</details>

<br>

## NonEmptyString
Usage:
```ts
NonEmptyString<TString extends string>
```
  
This type describes a string that has at least one character.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import type { NonEmptyString } from "@sv443-network/userutils";

function convertToNumber<T extends string>(str: NonEmptyString<T>) {
  console.log(parseInt(str));
}

convertToNumber("04abc"); // "4"
convertToNumber("");      // type error: Argument of type 'string' is not assignable to parameter of type 'never'
```
</details>

<br>

## LooseUnion
Usage:
```ts
LooseUnion<TUnion extends string | number | object>
```
  
A type that offers autocomplete in the IDE for the passed union but also allows any value of the same type to be passed.  
Supports unions of strings, numbers and objects.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
function foo(bar: LooseUnion<"a" | "b" | "c">) {
  console.log(bar);
}

// when typing the following, autocomplete suggests "a", "b" and "c"
// foo("

foo("a"); // included in autocomplete, no type error
foo("");  // *not* included in autocomplete, still no type error
foo(1);   // type error: Argument of type '1' is not assignable to parameter of type 'LooseUnion<"a" | "b" | "c">'
```
</details>

<br><br><br><br>

<!-- #region Footer -->
<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
