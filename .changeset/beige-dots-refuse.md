---
"@sv443-network/userutils": major
---

**BREAKING** - Reworked translation system:
- Removed `tr()`, `tr.setLanguage()` and `tr.getLanguage()`
- Renamed function `tr.addLanguage()` to `tr.addTranslations()`
- Removed `%n`-based argument insertion by default (re-enable explicitly with `tr.addTransform(tr.transforms.percent)`).
- Added ability for nested translation objects and object traversal via dot notation.
- Added functions:
  - `tr.for()` - translates a key for the specified language.
  - `tr.use()` - creates a translation function for the specified language for much easier usage.
  - `tr.hasKey()` - checks if a key exists in the given language.
  - `tr.setFallbackLanguage()` - sets the fallback language used when a key is not found in the given language.
  - `tr.getFallbackLanguage()` - returns the fallback language.
  - `tr.addTransform()` - adds a transform function to the translation system, allowing for custom argument insertion and much more.
  - `tr.deleteTransform()` - removes a transform function.
- Added ability to specify transform patterns and functions for arbitrary modification of the translation string.
  - Added transform for template literal syntax (e.g. `${keyName}`) with `tr.addTransform(tr.transforms.templateLiteral)`. This transform supports positional argument injection, as well as named arguments via an object with the same keys as in the template literal pattern. See the documentation for more information and a code example.
- Added TS type `TrKeys<T>` for extracting the keys of a translation object (both flat and nested).
- Fixed bug with resolving translations for flat objects.
