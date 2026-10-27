---
"@sv443-network/userutils": minor
---

Added `SelectorObserver.setOption()` to change a few of the options after class instantiation.  
This comes with the new type `SelectorObserverOptionsMutable`, which contains all options of the `SelectorObserver` that can be modified using this new method.  
The types `SelectorObserverOptions` and `SelectorObserverConstructorOptions` were updated to reference this new type. These changes should be backwards-compatible.
