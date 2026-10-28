---
"@sv443-network/userutils": minor
---

For better performance, the selector checks in the `SelectorObserver` class will now also be debounced with the given default settings. The new option `debounceChecks` can be used to turn this off, so only the listener function is debounced, as before.
