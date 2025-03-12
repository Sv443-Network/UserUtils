/**
 * @module lib/math
 * This module contains various math functions - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#math)
 */

import type { Stringifiable } from "./types.js";

/** Ensures the passed {@linkcode value} always stays between {@linkcode min} and {@linkcode max} */
export function clamp(value: number, min: number, max: number): number
/** Ensures the passed {@linkcode value} always stays between 0 and {@linkcode max} */
export function clamp(value: number, max: number): number
/** Ensures the passed {@linkcode value} always stays between {@linkcode min} and {@linkcode max} - if `max` isn't given, it defaults to `min` and `min` defaults to 0 */
export function clamp(value: number, min: number, max?: number): number {
  if(typeof max !== "number") {
    max = min;
    min = 0;
  }
  return Math.max(Math.min(value, max), min);
}

/**
 * Transforms the value parameter from the numerical range `range1min` to `range1max` to the numerical range `range2min` to `range2max`  
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
export function mapRange(value: number, range1min: number, range1max: number, range2min: number, range2max: number): number;
/**
 * Transforms the value parameter from the numerical range `0` to `range1max` to the numerical range `0` to `range2max`
 * For example, you can map the value 2 in the range of 0-5 to the range of 0-10 and you'd get a 4 as a result.
 */
export function mapRange(value: number, range1max: number, range2max: number): number;
export function mapRange(value: number, range1min: number, range1max: number, range2min?: number, range2max?: number): number {
  if(typeof range2min === "undefined" || typeof range2max === "undefined") {
    range2max = range1max;
    range1max = range1min;
    range2min = range1min = 0;
  }

  if(Number(range1min) === 0.0 && Number(range2min) === 0.0)
    return value * (range2max / range1max);

  return (value - range1min) * ((range2max - range2min) / (range1max - range1min)) + range2min;
}

/**
 * Returns a random number between {@linkcode min} and {@linkcode max} (inclusive)  
 * Set {@linkcode enhancedEntropy} to true to use `crypto.getRandomValues()` for better cryptographic randomness (this also makes it take longer to generate)
 */
export function randRange(min: number, max: number, enhancedEntropy?: boolean): number
/**
 * Returns a random number between 0 and {@linkcode max} (inclusive)  
 * Set {@linkcode enhancedEntropy} to true to use `crypto.getRandomValues()` for better cryptographic randomness (this also makes it take longer to generate)
 */
export function randRange(max: number, enhancedEntropy?: boolean): number
/**
 * Returns a random number between {@linkcode min} and {@linkcode max} (inclusive)  
 * Set {@linkcode enhancedEntropy} to true to use `crypto.getRandomValues()` for better cryptographic randomness (this also makes it take longer to generate)
 */
export function randRange(...args: (number | boolean | undefined)[]): number {
  let min: number, max: number, enhancedEntropy = false;

  // using randRange(min, max)
  if(typeof args[0] === "number" && typeof args[1] === "number")
    [ min, max ] = args;
  // using randRange(max)
  else if(typeof args[0] === "number" && typeof args[1] !== "number") {
    min = 0;
    [ max ] = args;
  }
  else
    throw new TypeError(`Wrong parameter(s) provided - expected (number, boolean|undefined) or (number, number, boolean|undefined) but got (${args.map(a => typeof a).join(", ")}) instead`);

  if(typeof args[2] === "boolean")
    enhancedEntropy = args[2];
  else if(typeof args[1] === "boolean")
    enhancedEntropy = args[1];

  min = Number(min);
  max = Number(max);

  if(isNaN(min) || isNaN(max))
    return NaN;

  if(min > max)
    throw new TypeError("Parameter \"min\" can't be bigger than \"max\"");

  if(enhancedEntropy) {
    const uintArr = new Uint8Array(1);
    crypto.getRandomValues(uintArr);
    return Number(Array.from(
      uintArr,
      (v) => Math.round(mapRange(v, 0, 255, min, max)).toString(10),
    ).join(""));
  }
  else
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculates the amount of digits in the given number - the given number or string will be passed to the `Number()` constructor.  
 * Returns NaN if the number is invalid.  
 * @param num The number to count the digits of
 * @param withDecimals Whether to count the decimal places as well (defaults to true)
 * @example ```ts
 * digitCount();         // NaN
 * digitCount(0);        // 1
 * digitCount(123);      // 3
 * digitCount(123.456);  // 6
 * digitCount(Infinity); // Infinity
 * ```
 */
export function digitCount(num: number | Stringifiable, withDecimals = true): number {
  num = Number((!["string", "number"].includes(typeof num)) ? String(num) : num);

  if(typeof num === "number" && isNaN(num))
    return NaN;

  const [intPart, decPart] = num.toString().split(".");

  const intDigits = intPart === "0"
    ? 1
    : Math.floor(Math.log10(Math.abs(Number(intPart))) + 1);
  const decDigits = withDecimals && decPart
    ? decPart.length
    : 0;

  return intDigits + decDigits;
}

/**
 * Rounds {@linkcode num} to a fixed amount of decimal places, specified by {@linkcode fractionDigits} (supports negative values to round to the nearest power of 10).
 * @example ```ts
 * roundFixed(234.567, -2); // 200
 * roundFixed(234.567, -1); // 230
 * roundFixed(234.567, 0);  // 235
 * roundFixed(234.567, 1);  // 234.6
 * roundFixed(234.567, 2);  // 234.57
 * roundFixed(234.567, 3);  // 234.567
 * ```
 */
export function roundFixed(num: number, fractionDigits: number): number {
  const scale = 10 ** fractionDigits;
  return Math.round(num * scale) / scale;
}

/**
 * Checks if the {@linkcode bitSet} has the {@linkcode checkVal} set
 * @example ```ts
 * // the two vertically adjacent bits are tested for:
 * bitSetHas(
 *   0b1110,
 *   0b0010,
 * ); // true
 * 
 * bitSetHas(
 *   0b1110,
 *   0b0001,
 * ); // false
 * 
 * // with TS enums (or JS maps):
 * enum MyEnum {
 *   A = 1, B = 2, C = 4,
 *   D = 8, E = 16, F = 32,
 * }
 * 
 * const myBitSet = MyEnum.A | MyEnum.B;
 * bitSetHas(myBitSet, MyEnum.B); // true
 * bitSetHas(myBitSet, MyEnum.F); // false
 * ```
 */
export function bitSetHas<TType extends number | bigint>(bitSet: TType, checkVal: TType): boolean {
  return (bitSet & checkVal) === checkVal;
}
