---
"@sv443-network/userutils": major
---

Rewrote `amplifyMedia()` using a new approach for clear and undistorted audio.  
Instead of just one post-amplifier GainNode and a DynamicsCompressorNode, there are now two GainNodes (one for pre-amp, one for post-amp) and ten BiquadFilterNodes in-between them for predetermined frequency bands.  
  
**Migration info:**
- The methods `setGain()` and `getGain()` have been exchanged for `setPreampGain()`, `getPreampGain()`, `setPostampGain()` and `getPostampGain()`
- The parameter `initialMultiplier` has been exchanged for `initialPreampGain` and `initialPostampGain` to support the new system and reduce confusion (they are not multipliers strictly speaking)
- A boolean property `enabled` has been added to check if the amplification is enabled or not
- The property `gainNode` has been exchanged for `preampNode` and `postampNode`
- The property `source` has been renamed to `sourceNode` to fit the naming of the other properties
- A property `filterNodes` has been added to house an array of the ten BiquadFilterNodes
