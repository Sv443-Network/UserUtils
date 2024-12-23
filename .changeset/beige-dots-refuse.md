---
"@sv443-network/userutils": major
---

Reworked translation system:
- **BREAKING:** Renamed function `tr.addLanguage()` to `tr.addTranslations()`
- Added functions:
  - `tr.deleteTranslations()` to delete translations for the given or active language
  - `tr.hasKey()` to check if the translation with the given key exists for the given or active language
  - `tr.addTransform()` to add a transform function for all languages that can dynamically modify translations
  - `tr.deleteTransform()` to delete a previously registered transform function
