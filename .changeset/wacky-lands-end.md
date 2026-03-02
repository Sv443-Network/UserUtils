---
"@sv443-network/userutils": patch
---

An empty string can now be used as a valid translation language.  
When the language parameter is an empty string, it will now be treated as an actual valid language instead of aggressively trying to use the fallback language and failing.  
If the language is undefined at runtime (even though this is a TS error), it will default to an empty string, triggering the same behavior.  
As a side effect, this also allows for a second fallback layer that is applied instead of the default "return the key if translation is missing" fallback.
