import { getUnsafeWindow } from "./dom.js";
import type { Stringifiable } from "./types.js";

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
export type FetchAdvancedOpts = Omit<
  RequestInit & Partial<{
    /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
    timeout: number;
  }>,
  "signal"
>;

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

  const res = await fetch(input, {
    ...options,
    ...signalOpts,
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
export function insertValues(input: string, ...values: Stringifiable[]): string {
  return input.replace(/%\d/gm, (match) => {
    const argIndex = Number(match.substring(1)) - 1;
    return (values[argIndex] ?? match)?.toString();
  });
}

/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as a base64 string */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType?: "string"): Promise<string>
/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as an ArrayBuffer */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "arrayBuffer"): Promise<ArrayBuffer>
/** Compresses a string or an ArrayBuffer using the provided {@linkcode compressionFormat} and returns it as a base64 string or ArrayBuffer, depending on what {@linkcode outputType} is set to */
export async function compress(input: string | ArrayBuffer, compressionFormat: CompressionFormat, outputType: "string" | "arrayBuffer" = "string"): Promise<ArrayBuffer | string> {
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

/**
 * Creates a hash / checksum of the given {@linkcode input} string using the specified {@linkcode algorithm} ("SHA-256" by default).  
 * ⚠️ Uses the Web Crypto API so it needs to run in a secure context (HTTPS).
 */
export async function computeHash(input: string, algorithm = "SHA-256") {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}
