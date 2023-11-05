---
"@sv443-network/userutils": major
---

`onSelector()` has been turned into the `SelectorObserver` class to reduce the performance impact on larger sites:
- its instances can be scoped to any element lower in the DOM tree, unlike before where it was always observing the entire body with all its children
- separate instances can be disabled and reenabled individually on demand
- separate instances can have different MutationObserver options set to further reduce performance impact
- the separation into instances allows for a new "chaining" paradigm where selector listeners are only added and checked for once they are actually needed (see examples in the documentation)
- every listener can have a set debounce time, so that it doesn't get called too often (works the same as the [`debounce()` function](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#debounce), but is disabled by default)
- there are now multiple methods to get and delete specific listeners
  
The `SelectorObserver.addListener()` method is backwards compatible with the old `onSelector()` function, so you can just add the class instance in front (for full backwards compat use `document.body` for the `baseElement` parameter of the constructor), then change the old function's name and it should work as before.  
For more info and examples, please view the [SelectorObserver documentation](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#selectorobserver)  
