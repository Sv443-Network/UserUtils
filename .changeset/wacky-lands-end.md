---
"@sv443-network/userutils": patch
---

An empty string can now be used as a valid translation language.  
When the language parameter is an empty string or undefined, it will now be treated as an actual valid language instead of aggressively trying to use the fallback language and failing. This essentially allows for a custom fallback, in case the "return keys if translation is missing" fallback isn't desired for some reason.
