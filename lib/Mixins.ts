/**
 * @module lib/Mixins
 * Allows for defining and applying mixin functions to allow multiple sources to modify a value in a controlled way.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Full mixin object as it is stored in the instance's mixin array. */
export type MixinObj<TArg, TCtx> = {
  /** The public identifier key (purpose) of the mixin */
  key: string;
  /** The mixin function */
  fn: (arg: TArg, ctx?: TCtx) => TArg;
} & MixinConfig;

/** Configuration object for a mixin function */
export type MixinConfig = {
  /** The higher, the earlier the mixin will be applied. Supports negative numbers too. 0 by default. */
  priority: number;
  /** If true, no further mixins will be applied after this one. */
  stopPropagation: boolean;
  /** If set, the mixin will only be applied if the given signal is not aborted. */
  signal?: AbortSignal;
}

/**
 * The mixin class allows for defining and applying mixin functions to allow multiple sources to modify values in a controlled way.  
 * Mixins are identified via their string key and can be added with {@linkcode add()}  
 * When calling {@linkcode resolve()}, all registered mixin functions with the same key will be applied to the input value in the order of their priority.  
 * If a mixin has the stopPropagation flag set to true, no further mixins will be applied after it.  
 *   
 * @example ```ts
 * const mathMixins = new Mixins<{
 *   foo: (val: number) => number;
 *   bar: (val: string, ctx: { baz: number }) => string;
 * }>();
 * 
 * // will be applied second due to base priority of 0:
 * mathMixins.add("foo", (val) => val * 2);
 * // this mixin will be applied first, even though the above one was called first:
 * mathMixins.add("foo", (val) => val + 1, { priority: 1 });
 * 
 * function getFoo() {
 *   // 1. start with 5 as the base value
 *   // 2. add 1
 *   // 3. multiply by 2
 *   // result: 12
 *   return mathMixins.resolve("foo", 5);
 * }
 * 
 * 
 * mathMixins.add("bar", (val, ctx) => `${val} ${btoa(ctx.baz)}`);
 * mathMixins.add("bar", (val, ctx) => `${val}!`);
 * 
 * function getBar() {
 *   // 1. start with "Hello" as the base value
 *   // 2. append base64-encoded value in ctx.baz
 *   // 3. append "!"
 *   // result: "Hello d29ybGQ=!"
 *   return mathMixins.resolve("bar", "Hello", { baz: "world" });
 * }
 * ```
 */
export class Mixins<TMixinMap extends Record<string, (arg: any, ctx?: any) => any>> {
  protected mixins: MixinObj<any, any>[] = [];
  protected readonly defaultConfig: MixinConfig;

  /**
   * Creates a new Mixins instance.
   * @param defaultConfigOverrides An object to override the default configuration values for all mixin functions.
   */
  constructor(defaultConfigOverrides: Partial<MixinConfig> = {}) {
    this.defaultConfig = {
      priority: 0,
      stopPropagation: false,
      ...defaultConfigOverrides,
    };
  }

  /**
   * Adds a modifier function to the mixin with the given {@linkcode mixinKey}.
   * @param mixinKey The key to identify the mixin function.
   * @param mixinFn The function to be called to apply the mixin.
   * @param config Configuration object to customize the mixin behavior.
   * @returns Returns a cleanup function, to be called when this mixin is no longer needed.
   */
  public add<
    TMixinKey extends string,
    TArg extends Parameters<TMixinMap[TMixinKey]>[0],
    TCtx extends Parameters<TMixinMap[TMixinKey]>[1],
  >(
    mixinKey: TMixinKey,
    mixinFn: (arg: TArg, ...ctx: TCtx extends undefined ? [void] : [TCtx]) => TArg,
    config: Partial<MixinConfig> = {}
  ): () => void {
    const mixin = {
      key: mixinKey as string,
      fn: mixinFn,
      ...this.defaultConfig,
      ...config,
    } as MixinObj<TArg, TCtx>;
    this.mixins.push(mixin);

    const clean = (): void => {
      this.mixins = this.mixins.filter((m) => m !== mixin);
    };
    config.signal?.addEventListener("abort", clean, { once: true });

    return clean;
  }

  /** Returns a list of all added mixins with their keys and configuration objects, but not their functions */
  public list(): ({ key: string; } & MixinConfig)[] {
    return this.mixins.map(({ fn: _f, ...rest }) => rest);
  }

  /**
   * Applies all mixins with the given key to the input value, respecting the priority and stopPropagation settings.  
   * If additional context is set in the MixinMap, it will need to be passed as the third argument.  
   * @returns The modified value after all mixins have been applied.
   */
  public resolve<
    TMixinKey extends keyof TMixinMap,
    TArg extends Parameters<TMixinMap[TMixinKey]>[0],
    TCtx extends Parameters<TMixinMap[TMixinKey]>[1],
  >(
    mixinKey: TMixinKey,
    inputValue: TArg,
    ...inputCtx: TCtx extends undefined ? [void] : [TCtx]
  ): TArg {
    const mixins = this.mixins.filter((m) => m.key === mixinKey);
    const sortedMixins = mixins.sort((a, b) => a.priority - b.priority);
    let result = inputValue;
    for(const mixin of sortedMixins) {
      result = mixin.fn(result, ...inputCtx);
      if(mixin.stopPropagation)
        break;
    }
    return result;
  }

  /** Removes all mixins with the given key */
  protected removeAll<TMixinKey extends keyof TMixinMap>(mixinKey: TMixinKey): void {
    this.mixins.filter((m) => m.key === mixinKey);
    this.mixins = this.mixins.filter((m) => m.key !== mixinKey);
  }
}
