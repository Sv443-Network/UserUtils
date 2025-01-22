---
"@sv443-network/userutils": major
---

**BREAKING** - Reworked debounce system:  
- Edge types `rising` and `falling` have been removed.
- Added new edge types `immediate` and `idle` with new behavior.
  - `immediate` (default & recommended) will trigger immediately, then queue all subsequent calls until the timeout has passed.
  - `idle` will trigger the last queued call only after there haven't been any subsequent calls for the specified timeout.
- Added `Debouncer` class for more advanced control over debouncing, and with that the following changes:
  - Ability to attach and manage multiple listeners.
  - Inherits from NanoEmitter, allowing event-based debouncing.
  - Can be inherited by your own classes for built-in debouncing.
- `debounce()` function can still be called as usual (after replacing the edge type names with the new ones). Internally, it will instantiate a `Debouncer` instance, which is available via the `debouncer` property on the returned function.
- Reduced default timeout from 300ms to 200ms.
