---
"@sv443-network/userutils": major
---

**Moved a majority of the general-purpose code to the `@sv443-network/coreutils` package.**  
The features are still accessible in this library in the same way, but some of them needed to be modified so they were more generic and consistent with the new package's codebase.  
Refer to [the CoreUtils documentation](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md) for more information.  
  
### Breaking Changes
- **Renamed `index.<ext>` files in `dist/` to `UserUtils.<ext>`**  
  If you're specifying the URL to the bundle, make sure to replace the `index` in the file name with `UserUtils`.
  - Turned `index.global.js` into an actual full-fledged UMD bundle at `UserUtils.umd.js` (where previously it would only declare a global variable).
- **Reworked `DataStore` class**
  - The constructor now needs an `engine` property that is an instance of a [`DataStoreEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreengine)
  - Encoding with `deflate-raw` will now be enabled by default. Set `compressionFormat: null` to disable it and restore the previous behavior.
  - Added [`DataStoreEngine` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreengine) with three implementations available out-of-the-box; [`FileStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-filestorageengine), [`BrowserStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-browserstorageengine) and [`GMStorageEngine`](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#class-gmstorageengine), for Node/Deno and two kinds of browser environments, respectively. Userscripts need to use either the `GMStorageEngine` or `BrowserStorageEngine` depending on whether they want to use GreaseMonkey storage (only accessible to the userscript) or standard browser storage (accessible by the website's scripts).
  - Added shorthand property `compressionFormat` as an alternative to the properties `encodeData` and `decodeData`.
  - The properties `encodeData` and `decodeData` are now a tuple of a string format identifier (like `gzip`, `deflate-raw`, `base64`, etc.) and the respective function that used to be the only value of those properties.
  - (The global key `__ds_fmt_ver` will now contain a global version number for DataStore-internal format integrity.)
- **Renamed functions**
  - Renamed `ab2str()` to `abtoa()` and `str2ab()` to `atoab()` to match `btoa()` and `atob()`
  - Renamed `purifyObj()` to `pureObj()`
