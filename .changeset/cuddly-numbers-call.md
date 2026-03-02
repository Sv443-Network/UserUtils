---
"@sv443-network/userutils": patch
---

Updated CoreUtils to v3.3.0.  
This fixes various `DataStore` and `DataStoreEngine` issues and adds `NanoEmitter` into `DataStore`'s inheritance chain, including many new events.  
It also adds a second parameter of type `DataStoreEngineDSOptions` to the `filePath` function property in `FileStorageEngineOptions`, which allows for setting the file path based on encoding options.
