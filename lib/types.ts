/**
 * @module lib/types
 * This module contains various TS types - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#utility-types)
 */

//#region UU types

/** Represents any value that is either a string itself or can be converted to one (implicitly and explicitly) because it has a toString() method */
export type Stringifiable = string | { toString(): string } | { [Symbol.toStringTag]: string } | number | boolean | null | undefined;

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
 * Makes the structure of a type more readable by expanding it.  
 * This can be useful for debugging or for improving the readability of complex types.
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/** Any value that is list-like, i.e. has a numeric length, count or size property */
export type ListWithLength = unknown[] | NodeList | { length: number } | { count: number } | { size: number };
