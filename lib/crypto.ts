import { getUnsafeWindow } from "./dom.js";
import { mapRange } from "./math.js";

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
function ab2str(buf: ArrayBuffer): string {
  return getUnsafeWindow().btoa(
    new Uint8Array(buf)
      .reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
}

/** Converts a base64-encoded string to an ArrayBuffer representation of its bytes */
function str2ab(str: string): ArrayBuffer {
  return Uint8Array.from(getUnsafeWindow().atob(str), c => c.charCodeAt(0));
}

/**
 * Creates a hash / checksum of the given {@linkcode input} string or ArrayBuffer using the specified {@linkcode algorithm} ("SHA-256" by default).  
 *   
 * ⚠️ Uses the SubtleCrypto API so it needs to run in a secure context (HTTPS).  
 * ⚠️ If you use this for cryptography, make sure to use a secure algorithm (under no circumstances use SHA-1) and to [salt](https://en.wikipedia.org/wiki/Salt_(cryptography)) your input data.
 */
export async function computeHash(input: string | ArrayBuffer, algorithm = "SHA-256"): Promise<string> {
  let data: ArrayBuffer;
  if(typeof input === "string") {
    const encoder = new TextEncoder();
    data = encoder.encode(input);
  }
  else
    data = input;

  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");

  return hashHex;
}

/**
 * Generates a random ID with the specified length and radix (16 characters and hexadecimal by default)  
 *   
 * ⚠️ Not suitable for generating anything related to cryptography! Use [SubtleCrypto's `generateKey()`](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/generateKey) for that instead.
 * @param length The length of the ID to generate (defaults to 16)
 * @param radix The [radix](https://en.wikipedia.org/wiki/Radix) of each digit (defaults to 16 which is hexadecimal. Use 2 for binary, 10 for decimal, 36 for alphanumeric, etc.)
 * @param enhancedEntropy If set to true, uses [`crypto.getRandomValues()`](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues) for better cryptographic randomness (this also makes it take MUCH longer to generate)  
 */
export function randomId(length = 16, radix = 16, enhancedEntropy = false): string {
  if(enhancedEntropy) {
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    return Array.from(
      arr,
      (v) => mapRange(v, 0, 255, 0, radix).toString(radix).substring(0, 1),
    ).join("");
  }

  return Array.from(
    { length },
    () => Math.floor(Math.random() * radix).toString(radix),
  ).join("");
}
