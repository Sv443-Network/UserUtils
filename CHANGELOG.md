# @sv443-network/userutils

## 4.1.0

### Minor Changes

- 885323d: Added function `observeElementProp` to allow observing element property changes

## 4.0.0

### Major Changes

- dae5450: Removed `amplifyMedia` function due to massive inconsistencies in sound quality

### Minor Changes

- 168c2aa: Added functions `compress` and `decompress` to compress and decompress strings using gzip or deflate
- 49bc85e: Added utility types `NonEmptyString` and `LooseUnion`

### Patch Changes

- 2ae665d: fixed wrong TS type for SelectorObserver options in constructor

## 3.0.0

### Major Changes

- 1859022: `onSelector()` has been turned into the `SelectorObserver` class to reduce the performance impact on larger sites:

  - its instances can be scoped to any element lower in the DOM tree, unlike before where it was always observing the entire body with all its children
  - separate instances can be disabled and reenabled individually on demand
  - separate instances can have different MutationObserver options set to further reduce performance impact
  - the separation into instances allows for a new "chaining" paradigm where selector listeners are only added and checked for once they are actually needed (see examples in the documentation)
  - when using chaining, separate instances can be created and have listeners added to them before their base element is available in the DOM tree
  - every listener can have a set debounce time, so that it doesn't get called too often (works the same as the [`debounce()` function](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#debounce), but is disabled by default)
  - there are now multiple methods to get and delete specific listeners

  The `SelectorObserver.addListener()` method is backwards compatible with the old `onSelector()` function, so you can just add the class instance in front (for full backwards compat use `document.body` for the `baseElement` parameter of the constructor), then change the old function's name and it should work as before.
  For more info and examples, please view the [SelectorObserver documentation](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#selectorobserver)

### Minor Changes

- 0db73b5: Removed the limiter (DynamicsCompressorNode) from `amplifyMedia()` for clear and undistorted audio.

  **Notable changes:**

  - The property `source` has been renamed to `sourceNode` to fit the naming of the `gainNode` property
  - A boolean property `enabled` has been added to check if the amplification is enabled or not
  - The parameter `initialMultiplier` has been renamed to `initialGain` to reduce confusion (it is not a multiplier strictly speaking)

- 736784f: Added function `randomId()` to randomly generate cryptographically strong hexadecimal IDs
- 563e515: Added utility type `NonEmptyArray` for typing an array with at least 1 item

### Patch Changes

- a123da6: Added `@linkcode` references to the JSDoc in-IDE documentation

## 2.0.1

### Patch Changes

- 63af1a7: Change default limiter options to be more balanced

## 2.0.0

### Major Changes

- b53a946: Added compression to `amplifyMedia()` to prevent audio clipping and distortion and modified return type accordingly:
  - Renamed: `amplify()` to `setGain()` and `getAmpLevel()` to `getGain()`
  - Added properties: `enable()`, `disable()`, `setLimiterOptions()` and `limiterNode`
  - Other changes: Amplification is no longer enabled automatically, `enable()` must now be called manually after initializing

## 1.2.0

### Minor Changes

- 84b37f1: Added utility type Stringifiable to describe a string or any value that can be converted to one
- 142c5e2: Added function insertValues() to insert values into a string with placeholders
- 16ce257: Added lightweight translation system

## 1.1.3

### Patch Changes

- ad17374: Add support for OpenUserJS

## 1.1.2

### Patch Changes

- 049aeb0: Export ConfigMigrationsDict for easier use with TypeScript

## 1.1.1

### Patch Changes

- 4799a9f: Fix TS error in ConfigManager migration functions

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
