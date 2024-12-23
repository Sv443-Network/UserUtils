import { insertValues } from "./misc.js";
import type { Stringifiable } from "./types.js";

/**
 * Translation object to pass to {@linkcode tr.addTranslations()}  
 * Can be a flat object of identifier keys and the translation text as the value, or an infinitely nestable object containing the same.  
 *   
 * @example
* // Flat object:
* const tr_en: TrObject = {
*   hello: "Hello, %1!",
*   foo: "Foo",
* };
* 
* // Nested object:
* const tr_de: TrObject = {
*   hello: "Hallo, %1!",
*   foo: {
*     bar: "Foo bar",
*   },
* };
*/
export interface TrObject {
 [key: string]: string | TrObject;
}

/** Function that transforms a matched translation string into something else */
export type TransformFn = (matches: RegExpMatchArray, language: string) => Stringifiable;

/** All translations loaded into memory */
const trans: {
 [language: string]: TrObject;
} = {};

/** All registered value transformers */
const valTransforms: Array<{
 regex: RegExp;
 fn: (matches: RegExpMatchArray, language: string) => Stringifiable;
}> = [];

/** Currently set language */
let curLang = "";

/** Common function to resolve the translation text in a specific language. */
function translate(language: string, key: string, ...args: Stringifiable[]): string {
  if(typeof language !== "string")
    language = curLang ?? "";

  const trObj = trans[language];

  if(typeof language !== "string" || language.length === 0 || typeof trObj !== "object" || trObj === null)
    return key;

  const transform = (value: string): string => {
    const tf = valTransforms.find((t) => t.regex.test(value));

    return tf
      ? value.replace(tf.regex, (...matches) => String(tf.fn(matches, language)))
      : value;
  };

  // try to resolve via traversal (e.g. `trObj["key"]["parts"]`)
  const keyParts = key.split(".");
  let value: string | TrObject | undefined = trObj;
  for(const part of keyParts) {
    if(typeof value !== "object" || value === null)
      break;
    value = value?.[part];
  }
  if(typeof value === "string")
    return transform(insertValues(value, args));

  // try falling back to `trObj["key.parts"]`
  value = trObj?.[key];
  if(typeof value === "string")
    return transform(insertValues(value, args));

  // default to translation key
  return key;
}

/**
* Returns the translated text for the specified key in the current language set by {@linkcode tr.setLanguage()}  
* Use {@linkcode tr.forLang()} to get the translation for a specific language instead of the currently set one.  
* If the key is not found in the currently set language, the key itself is returned.  
*   
* ⚠️ Remember to register a language with {@linkcode tr.addTranslations()} and set it as active with {@linkcode tr.setLanguage()} before using this function, otherwise it will always return the key itself.
* @param key Key of the translation to return
* @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
*/
const tr = (key: string, ...args: Stringifiable[]): string => translate(curLang, key, ...args);

/**
* Returns the translated text for the specified key in the specified language.  
* If the key is not found in the specified previously registered translation, the key itself is returned.  
*   
* ⚠️ Remember to register a language with {@linkcode tr.addTranslations()} before using this function, otherwise it will always return the key itself.
* @param language Language code or name to use for the translation
* @param key Key of the translation to return
* @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
*/
tr.forLang = translate;

/**
* Registers a new language and its translations - if the language already exists, it will be overwritten.  
* The translations are a key-value pair where the key is the translation key and the value is the translated text.  
*   
* The translations can contain placeholders in the format `%n`, where `n` is the 1-indexed argument number.  
* These placeholders will be replaced by the arguments passed to the translation functions.  
* @param language Language code or name to register
* @param translations Translations for the specified language
* @example ```ts
* tr.addTranslations("en", {
*   hello: "Hello, %1!",
*   foo: {
*     bar: "Foo bar",
*   },
* });
* ```
*/
tr.addTranslations = (language: string, translations: TrObject): void => {
  trans[language] = JSON.parse(JSON.stringify(translations));
};

/**
* Sets the active language for the translation functions.  
* This language will be used by the {@linkcode tr()} function to return the translated text.  
* If the language is not registered with {@linkcode tr.addTranslations()}, the translation functions will always return the key itself.  
* @param language Language code or name to set as active
*/
tr.setLanguage = (language: string): void => {
  curLang = language;
};

