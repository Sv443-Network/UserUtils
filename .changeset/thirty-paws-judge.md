---
"@sv443-network/userutils": minor
---

Updated to [CoreUtils v3.6.0](https://github.com/Sv443-Network/CoreUtils/releases/tag/%40sv443-network%2Fcoreutils%403.6.0), which comes with the following minor features:
- Added `stringifyData` option to `DataStoreSerializer` for preventing any stringification when serializing with the `stringify` parameter set to `false` too.
- Added optional `catchUpEvents` option to `NanoEmitter` and `NanoEmitterOptions`. When provided with a list of event names, the emitter remembers the last arguments of each listed event. Any listener attached via `on()` or `once()` after such an event has already fired will be immediately called / resolved with the cached arguments. Also added the protected `emitEvent()` method for subclasses - it behaves identically to `this.events.emit()` but additionally updates the catch-up cache and should thus be preferred over `this.events.emit()`.
- Added function `getterifyObj()` to turn all own, enumerable properties of an object into getters.
  This is useful when logging large objects to the console.
- Added optional `TFn` generic parameter to `ValueGen` and `StringGen` types, and a matching rest `...args` parameter to `consumeGen()` and `consumeStringGen()`, enabling parametrized function variants with full type safety.
