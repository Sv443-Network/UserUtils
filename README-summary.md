## UserUtils
General purpose DOM/GreaseMonkey library that allows you to register listeners for when CSS selectors exist, intercept events, create persistent & synchronous data stores, modify the DOM more easily and much more.  
Contains builtin TypeScript declarations. Supports ESM and CJS imports via a bundler and global declaration via `@require` or `<script>`  
The library works in any DOM environment with or without the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), but some features will be unavailable or limited.  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>

[![Tree shaking support badge](https://badgen.net/bundlephobia/tree-shaking/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)
[![Code coverage percentage badge](https://img.shields.io/coverallsCoverage/github/Sv443-Network/UserUtils?branch=main)](https://coveralls.io/github/Sv443-Network/UserUtils)
[![Minified bundle size badge](https://badgen.net/bundlephobia/min/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)
[![Minified and gzipped bundle size badge](https://badgen.net/bundlephobia/minzip/@sv443-network/userutils)](https://bundlephobia.com/package/@sv443-network/userutils)

[![Discord server badge](https://badgen.net/discord/online-members/aBH4uRG?icon=discord)](https://dc.sv443.net/)
[![Github stargazers badge](https://badgen.net/github/stars/Sv443-Network/UserUtils?icon=github)](https://github.com/Sv443-Network/UserUtils/stargazers)
[![Support development on Github Sponsors badge](https://img.shields.io/github/sponsors/Sv443?icon=github)](https://github.com/sponsors/Sv443)

<br>

## &gt; [Full documentation on GitHub](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#readme) &lt;

<br>

<span style="font-size: 0.8em;">

View the documentation of previous major releases:  
<a href="https://github.com/Sv443-Network/UserUtils/blob/v8.0.0/README.md" rel="noopener noreferrer">8.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v7.0.0/README.md" rel="noopener noreferrer">7.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v6.0.0/README.md" rel="noopener noreferrer">6.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v5.0.0/README.md" rel="noopener noreferrer">5.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v4.0.0/README.md" rel="noopener noreferrer">4.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v3.0.0/README.md" rel="noopener noreferrer">3.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v2.0.0/README.md" rel="noopener noreferrer">2.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v1.0.0/README.md" rel="noopener noreferrer">1.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v0.5.3/README.md" rel="noopener noreferrer">0.5.3</a>
<!-- <a href="https://github.com/Sv443-Network/UserUtils/blob/vX.0.0/docs.md" rel="noopener noreferrer">X.0.0</a>, -->
</span>

<br>

<!-- https://github.com/Sv443-Network/UserUtils  < #foo    -->
## Feature Summary:
- **DOM:**
    - [`SelectorObserver`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - [`getUnsafeWindow()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [`isDomLoaded()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#isdomloaded) - check if the DOM has finished loading and can be queried and modified
    - [`onDomLoad()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#ondomload) - run a function or pause async execution until the DOM has finished loading (or immediately if DOM is already loaded)
    - [`addParent()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#addparent) - add a parent element around another element
    - [`addGlobalStyle()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#addglobalstyle) - add a global style to the page
    - [`preloadImages()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#preloadimages) - preload images into the browser cache for faster loading later on
    - [`openInNewTab()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#openinnewtab) - open a link in a new tab
    - [`interceptEvent()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [`interceptWindowEvent()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [`isScrollable()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#isscrollable) - check if an element has a horizontal or vertical scroll bar
    - [`observeElementProp()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - [`getSiblingsFrame()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
    - [`setInnerHtmlUnsafe()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#setinnerhtmlunsafe) - set the innerHTML of an element using a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) without sanitizing or escaping it
    - [`probeElementStyle()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#probeelementstyle) - probe the computed style of a temporary element (get default font size, resolve CSS variables, etc.)
- **Math:**
    - [`clamp()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#clamp) - constrain a number between a min and max value
    - [`mapRange()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#maprange) - map a number from one range to the same spot in another range
    - [`randRange()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#randrange) - generate a random number between a min and max boundary
    - [`digitCount()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#digitcount) - calculate the amount of digits in a number
    - [`roundFixed()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#roundfixed) - round a floating-point number at the given amount of decimals, or to the given power of 10
    - [`bitSetHas()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#bitsethas) - check if a bit is set in a [bitset](https://www.geeksforgeeks.org/cpp-bitset-and-its-application/)
- **Misc:**
    - [`DataStore`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#datastore) - class that manages a hybrid sync & async persistent JSON database, including data migration
    - [`DataStoreSerializer`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#datastoreserializer) - class for importing & exporting data of multiple DataStore instances, including compression, checksumming and running migrations
    - [`Dialog`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#dialog) - class for creating custom modal dialogs with a promise-based API and a generic, default style
    - [`Mixins`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#mixins) - class for creating mixin functions that allow multiple sources to modify a target value in a highly flexible way
    - [`NanoEmitter`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#nanoemitter) - tiny event emitter class with a focus on performance and simplicity (based on [nanoevents](https://npmjs.com/package/nanoevents))
    - [`Debouncer`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#debouncer) - class for debouncing function calls with a given timeout
    - [`debounce()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#debounce) - function wrapper for the Debouncer class for easier usage
    - [`autoPlural()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#autoplural) - automatically pluralize a string
    - [`pauseFor()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#pausefor) - pause the execution of a function for a given amount of time
    - [`fetchAdvanced()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#fetchadvanced) - wrapper around the fetch API with a timeout option
    - [`insertValues()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#insertvalues) - insert values into a string at specified placeholders
    - [`compress()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#compress) - compress a string with Gzip or Deflate
    - [`decompress()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#decompress) - decompress a previously compressed string
    - [`computeHash()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#computehash) - compute the hash / checksum of a string or ArrayBuffer
    - [`randomId()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#randomid) - generate a random ID of a given length and radix
    - [`consumeGen()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#consumegen) - consumes a ValueGen and returns the value
    - [`consumeStringGen()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#consumestringgen) - consumes a StringGen and returns the string
    - [`getListLength()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#getlistlength) - get the length of any object with a numeric `length`, `count` or `size` property
    - [`purifyObj()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#purifyobj) - removes the prototype chain (all default properties like `toString`, `__proto__`, etc.) from an object
- **Arrays:**
    - [`randomItem()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#randomitem) - returns a random item from an array
    - [`randomItemIndex()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#randomitemindex) - returns a tuple of a random item and its index from an array
    - [`takeRandomItem()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [`randomizeArray()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#randomizearray) - returns a copy of the array with its items in a random order
- **Translation:**
    - [`tr.for()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trfor) - translates a key for the specified language
    - [`tr.use()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#truse) - creates a translation function for the specified language
    - [`tr.hasKey()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trhaskey) - checks if a key exists in the given language
    - [`tr.addTranslations()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#traddtranslations) - add a flat or recursive translation object for a language
    - [`tr.getTranslations()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trgettranslations) - returns the translation object for a language
    - [`tr.deleteTranslations()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trdeletetranslations) - delete the translation object for a language
    - [`tr.setFallbackLanguage()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trsetfallbacklanguage) - set the fallback language used when a key is not found in the given language
    - [`tr.getFallbackLanguage()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trgetfallbacklanguage) - returns the fallback language
    - [`tr.addTransform()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#traddtransform) - adds a transform function to the translation system for custom argument insertion and much more
    - [`tr.deleteTransform()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trdeletetransform) - removes a transform function
    - [`tr.transforms`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trtransforms) - predefined transform functions for quickly adding custom argument insertion
    - [`TrKeys`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#trkeys) - generic type that extracts all keys from a flat or recursive translation object into a union
- **Colors:**
    - [`hexToRgb()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#hextorgb) - convert a hex color string to an RGB or RGBA value tuple
    - [`rgbToHex()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#rgbtohex) - convert RGB or RGBA values to a hex color string
    - [`lightenColor()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#lightencolor) - lighten a CSS color string (hex, rgb or rgba) by a given percentage
    - [`darkenColor()`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#darkencolor) - darken a CSS color string (hex, rgb or rgba) by a given percentage
- **Utility types for TypeScript:**
    - [`Stringifiable`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#stringifiable) - any value that is a string or can be converted to one (implicitly or explicitly)
    - [`NonEmptyArray`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#nonemptyarray) - any array that should have at least one item
    - [`NonEmptyString`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#nonemptystring) - any string that should have at least one character
    - [`LooseUnion`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#looseunion) - a union that gives autocomplete in the IDE but also allows any other value of the same type
    - [`Prettify`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#prettify) - expands a complex type into a more readable format while keeping functionality the same
    - [`ValueGen`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#valuegen) - a "generator" value that allows for super flexible value typing and declaration
    - [`StringGen`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#stringgen) - a "generator" string that allows for super flexible string typing and declaration, including enhanced support for unions
    - [`ListWithLength`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#listwithlength) - represents an array or object with a numeric `length`, `count` or `size` property
- **Custom Error classes:**
    - [`UUError`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#uuerror) - base class for all custom UserUtils errors - has a custom `date` prop set to the time of creation
    - [`ChecksumMismatchError`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#checksummismatcherror) - thrown when a string of data doesn't match its checksum
    - [`MigrationError`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#migrationerror) - thrown when a data migration fails
    - [`PlatformError`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#platformerror) - thrown when a function is called in an unsupported environment

<br><br>

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

- If you are not using a bundler, want to reduce the size of your userscript, or declared the package as external in your bundler, you can include the latest release by adding one of these directives to the userscript header, depending on your preferred CDN:  
    Versioned (recommended):  

    ```
    // @require https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js
    // @require https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js
    ```
    Non-versioned (not recommended because auto-updating):  

    ```
    // @require https://update.greasyfork.org/scripts/472956/UserUtils.js
    // @require https://openuserjs.org/src/libs/Sv443/UserUtils.js
    ```

- If you are using this library in a generic DOM environment without access to the GreaseMonkey API, either download the latest release from the [releases page](https://github.com/Sv443-Network/UserUtils/releases) to include in your project or add one of the following tags to the &lt;head&gt;:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js"></script>
    <script src="https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/index.global.js"></script>
    ```

> **Note:**  
> In order for your userscript not to break on a major library update, use one the versioned URLs above after replacing `INSERT_VERSION` with the desired version (e.g. `8.3.2`) or the versioned URL that's shown [at the top of the GreasyFork page.](https://greasyfork.org/scripts/472956-userutils)  

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

<br><br>

---

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting the development](https://github.com/sponsors/Sv443)
