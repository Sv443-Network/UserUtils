import type { Prettify, Stringifiable } from "./types.js";

/**
 * Automatically appends an `s` to the passed {@linkcode word}, if {@linkcode num} is not equal to 1
 * @param word A word in singular form, to auto-convert to plural
 * @param num If this is an array or NodeList, the amount of items is used
 */
export function autoPlural(word: Stringifiable, num: number | unknown[] | NodeList): string {
  if(Array.isArray(num) || num instanceof NodeList)
    num = num.length;
  return `${word}${num === 1 ? "" : "s"}`;
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
  const { signal, abort } = new AbortController();

  options.signal?.addEventListener("abort", abort);

  let signalOpts: Partial<RequestInit> = {},
    id: ReturnType<typeof setTimeout> | undefined = undefined;

  if(timeout >= 0) {
    id = setTimeout(() => abort(), timeout);
    signalOpts = { signal };
  }

  try {
    const res = await fetch(input, {
      ...options,
      ...signalOpts,
    });
    id && clearTimeout(id);
    return res;
  }
  catch(err) {
    id && clearTimeout(id);
    throw err;
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
