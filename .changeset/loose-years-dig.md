---
"@sv443-network/userutils": minor
---

Updated CoreUtils to v3.5.0, which includes the following changes:
- Added function `createTable()` to create a very flexible ASCII table, including ANSI color and `%c` styling support.
- Fixed type variance issue in `DataStoreSerializer` where `DataStore` instances with specific data types (e.g. `DataStore<MyType>`) couldn't be passed to the constructor without being asserted `as DataStore<DataStoreData, boolean>`.
