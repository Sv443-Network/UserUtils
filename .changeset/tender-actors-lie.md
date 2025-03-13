---
"@sv443-network/userutils": minor
---

Added custom error classes `ChecksumMismatchError`, `DataMigrationError` and `PlatformError`, extending from the base class `UUError`  
  The base class has the additional property `date` which is the time of the error creation
