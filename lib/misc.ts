/** Options for the `fetchAdvanced()` function */
export type FetchAdvancedOpts = RequestInit & Partial<{
  /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
  timeout: number;
}>;

/**
 * Automatically appends an `s` to the passed `word`, if `num` is not equal to 1
 * @param word A word in singular form, to auto-convert to plural
 * @param num If this is an array or NodeList, the amount of items is used
 */
export function autoPlural(word: string, num: number | unknown[] | NodeList) {
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
 * Calls the passed `func` after the specified `timeout` in ms.  
 * Any subsequent calls to this function will reset the timer and discard previous calls.
 */
export function debounce<TFunc extends (...args: TArgs[]) => void, TArgs = any>(func: TFunc, timeout = 300) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let timer: number | undefined;
  return function(...args: TArgs[]) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout) as unknown as number;
  };
}

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
