## UserUtils
Library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, modify the DOM more easily and more.  
Contains builtin TypeScript declarations. Webpack compatible and supports ESM and CJS.  
Licensed under the [MIT license.](https://github.com/Sv443-Network/UserUtils/blob/main/LICENSE.txt)  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>

### Full documentation [on GitHub](https://github.com/Sv443-Network/UserUtils#readme)

<br>

## Features:
- DOM:
    - [onSelector()](https://github.com/Sv443-Network/UserUtils#onselector) - call a listener once a selector is found in the DOM
    - [initOnSelector()](https://github.com/Sv443-Network/UserUtils#initonselector) - needs to be called once to be able to use `onSelector()`
    - [getSelectorMap()](https://github.com/Sv443-Network/UserUtils#getselectormap) - returns all currently registered selectors, listeners and options
    - [getUnsafeWindow()](https://github.com/Sv443-Network/UserUtils#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [insertAfter()](https://github.com/Sv443-Network/UserUtils#insertafter) - insert an element as a sibling after another element
    - [addParent()](https://github.com/Sv443-Network/UserUtils#addparent) - add a parent element around another element
    - [addGlobalStyle()](https://github.com/Sv443-Network/UserUtils#addglobalstyle) - add a global style to the page
    - [preloadImages()](https://github.com/Sv443-Network/UserUtils#preloadimages) - preload images into the browser cache for faster loading later on
    - [openInNewTab()](https://github.com/Sv443-Network/UserUtils#openinnewtab) - open a link in a new tab
    - [interceptEvent()](https://github.com/Sv443-Network/UserUtils#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [interceptWindowEvent()](https://github.com/Sv443-Network/UserUtils#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [amplifyMedia()](https://github.com/Sv443-Network/UserUtils#amplifymedia) - amplify an audio or video element's volume past the maximum of 100%
- Math:
    - [clamp()](https://github.com/Sv443-Network/UserUtils#clamp) - constrain a number between a min and max value
    - [mapRange()](https://github.com/Sv443-Network/UserUtils#maprange) - map a number from one range to the same spot in another range
    - [randRange()](https://github.com/Sv443-Network/UserUtils#randrange) - generate a random number between a min and max boundary
- Misc:
    - [autoPlural()](https://github.com/Sv443-Network/UserUtils#autoplural) - automatically pluralize a string
    - [pauseFor()](https://github.com/Sv443-Network/UserUtils#pausefor) - pause the execution of a function for a given amount of time
    - [debounce()](https://github.com/Sv443-Network/UserUtils#debounce) - call a function only once, after a given amount of time
    - [fetchAdvanced()](https://github.com/Sv443-Network/UserUtils#fetchadvanced) - wrapper around the fetch API with a timeout option
- Arrays:
    - [randomItem()](https://github.com/Sv443-Network/UserUtils#randomitem) - returns a random item from an array
    - [randomItemIndex()](https://github.com/Sv443-Network/UserUtils#randomitemindex) - returns a tuple of a random item and its index from an array
    - [takeRandomItem()](https://github.com/Sv443-Network/UserUtils#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [randomizeArray()](https://github.com/Sv443-Network/UserUtils#randomizearray) - returns a copy of the array with its items in a random order

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
    Shameless plug: I made a [webpack-based template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.


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
