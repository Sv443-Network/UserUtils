---
"@sv443-network/userutils": minor
---

Updated to CoreUtils v3.7.0 - this comes with the following feature:
- Added the abstract class `PicoEmitter`, which is now the base class of `NanoEmitter`. It's meant purely for bootstrapping a class, not for standalone use in a functional environment.  
For public methods it only provides the basic `on()`, `once()` and `onMulti()` for attaching listeners. Emitting events is done purely internal via `emitEvent()` calls in a subclass.
