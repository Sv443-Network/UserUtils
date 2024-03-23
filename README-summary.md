## UserUtils
Library with various utilities for userscripts - register listeners for when CSS selectors exist, intercept events, manage persistent user configurations, modify the DOM more easily and more.  
Contains builtin TypeScript declarations. Fully web compatible and supports ESM and CJS imports and global declaration.  
Licensed under the [MIT license.](https://github.com/Sv443-Network/UserUtils/blob/main/LICENSE.txt)  
  
You may want to check out my [template for userscripts in TypeScript](https://github.com/Sv443/Userscript.ts) that you can use to get started quickly. It also includes this library by default.  
  
If you like using this library, please consider [supporting the development ❤️](https://github.com/sponsors/Sv443)

<br>

## &gt; [Full documentation on GitHub](https://github.com/Sv443-Network/UserUtils#readme) &lt;

<br>

<sup>
View the documentation of previous major releases:
</sup>
<sup>

<a href="https://github.com/Sv443-Network/UserUtils/blob/v5.0.1/README.md" rel="noopener noreferrer">5.0.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v4.2.1/README.md" rel="noopener noreferrer">4.2.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v3.0.0/README.md" rel="noopener noreferrer">3.0.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v2.0.1/README.md" rel="noopener noreferrer">2.0.1</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v1.2.0/README.md" rel="noopener noreferrer">1.2.0</a>, <a href="https://github.com/Sv443-Network/UserUtils/blob/v0.5.3/README.md" rel="noopener noreferrer">0.5.3</a>

</sup>

<br>

<!-- https://github.com/Sv443-Network/UserUtils  < #foo    -->
## Feature Summary:
- DOM:
    - [SelectorObserver](https://github.com/Sv443-Network/UserUtils#selectorobserver) - class that manages listeners that are called when selectors are found in the DOM
    - [getUnsafeWindow()](https://github.com/Sv443-Network/UserUtils#getunsafewindow) - get the unsafeWindow object or fall back to the regular window object
    - [insertAfter()](https://github.com/Sv443-Network/UserUtils#insertafter) - insert an element as a sibling after another element
    - [addParent()](https://github.com/Sv443-Network/UserUtils#addparent) - add a parent element around another element
    - [addGlobalStyle()](https://github.com/Sv443-Network/UserUtils#addglobalstyle) - add a global style to the page
    - [preloadImages()](https://github.com/Sv443-Network/UserUtils#preloadimages) - preload images into the browser cache for faster loading later on
    - [openInNewTab()](https://github.com/Sv443-Network/UserUtils#openinnewtab) - open a link in a new tab
    - [interceptEvent()](https://github.com/Sv443-Network/UserUtils#interceptevent) - conditionally intercepts events registered by `addEventListener()` on any given EventTarget object
    - [interceptWindowEvent()](https://github.com/Sv443-Network/UserUtils#interceptwindowevent) - conditionally intercepts events registered by `addEventListener()` on the window object
    - [isScrollable()](https://github.com/Sv443-Network/UserUtils#isscrollable) - check if an element has a horizontal or vertical scroll bar
    - [observeElementProp()](https://github.com/Sv443-Network/UserUtils#observeelementprop) - observe changes to an element's property that can't be observed with MutationObserver
    - [getSiblingsFrame()](https://github.com/Sv443-Network/UserUtils#getsiblingsframe) - returns a frame of an element's siblings, with a given alignment and size
- Math:
    - [clamp()](https://github.com/Sv443-Network/UserUtils#clamp) - constrain a number between a min and max value
    - [mapRange()](https://github.com/Sv443-Network/UserUtils#maprange) - map a number from one range to the same spot in another range
    - [randRange()](https://github.com/Sv443-Network/UserUtils#randrange) - generate a random number between a min and max boundary
    - [randomId()](https://github.com/Sv443-Network/UserUtils#randomid) - generate a random ID of a given length and radix
- Misc:
    - [DataStore](https://github.com/Sv443-Network/UserUtils#DataStore) - class that manages a sync & async persistent JSON database, including data migration
    - [autoPlural()](https://github.com/Sv443-Network/UserUtils#autoplural) - automatically pluralize a string
    - [pauseFor()](https://github.com/Sv443-Network/UserUtils#pausefor) - pause the execution of a function for a given amount of time
    - [debounce()](https://github.com/Sv443-Network/UserUtils#debounce) - call a function only once, after a given amount of time
    - [fetchAdvanced()](https://github.com/Sv443-Network/UserUtils#fetchadvanced) - wrapper around the fetch API with a timeout option
    - [insertValues()](https://github.com/Sv443-Network/UserUtils#insertvalues) - insert values into a string at specified placeholders
    - [compress()](https://github.com/Sv443-Network/UserUtils#compress) - compress a string with Gzip or Deflate
    - [decompress()](https://github.com/Sv443-Network/UserUtils#decompress) - decompress a previously compressed string
- Arrays:
    - [randomItem()](https://github.com/Sv443-Network/UserUtils#randomitem) - returns a random item from an array
    - [randomItemIndex()](https://github.com/Sv443-Network/UserUtils#randomitemindex) - returns a tuple of a random item and its index from an array
    - [takeRandomItem()](https://github.com/Sv443-Network/UserUtils#takerandomitem) - returns a random item from an array and mutates it to remove the item
    - [randomizeArray()](https://github.com/Sv443-Network/UserUtils#randomizearray) - returns a copy of the array with its items in a random order
- Translation:
    - [tr()](https://github.com/Sv443-Network/UserUtils#tr) - simple translation of a string to another language
    - [tr.addLanguage()](https://github.com/Sv443-Network/UserUtils#traddlanguage) - add a language and its translations
    - [tr.setLanguage()](https://github.com/Sv443-Network/UserUtils#trsetlanguage) - set the currently active language
    - [tr.getLanguage()](https://github.com/Sv443-Network/UserUtils#trgetlanguage) - returns the currently active language
- Utility types for TypeScript
    - [Stringifiable](https://github.com/Sv443-Network/UserUtils#stringifiable) - any value that is a string or can be converted to one (implicitly or explicitly)
    - [NonEmptyArray](https://github.com/Sv443-Network/UserUtils#nonemptyarray) - any array that should have at least one item

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

- If you are not using a bundler, you can include the latest release by adding one of these directives to the userscript header, depending on your preferred CDN:
    ```
    // @require https://greasyfork.org/scripts/472956-userutils/code/UserUtils.js
    ```
    ```
    // @require https://openuserjs.org/src/libs/Sv443/UserUtils.js
    ```
    (in order for your userscript not to break on a major library update, use the versioned URL at the top of the [GreasyFork page](https://greasyfork.org/scripts/472956-userutils))  
      
    Then, access the functions on the global variable `UserUtils`:
    ```ts
    UserUtils.addGlobalStyle("body { background-color: red; }");

    // or using object destructuring:

    const { clamp } = UserUtils;
    console.log(clamp(1, 5, 10)); // 5
    ```
