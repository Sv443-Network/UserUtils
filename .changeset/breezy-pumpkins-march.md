---
"@sv443-network/userutils": major
---

Renamed `ConfigManager` to `DataStore` to make its implied purpose as a generic JSON database more clear.
- the constructor property `defaultConfig` is now called `defaultData`
- `deleteConfig()` is now called `deleteData()`
- the internal GM storage keys will still have the prefix `_uucfg` for backwards compatibility
