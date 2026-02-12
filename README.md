<div style="text-align: center;" align="center">

<!-- #region Description -->
## UserUtils
General purpose DOM/GreaseMonkey library that allows you to register listeners for when CSS selectors exist, intercept events, create persistent & synchronous data stores, modify the DOM more easily and much more.  
Contains builtin TypeScript declarations. Supports ESM and CJS imports via a bundler and global declaration via `@require` or `<script>`  
The library works in any DOM environment with or without the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), but some features will be unavailable or require special setup.  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>

[![Code coverage percentage badge](https://img.shields.io/coverallsCoverage/github/Sv443-Network/UserUtils?branch=main)](https://coveralls.io/github/Sv443-Network/UserUtils)
[![Bundle size badge](https://deno.bundlejs.com/badge?q=@sv443-network/userutils@latest)](https://bundlejs.com/?q=%40sv443-network%2Fuserutils%40latest)

[![Discord server badge](https://badgen.net/discord/online-members/aBH4uRG?icon=discord)](https://dc.sv443.net/)
[![Github stargazers badge](https://badgen.net/github/stars/Sv443-Network/UserUtils?icon=github)](https://github.com/Sv443-Network/UserUtils/stargazers)
[![Support development on Github Sponsors badge](https://img.shields.io/github/sponsors/Sv443?icon=github)](https://github.com/sponsors/Sv443)

<br>
<sub>

View the documentation of previous major versions:  

<a title="View docs for patch version 9.4.4" href="https://github.com/Sv443-Network/UserUtils/blob/v9.4.4/docs.md" rel="noopener noreferrer">**v9.4.4**</a> &bull; <a title="View docs for minor version 8.4.0" href="https://github.com/Sv443-Network/UserUtils/blob/v8.4.0/README.md" rel="noopener noreferrer">**v8.4.0**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v7.3.0/README.md" title="View docs for minor version 7.3.0" rel="noopener noreferrer">**v7.3.0**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v6.3.0/README.md" title="View docs for minor version 6.3.0" rel="noopener noreferrer">**v6.3.0**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v5.0.1/README.md" title="View docs for patch version 5.0.1" rel="noopener noreferrer">**v5.0.1**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v4.2.1/README.md" title="View docs for patch version 4.2.1" rel="noopener noreferrer">**v4.2.1**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v3.0.0/README.md" title="View docs for major version 3.0.0" rel="noopener noreferrer">**v3.0.0**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v2.0.1/README.md" title="View docs for patch version 2.0.1" rel="noopener noreferrer">**v2.0.1**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v1.2.0/README.md" title="View docs for minor version 1.2.0" rel="noopener noreferrer">**v1.2.0**</a> &bull; <a href="https://github.com/Sv443-Network/UserUtils/blob/v0.5.3/README.md" title="View docs for patch version 0.5.3" rel="noopener noreferrer">**v0.5.3**</a>

</sub>

<br>

</div>

> [!NOTE]  
> In version 10.0.0, many of the platform-agnostic features were moved to [the CoreUtils library.](https://github.com/Sv443-Network/CoreUtils)  
> <sub>
> Everything in CoreUtils is re-exported by UserUtils for backwards compatibility, so installing both at the same time isn't usually necessary.  
> Beware that when both are installed, class inheritance between the two libraries will only work if the installed version of CoreUtils matches the version of CoreUtils that is included in UserUtils (refer to `package.json`), so that the final bundler is able to deduplicate them correctly. See also [`const versions`](./docs.md#const-versions)
> 
> </sub>

<br>

<!-- #region Table of Contents -->
## Table of Contents:
- [**Installation**](#installation)
- [**License**](#license)
- [**Preamble** (info about the documentation)](./docs.md#preamble)
- [**UserUtils Features**](./docs.md#features)
  - [**DOM:**](./docs.md#dom)
    - 🟧 [`class Dialog`](./docs.md#class-dialog) - class for creating custom modal dialogs with a promise-based API and a generic, default style
    - 🟧 [`class SelectorObserver`](./docs.md#class-selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - 🟣 [`function getUnsafeWindow()`](./docs.md#function-getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - 🟣 [`function isDomLoaded()`](./docs.md#function-isdomloaded) - check if the DOM has finished loading and can be queried and modified
    - 🟣 [`function onDomLoad()`](./docs.md#function-ondomload) - run a function or pause async execution until the DOM has finished loading (or immediately if DOM is already loaded)
    - 🟣 [`function addParent()`](./docs.md#function-addparent) - add a parent element around another element
    - 🟣 [`function addGlobalStyle()`](./docs.md#function-addglobalstyle) - add a global style to the page
    - 🟣 [`function preloadImages()`](./docs.md#function-preloadimages) - preload images into the browser cache for faster loading later on
    - 🟣 [`function openInNewTab()`](./docs.md#function-openinnewtab) - open a link in a new tab
    - 🟣 [`function interceptEvent()`](./docs.md#function-interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - 🟣 [`function interceptWindowEvent()`](./docs.md#function-interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - 🟣 [`function isScrollable()`](./docs.md#function-isscrollable) - check if an element has a horizontal or vertical scroll bar
    - 🟣 [`function observeElementProp()`](./docs.md#function-observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - 🟣 [`function getSiblingsFrame()`](./docs.md#function-getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
    - 🟣 [`function setInnerHtmlUnsafe()`](./docs.md#function-setinnerhtmlunsafe) - set the innerHTML of an element using a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) without sanitizing or escaping it
    - 🟣 [`function probeElementStyle()`](./docs.md#function-probeelementstyle) - probe the computed style of a temporary element (get default font size, resolve CSS variables, etc.)
  - [**Misc:**](./docs.md#misc)
    - 🟧 [`class GMStorageEngine`](./docs.md#class-gmstorageengine) - storage engine class for [`DataStore`s](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#datastore) using the GreaseMonkey API
    - 🟧 [`class Mixins`](./docs.md#class-mixins) - class for creating mixin functions that allow multiple sources to modify a target value in a highly flexible way
    - 🟩 [`const versions`](./docs.md#const-versions) - contains version information for UserUtils and CoreUtils
  - [**Translation:**](./docs.md#translation)
    - 🟣 [`function tr.for()`](./docs.md#function-trfor) - translates a key for the specified language
    - 🟣 [`function tr.use()`](./docs.md#function-truse) - creates a translation function for the specified language
    - 🟣 [`function tr.hasKey()`](./docs.md#function-trhaskey) - checks if a key exists in the given language
    - 🟣 [`function tr.addTranslations()`](./docs.md#function-traddtranslations) - add a flat or recursive translation object for a language
    - 🟣 [`function tr.getTranslations()`](./docs.md#function-trgettranslations) - returns the translation object for a language
    - 🟣 [`function tr.deleteTranslations()`](./docs.md#function-trdeletetranslations) - delete the translation object for a language
    - 🟣 [`function tr.setFallbackLanguage()`](./docs.md#function-trsetfallbacklanguage) - set the fallback language used when a key is not found in the given language
    - 🟣 [`function tr.getFallbackLanguage()`](./docs.md#function-trgetfallbacklanguage) - returns the fallback language
    - 🟣 [`function tr.addTransform()`](./docs.md#function-traddtransform) - adds a transform function to the translation system for custom argument insertion and much more
    - 🟣 [`function tr.deleteTransform()`](./docs.md#function-trdeletetransform) - removes a transform function
    - 🟩 [`const tr.transforms`](./docs.md#const-trtransforms) - predefined transform functions for quickly adding custom argument insertion
    - 🔷 [`type TrKeys`](./docs.md#type-trkeys) - generic type that extracts all keys from a flat or recursive translation object into a union
  - [**Errors**](./docs.md#error-classes)
    - 🟧 [`class PlatformError`](./docs.md#class-platformerror) - thrown when the current platform doesn't support a certain feature, like calling a DOM function in a non-DOM environment
- [**CoreUtils Features** (re-exported for backwards compatibility)](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#table-of-contents)
  - [**Array:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#array)
    - 🟣 [`function randomItem()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomitem) - Returns a random item from the given array
    - 🟣 [`function randomItemIndex()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomitemindex) - Returns a random array item and index as a tuple
    - 🟣 [`function randomizeArray()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomizearray) - Returns a new array with the items in random order
    - 🟣 [`function takeRandomItem()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-takerandomitem) - Returns a random array item and mutates the array to remove it
    - 🟣 [`function takeRandomItemIndex()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomitemindex) - Returns a random array item and index as a tuple and mutates the array to remove it
    - 🔷 [`type NonEmptyArray`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-nonemptyarray) - Non-empty array type
  - [**Colors:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#colors)
    - 🟣 [`function darkenColor()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-darkencolor) - Darkens the given color by the given percentage
    - 🟣 [`function hexToRgb()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-hextorgb) - Converts a hex color string to an RGB object
    - 🟣 [`function lightenColor()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-lightencolor) - Lightens the given color by the given percentage
    - 🟣 [`function rgbToHex()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-rgbtohex) - Converts an RGB object to a hex color string
  - [**Crypto:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#crypto)
    - 🟣 [`function abtoa()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-abtoa) - Converts an ArrayBuffer to a string
    - 🟣 [`function atoab()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-atoab) - Converts a string to an ArrayBuffer
    - 🟣 [`function compress()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-compress) - Compresses the given string using the given algorithm and encoding
    - 🟣 [`function decompress()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-decompress) - Decompresses the given string using the given algorithm and encoding
    - 🟣 [`function computeHash()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-computehash) - Computes a string's hash using the given algorithm
    - 🟣 [`function randomId()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomid) - Generates a random ID of the given length
  - [**DataStore:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#datastore) - Cross-platform, general-purpose, sync/async hybrid, JSON-serializable database infrastructure:
    - 🟧 [`class DataStore`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastore) - The main class for the data store
      - 🔷 [`type DataStoreOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datastoreoptions) - Options for the data store
      - 🔷 [`type DataMigrationsDict`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datamigrationsdict) - Dictionary of data migration functions
    - 🟧 [`class DataStoreSerializer`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreserializer) - Serializes and deserializes data for multiple DataStore instances
      - 🔷 [`type DataStoreSerializerOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datastoreserializeroptions) - Options for the DataStoreSerializer
      - 🔷 [`type LoadStoresDataResult`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-loadstoresdataresult) - Result of calling [`loadStoresData()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#datastoreserializer-loadstoresdata)
      - 🔷 [`type SerializedDataStore`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-serializeddatastore) - Meta object and serialized data of a DataStore instance
      - 🔷 [`type StoreFilter`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-storefilter) - Filter for selecting data stores
    - 🟧 [`class DataStoreEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreengine) - Base class for DataStore storage engines, which handle the data storage
      - 🔷 [`type DataStoreEngineDSOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datastoreenginedsoptions) - Reduced version of [`DataStoreOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datastoreoptions)
    - [Storage Engines:](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#storage-engines)
      - 🟧 [`class BrowserStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-browserstorageengine) - Storage engine for browser environments (localStorage, sessionStorage)
        - 🔷 [`type BrowserStorageEngineOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#browserstorageengineoptions) - Options for the browser storage engine
      - 🟧 [`class FileStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-FileStorageEngine) - File-based storage engine for Node.js and Deno
        - 🔷 [`type FileStorageEngineOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#FileStorageEngineoptions) - Options for the file storage engine
  - [**Debouncer:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#debouncer)
    - 🟣 [`function debounce()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-debounce) - Function wrapper for the [`Debouncer` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-debouncer)
    - 🟧 [`class Debouncer`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-debouncer) - Class that manages listeners whose calls are rate-limited
      - 🔷 [`type DebouncerType`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-debouncertype) - The triggering type for the debouncer
      - 🔷 [`type DebouncedFunction`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-debouncedfunction) - Function type that is returned by the [`debounce()` function](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-debounce)
      - 🔷 [`type DebouncerEventMap`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-debouncereventmap) - Event map type for the [`Debouncer` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-debouncer)
  - [**Errors:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#errors)
    - 🟧 [`class DatedError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datederror) - Base error class with a `date` property
      - 🟧 [`class ChecksumMismatchError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-checksummismatcherror) - Error thrown when two checksums don't match
      - 🟧 [`class CustomError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-customerror) - Custom error with a configurable name for one-off situations
      - 🟧 [`class MigrationError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-migrationerror) - Error thrown in a failed data migration
      - 🟧 [`class ValidationError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-validationerror) - Error while validating data
  - [**Math:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#math)
    - 🟣 [`function bitSetHas()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-bitsethas) - Checks if a bit is set in a bitset
    - 🟣 [`function clamp()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-clamp) - Clamps a number between a given range
    - 🟣 [`function digitCount()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-digitcount) - Returns the number of digits in a number
    - 🟣 [`function formatNumber()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-formatnumber) - Formats a number to a string using the given locale and format identifier
      - 🔷 [`type NumberFormat`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-numberformat) - Number format identifier
    - 🟣 [`function mapRange()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-maprange) - Maps a number from one range to another
    - 🟣 [`function overflowVal()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-overflowVal) - Makes sure a number is in a range by over- & underflowing it
    - 🟣 [`function randRange()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randrange) - Returns a random number in the given range
    - 🟣 [`function roundFixed()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-roundfixed) - Rounds the given number to the given number of decimal places
    - 🟣 [`function valsWithin()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-valswithin) - Checks if the given numbers are within a certain range of each other
  - [**Misc:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#misc)
    - 🟣 [`function consumeGen()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-consumegen) - Consumes a [`ValueGen` object](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-valuegen)
      - 🔷 [`type ValueGen`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-valuegen) - A value that can be either type T, or a sync or async function that returns T
    - 🟣 [`function consumeStringGen()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-consumestringgen) - Consumes a [`StringGen` object](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-stringgen)
      - 🔷 [`type StringGen`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-stringgen) - A value that can be either of type string, or a sync or async function that returns a string
    - 🟣 [`function fetchAdvanced()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-fetchadvanced) - Wrapper around [`fetch()`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with options like a timeout
      - 🔷 [`type FetchAdvancedOpts`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-fetchadvancedopts) - Options for the [`fetchAdvanced()` function](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-fetchadvanced)
    - 🟣 [`function getListLength()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-getlistlength) - Returns the length of a [`ListLike` object](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-listlike)
    - 🟣 [`function pauseFor()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-pausefor) - Pauses async execution for the given amount of time
    - 🟣 [`function pureObj()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-pureobj) - Applies an object's props to a null object (object without prototype chain) or just returns a new null object
    - 🟣 [`function setImmediateInterval()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-setimmediateinterval) - Like `setInterval()`, but instantly calls the callback and supports passing an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
    - 🟣 [`function setImmediateTimeoutLoop()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-setimmediatetimeoutloop) - Like a recursive `setTimeout()` loop, but instantly calls the callback and supports passing an [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
    - 🟣 [`function scheduleExit()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-scheduleexit) - Schedules a process exit after the next event loop tick, to allow operations like IO writes to finish.
    - 🟣 [`function getCallStack()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-getcallstack) - Returns the current call stack, starting at the caller of this function.
  - [**NanoEmitter:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#nanoemitter)
    - 🟧 [`class NanoEmitter`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-nanoemitter) - Simple, lightweight event emitter class that can be used in both FP and OOP, inspired by [`EventEmitter` from `node:events`](https://nodejs.org/api/events.html#class-eventemitter), based on [`nanoevents`](https://npmjs.com/package/nanoevents)
      - 🔷 [`type NanoEmitterOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-nanoemitteroptions) - Options for the [`NanoEmitter` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-nanoemitter)
  - [**Text:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#text)
    - 🟣 [`function autoPlural()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-autoplural) - Turns the given term into its plural form, depending on the given number or list length
    - 🟣 [`function capitalize()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-capitalize) - Capitalizes the first letter of the given string
    - 🟣 [`function createProgressBar()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-createprogressbar) - Creates a progress bar string with the given percentage and length
      - 🟩 [`const defaultPbChars`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#const-defaultpbchars) - Default characters for the progress bar
      - 🔷 [`type ProgressBarChars`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-progressbarchars) - Type for the progress bar characters object
    - 🟣 [`function joinArrayReadable()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-joinarrayreadable) - Joins the given array into a string, using the given separators and last separator
    - 🟣 [`function secsToTimeStr()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-secstotimestr) - Turns the given number of seconds into a string in the format `(hh:)mm:ss` with intelligent zero-padding
    - 🟣 [`function truncStr()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-truncstr) - Truncates the given string to the given length
  - [**Misc. Types:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#types)
    - 🔷 [`type LooseUnion`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-looseunion) - A union type that allows for autocomplete suggestions as well as substitutions of the same type
    - 🔷 [`type ListLike`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-listlike) - Any value with a quantifiable `length`, `count` or `size` property
    - 🔷 [`type Newable`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-newable) - Any class reference that can be instantiated with `new`
    - 🔷 [`type NonEmptyArray`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-nonemptyarray) - Non-empty array type
    - 🔷 [`type NonEmptyString`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-nonemptystring) - String type with at least one character
    - 🔷 [`type NumberFormat`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-numberformat) - Number format identifier
    - 🔷 [`type Prettify`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-prettify) - Makes the structure of a type more readable by fully expanding it (recursively)
    - 🔷 [`type SerializableVal`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-serializableval) - Any value that can be serialized to JSON
    - 🔷 [`type StringGen`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-stringgen) - A value that can be either of type string, or a sync or async function that returns a string
    - 🔷 [`type ValueGen`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-valuegen) - A value that can be either the generic type T, or a sync or async function that returns T
    - 🔷 [`type Stringifiable`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-stringifiable) - Any value that can be implicitly converted to a string

> [!NOTE]  
> 🟣 = function  
> 🟧 = class  
> 🔷 = type  
> 🟩 = const

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
  // @require https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/UserUtils.user.js
  // @require https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/UserUtils.user.js
  ```
  Non-versioned (not recommended because it auto-updates):
  ```
  // @require https://update.greasyfork.org/scripts/472956/UserUtils.js
  // @require https://openuserjs.org/src/libs/Sv443/UserUtils.js
  ```

- If you are using this library in a generic DOM environment without access to the GreaseMonkey API, either download the latest release from the [releases page](https://github.com/Sv443-Network/UserUtils/releases) to include in your project or add one of the following tags to the &lt;head&gt;:
  ```html
  <script src="https://cdn.jsdelivr.net/npm/@sv443-network/userutils@INSERT_VERSION/dist/UserUtils.umd.js"></script>
  <script src="https://unpkg.com/@sv443-network/userutils@INSERT_VERSION/dist/UserUtils.umd.js"></script>
  ```

> [!NOTE]  
> In order for your script not to break on a major library update, use one the versioned URLs above after replacing `INSERT_VERSION` with the desired version (e.g. `10.0.4`) or the versioned URL that's shown [at the top of the GreasyFork page.](https://greasyfork.org/scripts/472956-userutils)  

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
