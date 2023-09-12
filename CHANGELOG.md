# @sv443-network/userutils

## 1.1.0

### Minor Changes

- db5cded: Added `isScrollable()` to check whether an element has a horizontal or vertical scroll bar

### Patch Changes

- 9e26464: Replaced most occurrences of `HTMLElement` in the docs with `Element` for better compatibility

## 1.0.0

### Major Changes

- a500a98: Added ConfigManager to manage persistent user configurations including data versioning and migration

### Patch Changes

- 6d0a700: Event interceptor can now be toggled at runtime ([#16](https://github.com/Sv443-Network/UserUtils/issues/16))
- d038b21: Global (IIFE) build now comes with a header

## 0.5.3

### Patch Changes

- f97dae6: change bundling process

## 0.5.2

### Patch Changes

- 18d4a10: make npm bundle smaller

## 0.5.1

### Patch Changes

- aa8efbd: fix documentation

## 0.5.0

### Minor Changes

- 54e7905: Features:

  - add function `amplifyMedia()` to boost the volume of a MediaElement past its default maximum
  - allow all `MutationObserver.observe()` options to be passed to `initOnSelector()`

  Fixes:

  - fix `onSelector()` not triggering correctly

## 0.4.1

### Patch Changes

- 85ec87b: fix missing export for array functions

## 0.4.0

### Minor Changes

- 231a79c: Refactored code and documentation and added new functions:
  - `mapRange()` to map a number from one range to the same spot in another range
  - `randRange()` to generate a random number between a min and max boundary
  - `randomItem()` to return a random item from an array
  - `randomItemIndex()` to return a tuple of a random item and its index from an array
  - `takeRandomItem()` to return a random item from an array and mutate it to remove the item
  - `randomizeArray()` to return a copy of the array with its items in a random order

### Patch Changes

- 7edf837: decrease npm bundle size

## 0.3.0

### Minor Changes

- 07ec443: add `getSelectorMap()` to return all currently registered selectors

## 0.2.0

### Minor Changes

- 0cf2254: add `onSelector()` to call a listener once a selector is found in the DOM

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
