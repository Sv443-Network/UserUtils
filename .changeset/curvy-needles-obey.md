---
"@sv443-network/userutils": minor
---

Removed the limiter (DynamicsCompressorNode) from `amplifyMedia()` for clear and undistorted audio.  
  
**Notable changes:**
- The property `source` has been renamed to `sourceNode` to fit the naming of the `gainNode` property
- A boolean property `enabled` has been added to check if the amplification is enabled or not
- The parameter `initialMultiplier` has been renamed to `initialGain` to reduce confusion (it is not a multiplier strictly speaking)
