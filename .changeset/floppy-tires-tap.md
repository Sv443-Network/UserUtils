---
"@sv443-network/userutils": minor
---

Updated CoreUtils to v3.4.0, which includes the following changes:
- `Debouncer` and `debounce` now have an extra parameter of type `NanoEmitterOptions` to customize the underlying `NanoEmitter` instance.
- Added function `createRecurringTask()` as a "batteries included" alternative to `setImmediateTimeoutLoop()` and `setImmediateInterval()`, with more ways to control task execution and aborting.
- Fixed internal event emission problems in `Debouncer`
