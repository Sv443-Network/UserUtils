import type { Stringifiable } from "./types.js";

//#region types

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

/** Properties for the transform function that transforms a matched translation string into something else */
export type TransformFnProps<TTrKey extends string = string> = {
  /** The current language - empty string if not set yet */
  language: string;
  /** The matches as returned by `RegExp.exec()` */
  matches: RegExpExecArray[];
  /** The translation key */
  trKey: TTrKey;
  /** Translation value before any transformations */
  trValue: string;
  /** Current value, possibly in-between transformations */
  currentValue: string;
  /** Arguments passed to the translation function */
  trArgs: (Stringifiable | Record<string, Stringifiable>)[];
};

/** Function that transforms a matched translation string into another string */
export type TransformFn<TTrKey extends string = string> = (props: TransformFnProps<TTrKey>) => Stringifiable;

/** Transform pattern and function in tuple form */
export type TransformTuple<TTrKey extends string = string> = [RegExp, TransformFn<TTrKey>];

/**
 * Pass a recursive or flat translation object to this generic type to get all keys in the object.  
 * @example ```ts
 * type Keys = TrKeys<{ a: { b: "foo" }, c: "bar" }>;
 * // result: type Keys = "a.b" | "c"
 * ```
 */
export type TrKeys<TTrObj, P extends string = ""> = {
  [K in keyof TTrObj]: K extends string | number | boolean | null | undefined
    ? TTrObj[K] extends object
      ? TrKeys<TTrObj[K], `${P}${K}.`>
      : `${P}${K}`
    : never
}[keyof TTrObj];

//#region vars

/** All translations loaded into memory */
const trans: {
 [language: string]: TrObject;
} = {};

/** All registered value transformers */
const valTransforms: Array<{
 regex: RegExp;
 fn: TransformFn;
}> = [];

/** Fallback language - if undefined, the trKey itself will be returned if the translation is not found */
let fallbackLang: string | undefined;

//#region tr backend

