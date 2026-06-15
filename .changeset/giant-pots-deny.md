---
"@sv443-network/userutils": major
---

Removed `deleteStorage()` implementation in `GMStorageEngine`, which would delete data from all other `DataStore`s in previous versions of UserUtils.  
This means that calling `deleteData()` on a `DataStore` will now only delete the instance's own data (the three keys ending in `-dat`, `-ver` and `-enf`), and not affect any other `DataStore` instances.  
If you relied on deleting all storage before, consider using a [`DataStoreSerializer`](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#class-datastoreserializer) to manage all `DataStore` instances, and calling its [`deleteStoresData()` method](https://github.com/Sv443-Network/CoreUtils/blob/main/docs.md#datastoreserializerdeletestoresdata) instead.
