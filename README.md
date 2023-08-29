<div style="text-align: center;" align="center">

## UserUtils
Zero-dependency library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, modify the DOM more easily and more.  
Contains builtin TypeScript declarations. Webpack compatible and supports ESM and CJS.  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

</div>
<br>

## Table of Contents:
- [**Installation**](#installation)
- [**Preamble**](#preamble)
- [**License**](#license)
- [**Features**](#features)
  - [DOM:](#dom)
    - [onSelector()](#onselector) - call a listener once a selector is found in the DOM
    - [initOnSelector()](#initonselector) - needs to be called once to be able to use `onSelector()`
    - [getSelectorMap()](#getselectormap) - returns all currently registered selectors, listeners and options
    - [getUnsafeWindow()](#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [insertAfter()](#insertafter) - insert an element as a sibling after another element
    - [addParent()](#addparent) - add a parent element around another element
    - [addGlobalStyle()](#addglobalstyle) - add a global style to the page
    - [preloadImages()](#preloadimages) - preload images into the browser cache for faster loading later on
    - [openInNewTab()](#openinnewtab) - open a link in a new tab
    - [interceptEvent()](#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [interceptWindowEvent()](#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [amplifyMedia()](#amplifymedia) - amplify an audio or video element's volume past the maximum of 100%
  - [Math:](#math)
    - [clamp()](#clamp) - constrain a number between a min and max value
    - [mapRange()](#maprange) - map a number from one range to the same spot in another range
    - [randRange()](#randrange) - generate a random number between a min and max boundary
  - [Misc:](#misc)
    - [ConfigManager()](#configmanager) - class that manages persistent userscript configurations, including data migration
    - [autoPlural()](#autoplural) - automatically pluralize a string
    - [pauseFor()](#pausefor) - pause the execution of a function for a given amount of time
    - [debounce()](#debounce) - call a function only once, after a given amount of time
    - [fetchAdvanced()](#fetchadvanced) - wrapper around the fetch API with a timeout option
  - [Arrays:](#arrays)
    - [randomItem()](#randomitem) - returns a random item from an array
    - [randomItemIndex()](#randomitemindex) - returns a tuple of a random item and its index from an array
    - [takeRandomItem()](#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [randomizeArray()](#randomizearray) - returns a copy of the array with its items in a random order

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
The usages and examples in this readme are written in TypeScript, but the library can also be used in plain JavaScript.  
  
Some functions require the `@run-at` or `@grant` directives to be tweaked in the userscript header or have other requirements.  
Their documentation will contain a section marked by a warning emoji (⚠️) that will go into more detail.  
  
If the usage contains multiple definitions of the function, each line represents an overload and you can choose which one you want to use.

<br><br>

## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

## Features:

<br>

## DOM:

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
initOnSelector(options?: MutationObserverInit): void
```

Initializes the MutationObserver that is used by [`onSelector()`](#onselector) to check for the registered selectors whenever a DOM change occurs on the `<body>`  
By default, this only checks if elements are added or removed (at any depth).  

⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
The options object is passed directly to the MutationObserver.observe() method.  
Note that `options.subtree` and `options.childList` will be set to true by default.  
You may see all options [here](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options), but these are the important ones:  
> Set `options.attributes` to `true` to also check for attribute changes on every single descendant of the `<body>` (defaults to false).  
> Set `options.characterData` to `true` to also check for character data changes on every single descendant of the `<body>` (defaults to false).  
>   
> ⚠️ Using these extra options can have a performance impact on larger sites or sites with a constantly changing DOM.
  
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

### openInNewTab()
Usage: `openInNewTab(url: string): void`  
  
Creates an invisible anchor with a `_blank` target and clicks it.  
Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
This function has to be run in response to a user interaction event, else the browser might reject it.  
  
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

<br>

### amplifyMedia()
Usage: `amplifyMedia(mediaElement: HTMLMediaElement, multiplier?: number): AmplifyMediaResult`  
  
Amplifies the gain of a media element (like `<audio>` or `<video>`) by a given multiplier (defaults to 1.0).  
This is how you can increase the volume of a media element beyond the default maximum volume of 1.0 or 100%.  
Make sure to limit the multiplier to a reasonable value ([clamp()](#clamp) is good for this), as it may cause clipping or bleeding eardrums.  
  
⚠️ This function has to be run in response to a user interaction event, else the browser will reject it because of the strict autoplay policy.  
  
Returns an object with the following properties:
| Property | Description |
| :-- | :-- |
| `mediaElement` | The passed media element |
| `amplify()` | A function to change the amplification level |
| `getAmpLevel()` | A function to return the current amplification level |
| `context` | The AudioContext instance |
| `source` | The MediaElementSourceNode instance |
| `gain` | The GainNode instance |
  
<details><summary><b>Example - click to view</b></summary>

```ts
const audio = document.querySelector<HTMLAudioElement>("audio");
const button = document.querySelector<HTMLButtonElement>("button");

// amplifyMedia needs to be called in response to a user interaction event:
button.addEventListener("click", () => {
  const { amplify, getAmpLevel } = amplifyMedia(audio);

  const setGain = (value: number) => {
    // constrain the value to between 0 and 5
    amplify(clamp(value, 0, 5));
    console.log("Gain set to", getAmpLevel());
  }

  setGain(2);    // set gain to 2x
  setGain(3.5);  // set gain to 3.5x

  console.log(getAmpLevel()); // 3.5
});
```

</details>

<br><br>

## Math:

### clamp()
Usage: `clamp(num: number, min: number, max: number): number`  
  
Clamps a number between a min and max boundary (inclusive).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
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
Usage: `mapRange(value: number, range_1_min: number, range_1_max: number, range_2_min: number, range_2_max: number): number`  
  
Maps a number from one range to the spot it would be in another range.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
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
randRange(0, 10);  // 4
randRange(10, 20); // 17
randRange(10);     // 7
```

</details>

<br><br>

## Misc:

### ConfigManager()
Usage: `new ConfigManager<TData = any>(options: ConfigManagerOptions)`  
  
A class that manages a userscript's configuration that is persistently saved to and loaded from GM storage.  
Also supports automatic migration of outdated data formats via provided migration functions.  
  
The options object has the following properties:
| Property | Description |
| :-- | :-- |
| `id` | A unique ID for this configuration |
| `defaultConfig` | The default config data to use if no data is saved in persistent storage yet. Until the data is loaded from persistent storage, this will be the data returned by `getData()` |
| `formatVersion` | An incremental version of the data format. If the format of the data is changed, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively. Never decrement this number, but you may skip numbers if you need to for some reason. |
| `migrations?` | (Optional) A dictionary of functions that can be used to migrate data from older versions of the configuration to newer ones. The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value. The values should be functions that take the data in the old format and return the data in the new format. The functions will be run in order from the oldest to the newest version. If the current format version is not in the dictionary, no migrations will be run. |
| `autoLoad?` | (Optional) If set to true, the already stored data in persistent storage is loaded asynchronously as soon as this instance is created. Note that this might cause race conditions as it is uncertain when the internal data cache gets populated. |
  
⚠️ The configuration is stored as a JSON string, so only JSON-compatible data can be used.  
⚠️ The directives `@grant GM.getValue` and `@grant GM.setValue` are required for this to work.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { ConfigManager } from "@sv443-network/userutils";

interface MyConfig {
  foo: string;
  bar: number;
}

/** Default config data */
const defaultConfig: MyConfig = {
  foo: "hello",
  bar: 42,
};
/** If the format of MyConfig changes, increment this number */
const formatVersion = 2;
/** Functions that migrate outdated data to the latest format - make sure a function exists for every previously used formatVersion! */
const migrations = {
  // migrate from format version 0 to 1
  1: (oldData: any) => {
    return {
      foo: oldData.foo,
      bar: oldData.bar,
      baz: "world",
    };
  },
  // asynchronously migrate from format version 1 to 2
  2: async (oldData: any) => {
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

const configMgr = new ConfigManager({
  /** A unique ID for this configuration */
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
  // if no data is saved in persistent storage yet or getData() is called before loadData(), the value of options.defaultConfig will be returned
  const configData = await configMgr.loadData();

  console.log(configData.foo); // "hello"

  // update the config
  configData.foo = "world";
  configData.bar = 123;

  // save the updated config - synchronously to the cache and asynchronously to persistent storage
  configMgr.saveData(configData).then(() => {
    console.log("Config saved to persistent storage!");
  });

  // the internal cache is updated synchronously, so the updated data can be accessed before the Promise resolves:
  console.log(config.getData().foo); // "world"
}

init();
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

<br><br>

## Arrays:

### randomItem()
Usage: `randomItem(array: Array): any`  
  
Returns a random item from an array.  
Returns undefined if the array is empty.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
randomItem(["foo", "bar", "baz"]); // "bar"
randomItem([ ]);                   // undefined
```

</details>

<br>

### randomItemIndex()
Usage: `randomItemIndex(array: Array): [item: any, index: number]`  
  
Returns a tuple of a random item and its index from an array.  
If the array is empty, it will return undefined for both values.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
randomItemIndex(["foo", "bar", "baz"]); // ["bar", 1]
randomItemIndex([ ]);                   // [undefined, undefined]
// using array destructuring:
const [item, index] = randomItemIndex(["foo", "bar", "baz"]);
// or if you only want the index:
const [, index] = randomItemIndex(["foo", "bar", "baz"]);
```

</details>

<br>

### takeRandomItem()
Usage: `takeRandomItem(array: Array): any`  
  
Returns a random item from an array and mutates the array by removing the item.  
Returns undefined if the array is empty.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
const arr = ["foo", "bar", "baz"];
takeRandomItem(arr); // "bar"
console.log(arr);    // ["foo", "baz"]
```

</details>

<br>

### randomizeArray()
Usage: `randomizeArray(array: Array): Array`  
  
Returns a copy of the array with its items in a random order.  
If the array is empty, the originally passed array will be returned.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
randomizeArray([1, 2, 3, 4, 5, 6]); // [3, 1, 5, 2, 4, 6]
```

</details>

<br>

<br><br><br><br>

<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
