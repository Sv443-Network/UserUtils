import { getUnsafeWindow } from "./dom";

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
        TUnion extends number
          ? (number & {})
          : (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            TUnion extends Record<keyof any, unknown>
            ? (object & {})
            : never
          )
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
 * @param input The string to insert the values into
 * @param values The values to insert, in order, starting at `%1`
 */
export function insertValues(input: string, ...values: Stringifiable[]) {
  return input.replace(/%\d/gm, (match) => {
    const argIndex = Number(match.substring(1)) - 1;
    return (values[argIndex] ?? match)?.toString();
  });
}

/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as a base64 string */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType?: "base64"): Promise<string>
/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as an ArrayBuffer */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "arrayBuffer"): Promise<ArrayBuffer>
/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as a base64 string or ArrayBuffer, depending on what {@linkcode outputType} is set to */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "base64" | "arrayBuffer" = "base64"): Promise<ArrayBuffer | string> {
  const byteArray = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const comp = new CompressionStream(compressionFormat);
  const writer = comp.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  const buf = await (new Response(comp.readable).arrayBuffer());
  return outputType === "arrayBuffer" ? buf : ab2str(buf);
}

/** Decompresses a previously compressed base64 string or ArrayBuffer, with the format passed by {@linkcode compressionFormat}, converted to a string */
export async function decompress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType?: "string"): Promise<string>
/** Decompresses a previously compressed base64 string or ArrayBuffer, with the format passed by {@linkcode compressionFormat}, converted to an ArrayBuffer */
export async function decompress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "arrayBuffer"): Promise<ArrayBuffer>
/** Decompresses a previously compressed base64 string or ArrayBuffer, with the format passed by {@linkcode compressionFormat}, converted to a string or ArrayBuffer, depending on what {@linkcode outputType} is set to */
export async function decompress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "string" | "arrayBuffer" = "string"): Promise<ArrayBuffer | string> {
  const byteArray = typeof input === "string" ? str2ab(input) : input;
  const decomp = new DecompressionStream(compressionFormat);
  const writer = decomp.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  const buf = await (new Response(decomp.readable).arrayBuffer());
  return outputType === "arrayBuffer" ? buf : new TextDecoder().decode(buf);
}

/** Converts an ArrayBuffer to a base64-encoded string */
function ab2str(buf: ArrayBuffer) {
  return getUnsafeWindow().btoa(
    new Uint8Array(buf)
      .reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
}

/** Converts a base64-encoded string to an ArrayBuffer representation of its bytes */
function str2ab(str: string) {
  return Uint8Array.from(getUnsafeWindow().atob(str), c => c.charCodeAt(0));
}
