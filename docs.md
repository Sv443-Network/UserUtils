# UserUtils Documentation
General purpose DOM/GreaseMonkey library that allows you to register listeners for when CSS selectors exist, intercept events, create persistent & synchronous data stores, modify the DOM more easily and much more.  
Contains builtin TypeScript declarations. Supports ESM and CJS imports via a bundler and global declaration via `@require` or `<script>`  
The library works in any DOM environment with or without the [GreaseMonkey API](https://wiki.greasespot.net/Greasemonkey_Manual:API), but some features will be unavailable or limited.  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)  
  
> [!NOTE]  
> In version 10.0.0, many of the platform-agnostic features were moved to [the CoreUtils library.](https://github.com/Sv443-Network/CoreUtils)  
> They are still re-exported by UserUtils for backwards compatibility, but you may want to consider using CoreUtils directly if you don't need any of the DOM- or GreaseMonkey-specific features or want control over the installed version of CoreUtils.

<br>

<!-- #region Preamble -->
## Preamble:
This library is written in TypeScript and contains builtin TypeScript declarations, but it will also work in plain JavaScript after removing the `: type` annotations in the example code snippets.  
  
Each feature's example code snippet can be expanded by clicking on the text "Example - click to view".  
The signatures and examples are written in TypeScript and use ESM import syntax to show you which types need to be provided and will be returned.  
The library itself supports importing an ESM, CommonJS or global variable definition bundle, depending on your use case.  
  
If the signature section contains multiple signatures of the function, each occurrence represents an overload and you can choose which one you want to use.  
They will also be further explained in the description below that section.  
  
Some features require the `@run-at` or `@grant` directives to be tweaked in the userscript header or have other specific requirements and limitations.  
Those will be listed in a section marked by a warning emoji (⚠️) each.  
  
If you need help with something, please [create a new discussion](https://github.com/Sv443-Network/UserUtils/discussions) or [join my Discord server.](https://dc.sv443.net/)  
For submitting bug reports or feature requests, please use the [GitHub issue tracker.](https://github.com/Sv443-Network/UserUtils/issues)

<br>

<!-- #region Features -->
## Table of Contents:
- [**Preamble** (info about the documentation)](#preamble)
- [**UserUtils Features**](#features)
  - [**DOM:**](#dom)
    - 🟧 [`Dialog`](#class-dialog) - class for creating custom modal dialogs with a promise-based API and a generic, default style
    - 🟧 [`SelectorObserver`](#class-selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - 🟣 [`getUnsafeWindow()`](#function-getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - 🟣 [`isDomLoaded()`](#function-isdomloaded) - check if the DOM has finished loading and can be queried and modified
    - 🟣 [`onDomLoad()`](#function-ondomload) - run a function or pause async execution until the DOM has finished loading (or immediately if DOM is already loaded)
    - 🟣 [`addParent()`](#function-addparent) - add a parent element around another element
    - 🟣 [`addGlobalStyle()`](#function-addglobalstyle) - add a global style to the page
    - 🟣 [`preloadImages()`](#function-preloadimages) - preload images into the browser cache for faster loading later on
    - 🟣 [`openInNewTab()`](#function-openinnewtab) - open a link in a new tab
    - 🟣 [`interceptEvent()`](#function-interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - 🟣 [`interceptWindowEvent()`](#function-interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - 🟣 [`isScrollable()`](#function-isscrollable) - check if an element has a horizontal or vertical scroll bar
    - 🟣 [`observeElementProp()`](#function-observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - 🟣 [`getSiblingsFrame()`](#function-getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
    - 🟣 [`setInnerHtmlUnsafe()`](#function-setinnerhtmlunsafe) - set the innerHTML of an element using a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) without sanitizing or escaping it
    - 🟣 [`probeElementStyle()`](#function-probeelementstyle) - probe the computed style of a temporary element (get default font size, resolve CSS variables, etc.)
  - [**Misc:**](#misc)
    - 🟧 [`GMStorageEngine`](#class-gmstorageengine) - storage engine class for [`DataStore`s](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#datastore) using the GreaseMonkey API
    - 🟧 [`Mixins`](#class-mixins) - class for creating mixin functions that allow multiple sources to modify a target value in a highly flexible way
  - [**Translation:**](#translation)
    - 🟣 [`tr.for()`](#function-trfor) - translates a key for the specified language
    - 🟣 [`tr.use()`](#function-truse) - creates a translation function for the specified language
    - 🟣 [`tr.hasKey()`](#function-trhaskey) - checks if a key exists in the given language
    - 🟣 [`tr.addTranslations()`](#function-traddtranslations) - add a flat or recursive translation object for a language
    - 🟣 [`tr.getTranslations()`](#function-trgettranslations) - returns the translation object for a language
    - 🟣 [`tr.deleteTranslations()`](#function-trdeletetranslations) - delete the translation object for a language
    - 🟣 [`tr.setFallbackLanguage()`](#function-trsetfallbacklanguage) - set the fallback language used when a key is not found in the given language
    - 🟣 [`tr.getFallbackLanguage()`](#function-trgetfallbacklanguage) - returns the fallback language
    - 🟣 [`tr.addTransform()`](#function-traddtransform) - adds a transform function to the translation system for custom argument insertion and much more
    - 🟣 [`tr.deleteTransform()`](#function-trdeletetransform) - removes a transform function
    - ⬜ [`tr.transforms`](#const-trtransforms) - predefined transform functions for quickly adding custom argument insertion
    - 🔷 [`TrKeys`](#type-trkeys) - generic type that extracts all keys from a flat or recursive translation object into a union
  - [**Custom Error classes**](#error-classes)
    - 🟧 [`PlatformError`](#class-platformerror) - thrown when the current platform doesn't support a certain feature, like calling a DOM function in a non-DOM environment
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
      - 🔷 [`type DataStoreData`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-datastoredata) - The type of the serializable data
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
      - ⬜ [`const defaultPbChars`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#const-defaultpbchars) - Default characters for the progress bar
      - 🔷 [`type ProgressBarChars`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-progressbarchars) - Type for the progress bar characters object
    - 🟣 [`function joinArrayReadable()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-joinarrayreadable) - Joins the given array into a string, using the given separators and last separator
    - 🟣 [`function secsToTimeStr()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-secstotimestr) - Turns the given number of seconds into a string in the format `(hh:)mm:ss` with intelligent zero-padding
    - 🟣 [`function truncStr()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-truncstr) - Truncates the given string to the given length
  <!-- - *[**TieredCache:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#tieredcache)
    - 🟧 *[`class TieredCache`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-tieredcache) - A multi-tier cache that uses multiple storage engines with different expiration times
      - 🔷 *[`type TieredCacheOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-tieredcacheoptions) - Options for the [`TieredCache` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-tieredcache)
      - 🔷 *[`type TieredCachePropagateTierOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-tieredcachestaleoptions) - Entry propagation options for each tier
      - 🔷 *[`type TieredCacheStaleOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-tieredcachepropagatetieroptions) - Entry staleness options for each tier
      - 🔷 *[`type TieredCacheTierOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-tieredcachetieroptions) - Options for each tier of a [`TieredCache` instance](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-tieredcache)
  - *[**Translate:**](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#translate)
    - 🟧 *[`class Translate`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-translate) - JSON-based translation system supporting transformation hooks, value injection, nested objects, etc.
    - 🔷 *[`type TransformFn`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-transformfn) - The type of the transformation hook functions
    - 🔷 *[`type TransformFnProps`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-transformfnprops) - The properties passed to the transformation functions
    - 🔷 *[`type TranslateOptions`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-translateoptions) - The options for the [`Translate` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-translate)
    - 🔷 *[`type TrKeys`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-trkeys) - Generic type that gives you a union of keys from the passed [`TrObject` object](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-trobject)
    - 🔷 *[`type TrObject`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#type-trobject) - The translation object for a specific language -->
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
> ⬜ = const

<br><br><br>

<!-- #region Features -->
## Features:

<br>

<!-- #region DOM -->
## DOM:

### `class Dialog`
Signature:
```ts
class Dialog extends NanoEmitter;
```
  
Usage:
```ts
const dialog = new Dialog(options: DialogOptions);
```
  
A class that creates a customizable modal dialog with a title (optional), body and footer (optional).  
There are tons of options for customization, like changing the close behavior, translating strings and more.  
  
To see all available options, refer to [the `DialogOptions` type.](#type-dialogoptions)  
  
- ⚠️ Each instance should have a unique ID, else the elements will conflict with each other in the DOM.
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { Dialog } from "@sv443-network/userutils";

const myDialog = new Dialog({
  id: "my-unique-dialog-id",
  width: 450,
  height: 250,
  closeOnBgClick: true,
  closeOnEscPress: true,
  destroyOnClose: false,
  unmountOnClose: false,
  small: true,
  verticalAlign: "top",
  renderHeader: () => {
    const header = document.createElement("div");
    header.textContent = "My Custom Dialog";
    return header;
  },
  renderBody: () => {
    const body = document.createElement("div");
    body.textContent = "This is the body of the dialog.";
    return body;
  },
  renderFooter: () => {
    const footer = document.createElement("div");
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.addEventListener("click", () => myDialog.close());
    footer.appendChild(closeButton);
    return footer;
  },
});

// register some event listeners:
myDialog.on("open", () => {
  console.log("Dialog opened!");
});

myDialog.on("close", () => {
  console.log("Dialog closed!");
});

myDialog.on("destroy", () => {
  console.log("Dialog destroyed!");
});

// open the dialog:
await myDialog.open();

// pause async execution until the dialog is closed:
await myDialog.once("close");

// destroy the dialog when done:
myDialog.destroy();
```
</details>

<br>

### Events
The Dialog class inherits from [`NanoEmitter`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-nanoemitter), so you can use all of its inherited methods to listen to the following events:
| Event | Arguments | Description |
| :-- | :-- | :-- |
| `close` | - | Emitted just **after** the dialog is closed |
| `open` | - | Emitted just **after** the dialog is opened |
| `render` | - | Emitted just **after** the dialog contents are rendered | |
| `clear` | - | Emitted just **after** the dialog contents are cleared | |
| `destroy` | - | Emitted just **after** the dialog is destroyed and **

<br>

### Methods

### `Dialog.mount()`
Signature:
```ts
public async mount(): Promise<HTMLElement | void>;
```
  
Call after DOMContentLoaded to pre-render the dialog and invisibly mount it in the DOM.  

<br>

### `Dialog.unmount()`
Signature:
```ts
public unmount(): void;
```
  
Closes the dialog and clears all its contents (unmounts elements from the DOM) in preparation for a new rendering call.

<br>

### `Dialog.remount()`
Signature:
```ts
public async remount(): Promise<void>;
```
  
Clears the DOM of the dialog and then renders it again.  
This can be used to call the rendering functions again to update the dialog contents.

<br>

### `Dialog.open()`
Signature:
```ts
public async open(e?: MouseEvent | KeyboardEvent): Promise<HTMLElement | void>;
```
  
Opens the dialog - also mounts it if it hasn't been mounted yet.  
Prevents default action and immediate propagation of the passed event.

<br>

### `Dialog.close()`
Signature:
```ts
public close(e?: MouseEvent | KeyboardEvent): void;
```
  
Closes the dialog - prevents default action and immediate propagation of the passed event.

<br>

### `Dialog.isOpen()`
Signature:
```ts
public isOpen(): boolean;
```
  
Returns true if the dialog is currently open.

<br>

### `Dialog.isMounted()`
Signature:
```ts
public isMounted(): boolean;
```
  
Returns true if the dialog is currently mounted.

<br>

### `Dialog.destroy()`
Signature:
```ts
public destroy(): void;
```
  
Clears the DOM of the dialog and removes all event listeners.

<br>

### `Dialog.getCurrentDialogId()`
Signature:
```ts
public static getCurrentDialogId(): string | null;
```
  
Returns the ID of the top-most dialog (the dialog that has been opened last).

<br>

### `Dialog.getOpenDialogs()`
Signature:
```ts
public static getOpenDialogs(): string[];
```
  
Returns the IDs of all currently open dialogs, top-most first.

<br>

### Types

### `type DialogOptions`
The options object for the [`Dialog` class.](#class-dialog)  
These are the properties:
| Property | Type | Description |
| :-- | :-- | :-- |
| `id` | `string` | ID that gets added to child element IDs - has to be unique and conform to HTML ID naming rules! |
| `width` | `number` | Target and max width of the dialog in pixels |
| `height` | `number` | Target and max height of the dialog in pixels |
| `closeOnBgClick?` | `boolean \| undefined` | Whether the dialog should close when the background is clicked - defaults to true |
| `closeOnEscPress?` | `boolean \| undefined` | Whether the dialog should close when the escape key is pressed - defaults to true |
| `destroyOnClose?` | `boolean \| undefined` | Whether the dialog should be destroyed when it's closed - defaults to false |
| `unmountOnClose?` | `boolean \| undefined` | Whether the dialog should be unmounted when it's closed - defaults to true - superseded by destroyOnClose |
| `removeListenersOnDestroy?` | `boolean \| undefined` | Whether all listeners should be removed when the dialog is destroyed - defaults to true |
| `small?` | `boolean \| undefined` | Whether the dialog should have a smaller overall appearance - defaults to false |
| `verticalAlign?` | `"top" \| "center" \| "bottom" \| undefined` | Where to align or anchor the dialog vertically - defaults to "center" |
| `strings?` | `Partial<typeof defaultStrings> \| undefined` | Strings used in the dialog (used for translations) - defaults to the default English strings exported as `defaultStrings` |
| `dialogCss?` | `string \| undefined` | CSS to apply to the dialog - defaults to the exported constant `defaultDialogCss` |
| `renderBody` | `() => HTMLElement \| Promise<HTMLElement>` | Called to render the body of the dialog |
| `renderHeader?` | `(() => HTMLElement \| Promise<HTMLElement>) \| undefined` | Called to render the header of the dialog - leave undefined for a blank header |
| `renderFooter?` | `(() => HTMLElement \| Promise<HTMLElement>) \| undefined` | Called to render the footer of the dialog - leave undefined for no footer |
| `renderCloseBtn?` | `(() => HTMLElement \| Promise<HTMLElement>) \| undefined` | Called to render the close button of the dialog - leave undefined for no close button |

<br><br>

### `class SelectorObserver`
Signature:
```ts
class SelectorObserver;
```
  
Usage:
```ts
new SelectorObserver(baseElement: Element, options?: SelectorObserverConstructorOptions);
new SelectorObserver(baseElementSelector: string, options?: SelectorObserverConstructorOptions);
```
  
A class that manages listeners that are called when elements at given CSS selectors are found in the DOM.  
It is useful for userscripts that need to wait for elements to be added to the DOM at an indeterminate point in time before they can be interacted with.  
By default, it uses the MutationObserver API to observe for any element changes, and as such is highly customizable, but can also be configured to run on a fixed interval.  
  
The constructor takes a `baseElement`, which is a parent of the elements you want to observe.  
If a selector string is passed instead, it will be used to find the element.  
If you want to observe the entire document, you can pass `document.body` - ⚠️ you should only use this to initialize other SelectorObserver instances, and never run continuous listeners on this instance, as the performance impact can be massive!  
  
The `options` parameter is optional and will be passed to the MutationObserver that is used internally.  
The MutationObserver options present by default are `{ childList: true, subtree: true }` - you may see the [MutationObserver.observe() documentation](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options) for more information and a list of options.  
For example, if you want to trigger the listeners when certain attributes change, pass `{ attributeFilter: ["class", "data-my-attribute"] }`  
  
⚠️ Make sure to call `enable()` to actually start observing. This will need to be done after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired) **and** as soon as the `baseElement` or `baseElementSelector` is available.  
  
<details><summary><b>Example - click to view</b></summary>

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
    defaultDebounceType: "immediate",
  });

  barObserver.addListener("#my-element", {
    listener: (element) => {
      console.log("Element's attributes changed:", element);
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
});
```
</details>

<br>

### Methods

### `SelectorObserver.addListener()`
Signature:
```ts
public addListener<TElem extends Element = HTMLElement>(
  selector: string,
  options: SelectorListenerOptions<TElem>
): UnsubscribeFunction;
```
  
Starts observing the children of the base element for changes to the given `selector` according to the set `options`.  
Returns a function that can be called to remove this listener.  
  
The `options` object has the following properties:
| Property | Type | Description |
| :-- | :-- | :-- |
| `listener` | `(element: TElem) => void` or `(elements: NodeListOf<TElem>) => void` | Gets called whenever the selector is found in the DOM |
| `all?` | `boolean \| undefined` | Whether to use `querySelectorAll()` instead - defaults to false |
| `continuous?` | `boolean \| undefined` | Whether to call the listener continuously instead of just once - defaults to false |
| `debounce?` | `number \| undefined` | Whether to debounce the listener to reduce calls - set undefined or <=0 to disable (default) |
| `debounceType?` | `DebouncerType \| undefined` | The edge type of the debouncer - defaults to "immediate" |

<br>

### `SelectorObserver.enable()`
Signature:
```ts
public enable(immediatelyCheckSelectors?: boolean): boolean;
```
  
Enables or reenables the observation of the child elements.  
`immediatelyCheckSelectors` defaults to true, which means all previously registered selectors will be checked.  
Returns true when the observation was enabled, false otherwise (e.g. when the base element wasn't found).

<br>

### `SelectorObserver.disable()`
Signature:
```ts
public disable(): void;
```
  
Disables the observation of the child elements.

<br>

### `SelectorObserver.isEnabled()`
Signature:
```ts
public isEnabled(): boolean;
```
  
Returns whether the observation of the child elements is currently enabled.

<br>

### `SelectorObserver.clearListeners()`
Signature:
```ts
public clearListeners(): void;
```
  
Removes all listeners that have been registered with `addListener()`.

<br>

### `SelectorObserver.removeAllListeners()`
Signature:
```ts
public removeAllListeners(selector: string): boolean;
```
  
Removes all listeners for the given `selector`.  
Returns true when all listeners for the associated selector were found and removed, false otherwise.

<br>

### `SelectorObserver.removeListener()`
Signature:
```ts
public removeListener(selector: string, options: SelectorListenerOptions): boolean;
```
  
Removes a single listener for the given `selector` and `options`.  
Returns true when the listener was found and removed, false otherwise.

<br>

### `SelectorObserver.getAllListeners()`
Signature:
```ts
public getAllListeners(): Map<string, SelectorListenerOptions<HTMLElement>[]>;
```
  
Returns all listeners that have been registered with `addListener()`.

<br>

### `SelectorObserver.getListeners()`
Signature:
```ts
public getListeners(selector: string): SelectorListenerOptions<HTMLElement>[] | undefined;
```
  
Returns all listeners for the given `selector` or undefined if there are none.

<br>

### Types

### `type SelectorObserverConstructorOptions`
Options object passed to the [`SelectorObserver` constructor.](#class-selectorobserver)  
Extends [`MutationObserverInit`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe#options) with the following additional properties:
| Property | Type | Description |
| :-- | :-- | :-- |
| `defaultDebounce?` | `number \| undefined` | If set, applies this debounce in milliseconds to all listeners that don't have their own debounce set |
| `defaultDebounceType?` | `DebouncerType \| undefined` | If set, applies this debounce edge type to all listeners that don't have their own set - defaults to "immediate" |
| `disableOnNoListeners?` | `boolean \| undefined` | Whether to disable the observer when no listeners are present - defaults to false |
| `enableOnAddListener?` | `boolean \| undefined` | Whether to ensure the observer is enabled when a new listener is added - defaults to true |
| `checkInterval?` | `number \| undefined` | If set to a number, the checks will be run on interval instead of on mutation events - all MutationObserverInit props will be ignored |

<br>

### `type SelectorListenerOptions`
Options object passed to [`SelectorObserver.addListener()`](#selectorobserveraddlistener).  
See the table in that section for more details.

<br><br>

### `function getUnsafeWindow`
Signature:
```ts
function getUnsafeWindow(): Window;
```
  
Returns the `unsafeWindow` object or falls back to the regular `window` object if the `@grant unsafeWindow` is not given.  
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

<br><br>

### `function isDomLoaded`
Signature:
```ts
function isDomLoaded(): boolean;
```
  
Returns whether or not the DOM has finished loading and can be queried and modified.  
  
As long as the library is loaded immediately on page load, this function will always return the correct value, even if your runtime is executed after the DOM has finished loading (like when using `@run-at document-end`).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { isDomLoaded } from "@sv443-network/userutils";

console.log(isDomLoaded()); // false

document.addEventListener("DOMContentLoaded", () => {
  console.log(isDomLoaded()); // true
});
```
</details>

<br><br>

### `function onDomLoad`
Signature:
```ts
function onDomLoad(cb?: () => void): Promise<void>;
```
  
Executes a callback and/or resolves the returned Promise when the DOM has finished loading.  
Immediately executes/resolves if the DOM is already loaded.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { onDomLoad } from "@sv443-network/userutils";

onDomLoad(() => {
  console.log("DOM has finished loading.");
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM loaded!");

  // immediately resolves because the DOM is already loaded:
  await onDomLoad();

  console.log("DOM has finished loading.");
});
```
</details>

<br><br>

### `function addParent`
Signature:
```ts
function addParent<TElem extends Element, TParentElem extends Element>(
  element: TElem,
  newParent: TParentElem
): TParentElem;
```
  
Adds a parent container around the provided element and returns the new parent element.  
Previously registered event listeners are kept intact.  
  
⚠️ This function needs to be run after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { addParent } from "@sv443-network/userutils";

const element = document.querySelector("#element");
const newParent = document.createElement("a");
newParent.href = "https://example.org/";

addParent(element, newParent);
```
</details>

<br><br>

### `function addGlobalStyle`
Signature:
```ts
function addGlobalStyle(style: string): HTMLStyleElement;
```
  
Adds global CSS style in the form of a `<style>` element in the document's `<head>`.  
Returns the created style element.  
  
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

<br><br>

### `function preloadImages`
Signature:
```ts
function preloadImages(srcUrls: string[], rejects?: boolean): Promise<PromiseSettledResult<HTMLImageElement>[]>;
```
  
Preloads an array of image URLs so they can be loaded instantly from the browser cache later on.  
The `rejects` parameter defaults to false. If set to true, the returned PromiseSettledResults will contain rejections for any of the images that failed to load.  
Each resolved result will contain the loaded image element, while each rejected result will contain an `ErrorEvent`.  
  
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

<br><br>

### `function openInNewTab`
Signature:
```ts
function openInNewTab(href: string, background?: boolean, additionalProps?: Partial<HTMLAnchorElement>): void;
```
  
Tries to use `GM.openInTab` to open the given URL in a new tab, otherwise if the grant is not given, creates an invisible anchor element and clicks it.  
If `background` is set to true, the tab will be opened in the background. Leave `undefined` to use the browser's default behavior.  
If `additionalProps` is set and `GM.openInTab` is not available, the given properties will be added or overwritten on the created anchor element.  
  
⚠️ You should add the `@grant GM.openInTab` directive, otherwise only the fallback behavior will be used.  
⚠️ For the fallback to work, this function needs to be run in response to a user interaction event, else the browser might reject it.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { openInNewTab } from "@sv443-network/userutils";

document.querySelector("#my-button").addEventListener("click", () => {
  openInNewTab("https://example.org/", true);
});
```
</details>

<br><br>

### `function interceptEvent`
Signature:
```ts
function interceptEvent<
  TEvtObj extends EventTarget,
  TPredicateEvt extends Event,
>(
  eventObject: TEvtObj,
  eventName: Parameters<TEvtObj["addEventListener"]>[0],
  predicate?: (event: TPredicateEvt) => boolean
): void;
```
  
Intercepts the specified event on the passed object and prevents it from being called if the called `predicate` function returns a truthy value.  
If no predicate is specified, all events will be discarded.  
Calling this function will set `Error.stackTraceLimit = 100` (if not already higher) to ensure the stack trace is preserved.  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
⚠️ Due to this function modifying the `addEventListener` prototype, it might break execution of the page's main script if the userscript is running in an isolated context (like it does in FireMonkey). In that case, calling this function will throw a [`PlatformError`](#class-platformerror).  
  
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

<br><br>

### `function interceptWindowEvent`
Signature:
```ts
function interceptWindowEvent<TEvtKey extends keyof WindowEventMap>(
  eventName: TEvtKey,
  predicate?: (event: WindowEventMap[TEvtKey]) => boolean
): void;
```
  
Intercepts the specified event on the `unsafeWindow` (if available) or `window` object and prevents it from being called if the called `predicate` function returns a truthy value.  
If no predicate is specified, all events will be discarded.  
This is essentially the same as [`interceptEvent()`](#function-interceptevent), but automatically uses the `unsafeWindow` or `window`, depending on availability.  
  
⚠️ This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
⚠️ In order to have the best chance at intercepting events in a userscript, the directive `@grant unsafeWindow` should be set.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { interceptWindowEvent } from "@sv443-network/userutils";

// prevent the "Are you sure you want to leave this page?" popup:
interceptWindowEvent("beforeunload");

// discard all context menu commands that are not within #my-element:
interceptWindowEvent("contextmenu", (event) =>
  event.target instanceof HTMLElement && !event.target.closest("#my-element")
);
```
</details>

<br><br>

### `function isScrollable`
Signature:
```ts
function isScrollable(element: Element): Record<"vertical" | "horizontal", boolean>;
```
  
Checks if an element has a horizontal or vertical scroll bar.  
Uses the computed style of the element, so it has a high chance of working even if the element is hidden.  
  
⚠️ The element needs to be mounted in the DOM so the CSS engine evaluates it, otherwise no scroll bars can be detected.  
  
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

### `function observeElementProp`
Signature:
```ts
function observeElementProp<
  TElem extends Element = HTMLElement,
  TPropKey extends keyof TElem = keyof TElem,
>(
  element: TElem,
  property: TPropKey,
  callback: (oldVal: TElem[TPropKey], newVal: TElem[TPropKey]) => void
): void;
```
  
Executes the callback when the passed element's property changes.  
Contrary to an element's attributes, properties can usually not be observed with a MutationObserver.  
This function shims the getter and setter of the property to invoke the callback.  
  
When using TypeScript, the types for `element`, `property` and the arguments for `callback` will be automatically inferred.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { observeElementProp } from "@sv443-network/userutils";

const myInput = document.querySelector("input#my-input");

observeElementProp(myInput, "value", (oldValue, newValue) => {
  console.log("Value changed from", oldValue, "to", newValue);
});
```
</details>

<br><br>

### `function getSiblingsFrame`
Signature:
```ts
function getSiblingsFrame<TSibling extends Element = HTMLElement>(
  refElement: Element,
  siblingAmount: number,
  refElementAlignment?: "center-top" | "center-bottom" | "top" | "bottom",
  includeRef?: boolean
): TSibling[];
```
  
Returns a "frame" of the closest siblings of the `refElement`, based on the passed amount of siblings and `refElementAlignment`.  
  
These are the parameters:
- `refElement` - The reference element to return the relative closest siblings from.
- `siblingAmount` - The amount of siblings to return in total.
- `refElementAlignment` - Can be set to `center-top` (default), `center-bottom`, `top`, or `bottom`, which will determine where the relative location of the provided `refElement` is in the returned array.
- `includeRef` - If set to `true` (default), the provided `refElement` will be included in the returned array at its corresponding position.
  
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

// ref element aligned to the top, included in the result:
const siblings = getSiblingsFrame(refElement, 3, "top", true);
// [<div id="ref">3</div>, <div>4</div>, <div>5</div>]
```
</details>

<br><br>

### `function setInnerHtmlUnsafe`
Signature:
```ts
function setInnerHtmlUnsafe<TElement extends Element = HTMLElement>(
  element: TElement,
  html: string
): TElement;
```
  
Sets the innerHTML property of the provided element ***without any sanitization or validation.***  
Uses a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) on Chromium-based browsers to trick the browser into thinking the HTML is safe.  
Returns the element that was passed for chaining.  
  
⚠️ This function does not perform any sanitization and should thus be used with utmost caution, as it can easily lead to XSS vulnerabilities when used with untrusted input!  
⚠️ Only use this function when absolutely necessary, prefer using `element.textContent = "foo"` or other safer alternatives like the [DOMPurify library](https://github.com/cure53/DOMPurify) whenever possible.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { setInnerHtmlUnsafe } from "@sv443-network/userutils";

const myElement = document.querySelector("#my-element");
setInnerHtmlUnsafe(myElement, "<img src='https://picsum.photos/100/100' />");
```
</details>

<br><br>

### `function probeElementStyle`
Signature:
```ts
function probeElementStyle<
  TValue,
  TElem extends HTMLElement = HTMLSpanElement,
>(
  probeStyle: (style: CSSStyleDeclaration, element: TElem) => TValue,
  element?: TElem | (() => TElem),
  hideOffscreen?: boolean,
  parentElement?: HTMLElement
): TValue;
```
  
Creates an invisible temporary element to probe its rendered [computed style](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).  
This might be useful for resolving the value behind a CSS variable, getting the browser's default font size, etc.  
  
⚠️ This function can only be called after the DOM has loaded (when using `@run-at document-end` or after `DOMContentLoaded` has fired).  
  
- `probeStyle` - Function to probe the element's style. First argument is the element's style object, second argument is the element itself.
- `element` - The element to probe, or a function that creates and returns the element. All probe elements will have the class `_uu_probe_element` added. Defaults to a `<span>` element.
- `hideOffscreen` - Whether to hide the element offscreen (default: true). Disable if you want to probe position style properties.
- `parentElement` - The parent element to append the probe element to (default: `document.body`).
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { probeElementStyle } from "@sv443-network/userutils";

document.addEventListener("DOMContentLoaded", () => {
  const probedCol = probeElementStyle(
    (style) => style.backgroundColor,
    () => {
      const elem = document.createElement("span");
      elem.style.backgroundColor = "var(--my-cool-color, #000)";
      return elem;
    },
    true,
  );

  console.log("Resolved:", probedCol);
});
```
</details>

<br><br>

<!-- #region Misc -->
## Misc:

### `class GMStorageEngine`
Signature:
```ts
class GMStorageEngine<TData extends DataStoreData> extends DataStoreEngine<TData>;
```
  
Usage:
```ts
const engine = new GMStorageEngine(options?: GMStorageEngineOptions);
```
  
Storage engine for the [`DataStore`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastore) class that uses GreaseMonkey's `GM.getValue` and `GM.setValue` functions.  
Refer to the [DataStore documentation](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastore) for more information on how to use DataStore and storage engines.  
  
- ⚠️ Requires the grants `GM.getValue`, `GM.setValue`, `GM.deleteValue`, and `GM.listValues` in your userscript metadata.
- ⚠️ Don't reuse engine instances, always create a new one for each DataStore instance.
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { DataStore } from "@sv443-network/coreutils";
import { GMStorageEngine } from "@sv443-network/userutils";

const myStore = new DataStore({
  id: "my-data",
  defaultData: { foo: "bar" },
  formatVersion: 1,
  storageEngine: new GMStorageEngine(),
});

await myStore.loadData();
console.log(myStore.getData()); // { foo: "bar" }
```
</details>

<br>

### Methods

### `GMStorageEngine.getValue()`
Signature:
```ts
public async getValue<TValue extends SerializableVal = string>(name: string, defaultValue: TValue): Promise<string | TValue>;
```
  
Fetches a value from persistent GM storage.

<br>

### `GMStorageEngine.setValue()`
Signature:
```ts
public async setValue<TValue extends SerializableVal = string>(name: string, value: TValue): Promise<void>;
```
  
Sets a value in persistent GM storage.

<br>

### `GMStorageEngine.deleteValue()`
Signature:
```ts
public async deleteValue(name: string): Promise<void>;
```
  
Deletes a value from persistent GM storage.

<br>

### `GMStorageEngine.deleteStorage()`
Signature:
```ts
public async deleteStorage(): Promise<void>;
```
  
Deletes all values from the GM storage.

<br>

### Types

### `type GMStorageEngineOptions`
Options for the [`GMStorageEngine` class.](#class-gmstorageengine)
| Property | Type | Description |
| :-- | :-- | :-- |
| `dataStoreOptions?` | `DataStoreEngineDSOptions<DataStoreData> \| undefined` | Specifies the necessary options for storing data - ⚠️ Only specify this if you are using this instance standalone! The parent DataStore will set this automatically. |

<br><br>

### `class Mixins`
Signature:
```ts
class Mixins<
  TMixinMap extends Record<string, (arg: any, ctx?: any) => any>,
  TMixinKey extends Extract<keyof TMixinMap, string> = Extract<keyof TMixinMap, string>,
>;
```
  
Usage:
```ts
const mixins = new Mixins<TMixinMap>(config?: Partial<MixinsConstructorConfig>);
```
  
A class for creating mixin functions that allow multiple sources to modify a target value in a highly flexible way.  
Mixins are identified via their string key and can be added with `add()`.  
When calling `resolve()`, all registered mixin functions with the same key will be applied to the input value in the order of their priority.  
If a mixin function has its `stopPropagation` flag set, no further mixin functions will be applied after it.  
  
The `TMixinMap` template generic defines the mixin functions. Keys are the mixin names and values are functions that take the value as the first argument and an optional context object as the second, and return the modified value.  
**Important:** the first argument and return type need to be the same. Also, if a context object is defined, it must be passed as the third argument in `resolve()`.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { Mixins } from "@sv443-network/userutils";

const myMixins = new Mixins<{
  myValue: (val: number, ctx: { factor: number }) => Promise<number>;
}>({
  autoIncrementPriority: true,
});

myMixins.add("myValue", (val, { factor }) => val * factor);
myMixins.add("myValue", (val) => Promise.resolve(val + 1));
myMixins.add("myValue", (val) => val * 2, 1);

const result = await myMixins.resolve("myValue", 10, { factor: 0.75 });
// order of operations:
// 1. 10 * 2 = 20     (priority 1)
// 2. 20 * 0.75 = 15  (priority 0, index 0)
// 3. 15 + 1 = 16     (priority 0, index 1)
// result = 16
```
</details>

<br>

### Methods

### `Mixins.add()`
Signature:
```ts
public add<TKey extends TMixinKey, TArg, TCtx>(
  mixinKey: TKey,
  mixinFn: (arg: TArg, ...ctx: TCtx extends undefined ? [void] : [TCtx]) => ReturnType<TMixinMap[TKey]>,
  config?: Partial<MixinConfig> | number
): () => void;
```
  
Registers a mixin function for the given key.  
If a number is passed as `config`, it will be treated as the priority.  
Returns a cleanup function that removes this mixin when called.  
  
Mixins with the highest priority will be applied first. If two or more mixins share the exact same priority, they will be executed in order of registration (first come, first serve).

<br>

### `Mixins.resolve()`
Signature:
```ts
public resolve<TKey extends TMixinKey, TArg, TCtx>(
  mixinKey: TKey,
  inputValue: TArg,
  ...inputCtx: TCtx extends undefined ? [void] : [TCtx]
): ReturnType<TMixinMap[TKey]>;
```
  
Applies all mixins with the given key to the input value, respecting the priority and stopPropagation settings.  
If some of the mixins are async, the method will also return a Promise.

<br>

### `Mixins.list()`
Signature:
```ts
public list(): ({ key: string } & MixinConfig)[];
```
  
Returns an array of objects that contain the mixin keys and their configuration objects, but not the mixin functions themselves.

<br>

### Types

### `type MixinsConstructorConfig`
Configuration object for the [`Mixins` class.](#class-mixins)
| Property | Type | Description |
| :-- | :-- | :-- |
| `autoIncrementPriority` | `boolean` | If true, an auto-incrementing integer priority will be used when none is specified (unique per mixin key). Defaults to false. |
| `defaultPriority` | `number` | The default priority for mixins that do not specify one. Defaults to 0. |
| `defaultStopPropagation` | `boolean` | The default `stopPropagation` value. Defaults to false. |
| `defaultSignal?` | `AbortSignal \| undefined` | The default `AbortSignal` for mixins that do not specify one. |

<br>

### `type MixinConfig`
Configuration object for an individual mixin function.
| Property | Type | Description |
| :-- | :-- | :-- |
| `priority` | `number` | The higher, the earlier the mixin will be applied. Supports floating-point and negative numbers. Defaults to 0. |
| `stopPropagation` | `boolean` | If true, no further mixins will be applied after this one. |
| `signal?` | `AbortSignal \| undefined` | If set, the mixin will only be applied if the given signal is not aborted. |

<br><br>

<!-- #region Translation -->
## Translation:

### `function tr.for`
Signature:
```ts
function tr.for<TTrKey extends string = string>(
  language: string,
  key: TTrKey,
  ...args: (Stringifiable | Record<string, Stringifiable>)[]
): string;
```
  
Returns the translated text for the specified key in the specified language.  
If the key is not found in the specified previously registered translation, the key itself is returned.  
  
⚠️ Remember to register a language with `tr.addTranslations()` before using this function, otherwise it will always return the key itself.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", { hello: "Hello, World!" });
tr.addTranslations("de", { hello: "Hallo, Welt!" });

tr.setFallbackLanguage("en");

tr.for("en", "hello"); // "Hello, World!"
tr.for("de", "hello"); // "Hallo, Welt!"
```
</details>

<br><br>

### `function tr.use`
Signature:
```ts
function tr.use<TTrKey extends string = string>(
  language: string
): (key: TTrKey, ...args: (Stringifiable | Record<string, Stringifiable>)[]) => string;
```
  
Creates a translation function for the specified language, allowing you to translate multiple strings without repeating the language parameter.  
The returned function works exactly like `tr.for()`, minus the language parameter.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr, type TrKeys } from "@sv443-network/userutils";

const transEn = {
  hello: "Hello, World!",
} as const;

tr.addTranslations("en", transEn);

const t = tr.use<TrKeys<typeof transEn>>("en");

t("hello"); // "Hello, World!"
```
</details>

<br><br>

### `function tr.hasKey`
Signature:
```ts
function tr.hasKey<TTrKey extends string = string>(
  language?: string,
  key: TTrKey
): boolean;
```
  
Checks if a translation key exists in the specified language or the set fallback language.  
Returns `false` if the given language was not registered with `tr.addTranslations()`.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", { hello: "Hello, World!" });

tr.hasKey("en", "hello");   // true
tr.hasKey("en", "goodbye"); // false
```
</details>

<br><br>

### `function tr.addTranslations`
Signature:
```ts
function tr.addTranslations(language: string, translations: TrObject): void;
```
  
Registers a new language and its translations. If the language already exists, it will be overwritten.  
The translations can be a flat key-value object or infinitely nested objects, resulting in a dot-separated key.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", {
  hello: "Hello, World!",
  nested: {
    key: "This is a nested key",
  },
});

const t = tr.use("en");

t("hello");      // "Hello, World!"
t("nested.key"); // "This is a nested key"
```
</details>

<br><br>

### `function tr.getTranslations`
Signature:
```ts
function tr.getTranslations(language?: string): TrObject | undefined;
```
  
Returns the translation object for the specified language, or `undefined` if the language is not registered.  
If no language is provided, defaults to the fallback language.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", { hello: "Hello, World!" });

tr.getTranslations("en"); // { hello: "Hello, World!" }
tr.getTranslations("de"); // undefined
```
</details>

<br><br>

### `function tr.deleteTranslations`
Signature:
```ts
function tr.deleteTranslations(language: string): boolean;
```
  
Deletes the translations for the specified language from memory.  
Returns `true` if the translations were found and deleted, `false` otherwise.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", { hello: "Hello, World!" });
tr.deleteTranslations("en"); // true
tr.deleteTranslations("de"); // false
```
</details>

<br><br>

### `function tr.setFallbackLanguage`
Signature:
```ts
function tr.setFallbackLanguage(fallbackLanguage?: string): void;
```
  
Sets the fallback language to use when a translation key is not found in the given language.  
Pass `undefined` to disable fallbacks and just return the translation key if translations are not found.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", { hello: "Hello!", goodbye: "Goodbye!" });
tr.addTranslations("de", { hello: "Hallo!" });

tr.setFallbackLanguage("en");

const t = tr.use("de");

t("hello");   // "Hallo!"
t("goodbye"); // "Goodbye!" (falls back to "en")
```
</details>

<br><br>

### `function tr.getFallbackLanguage`
Signature:
```ts
function tr.getFallbackLanguage(): string | undefined;
```
  
Returns the currently set fallback language, or `undefined` if no fallback language was set.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.getFallbackLanguage(); // undefined

tr.setFallbackLanguage("en");

tr.getFallbackLanguage(); // "en"
```
</details>

<br><br>

### `function tr.addTransform`
Signature:
```ts
function tr.addTransform<TTrKey extends string = string>(
  transform: TransformTuple<TTrKey>
): void;
```
  
Adds a transform function to the translation system. Transforms are applied after resolving a translation for any language.  
Use this to enable dynamic values in translations, for example to insert custom values or to denote a section that could be encapsulated by rich text.  
The `transform` argument is a tuple of `[RegExp, TransformFn]`.  
  
The `TransformFn` receives an object with the following properties:
| Property | Type | Description |
| :-- | :-- | :-- |
| `language` | `string` | The current or fallback language |
| `matches` | `RegExpExecArray[]` | All matches as returned by `RegExp.exec()` |
| `trKey` | `TTrKey` | The translation key |
| `trValue` | `string` | Translation value before any transformations |
| `currentValue` | `string` | Current value, possibly in-between transformations |
| `trArgs` | `(Stringifiable \| Record<string, Stringifiable>)[]` | Arguments passed to the translation function |
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", {
  greeting: "Hello, ${name}!",
});

tr.addTransform(tr.transforms.templateLiteral);

const t = tr.use("en");

t("greeting", { name: "John" }); // "Hello, John!"
t("greeting", "John");           // "Hello, John!"
```
</details>

<br><br>

### `function tr.deleteTransform`
Signature:
```ts
function tr.deleteTransform(patternOrFn: RegExp | TransformFn): boolean;
```
  
Removes a transform function from the list of registered transform functions.  
Returns `true` if the transform was found and deleted, `false` otherwise.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr, type TransformTuple } from "@sv443-network/userutils";

const myTransform: TransformTuple = [
  /\$\{([a-zA-Z0-9$_-]+)\}/gm,
  ({ matches }) => matches[1] ?? "",
];

tr.addTransform(myTransform);
tr.deleteTransform(myTransform[0]); // true
```
</details>

<br>

### `const tr.transforms`
Predefined transform functions for quickly adding custom argument insertion.  
  
Currently available transforms:
| Key | Pattern | Type(s) |
| :-- | :-- | :-- |
| `templateLiteral` | `${key}` | Keyed / Positional |
| `percent` | `%n` | Positional |
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr } from "@sv443-network/userutils";

tr.addTranslations("en", {
  greeting: "Hello, ${name}! You have ${notifs} notifications.",
  message: "Hello, %1! You have %2 notifications.",
});

tr.addTransform(tr.transforms.templateLiteral);
tr.addTransform(tr.transforms.percent);

const t = tr.use("en");

// templateLiteral supports both keyed and positional:
t("greeting", { name: "John", notifs: 42 }); // "Hello, John! You have 42 notifications."
t("greeting", "John", 42);                   // "Hello, John! You have 42 notifications."

// percent is positional only:
t("message", "John", 42); // "Hello, John! You have 42 notifications."
```
</details>

<br>

### Types

### `type TrKeys`
Signature:
```ts
type TrKeys<TTrObj, P extends string = "">;
```
  
Generic type that extracts all keys from a flat or recursive translation object into a union type.  
Nested keys will be joined with a dot (`.`).  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { tr, type TrKeys } from "@sv443-network/userutils";

const trEn = {
  hello: "Hello, World!",
  nested: {
    key: "This is a nested key",
  },
} as const;

tr.addTranslations("en", trEn);

type MyKeys = TrKeys<typeof trEn>; // "hello" | "nested.key"

const t = tr.use<MyKeys>("en");
```
</details>

<br>

### `type TrObject`
```ts
interface TrObject {
  [key: string]: string | TrObject;
}
```
  
Translation object to pass to `tr.addTranslations()`.  
Can be a flat object of identifier keys and translation text values, or an infinitely nestable object containing the same.

<br>

### `type TransformFn`
```ts
type TransformFn<TTrKey extends string = string> = (props: TransformFnProps<TTrKey>) => Stringifiable;
```
  
Function that transforms a matched translation string into another string.

<br>

### `type TransformTuple`
```ts
type TransformTuple<TTrKey extends string = string> = [RegExp, TransformFn<TTrKey>];
```
  
Transform pattern and function in tuple form, passed to `tr.addTransform()`.

<br><br>

<!-- #region Error classes -->
## Error classes:

### `class PlatformError`
Signature:
```ts
class PlatformError extends DatedError;
```
  
Usage:
```ts
throw new PlatformError(message: string, options?: ErrorOptions);
```
  
Thrown when the current platform doesn't support a certain feature, like calling a DOM function in a non-DOM environment.  
Extends from [`DatedError`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datederror), which has a `date` property that contains the date and time when the error was created.  
  
<details><summary><b>Example - click to view</b></summary>

```ts
import { PlatformError } from "@sv443-network/userutils";

if(typeof document === "undefined")
  throw new PlatformError("This feature requires a DOM environment");
```
</details>

<br><br><br><br>

<!-- #region Footer -->
<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