/** Common function to resolve the translation text in a specific language and apply transform functions. */
function translate<TTrKey extends string = string>(language: string, key: TTrKey, ...trArgs: (Stringifiable | Record<string, Stringifiable>)[]): string {
  if(typeof language !== "string")
    language = fallbackLang ?? "";

  const trObj = trans[language];

  if(typeof language !== "string" || language.length === 0 || typeof trObj !== "object" || trObj === null)
    return fallbackLang ? translate(fallbackLang, key, ...trArgs) : key;

  /** Apply all transforms that match the translation string */
  const transformTrVal = (trKey: TTrKey, trValue: string): string => {
    const tfs = valTransforms.filter(({ regex }) => new RegExp(regex).test(trValue));

    if(tfs.length === 0)
      return trValue;

    let retStr = String(trValue);

    for(const tf of tfs) {
      const re = new RegExp(tf.regex);

      const matches: RegExpExecArray[] = [];
      let execRes: RegExpExecArray | null;
      while((execRes = re.exec(trValue)) !== null) {
        if(matches.some(m => m[0] === execRes?.[0]))
          break;
        matches.push(execRes);
      }

      retStr = String(tf.fn({
        language,
        trValue,
        currentValue: retStr,
        matches,
        trKey,
        trArgs,
      }));
    }

    return retStr;
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
    return transformTrVal(key, value);

  // try falling back to `trObj["key.parts"]`
  value = trObj?.[key];
  if(typeof value === "string")
    return transformTrVal(key, value);

  // default to fallbackLang or translation key
  return fallbackLang ? translate(fallbackLang, key, ...trArgs) : key;
}

//#region tr funcs

/**
 * Returns the translated text for the specified key in the specified language.  
 * If the key is not found in the specified previously registered translation, the key itself is returned.  
 *   
 * ⚠️ Remember to register a language with {@linkcode tr.addTranslations()} before using this function, otherwise it will always return the key itself.
 * @param language Language code or name to use for the translation
 * @param key Key of the translation to return
 * @param args Optional arguments to be passed to the translated text. They will replace placeholders in the format `%n`, where `n` is the 1-indexed argument number
 */
function trFor<TTrKey extends string = string>(language: string, key: TTrKey, ...args: (Stringifiable | Record<string, Stringifiable>)[]): string {
  const txt = translate(language, key, ...args);
  if(txt === key)
    return fallbackLang
      ? translate(fallbackLang, key, ...args)
      : key;
  return txt;
}

/**
 * Prepares a translation function for a specific language.
 * @example ```ts
 * tr.addTranslations("en", {
 *   hello: "Hello, %1!",
 * });
 * const t = tr.useTr("en");
 * t("hello", "John"); // "Hello, John!"
 * ```
 */
function useTr<TTrKey extends string = string>(language: string) {
  return (key: TTrKey, ...args: (Stringifiable | Record<string, Stringifiable>)[]) =>
    translate<TTrKey>(language, key, ...args);
}

/**
 * Checks if a translation exists given its {@linkcode key} in the specified {@linkcode language} or the set fallback language.  
 * If the given language was not registered with {@linkcode tr.addTranslations()}, this function will return `false`.  
 * @param key Key of the translation to check for
 * @param language Language code or name to check in - defaults to the currently active language (set by {@linkcode tr.setLanguage()})
 * @returns Whether the translation key exists in the specified language - always returns `false` if no language is given and no active language was set
 */
function hasKey<TTrKey extends string = string>(language = fallbackLang ?? "", key: TTrKey): boolean {
  return tr.for(language, key) !== key;
}

//#region manage translations

/**
 * Registers a new language and its translations - if the language already exists, it will be overwritten.  
 * The translations are a key-value pair where the key is the translation key and the value is the translated text.  
 * The translations can also be infinitely nested objects, resulting in a dot-separated key.
 * @param language Language code or name to register - I recommend sticking to a standard like [ISO 639](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) or [BCP 47](https://en.wikipedia.org/wiki/IETF_language_tag)
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
function addTranslations(language: string, translations: TrObject): void {
  trans[language] = JSON.parse(JSON.stringify(translations));
}

/**
 * Returns the translation object for the specified language or currently active one.  
 * If the language is not registered with {@linkcode tr.addTranslations()}, this function will return `undefined`.  
 * @param language Language code or name to get translations for - defaults to the currently active language (set by {@linkcode tr.setLanguage()})
 * @returns Translations for the specified language
 */
function getTranslations(language = fallbackLang ?? ""): TrObject | undefined {
  return trans[language];
}

/**
 * Deletes the translations for the specified language from memory.  
 * @param language Language code or name to delete
 * @returns Whether the translations for the passed language were successfully deleted
 */
const deleteTranslations = (language: string): boolean => {
  if(language in trans) {
    delete trans[language];
    return true;
  }
  return false;
};

//#region set fb lang

/**
 * The fallback language to use when a translation key is not found in the currently active language.  
 * Leave undefined to disable fallbacks and just return the translation key if translations are not found.
 */
function setFallbackLanguage(fallbackLanguage?: string): void {
  fallbackLang = fallbackLanguage;
}

/** Returns the fallback language set by {@linkcode tr.setFallbackLanguage()} */
function getFallbackLanguage(): string | undefined {
  return fallbackLang;
}

//#region transforms

/**
 * Adds a transform function that gets called after resolving a translation for any language.  
 * Use it to enable dynamic values in translations, for example to insert custom global values from the application or to denote a section that could be encapsulated by rich text.  
 * Each function will receive the RegExpMatchArray [see MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match) and the current language as arguments.  
 * After all %n-formatted values have been injected, the transform functions will be called sequentially in the order they were added.
 * @example
 * ```ts
 * tr.addTranslations("en", {
 *    "greeting": {
 *      "with_username": "Hello, ${USERNAME}",
 *      "headline_html": "Hello, ${USERNAME}<br><c=red>You have ${UNREAD_NOTIFS} unread notifications.</c>"
 *    }
 * });
 * 
 * // replace ${PATTERN}
 * tr.addTransform(/<\$([A-Z_]+)>/g, ({ matches }) => {
 *   switch(matches?.[1]) {
 *     default: return "<UNKNOWN_PATTERN>";
 *     // these would be grabbed from elsewhere in the application:
 *     case "USERNAME": return "JohnDoe45";
 *     case "UNREAD_NOTIFS": return 5;
 *   }
 * });
 * 
 * // replace <c=red>...</c> with <span class="color red">...</span>
 * tr.addTransform(/<c=([a-z]+)>(.*?)<\/c>/g, ({ matches }) => {
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
 * @param args A tuple containing the regular expression to match and the transform function to call if the pattern is found in a translation string
 */
function addTransform<TTrKey extends string = string>(transform: TransformTuple<TTrKey>): void {
  const [pattern, fn] = transform;
  valTransforms.push({
    fn: fn as TransformFn,
    regex: typeof pattern === "string"
      ? new RegExp(pattern, "gm")
      : pattern
  });
}

/**
 * Deletes the first transform function from the list of registered transform functions.  
 * @param patternOrFn A reference to the regular expression of the transform function, a string matching the original pattern, or a reference to the transform function to delete
 * @returns Returns true if the transform function was found and deleted, false if it wasn't found
 */
function deleteTransform(patternOrFn: RegExp | string | TransformFn): boolean {
  const idx = valTransforms.findIndex((t) =>
    typeof patternOrFn === "function"
      ? t.fn === patternOrFn
      : (
        typeof patternOrFn === "string"
          ? t.regex.source === patternOrFn
          : t.regex === patternOrFn
      )
  );
  if(idx !== -1) {
    valTransforms.splice(idx, 1);
    return true;
  }
  return false;
}

//#region predef transforms

/**
 * This transform will replace placeholders matching `${key}` with the value of the passed argument(s).  
 * The arguments can be passed in keyed object form or positionally via the spread operator:
 * - Keyed: If the first argument is an object and `key` is found in it, the value will be used for the replacement.
 * - Positional: If the first argument is not an object or has a `toString()` method that returns something that doesn't start with `[object`, the values will be positionally inserted in the order they were passed.
 *   
 * @example ```ts
 * tr.addTranslations("en", {
 *  "greeting": "Hello, ${user}!\nYou have ${notifs} notifications.",
 * });
 * tr.addTransform(tr.transforms.templateLiteral);
 * 
 * const t = tr.use("en");
 * 
 * // both calls return the same result:
 * t("greeting", { user: "John", notifs: 5 }); // "Hello, John!\nYou have 5 notifications."
 * t("greeting", "John", 5);                   // "Hello, John!\nYou have 5 notifications."
 * 
 * // when a key isn't found in the object, it will be left as-is:
 * t("greeting", { user: "John" }); // "Hello, John!\nYou have ${notifs} notifications."
 * ```
 */
const templateLiteralTransform = [
  /\$\{([a-zA-Z0-9$_-]+)\}/gm,
  ({ matches, trArgs, trValue }) => {
    const patternStart = "${",
      patternEnd = "}",
      patternRegex = /\$\{.+\}/m;

    let str = String(trValue);

    const eachKeyInTrString = (keys: string[]) => keys.every((key) => trValue.includes(`${patternStart}${key}${patternEnd}`));

    const namedMapping = () => {
      if(!str.includes(patternStart) || typeof trArgs[0] === "undefined" || typeof trArgs[0] !== "object" || !eachKeyInTrString(Object.keys(trArgs[0] ?? {})))
        return;
      for(const match of matches) {
        const repl = match[1] !== undefined ? (trArgs[0] as Record<string, string>)[match[1]] : undefined;
        if(typeof repl !== "undefined")
          str = str.replace(match[0], String(repl));
      }
    };

    const positionalMapping = () => {
      if(!(patternRegex.test(str)) || !trArgs[0])
        return;
      let matchNum = -1;
      for(const match of matches) {
        matchNum++;
        if(typeof trArgs[matchNum] !== "undefined")
          str = str.replace(match[0], String(trArgs[matchNum]));
      }
    };

    /** Whether the first args parameter is an object that doesn't implement a custom `toString` method */
    const isArgsObject = trArgs[0] && typeof trArgs[0] === "object" && trArgs[0] !== null && String(trArgs[0]).startsWith("[object");

    if(isArgsObject && eachKeyInTrString(Object.keys(trArgs[0]!)))
      namedMapping();
    else
      positionalMapping();

    return str;
  },
] as const satisfies TransformTuple<string>;

/**
 * This transform will replace `%n` placeholders with the value of the passed arguments.  
 * The `%n` placeholders are 1-indexed, meaning `%1` will be replaced by the first argument, `%2` by the second, and so on.  
 * Objects will be stringified via `String()` before being inserted.  
 *   
 * @example ```ts
* tr.addTranslations("en", {
*  "greeting": "Hello, %1!\nYou have %2 notifications.",
* });
* tr.addTransform(tr.transforms.percent);
* 
* const t = tr.use("en");
* 
* // arguments are inserted in the order they're passed:
* t("greeting", "John", 5); // "Hello, John!\nYou have 5 notifications."
* 
* // when a value isn't found, the placeholder will be left as-is:
* t("greeting", "John"); // "Hello, John!\nYou have %2 notifications."
* ```
*/
const percentTransform = [
  /\$\{([a-zA-Z0-9$_-]+)\}/gm,
  ({ matches, trArgs, trValue }) => {
    let str = String(trValue);

    for(const match of matches) {
      const repl = match[1] !== undefined ? (trArgs[0] as Record<string, string>)[match[1]] : undefined;
      if(typeof repl !== "undefined")
        str = str.replace(match[0], String(repl));
    }

    return str;
  },
] as const satisfies TransformTuple<string>;

//#region exports

const tr = {
  for: <TTrKey extends string = string>(...params: Parameters<typeof trFor<TTrKey>>) => trFor<TTrKey>(...params as Parameters<typeof trFor<TTrKey>>),
  use: <TTrKey extends string = string>(...params: Parameters<typeof useTr<TTrKey>>) => useTr<TTrKey>(...params as Parameters<typeof useTr<TTrKey>>),
  hasKey: <TTrKey extends string = string>(language = fallbackLang ?? "", key: TTrKey) => hasKey<TTrKey>(language, key),
  addTranslations,
  getTranslations,
  deleteTranslations,
  setFallbackLanguage,
  getFallbackLanguage,
  addTransform,
  deleteTransform,
  transforms: {
    templateLiteral: templateLiteralTransform,
    percent: percentTransform,
  },
};

export { tr };
