# @sv443-network/userutils

## 0.4.1

### Patch Changes

- 85ec87b: fix missing export for array functions

## 0.4.0

### Minor Changes

- 231a79c: Refactored code and documentation and added new functions:
  - mapRange() to map a number from one range to the same spot in another range
  - randRange() to generate a random number between a min and max boundary
  - randomItem() to return a random item from an array
  - randomItemIndex() to return a tuple of a random item and its index from an array
  - takeRandomItem() to return a random item from an array and mutate it to remove the item
  - randomizeArray() to return a copy of the array with its items in a random order

### Patch Changes

- 7edf837: decrease npm bundle size

## 0.3.0

### Minor Changes

- 07ec443: add getSelectorMap() to return all currently registered selectors

## 0.2.0

### Minor Changes

- 0cf2254: add onSelector() to call a listener once a selector is found in the DOM

## 0.1.1

### Patch Changes

- bb60db0: minor fixes

## 0.1.0

### Minor Changes

- 9206f6e: Initial release - Features:
  - `onSelector()` to call a listener once a selector is found in the DOM
  - `autoPlural()` to automatically pluralize a string
  - `clamp()` to clamp a number between a min and max value
  - `pauseFor()` to pause the execution of a function for a given amount of time
  - `debounce()` to call a function only once, after a given amount of time
  - `getUnsafeWindow()` to get the unsafeWindow object or fall back to the regular window object
  - `insertAfter()` to insert an element as a sibling after another element
  - `addParent()` to add a parent element around another element
  - `addGlobalStyle()` to add a global style to the page
  - `preloadImages()` to preload images into the browser cache for faster loading later on
  - `fetchAdvanced()` as a wrapper around the fetch API with a timeout option
  - `openInNewTab()` to open a link in a new tab
  - `interceptEvent()` to conditionally intercept events registered by `addEventListener()` on any given EventTarget object
  - `interceptWindowEvent()` to conditionally intercept events registered by `addEventListener()` on the window object
