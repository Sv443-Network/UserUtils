import { Stringifiable, insertValues } from "./misc";

/** Trans rights! 🏳️‍⚧️ */
const trans: Record<string, Record<string, string>> = {};
let currentLanguage: string;

/**
 * Returns the translated text for the specified key in the current language set by `setLanguage()`  
 * If the key is not found in the previously registered translation, the key itself is returned.  
 *   
 * ⚠️ Remember to register a language with `tr.addLanguage()` and set it as active with `tr.setLanguage()` before using this function, otherwise it will always return the key itself.
 * @param key Key of the translation to return
 * @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
 */
function tr(key: string, ...args: Stringifiable[]) {
  if(!currentLanguage)
    return key;
  const trText = trans[currentLanguage]?.[key];
  if(!trText)
    return key;

  if(args.length > 0 && trText.match(/%\d/)) {
    return insertValues(trText, ...args);
  }
  return trText;
}

tr.addLanguage = (language: string, translations: Record<string, string>) => {
  trans[language] = translations;
};

tr.setLanguage = (language: string) => {
  currentLanguage = language;
};

export { tr };
