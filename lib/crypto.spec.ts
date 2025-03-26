import { describe, expect, it } from "vitest";
import { compress, computeHash, decompress, randomId } from "./crypto.js";

//#region compress
describe("crypto/compress", () => {
  it("Compresses strings and buffers as expected", async () => {
    const input = "Hello, world!".repeat(100);

    expect(await compress(input, "gzip", "string")).toBe("H4sIAAAAAAAACvNIzcnJ11Eozy/KSVH0GOWMckY5o5yRzQEAatVNcBQFAAA=");
    expect(await compress(input, "deflate", "string")).toBe("eJzzSM3JyddRKM8vyklR9BjljHJGOaOckc0BAOWGxZQ=");
    expect(await compress(input, "deflate-raw", "string")).toBe("80jNycnXUSjPL8pJUfQY5YxyRjmjnJHNAQA=");
    expect(await compress(input, "gzip", "arrayBuffer")).toBeInstanceOf(ArrayBuffer);
  });
});

//#region decompress
describe("crypto/decompress", () => {
  it("Decompresses strings and buffers as expected", async () => {
    const inputGz = "H4sIAAAAAAAACvNIzcnJ11Eozy/KSVH0GOWMckY5o5yRzQEAatVNcBQFAAA=";
    const inputDf = "eJzzSM3JyddRKM8vyklR9BjljHJGOaOckc0BAOWGxZQ=";
    const inputDfRaw = "80jNycnXUSjPL8pJUfQY5YxyRjmjnJHNAQA=";

    const expectedDecomp = "Hello, world!".repeat(100);

    expect(await decompress(inputGz, "gzip", "string")).toBe(expectedDecomp);
    expect(await decompress(inputDf, "deflate", "string")).toBe(expectedDecomp);
    expect(await decompress(inputDfRaw, "deflate-raw", "string")).toBe(expectedDecomp);
  });
});

//#region computeHash
describe("crypto/computeHash", () => {
  it("Computes hashes as expected", async () => {
    const input1 = "Hello, world!";
    const input2 = input1.repeat(10);

    expect(await computeHash(input1, "SHA-1")).toBe("943a702d06f34599aee1f8da8ef9f7296031d699");
    expect(await computeHash(input1, "SHA-256")).toBe("315f5bdb76d078c43b8ac0064e4a0164612b1fce77c869345bfc94c75894edd3");
    expect(await computeHash(input1, "SHA-512")).toBe("c1527cd893c124773d811911970c8fe6e857d6df5dc9226bd8a160614c0cd963a4ddea2b94bb7d36021ef9d865d5cea294a82dd49a0bb269f51f6e7a57f79421");
    expect(await computeHash(input2, "SHA-256")).toBe(await computeHash(input2, "SHA-256"));
  });
});

//#region randomId
describe("crypto/randomId", () => {
  it("Generates random IDs as expected", () => {
    const id1 = randomId(32, 36, false, true);

    expect(id1).toHaveLength(32);
    expect(id1).toMatch(/^[0-9a-zA-Z]+$/);

    const id2 = randomId(32, 36, true, true);

    expect(id2).toHaveLength(32);
    expect(id2).toMatch(/^[0-9a-zA-Z]+$/);

    expect(randomId(32, 2, false, false)).toMatch(/^[01]+$/);
  });

  it("Handles all edge cases", () => {
    expect(() => randomId(16, 1)).toThrow(RangeError);
    expect(() => randomId(16, 37)).toThrow(RangeError);
    expect(() => randomId(-1)).toThrow(RangeError);
  });
});
