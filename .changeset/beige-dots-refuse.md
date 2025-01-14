---
"@sv443-network/userutils": major
---

**BREAKING** - Reworked translation system:
- Removed `tr()`, `tr.setLanguage()` and `tr.getLanguage()`
- Renamed function `tr.addLanguage()` to `tr.addTranslations()`
- Disabled `%n`-based argument insertion by default (re-enable with `tr.addTransform(tr.transforms.percent)`)
- Added functions:
  - `tr.for()` - translates a key for the specified language
  - `tr.use()` - creates a translation function for the specified language for much easier usage
  - `tr.hasKey()` - checks if a key exists in the given language
  - `tr.setFallbackLanguage()` - sets the fallback language used when a key is not found in the given language
  - `tr.getFallbackLanguage()` - returns the fallback language
  - `tr.addTransform()` - adds a transform function to the translation system, allowing for custom argument insertion and much more
  - `tr.deleteTransform()` - removes a transform function
