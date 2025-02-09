<div style="text-align: center;" align="center">

<!-- #region Description -->
## UserUtils
General purpose DOM/GreaseMonkey library that allows you to register listeners for when CSS selectors exist, intercept events, create persistent & synchronous data stores, modify the DOM more easily and much more.  
Contains builtin TypeScript declarations. Supports ESM and CJS imports via a bundler and global declaration via `@require`  
The library works in any DOM environment with or without the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), but some features will be unavailable or limited.  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>

[![minified bundle size badge](https://badgen.net/bundlephobia/min/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)
[![minified and gzipped bundle size badge](https://badgen.net/bundlephobia/minzip/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)
[![tree shaking support badge](https://badgen.net/bundlephobia/tree-shaking/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)

[![github stargazers badge](https://badgen.net/github/stars/Sv443-Network/UserUtils?icon=github)](https://github.com/Sv443-Network/UserUtils/stargazers)
[![discord server badge](https://badgen.net/discord/online-members/aBH4uRG?icon=discord)](https://dc.sv443.net/)

<sup>
View the documentation of previous major releases:
</sup>
<sub>

<!-- <a href="https://github.com/Sv443-Network/UserUtils/blob/vX.0.0/docs.md" rel="noopener noreferrer">X.0.0</a>, -->
<a href="https://github.com/Sv443-Network/UserUtils/blob/v8.0.0/README.md" rel="noopener noreferrer">8.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v7.0.0/README.md" rel="noopener noreferrer">7.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v6.0.0/README.md" rel="noopener noreferrer">6.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v5.0.0/README.md" rel="noopener noreferrer">5.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v4.0.0/README.md" rel="noopener noreferrer">4.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v3.0.0/README.md" rel="noopener noreferrer">3.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v2.0.0/README.md" rel="noopener noreferrer">2.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v1.0.0/README.md" rel="noopener noreferrer">1.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v0.5.3/README.md" rel="noopener noreferrer">0.5.3</a>

</sub>
</div>
<br>

<!-- #region Table of Contents -->
## Table of Contents:
- [**Installation**](#installation)
- [**License**](#license)
- [**Preamble** (info about the documentation)](./docs.md#preamble)
- [**Features**](./docs.md#features)
  - [**DOM:**](./docs.md#dom)
    - [`SelectorObserver`](./docs.md#selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - [`getUnsafeWindow()`](./docs.md#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [`addParent()`](./docs.md#addparent) - add a parent element around another element
    - [`addGlobalStyle()`](./docs.md#addglobalstyle) - add a global style to the page
    - [`preloadImages()`](./docs.md#preloadimages) - preload images into the browser cache for faster loading later on
    - [`openInNewTab()`](./docs.md#openinnewtab) - open a link in a new tab
    - [`interceptEvent()`](./docs.md#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [`interceptWindowEvent()`](./docs.md#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [`isScrollable()`](./docs.md#isscrollable) - check if an element has a horizontal or vertical scroll bar
    - [`observeElementProp()`](./docs.md#observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - [`getSiblingsFrame()`](./docs.md#getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
    - [`setInnerHtmlUnsafe()`](./docs.md#setinnerhtmlunsafe) - set the innerHTML of an element using a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) without sanitizing or escaping it
  - [**Math:**](./docs.md#math)
    - [`clamp()`](./docs.md#clamp) - constrain a number between a min and max value
    - [`mapRange()`](./docs.md#maprange) - map a number from one range to the same spot in another range
    - [`randRange()`](./docs.md#randrange) - generate a random number between a min and max boundary
    - [`digitCount()`](./docs.md#digitcount) - calculate the amount of digits in a number
  - [**Misc:**](./docs.md#misc)
    - [`DataStore`](./docs.md#datastore) - class that manages a hybrid sync & async persistent JSON database, including data migration
    - [`DataStoreSerializer`](./docs.md#datastoreserializer) - class for importing & exporting data of multiple DataStore instances, including compression, checksumming and running migrations
    - [`Dialog`](./docs.md#dialog) - class for creating custom modal dialogs with a promise-based API and a generic, default style
    - [`NanoEmitter`](./docs.md#nanoemitter) - tiny event emitter class with a focus on performance and simplicity (based on [nanoevents](https://npmjs.com/package/nanoevents))
    - [`Debouncer`](./docs.md#debouncer) - class for debouncing function calls with a given timeout
    - [`debounce()`](./docs.md#debounce) - function wrapper for the Debouncer class for easier usage
    - [`autoPlural()`](./docs.md#autoplural) - automatically pluralize a string
    - [`pauseFor()`](./docs.md#pausefor) - pause the execution of a function for a given amount of time
    - [`fetchAdvanced()`](./docs.md#fetchadvanced) - wrapper around the fetch API with a timeout option
    - [`insertValues()`](./docs.md#insertvalues) - insert values into a string at specified placeholders
    - [`compress()`](./docs.md#compress) - compress a string with Gzip or Deflate
    - [`decompress()`](./docs.md#decompress) - decompress a previously compressed string
    - [`computeHash()`](./docs.md#computehash) - compute the hash / checksum of a string or ArrayBuffer
    - [`randomId()`](./docs.md#randomid) - generate a random ID of a given length and radix
    - [`consumeGen()`](./docs.md#consumegen) - consumes a ValueGen and returns the value
    - [`consumeStringGen()`](./docs.md#consumestringgen) - consumes a StringGen and returns the string
  - [**Arrays:**](./docs.md#arrays)
    - [`randomItem()`](./docs.md#randomitem) - returns a random item from an array
    - [`randomItemIndex()`](./docs.md#randomitemindex) - returns a tuple of a random item and its index from an array
    - [`takeRandomItem()`](./docs.md#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [`randomizeArray()`](./docs.md#randomizearray) - returns a copy of the array with its items in a random order
  - [**Translation:**](./docs.md#translation)
    - [`tr.for()`](./docs.md#trfor) - translates a key for the specified language
    - [`tr.use()`](./docs.md#truse) - creates a translation function for the specified language
    - [`tr.hasKey()`](./docs.md#trhaskey) - checks if a key exists in the given language
    - [`tr.addTranslations()`](./docs.md#traddtranslations) - add a flat or recursive translation object for a language
    - [`tr.getTranslations()`](./docs.md#trgettranslations) - returns the translation object for a language
    - [`tr.deleteTranslations()`](./docs.md#trdeletetranslations) - delete the translation object for a language
    - [`tr.setFallbackLanguage()`](./docs.md#trsetfallbacklanguage) - set the fallback language used when a key is not found in the given language
    - [`tr.getFallbackLanguage()`](./docs.md#trgetfallbacklanguage) - returns the fallback language
    - [`tr.addTransform()`](./docs.md#traddtransform) - adds a transform function to the translation system for custom argument insertion and much more
    - [`tr.deleteTransform()`](./docs.md#trdeletetransform) - removes a transform function
    - [`tr.transforms`](./docs.md#trtransforms) - predefined transform functions for quickly adding custom argument insertion
    - [`TrKeys`](./docs.md#trkeys) - generic type that extracts all keys from a flat or recursive translation object into a union
  - [**Colors:**](./docs.md#colors)
    - [`hexToRgb()`](./docs.md#hextorgb) - convert a hex color string to an RGB or RGBA value tuple
    - [`rgbToHex()`](./docs.md#rgbtohex) - convert RGB or RGBA values to a hex color string
    - [`lightenColor()`](./docs.md#lightencolor) - lighten a CSS color string (hex, rgb or rgba) by a given percentage
    - [`darkenColor()`](./docs.md#darkencolor) - darken a CSS color string (hex, rgb or rgba) by a given percentage
  - [**Utility types for TypeScript:**](./docs.md#utility-types)
    - [`Stringifiable`](./docs.md#stringifiable) - any value that is a string or can be converted to one (implicitly or explicitly)
    - [`NonEmptyArray`](./docs.md#nonemptyarray) - any array that should have at least one item
    - [`NonEmptyString`](./docs.md#nonemptystring) - any string that should have at least one character
    - [`LooseUnion`](./docs.md#looseunion) - a union that gives autocomplete in the IDE but also allows any other value of the same type
    - [`Prettify`](./docs.md#prettify) - expands a complex type into a more readable format while keeping functionality the same
    - [`ValueGen`](./docs.md#valuegen) - a "generator" value that allows for super flexible value typing and declaration
    - [`StringGen`](./docs.md#stringgen) - a "generator" string that allows for super flexible string typing and declaration, including enhanced support for unions
    - [`ListWithLength`](./docs.md#listwithlength) - represents an array or object with a numeric `length`, `count` or `size` property

<br><br>

<!-- #region Installation -->
## Installation:
Shameless plug: I made a [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
  
- If you are using a bundler (like webpack, rollup, vite, etc.), you can install this package in one of the following ways:
  ```
  npm i @sv443-network/userutils
  pnpm i @sv443-network/userutils
  yarn add @sv443-network/userutils
  npx jsr install @sv443-network/userutils
  deno add jsr:@sv443-network/userutils
  ```
  Then import it in your script as usual:  
  
  ```ts
  // on Node:
  import { addGlobalStyle } from "@sv443-network/userutils";

  // on Deno:
  import { addGlobalStyle } from "jsr:@sv443-network/userutils";

  // you can also import the entire library as an object (not recommended because of worse treeshaking support):
  import * as UserUtils from "@sv443-network/userutils";
  ```

<br>

- If you are not using a bundler, want to reduce the size of your script, or declared the package as external in your bundler, you can include the latest release by adding one of these directives to the userscript header, depending on your preferred CDN:
  
  Versioned (recommended):
  ```
  // @require https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js
  // @require https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js
  ```
  Non-versioned (not recommended because it auto-updates):
  ```
  // @require https://update.greasyfork.org/scripts/472956/UserUtils.js
  // @require https://openuserjs.org/src/libs/Sv443/UserUtils.js
  ```

- If you are using this library in a generic DOM environment without access to the GreaseMonkey API, either download the latest release from the [releases page](https://github.com/Sv443-Network/UserUtils/releases) to include in your project or add one of the following tags to the &lt;head&gt;:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js"></script>
  <script src="https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js"></script>
  ```

> [!NOTE]  
> In order for your script not to break on a major library update, use one the versioned URLs above after replacing `INSERT_VERSION` with the desired version (e.g. `8.3.2`) or the versioned URL that's shown [at the top of the GreasyFork page.](https://greasyfork.org/scripts/472956-userutils)  

<br>

- Then, access the functions on the global variable `UserUtils`:
  
  ```ts
  UserUtils.addGlobalStyle("body { background-color: red; }");

  // or using object destructuring:

  const { clamp } = UserUtils;
  console.log(clamp(1, 5, 10)); // 5
  ```

<br>

- If you're using TypeScript and it complains about the missing global variable `UserUtils`, install the library using the package manager of your choice and add the following inside any `.ts` file that is included in the final build:  
  
  ```ts
  declare const UserUtils: typeof import("@sv443-network/userutils");

  declare global {
    interface Window {
      UserUtils: typeof UserUtils;
    }
  }
  ```

<br>

- If you're using a linter like ESLint, it might complain about the global variable `UserUtils` not being defined. To fix this, add the following to your ESLint configuration file:
  ```json
  "globals": {
      "UserUtils": "readonly"
  }
  ```

<br><br>

<!-- #region License -->
## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br><br><br>

<!-- #region Footer -->
<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting the development](https://github.com/sponsors/Sv443)

</div>
