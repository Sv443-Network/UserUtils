---
"@sv443-network/userutils": major
---

Removed the function `insertAfter()` because the DOM API already has the method [`insertAdjacentElement()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentElement) that has the same functionality and even four positions to pick from.  
To get the same behavior as `insertAfter(refElem, newElem)`, you can use `refElem.insertAdjacentElement("afterend", newElem)`
