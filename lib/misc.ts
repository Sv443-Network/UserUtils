/**
 * @module lib/misc
 * This module contains miscellaneous functions that don't fit in another category - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#misc)
 */

import type { ListWithLength, Prettify, Stringifiable } from "./types.js";

/** Which plural form to use when auto-pluralizing */
export type PluralType = "auto" | "-s" | "-ies";

/**
 * Automatically pluralizes the given string an `-s` or `-ies` to the passed {@linkcode term}, if {@linkcode num} is not equal to 1.  
 * By default, words ending in `-y` will have it replaced with `-ies`, and all other words will simply have `-s` appended.  
 * If {@linkcode num} resolves to NaN or the {@linkcode pluralType} is wrong, it defaults to the {@linkcode pluralType} `auto` and sets {@linkcode num} to 2.
 * @param term The term, written in singular form, to auto-convert to plural form
 * @param num A number, or list-like value that has either a `length`, `count` or `size` property, like an array, Map or discord.js Collection - does not support iterables, they need to be converted to an array first
 * @param pluralType Which plural form to use when auto-pluralizing. Defaults to `"auto"`, which removes the last char and uses `-ies` for words ending in `y` and simply appends `-s` for all other words
 */
export function autoPlural(word: Stringifiable, num: number | ListWithLength, pluralType: PluralType = "auto"): string {
  if(typeof num !== "number") {
    if("length" in num)
      num = num.length;
    else if("size" in num)
      num = num.size;
    else if("count" in num)
      num = num.count;
  }

  const pType: Exclude<PluralType, "auto"> = pluralType === "auto"
    ? String(word).endsWith("y") ? "-ies" : "-s"
    : pluralType;

  if(!["-s", "-ies"].includes(pType) || isNaN(num))
    num = 2;

  switch(pType) {
  case "-s":
    return `${word}${num === 1 ? "" : "s"}`;
  case "-ies":
    return `${String(word).slice(0, -1)}${num === 1 ? "y" : "ies"}`;
  default:
    return String(word);
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

/** Pauses async execution for the specified time in ms */
export function pauseFor(time: number): Promise<void> {
  return new Promise<void>((res) => {
    setTimeout(() => res(), time);
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
  )as TValueType;
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
