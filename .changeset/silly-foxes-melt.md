---
"@sv443-network/userutils": major
---

**Moved a majority of the general-purpose code to the `@sv443-network/coreutils` package.**  
The features are still accessible on this library in the same way, but some of them needed to be modified so they were more generic and consistent with the new package's codebase.  
Refer to [the CoreUtils documentation](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md) for more information.  
  
**These are all the breaking changes:**
- Renamed `index.<ext>` files in `dist/` to `UserUtils.<ext>`
  - Turned `index.global.js` into an actual UMD bundle at `UserUtils.umd.js`
- Reworked DataStore
    - The constructor now needs an `engine` property that is an instance of a [`DataStoreEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreengine)
    - Encoding with `deflate-raw` will now be enabled by default. Set `compressionFormat: null` to disable it and restore the previous behavior.
    - Added [`DataStoreEngine` class](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreengine) with two implementations available out-of-the-box; [`FileStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-filestorageengine) and [`BrowserStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-browserstorageengine), for Node/Deno and browser environments respectively. Userscripts need to use [`BrowserStorageEngine`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-browserstorageengine)
    - Added shorthand property `compressionFormat` as an alternative to the properties `encodeData` and `decodeData`
    - The global key `__ds_fmt_ver` will now contain a global version number for DataStore-internal format integrity.
  - Renamed `ab2str()` to `abtoa()` and `str2ab()` to `atoab()` to match `btoa()` and `atob()`
  - Renamed `purifyObj()` to `pureObj()`
  
**These are all new additions:**
  - Added [`capitalize()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-capitalize) to capitalize the first letter of a string.
  - Added [`setImmediateInterval()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-setimmediateinterval) to set an interval that runs immediately, then again on a fixed *interval.*
  - Added [`setImmediateTimeoutLoop()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-setimmediatetimeoutloop) to set a recursive `setTimeout()` loop with a fixed *delay.*
  - Added [`takeRandomItemIndex()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-takerandomitemindex), as a mutating counterpart to [`randomItemIndex()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-randomitemindex)
  - Added [`truncStr()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-truncstr) to truncate a string to a given length, optionally adding an ellipsis.
  - Added [`valsWithin()`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#function-valswithin) to check if two values, rounded at the given decimal, are within a certain range of each other.
