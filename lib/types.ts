//#region shims

export type TrustedTypesPolicy = {
  createHTML?: (dirty: string) => string;
};

declare global {
  interface Window {
    // poly-shim for the new Trusted Types API
    trustedTypes: {
      createPolicy(name: string, policy: TrustedTypesPolicy): TrustedTypesPolicy;
    };
  }
}

//#region UU types

/** Represents any value that is either a string itself or can be converted to one (implicitly and explicitly) because it has a toString() method */
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
