---
"@sv443-network/userutils": major
---

Added compression to `amplifyMedia()` to prevent audio clipping and distortion and modified return type accordingly:  
- Renamed: `amplify()` to `setGain()` and `getAmpLevel()` to `getGain()`  
- Added properties: `enable()`, `disable()`, `setLimiterOptions()` and `limiterNode`  
- Other changes: Amplification is no longer enabled automatically, `enable()` must now be called manually after initializing
