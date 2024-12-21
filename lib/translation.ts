import { insertValues } from "./misc.js";
import type { Stringifiable } from "./types.js";

/**
 * Translation object to pass to {@linkcode tr.addLanguage()}  
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

/** All translations and some metadata */
const trans: {
  [language: string]: TrObject;
} = {};
/** Currently set language */
let curLang = "";

/** Common function to resolve the translation text in a specific language. */
function translate(language: string, key: string, ...args: Stringifiable[]): string {
  const trObj = trans[language]?.data;
  if(typeof language !== "string" || typeof trObj !== "object" || trObj === null)
    return key;

  // try to resolve via traversal (e.g. `trObj["key"]["parts"]`)
  const keyParts = key.split(".");
  let value: string | TrObject | undefined = trObj;
  for(const part of keyParts) {
    if(typeof value !== "object" || value === null)
      break;
    value = value?.[part];
  }
  if(typeof value === "string")
    return insertValues(value, args);

  // try falling back to `trObj["key.parts"]`
  value = trObj?.[key];
  if(typeof value === "string")
    return insertValues(value, args);

  // default to translation key
  return key;
}

/**
 * Returns the translated text for the specified key in the current language set by {@linkcode tr.setLanguage()}  
 * Use {@linkcode tr.forLang()} to get the translation for a specific language instead of the currently set one.  
 * If the key is not found in the currently set language, the key itself is returned.  
 *   
 * ⚠️ Remember to register a language with {@linkcode tr.addLanguage()} and set it as active with {@linkcode tr.setLanguage()} before using this function, otherwise it will always return the key itself.
 * @param key Key of the translation to return
 * @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
 */
const tr = (key: string, ...args: Stringifiable[]): string => translate(curLang, key, ...args);

/**
 * Returns the translated text for the specified key in the specified language.  
 * If the key is not found in the specified previously registered translation, the key itself is returned.  
 *   
 * ⚠️ Remember to register a language with {@linkcode tr.addLanguage()} before using this function, otherwise it will always return the key itself.
 * @param language Language to use for the translation
 * @param key Key of the translation to return
 * @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
 */
tr.forLang = translate;

/**
 * Registers a new language with its translations.  
 * The translations are a key-value pair where the key is the translation key and the value is the translated text.  
 *   
 * The translations can contain placeholders in the format `%n`, where `n` is the 1-indexed argument number.  
 * These placeholders will be replaced by the arguments passed to the translation functions.  
 * @param language Language code to register
 * @param translations Translations for the specified language
 * @example ```ts
 * tr.addLanguage("en", {
 *   hello: "Hello, %1!",
 *   foo: {
 *     bar: "Foo bar",
 *   },
 * });
 * ```
 */
tr.addLanguage = (language: string, translations: TrObject): void => {
  trans[language] = translations;
};

/**
 * Sets the active language for the translation functions.  
 * This language will be used by the {@linkcode tr()} function to return the translated text.  
 * If the language is not registered with {@linkcode tr.addLanguage()}, the translation functions will always return the key itself.  
 * @param language Language code to set as active
 */
tr.setLanguage = (language: string): void => {
  curLang = language;
};

/**
 * Returns the active language set by {@linkcode tr.setLanguage()}  
 * If no language is set, this function will return `undefined`.  
 * @returns Active language code
 */
tr.getLanguage = (): string => {
  return curLang;
};

/**
 * Returns the translations for the specified language or currently active one.  
 * If the language is not registered with {@linkcode tr.addLanguage()}, this function will return `undefined`.  
 * @param language Language code to get translations for - defaults to the currently active language (set by {@linkcode tr.setLanguage()})
 * @returns Translations for the specified language
 */
tr.getTranslations = (language?: string): TrObject | undefined => {
  return trans[language ?? curLang];
};

export { tr };
