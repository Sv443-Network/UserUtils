/**
 * @module lib/misc
 * This module contains miscellaneous functions that don't fit in another category - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#misc)
 */

import type { ListWithLength, Prettify, Stringifiable } from "./types.js";

/** Which plural form to use when auto-pluralizing */
export type PluralType = "auto" | "-s" | "-ies";

/**
 * Automatically pluralizes the given string by adding an `-s` or `-ies` to the passed {@linkcode term}, if {@linkcode num} is not equal to 1.  
 * By default, words ending in `-y` will have it replaced with `-ies`, and all other words will simply have `-s` appended.  
 * {@linkcode pluralType} will default to `auto` if invalid and {@linkcode num} is set to 2 if it resolves to `NaN`.
 * @param term The term, written in singular form, to auto-convert to plural form
 * @param num A number, or list-like value that has either a `length`, `count` or `size` property, like an array, Map or NodeList - does not support iterables, they need to be converted to an array first
 * @param pluralType Which plural form to use when auto-pluralizing. Defaults to `"auto"`, which removes the last char and uses `-ies` for words ending in `y` and simply appends `-s` for all other words
 */
export function autoPlural(term: Stringifiable, num: number | ListWithLength, pluralType: PluralType = "auto"): string {
  let n = num;
  if(typeof n !== "number")
    n = getListLength(n, false);

  if(!["-s", "-ies"].includes(pluralType))
    pluralType = "auto";

  if(isNaN(n))
    n = 2;

  const pType: Exclude<PluralType, "auto"> = pluralType === "auto"
    ? String(term).endsWith("y") ? "-ies" : "-s"
    : pluralType;

  switch(pType) {
  case "-s":
    return `${term}${n === 1 ? "" : "s"}`;
  case "-ies":
    return `${String(term).slice(0, -1)}${n === 1 ? "y" : "ies"}`;
  default:
    return String(term);
  }
}

/**
 * Inserts the passed values into a string at the respective placeholders.  
 * The placeholder format is `%n`, where `n` is the 1-indexed argument number.
 * @param input The string to insert the values into
 * @param values The values to insert, in order, starting at `%1`
 */
export function insertValues(input: string, ...values: Stringifiable[]): string {
  return input.replace(/%\d/gm, (match) => {
    const argIndex = Number(match.substring(1)) - 1;
    return (values[argIndex] ?? match)?.toString();
  });
}

/**
 * Pauses async execution for the specified time in ms.  
 * If an `AbortSignal` is passed, the pause will be aborted when the signal is triggered.  
 * By default, this will resolve the promise, but you can set {@linkcode rejectOnAbort} to true to reject it instead.
 */
export function pauseFor(time: number, signal?: AbortSignal, rejectOnAbort = false): Promise<void> {
  return new Promise<void>((res, rej) => {
    const timeout = setTimeout(() => res(), time);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      rejectOnAbort ? rej(new Error("The pause was aborted")) : res();
    });
  });
}

/** Options for the `fetchAdvanced()` function */
export type FetchAdvancedOpts = Prettify<
  Partial<{
    /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
    timeout: number;
  }> & RequestInit
>;

/** Calls the fetch API with special options like a timeout */
export async function fetchAdvanced(input: string | RequestInfo | URL, options: FetchAdvancedOpts = {}): Promise<Response> {
  const { timeout = 10000 } = options;
  const ctl = new AbortController();

  const { signal, ...restOpts } = options;

  signal?.addEventListener("abort", () => ctl.abort());

  let sigOpts: Partial<RequestInit> = {},
    id: ReturnType<typeof setTimeout> | undefined = undefined;

  if(timeout >= 0) {
    id = setTimeout(() => ctl.abort(), timeout);
    sigOpts = { signal: ctl.signal };
  }

  try {
    const res = await fetch(input, {
      ...restOpts,
      ...sigOpts,
    });
    typeof id !== "undefined" && clearTimeout(id);
    return res;
  }
  catch(err) {
    typeof id !== "undefined" && clearTimeout(id);
    throw new Error("Error while calling fetch", { cause: err });
  }
}

/**
 * A ValueGen value is either its type, a promise that resolves to its type, or a function that returns its type, either synchronous or asynchronous.  
 * ValueGen allows for the utmost flexibility when applied to any type, as long as {@linkcode consumeGen()} is used to get the final value.
 * @template TValueType The type of the value that the ValueGen should yield
 */
export type ValueGen<TValueType> = TValueType | Promise<TValueType> | (() => TValueType | Promise<TValueType>);

/**
 * Turns a {@linkcode ValueGen} into its final value.  
 * @template TValueType The type of the value that the ValueGen should yield
 */
export async function consumeGen<TValueType>(valGen: ValueGen<TValueType>): Promise<TValueType> {
  return await (typeof valGen === "function"
    ? (valGen as (() => Promise<TValueType> | TValueType))()
    : valGen
  ) as TValueType;
}

/**
 * A StringGen value is either a string, anything that can be converted to a string, or a function that returns one of the previous two, either synchronous or asynchronous, or a promise that returns a string.  
 * StringGen allows for the utmost flexibility when dealing with strings, as long as {@linkcode consumeStringGen()} is used to get the final string.
 */
export type StringGen = ValueGen<Stringifiable>;

/**
 * Turns a {@linkcode StringGen} into its final string value.  
 * @template TStrUnion The union of strings that the StringGen should yield - this allows for finer type control compared to {@linkcode consumeGen()}
 */
export async function consumeStringGen<TStrUnion extends string>(strGen: StringGen): Promise<TStrUnion> {
  return (
    typeof strGen === "string"
      ? strGen
      : String(
        typeof strGen === "function"
          ? await strGen()
          : strGen
      )
  ) as TStrUnion;
}

/**
 * Returns the length of the given list-like object (anything with a numeric `length`, `size` or `count` property, like an array, Map or NodeList).  
 * If the object doesn't have any of these properties, it will return 0 by default.  
 * Set {@linkcode zeroOnInvalid} to false to return NaN instead of 0 if the object doesn't have any of the properties.
 */
export function getListLength(obj: ListWithLength, zeroOnInvalid = true): number {
  // will I go to ternary hell for this?
  return "length" in obj
    ? obj.length
    : "size" in obj
      ? obj.size
      : "count" in obj
        ? obj.count
        : zeroOnInvalid
          ? 0
          : NaN;
}

/**
 * Turns the passed object into a "pure" object without a prototype chain, meaning it won't have any default properties like `toString`, `__proto__`, `__defineGetter__`, etc.  
 * This makes the object immune to prototype pollution attacks and allows for cleaner object literals, at the cost of being harder to work with in some cases.  
 * It also effectively transforms a `Stringifiable` value into one that will throw a TypeError when stringified instead of defaulting to `[object Object]`
 */
export function purifyObj<TObj extends object>(obj: TObj): TObj {
  return Object.assign(Object.create(null), obj);
}
