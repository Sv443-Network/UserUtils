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

/**
 * Calls the passed {@linkcode func} after the specified {@linkcode timeout} in ms (defaults to 300).  
 * Any subsequent calls to this function will reset the timer and discard all previous calls.
 * @param func The function to call after the timeout
 * @param timeout The time in ms to wait before calling the function
 * @param edge Whether to call the function at the very first call ("rising" edge) or the very last call ("falling" edge, default)
 */
export function debounce<
  TFunc extends (...args: TArgs[]) => void, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TArgs = any,
> (
  func: TFunc,
  timeout = 300,
  edge: "rising" | "falling" = "falling"
): (...args: TArgs[]) => void {
  let timer: NodeJS.Timeout | undefined;

  return function(...args: TArgs[]) {
    if(edge === "rising") {
      if(!timer) {
        func.apply(this, args);
        timer = setTimeout(() => timer = undefined, timeout);
      }
    }
    else {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), timeout);
    }
  };
}

/** Options for the `fetchAdvanced()` function */
export type FetchAdvancedOpts = Prettify<Omit<
  RequestInit & Partial<{
    /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
    timeout: number;
  }>,
  "signal"
>>;

/** Calls the fetch API with special options like a timeout */
export async function fetchAdvanced(input: RequestInfo | URL, options: FetchAdvancedOpts = {}): Promise<Response> {
  const { timeout = 10000 } = options;

  let signalOpts: Partial<RequestInit> = {},
    id: NodeJS.Timeout | undefined = undefined;

  if(timeout >= 0) {
    const controller = new AbortController();
    id = setTimeout(() => controller.abort(), timeout);
    signalOpts = { signal: controller.signal };
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
