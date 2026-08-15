---
"@sv443-network/userutils": minor
---

Updated the included version of [CoreUtils to v3.8.0](https://github.com/Sv443-Network/CoreUtils/releases/tag/%40sv443-network%2Fcoreutils%403.8.0), which comes with the following changes:
  - Added new `DataStore` engine `IndexedDBStorageEngine` for DOM environments with access to [`indexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/Window/indexedDB).
    This engine allows for larger storage limits and more complex data structures, including non-JSON-serializable and binary ([Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob) / [File](https://developer.mozilla.org/en-US/docs/Web/API/File)) data.
  - `DataStoreSerializer` now extends `PicoEmitter` and emits these events:
    - `loadedAllStores`: Emitted once, whenever all contained DataStore instances have finished loading at least once. No arguments.
    - `loadedStore`: Emitted once, whenever a contained DataStore instance has finished loading at least once. Gets passed the instance as the only argument.
    - `resetStores`: Emitted whenever one or more stores have had their data reset to the default value. Gets passed an array of all instances that were reset.
    - `deletedStores`: Emitted whenever one or more stores have had their persistent data cleared. Gets passed an array of all instances that were cleared.
  - `NanoEmitterOptions.publicEmit` is no longer a required property in all CoreUtils and UserUtils classes that extend `NanoEmitter`.
  - `createProgressBar()` now correctly uses the 25% and 75% characters.