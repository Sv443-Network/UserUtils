---
"@sv443-network/userutils": major
---

Changed `hexToRgb()` and `rgbToHex()` to support `#RGBA` and `#RRGGBBAA` color codes (with an alpha channel).  
Both functions now have an `alpha` value immediately after `blue`, which can be set to `undefined` to restore the old behavior.
