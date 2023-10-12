---
"@sv443-network/userutils": major
---

`onSelector()` has been turned into the `SelectorObserver` class to reduce the performance impact on larger sites:
- its instances can be scoped to any element lower in the DOM tree, not exclusively the entire body and all its children like before
- separate instances can be disabled and reenabled individually on demand
- separate instances can have different MutationObserver options set to further reduce performance impact
- every listener can have a debounce time, so that it doesn't get called too often
- there are now multiple methods to get and remove specific listeners
  
The `SelectorObserver.addListener()` method is backwards compatible with the old `onSelector()` function, so you can just add the class instance in front (for full backwards compat use `document.body` for the baseElement parameter), then change the old function's name and it should work as before.  
For more info and examples, please view the [SelectorObserver documentation](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#selectorobserver)  