/**
* Returns the active language set by {@linkcode tr.setLanguage()}  
* If no language is set, this function will return `undefined`.  
* @returns Active language code or name
*/
tr.getLanguage = (): string => curLang;

/**
* Returns the translation object for the specified language or currently active one.  
* If the language is not registered with {@linkcode tr.addTranslations()}, this function will return `undefined`.  
* @param language Language code or name to get translations for - defaults to the currently active language (set by {@linkcode tr.setLanguage()})
* @returns Translations for the specified language
*/
tr.getTranslations = (language = curLang): TrObject | undefined => trans[language];

/**
* Deletes the translations for the specified language from memory.  
* @param language Language code or name to delete
*/
tr.deleteTranslations = (language = curLang): void => {
  delete trans[language];
};

/**
* Checks if a translation exists given its {@linkcode key} in the specified {@linkcode language} or else the currently active one.  
* If the language is not registered with {@linkcode tr.addTranslations()}, this function will return `false`.  
* @param key Key of the translation to check for
* @param language Language code or name to check in - defaults to the currently active language (set by {@linkcode tr.setLanguage()})
* @returns Whether the translation key exists in the specified language - always returns `false` if no language is given and no active language was set
*/
tr.hasKey = (key: string, language = curLang): boolean => {
  return tr.forLang(language, key) !== key;
};

/**
* Adds a transform function that gets called after resolving a translation for any language.  
* Use it to enable dynamic values in translations, for example to insert custom global values from the application or to denote a section that could be encapsulated by rich text.  
* Each function will receive the RegExpMatchArray [see MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match) and the current language as arguments.  
* After all %n-formatted values have been injected, the transform functions will be called sequentially in the order they were added.
* @example
* ```ts
* tr.addTranslations("en", {
*    "greeting": {
*      "with_username": "Hello, <$USERNAME>",
*      "headline_html": "Hello, <$USERNAME><br><c=red>You have <$UNREAD_NOTIFS> unread notifications.</c>"
*    }
* });
* 
* // replace <$PATTERN>
* tr.addTransform(/<\$([A-Z_]+)>/g, (matches: RegExpMatchArray, language: string) => {
*   switch(matches?.[1]) {
*     default: return "<UNKNOWN_PATTERN>";
*     // these would be grabbed from elsewhere in the application:
*     case "USERNAME": return "JohnDoe45";
*     case "UNREAD_NOTIFS": return 5;
*   }
* });
* 
* // replace <c=red>...</c> with <span class="color red">...</span>
* tr.addTransform(/<c=([a-z]+)>(.*?)<\/c>/g, (matches: RegExpMatchArray, language: string) => {
*   const color = matches?.[1];
*   const content = matches?.[2];
* 
*   return "<span class=\"color " + color + "\">" + content + "</span>";
* });
* 
* tr.setLanguage("en");
* 
* tr("greeting.with_username"); // "Hello, JohnDoe45"
* tr("greeting.headline"); // "<b>Hello, JohnDoe45</b>\nYou have 5 unread notifications."
* ```
* @param pattern Regular expression or string (passed to `new RegExp(pattern, "gm")`) that should match the entire pattern that calls the transform function
*/
tr.addTransform = (pattern: RegExp | string, fn: TransformFn): void => {
  valTransforms.push({
    regex: typeof pattern === "string" ? new RegExp(pattern, "gm") : pattern,
    fn,
  });
};

/**
* Deletes the first transform function from the list of registered transform functions.  
* @param patternOrFn A reference to the regular expression of the transform function, a string matching the original pattern, or a reference to the transform function to delete
*/
tr.deleteTransform = (patternOrFn: RegExp | string | TransformFn): void => {
  const idx = typeof patternOrFn === "function"
    ? valTransforms.findIndex((t) => t.fn === patternOrFn)
    : valTransforms.findIndex((t) => t.regex === (typeof patternOrFn === "string" ? new RegExp(patternOrFn, "gm") : patternOrFn));

  if(idx !== -1)
    valTransforms.splice(idx, 1);
};

export { tr };
