/** Represents any value that is either a string itself or can be converted to one (implicitly or explicitly) because it has a toString() method */
export type Stringifiable = string | { toString(): string };

/**
 * A type that offers autocomplete for the passed union but also allows any arbitrary value of the same type to be passed.  
 * Supports unions of strings, numbers and objects.
 */
export type LooseUnion<TUnion extends string | number | object> =
  (TUnion) | (
    TUnion extends string
      ? (string & {})
      : (
        TUnion extends object
          ? (object & {})
          : (number & {})
      )
  );

/**
 * A type that allows all strings except for empty ones
 * @example
 * function foo<T extends string>(bar: NonEmptyString<T>) {
 *   console.log(bar);
 * }
 */
export type NonEmptyString<TString extends string> = TString extends "" ? never : TString;

/**
 * Automatically appends an `s` to the passed {@linkcode word}, if {@linkcode num} is not equal to 1
 * @param word A word in singular form, to auto-convert to plural
 * @param num If this is an array or NodeList, the amount of items is used
 */
export function autoPlural(word: Stringifiable, num: number | unknown[] | NodeList) {
  if(Array.isArray(num) || num instanceof NodeList)
    num = num.length;
  return `${word}${num === 1 ? "" : "s"}`;
}

/** Pauses async execution for the specified time in ms */
export function pauseFor(time: number) {
  return new Promise<void>((res) => {
    setTimeout(() => res(), time);
  });
}

/**
 * Calls the passed {@linkcode func} after the specified {@linkcode timeout} in ms (defaults to 300).  
 * Any subsequent calls to this function will reset the timer and discard all previous calls.
 */
export function debounce<TFunc extends (...args: TArgs[]) => void, TArgs = any>(func: TFunc, timeout = 300) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let timer: number | undefined;
  return function(...args: TArgs[]) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout) as unknown as number;
  };
}

/** Options for the `fetchAdvanced()` function */
export type FetchAdvancedOpts = RequestInit & Partial<{
  /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
  timeout: number;
}>;

/** Calls the fetch API with special options like a timeout */
export async function fetchAdvanced(url: string, options: FetchAdvancedOpts = {}) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const res = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);
  return res;
}

/**
 * Inserts the passed values into a string at the respective placeholders.  
 * The placeholder format is `%n`, where `n` is the 1-indexed argument number.
 * @param str The string to insert the values into
 * @param values The values to insert, in order, starting at `%1`
 */
export function insertValues(str: string, ...values: Stringifiable[]) {
  return str.replace(/%\d/gm, (match) => {
    const argIndex = Number(match.substring(1)) - 1;
    return (values[argIndex] ?? match)?.toString();
  });
}
