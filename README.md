<div style="text-align: center;" align="center">

## UserUtils
Zero-dependency library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, manage persistent user configurations, modify the DOM more easily and more.  
  
Contains builtin TypeScript declarations. Webpack compatible and supports ESM and CJS.  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

</div>
<br>

## Table of Contents:
- [**Installation**](#installation)
- [**Preamble**](#preamble)
- [**License**](#license)
- [**Features**](#features)
  - [**DOM:**](#dom)
    - [SelectorObserver](#selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - [getUnsafeWindow()](#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [insertAfter()](#insertafter) - insert an element as a sibling after another element
    - [addParent()](#addparent) - add a parent element around another element
    - [addGlobalStyle()](#addglobalstyle) - add a global style to the page
    - [preloadImages()](#preloadimages) - preload images into the browser cache for faster loading later on
    - [openInNewTab()](#openinnewtab) - open a link in a new tab
    - [interceptEvent()](#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [interceptWindowEvent()](#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [amplifyMedia()](#amplifymedia) - amplify an audio or video element's volume past the maximum of 100%
    - [isScrollable()](#isscrollable) - check if an element has a horizontal or vertical scroll bar
  - [**Math:**](#math)
    - [clamp()](#clamp) - constrain a number between a min and max value
    - [mapRange()](#maprange) - map a number from one range to the same spot in another range
    - [randRange()](#randrange) - generate a random number between a min and max boundary
  - [**Misc:**](#misc)
    - [ConfigManager](#configmanager) - class that manages persistent userscript configurations, including data migration
    - [autoPlural()](#autoplural) - automatically pluralize a string
    - [pauseFor()](#pausefor) - pause the execution of a function for a given amount of time
    - [debounce()](#debounce) - call a function only once, after a given amount of time
    - [fetchAdvanced()](#fetchadvanced) - wrapper around the fetch API with a timeout option
    - [insertValues()](#insertvalues) - insert values into a string at specified placeholders
  - [**Arrays:**](#arrays)
    - [randomItem()](#randomitem) - returns a random item from an array
    - [randomItemIndex()](#randomitemindex) - returns a tuple of a random item and its index from an array
    - [takeRandomItem()](#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [randomizeArray()](#randomizearray) - returns a copy of the array with its items in a random order
  - [**Translation:**](#translation)
    - [tr()](#tr) - simple translation of a string to another language
    - [tr.addLanguage()](#traddlanguage) - add a language and its translations
    - [tr.setLanguage()](#trsetlanguage) - set the currently active language for translations
    - [tr.getLanguage()](#trgetlanguage) - returns the currently active language
  - [**Utility types for TypeScript:**](#utility-types)
    - [Stringifiable](#stringifiable) - any value that is a string or can be converted to one (implicitly or explicitly)

<br><br>

## Installation:
- If you are using a bundler like webpack, you can install this package using npm:
  ```
  npm i @sv443-network/userutils
  ```
  Then, import it in your script as usual:
  ```ts
  import { addGlobalStyle } from "@sv443-network/userutils";

  // or just import everything (not recommended because this doesn't allow for treeshaking):

  import * as UserUtils from "@sv443-network/userutils";
  ```
  Shameless plug: I made a [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.

<br>

- If you are not using a bundler, you can include the latest release from GreasyFork by adding this directive to the userscript header:
  ```
  // @require https://greasyfork.org/scripts/472956-userutils/code/UserUtils.js
  ```

  Then, access the functions on the global variable `UserUtils`:
  ```ts
  UserUtils.addGlobalStyle("body { background-color: red; }");

  // or using object destructuring:

  const { clamp } = UserUtils;
  console.log(clamp(1, 5, 10); // 5
  ```

<br><br>

## Preamble:
This library is written in TypeScript and contains builtin TypeScript declarations.  
  
Each feature has example code that can be expanded by clicking on the text "Example - click to view".  
The usages and examples are written in TypeScript, but the library can also be used in plain JavaScript after removing the type annotations (and changing the imports if you are using CommonJS).  
If the usage section contains multiple definitions of the function, each occurrence represents an overload and you can choose which one you want to use.  
  
Some features require the `@run-at` or `@grant` directives to be tweaked in the userscript header or have other requirements.  
Their documentation will contain a section marked by a warning emoji (⚠️) that will go into more detail.

<br><br>

## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

## Features:

<br>

## DOM:

### SelectorObserver
Usage:  
```ts
new SelectorObserver(baseElement: Element, options?: MutationObserverInit)
```

A class that manages listeners that are called when selectors are found in the DOM.  
<!-- TODO: -->

<br>

### Methods:
`addListener<TElement = HTMLElement>(selector: string, options: SelectorListenerOptions): void`  
Adds a listener (specified in `options.listener`) for the given selector that will be called once the selector exists in the DOM. It will be passed the element(s) that match the selector as the only argument.  
The listener will be called immediately if the selector already exists in the DOM.  
  
If `options.all` is set to true, querySelectorAll() will be used instead and the listener will be passed a `NodeList` of matching elements.  
This will also include elements that were already found in a previous listener call.  
If set to false (default), querySelector() will be used and only the first matching element will be returned.  
  
If `options.continuous` is set to true, the listener will not be deregistered after it was called once (defaults to false).  
  
If `options.debounce` is set to a number above 0, the listener will be debounced by that amount of milliseconds (defaults to 0).  
E.g. if the debounce time is set to 200 and the selector is found twice within 100ms, only the last call of the listener will be executed.  
  
When using TypeScript, the generic `TElement` can be used to specify the type of the element(s) that the listener will return.  
It will default to HTMLElement if left undefined.  
  
<br>

`disable(): void`  
Disables the observation of the child elements.  
If selectors are currently being checked, the current selector will be finished before disabling.  
  
<br>

`enable(): void`  
Enables the observation of the child elements if it was disabled before.  
  
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

document.addEventListener("DOMContentLoaded", () => {
  // adding a single-shot listener:

  const fooObserver = new SelectorObserver(document.body);

  fooObserver.addListener("#my-element", {
    listener: (element) => {
      console.log("Element found:", element);
    },
  });


  // adding custom observer options:

  const barObserver = new SelectorObserver(document.body, {
    // only check if the following attributes change:
    attributeFilter: ["class", "style", "data-whatever"],
  });

  observer.addListener("#my-element", {
    listener: (element) => {
      console.log("Element attributes changed:", element);
    },
  });


  // using custom listener options:

  const bazObserver = new SelectorObserver(document.body);

  // for TypeScript, specify that input elements are returned by the listener:
  bazObserver.addListener<HTMLInputElement>("input", {
    all: true,        // use querySelectorAll() instead of querySelector()
    continuous: true, // don't remove the listener after it was called once
    debounce: 50,     // debounce the listener by 50ms
    listener: (elements) => {
      console.log("Input elements found:", elements);
    },
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

document.addEventListener("DOMContentLoaded", () => {
  // initialize generic observer that in turn initializes "sub-observers":
  const fooObserver = new SelectorObserver(document.body);

  fooObserver.addListener("#my-element", {
    listener: (element) => {
      // only initialize the observer once it is actually needed (when #my-element exists):
      const barObserver = new SelectorObserver(element);

      barObserver.addListener(".my-child-element", {
        all: true,
        continuous: true,
        listener: (elements) => {
          console.log("Child elements found:", elements);
        },
      });
    },
  });
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
Userscripts are sandboxed and do not have access to the regular window object, so this function is useful for websites that reject some events that were dispatched by the userscript.  
  
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

### insertAfter()
Usage:  
```ts
insertAfter(beforeElement: Element, afterElement: Element): Element
```
  
Inserts the element passed as `afterElement` as a sibling after the passed `beforeElement`.  
The passed `afterElement` will be returned.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { insertAfter } from "@sv443-network/userutils";

// insert a <div> as a sibling next to an element
const beforeElement = document.querySelector("#before");
const afterElement = document.createElement("div");
afterElement.innerText = "After";

insertAfter(beforeElement, afterElement);
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
addGlobalStyle(css: string): void
```
  
Adds a global style to the page in form of a `<style>` element that's inserted into the `<head>`.  
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
preloadImages(urls: string[], rejects?: boolean): Promise<void>
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
  });
```

</details>

<br>

### openInNewTab()
Usage:  
```ts
openInNewTab(url: string): void
```
  
Creates an invisible anchor with a `_blank` target and clicks it.  
Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
This function has to be run in response to a user interaction event, else the browser might reject it.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { openInNewTab } from "@sv443-network/userutils";

document.querySelector("#my-button").addEventListener("click", () => {
  openInNewTab("https://example.org/");
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
  predicate: (event: Event) => boolean
): void
```
  
Intercepts all events dispatched on the `eventObject` and prevents the listeners from being called as long as the predicate function returns a truthy value.  
Calling this function will set the `Error.stackTraceLimit` to 1000 (if it's not already higher) to ensure the stack trace is preserved.  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { interceptEvent } from "@sv443-network/userutils";

interceptEvent(document.body, "click", (event) => {
  console.log("Intercepting click event:", event);
  return true; // prevent all click events on the body element
});
```

</details>

<br>

### interceptWindowEvent()
Usage:  
```ts
interceptWindowEvent(
  eventName: string,
  predicate: (event: Event) => boolean
): void
```
  
Intercepts all events dispatched on the `window` object and prevents the listeners from being called as long as the predicate function returns a truthy value.  
This is essentially the same as [`interceptEvent()`](#interceptevent), but automatically uses the `unsafeWindow` (or falls back to regular `window`).  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are *attached* after this function is called.  
⚠️ In order for all events to be interceptable, the directive `@grant unsafeWindow` should be set.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { interceptWindowEvent } from "@sv443-network/userutils";

interceptWindowEvent("beforeunload", (event) => {
  return true; // prevent the pesky "Are you sure you want to leave this page?" popup
});
```

</details>

<br>

### amplifyMedia()
Usage:  
```ts
amplifyMedia(mediaElement: HTMLMediaElement, initialMultiplier?: number): AmplifyMediaResult
```
  
Amplifies the gain of a media element (like `<audio>` or `<video>`) by a given multiplier (defaults to 1.0).  
This is how you can increase the volume of a media element beyond the default maximum volume of 1.0 or 100%.  
Make sure to limit the multiplier to a reasonable value ([clamp()](#clamp) is good for this), as it may cause bleeding eardrums.  
  
This is the processing workflow applied to the media element:  
`MediaElement (source)` => `DynamicsCompressorNode (limiter)` => `GainNode` => `AudioDestination (output)`  
  
A limiter (compression) is applied to the audio to prevent clipping.  
Its properties can be changed by calling the returned function `setLimiterOptions()`  
The limiter options set by default are `{ threshold: -12, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }`  
  
⚠️ This function has to be run in response to a user interaction event, else the browser will reject it because of the strict autoplay policy.  
⚠️ Make sure to call the returned function `enable()` after calling this function to actually enable the amplification.  
  
The returned object of the type `AmplifyMediaResult` has the following properties:
| Property | Description |
| :-- | :-- |
| `setGain()` | Used to change the gain multiplier |
| `getGain()` | Returns the current gain multiplier |
| `enable()` | Call to enable the amplification for the first time or if it was disabled before |
| `disable()` | Call to disable amplification |
| `setLimiterOptions()` | Used for changing the [options of the DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode#options) - the default is `{ threshold: -12, knee: 30, ratio: 12, attack: 0.003, release: 0.25 }` |
| `context` | The AudioContext instance |
| `source` | The MediaElementSourceNode instance |
| `gainNode` | The GainNode instance used for actually boosting the gain |
| `limiterNode` | The DynamicsCompressorNode instance used for limiting clipping and distortion |
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { amplifyMedia, clamp } from "@sv443-network/userutils";
import type { AmplifyMediaResult } from "@sv443-network/userutils";

const audioElement = document.querySelector<HTMLAudioElement>("audio");

let ampResult: AmplifyMediaResult | undefined;

function setGain(newValue: number) {
  if(!ampResult)
    return;
  // constrain the value to between 0 and 3 for safety
  ampResult.setGain(clamp(newValue, 0, 3));
  console.log("Gain set to", ampResult.getGain());
}


const amplifyButton = document.querySelector<HTMLButtonElement>("button#amplify");

// amplifyMedia() needs to be called in response to a user interaction event:
amplifyButton.addEventListener("click", () => {
  // only needs to be initialized once, afterwards the returned object
  // can be used to change settings and enable/disable the amplification
  if(!ampResult) {
    // initialize amplification and set gain to 2x
    ampResult = amplifyMedia(audioElement, 2);
    // enable the amplification
    ampResult.enable();
  }

  setGain(2.5);  // set gain to 2.5x

  console.log(ampResult.getGain()); // 2.5
});


const disableButton = document.querySelector<HTMLButtonElement>("button#disable");

disableButton.addEventListener("click", () => {
  if(ampResult) {
    // disable the amplification
    ampResult.disable();
  }
});


const limiterButton = document.querySelector<HTMLButtonElement>("button#limiter");

limiterButton.addEventListener("click", () => {
  if(ampResult) {
    // change the limiter options to a more aggressive setting
    // see https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode#options
    ampResult.setLimiterOptions({
      threshold: -10,
      knee: 20,
      ratio: 20,
      attack: 0.001,
      release: 0.1,
    });
  }
});
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

<br><br>

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

## Misc:

### ConfigManager
Usage:  
```ts
new ConfigManager(options: ConfigManagerOptions)
```
  
A class that manages a userscript's configuration that is persistently saved to and loaded from GM storage.  
Also supports automatic migration of outdated data formats via provided migration functions.  
You may create as many instances as you like as long as they have different IDs.  
  
⚠️ The configuration is stored as a JSON string, so only JSON-compatible data can be used. Circular structures and complex objects will throw an error on load and save.  
⚠️ The directives `@grant GM.getValue` and `@grant GM.setValue` are required for this to work.  
  
The options object has the following properties:
| Property | Description |
| :-- | :-- |
| `id` | A unique internal identification string for this configuration. If two ConfigManagers share the same ID, they will overwrite each other's data. Choose wisely because if it is changed, the previously saved data will not be able to be loaded anymore. |
| `defaultConfig` | The default config data to use if no data is saved in persistent storage yet. Until the data is loaded from persistent storage, this will be the data returned by `getData()`. For TypeScript, the type of the data passed here is what will be used for all other methods of the instance. |
| `formatVersion` | An incremental version of the data format. If the format of the data is changed in any way, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively. Never decrement this number or skip numbers. |
| `migrations?` | (Optional) A dictionary of functions that can be used to migrate data from older versions of the configuration to newer ones. The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value. The values should be functions that take the data in the old format and return the data in the new format. The functions will be run in order from the oldest to the newest version. If the current format version is not in the dictionary, no migrations will be run. |

<br>

### Methods:
`loadData(): Promise<TData>`  
Asynchronously loads the configuration data from persistent storage and returns it.  
If no data was saved in persistent storage before, the value of `options.defaultConfig` will be returned and written to persistent storage.  
If the formatVersion of the saved data is lower than the current one and the `options.migrations` property is present, the data will be migrated to the latest format before the Promise resolves.  
  
`getData(): TData`  
Synchronously returns the current data that is stored in the internal cache.  
If no data was loaded from persistent storage yet using `loadData()`, the value of `options.defaultConfig` will be returned.  
  
`setData(data: TData): Promise<void>`  
Writes the given data synchronously to the internal cache and asynchronously to persistent storage.  
  
`saveDefaultData(): Promise<void>`  
Writes the default configuration given in `options.defaultConfig` synchronously to the internal cache and asynchronously to persistent storage.  
  
`deleteConfig(): Promise<void>`  
Fully deletes the configuration from persistent storage.  
The internal cache will be left untouched, so any subsequent calls to `getData()` will return the data that was last loaded.  
If `loadData()` or `setData()` are called after this, the persistent storage will be populated with the value of `options.defaultConfig` again.  
⚠️ If you want to use this method, the additional directive `@grant GM.deleteValue` is required.  

<br>

<details><summary><b>Example - click to view</b></summary>

```ts
import { ConfigManager } from "@sv443-network/userutils";

interface MyConfig {
  foo: string;
  bar: number;
  baz: string;
  qux: string;
}

/** Default config data */
const defaultConfig: MyConfig = {
  foo: "hello",
  bar: 42,
  baz: "xyz",
  qux: "something",
};
/** If any properties are added to, removed from or renamed in MyConfig, increment this number */
const formatVersion = 2;
/** Functions that migrate outdated data to the latest format - make sure a function exists for every previously used formatVersion and that no numbers are skipped! */
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
    // arbitrary async operation required for the new format
    const qux = JSON.parse(await (await fetch("https://api.example.org/some-data")).text());
    return {
      foo: oldData.foo,
      bar: oldData.bar,
      baz: oldData.baz,
      qux,
    };
  },
};

const manager = new ConfigManager({
  /** A unique ID for this configuration - choose wisely as changing it is not supported yet! */
  id: "my-userscript",
  /** Default / fallback configuration data */
  defaultConfig,
  /** The current version of the script's config data format */
  formatVersion,
  /** Data format migration functions */
  migrations,
});

/** Entrypoint of the userscript */
async function init() {
  // wait for the config to be loaded from persistent storage
  // if no data was saved in persistent storage before or getData() is called before loadData(), the value of options.defaultConfig will be returned
  // if the previously saved data needs to be migrated to a newer version, it will happen in this function call
  const configData = await manager.loadData();

  console.log(configData.foo); // "hello"

  // update the config
  configData.foo = "world";
  configData.bar = 123;

  // save the updated config - synchronously to the cache and asynchronously to persistent storage
  manager.saveData(configData).then(() => {
    console.log("Config saved to persistent storage!");
  });

  // the internal cache is updated synchronously, so the updated data can be accessed before the Promise resolves:
  console.log(manager.getData().foo); // "world"
}

init();
```

</details>

<br><br>

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
debounce(func: Function, timeout?: number): Function
```
  
Debounces a function, meaning that it will only be called once after a given amount of time.  
This is very useful for functions that are called repeatedly, like event listeners, to remove extraneous calls.  
All passed properties will be passed down to the debounced function.  
The timeout will default to 300ms if left undefined.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { debounce } from "@sv443-network/userutils";

window.addEventListener("resize", debounce((event) => {
  console.log("Window was resized:", event);
}, 500)); // 500ms timeout
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
import { fetchAdvanced } from "@sv443-network/userutils";

fetchAdvanced("https://jokeapi.dev/joke/Any?safe-mode", {
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

<br><br>

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
If the array is empty, the originally passed empty array will be returned without copying.  
  
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
  "items_added-0": "Added %1 items to your cart",
  "items_added-1": "Added %1 item to your cart",
  "items_added-n": "Added all %1 items to your cart",
});

/** Returns the custom pluralization identifier for the given number of items (or size of Array/NodeList) */
function pl(num: number | unknown[] | NodeList) {
  if(typeof num !== "number")
    num = num.length;

  if(num === 0)
    return "0";
  else if(num === 1)
    return "1";
  else
    return "n";
};

const items = [];
tr(`items_added-${pl(items)}`, items.length); // "Added 0 items to your cart"

items.push("foo");
tr(`items_added-${pl(items)}`, items.length); // "Added 1 item to your cart"

items.push("bar");
tr(`items_added-${pl(items)}`, items.length); // "Added all 2 items to your cart"
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

<br><br>

## Utility types:
UserUtils also offers some utility types that can be used in TypeScript projects.  
They don't alter the runtime behavior of the code, but they can be used to make the code more readable and to prevent errors.

### Stringifiable
This type describes any value that either is a string itself or can be converted to a string.  
To be considered stringifiable, the object needs to have a `toString()` method that returns a string (all primitive types have this method).  
This method allows not just explicit conversion by calling it, but also implicit conversion by passing it into the `String()` constructor or by interpolating it in a template string.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import type { Stringifiable } from "@sv443-network/userutils";

function logSomething(value: Stringifiable) {
  console.log(`Log: ${value}`); // implicit conversion using `value.toString()`
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
logSomething({});        // "Log: [object Object]"
logSomething(Symbol(1)); // "Log: Symbol(1)"
logSomething(fooObject); // "Log: hello world"
logSomething(barObject); // type error
```

</details>

<br><br><br><br>

<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
