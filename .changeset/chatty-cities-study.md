---
"@sv443-network/userutils": minor
---

`SelectorObserver` now publicly exposes the properties `baseElement` and `options` (though they are read-only). It also now has a generic type parameter to provide stricter types when an already resolved `Element` is passed.
