## UserUtils
Various utilities for userscripts

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
  import * as userUtils from "@sv443-network/userutils";
  // or
  import { addGlobalStyle } from "@sv443-network/userutils";
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

### autoPlural()

### clamp()

### pauseFor()

### debounce()

### getUnsafeWindow()

### insertAfter()

### addParent()

### addGlobalStyle()

### preloadImages()

### fetchAdvanced()

### openInNewTab()

### interceptEvent()

### interceptWindowEvent()


<br><br>

## License:
This library is licensed under the MIT License.  
See the [license file](./LICENSE.txt) for details.

<br><br>

<div style="text-align: center;" align="center">

Made with ❤️ by [Sv443](https://github.com/Sv443)  
If you like this library, please consider [supporting development](https://github.com/sponsors/Sv443)

</div>
