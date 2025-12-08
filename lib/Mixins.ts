/**
 * @module lib/Mixins
 * Allows for defining and applying mixin functions to allow multiple sources to modify a value in a controlled way.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { purifyObj } from "./misc.js";
import type { Prettify } from "./types.js";

/** Full mixin object (either sync or async), as it is stored in the instance's mixin array. */
export type MixinObj<TArg, TCtx> = Prettify<
  | MixinObjSync<TArg, TCtx>
  | MixinObjAsync<TArg, TCtx>
>;

/** Synchronous mixin object, as it is stored in the instance's mixin array. */
export type MixinObjSync<TArg, TCtx> = Prettify<{
  /** The mixin function */
  fn: (arg: TArg, ctx?: TCtx) => TArg;
} & MixinObjBase>;

/** Asynchronous mixin object, as it is stored in the instance's mixin array. */
export type MixinObjAsync<TArg, TCtx> = Prettify<{
  /** The mixin function */
  fn: (arg: TArg, ctx?: TCtx) => TArg | Promise<TArg>;
} & MixinObjBase>;

/** Base type for mixin objects */
type MixinObjBase = Prettify<{
  /** The public identifier key (purpose) of the mixin */
  key: string;
} & MixinConfig>;

/** Configuration object for a mixin function */
export type MixinConfig = {
  /** The higher, the earlier the mixin will be applied. Supports floating-point and negative numbers too. 0 by default. */
  priority: number;
  /** If true, no further mixins will be applied after this one. */
  stopPropagation: boolean;
  /** If set, the mixin will only be applied if the given signal is not aborted. */
  signal?: AbortSignal;
}

/** Configuration object for the {@linkcode Mixins} class */
export type MixinsConstructorConfig = {
  /**
   * If true, when no priority is specified, an auto-incrementing integer priority will be used, starting at `defaultPriority` or 0 (unique per mixin key). Defaults to false.  
   * If a priority value is already used, it will be incremented until a unique value is found.  
   * This is useful to ensure that mixins are applied in the order they were added, even if they don't specify a priority.  
   * It also allows for a finer level of interjection when the priority is a floating point number.
   */
  autoIncrementPriority: boolean;
  /** The default priority for mixins that do not specify one. Defaults to 0. */
  defaultPriority: number;
  /** The default stopPropagation value for mixins that do not specify one. Defaults to false. */
  defaultStopPropagation: boolean;
  /** The default AbortSignal for mixins that do not specify one. Defaults to undefined. */
  defaultSignal?: AbortSignal;
}

//#region class

/**
 * The mixin class allows for defining and applying mixin functions to allow multiple sources to modify values in a controlled way.  
 * Mixins are identified via their string key and can be added with {@linkcode add()}  
 * When calling {@linkcode resolve()}, all registered mixin functions with the same key will be applied to the input value in the order of their priority, or alternatively the order they were added.  
 * If a mixin function has its `stopPropagation` flag set to true when being added, no further mixin functions will be applied after it.  
 * @template TMixinMap A map of mixin keys to their respective function signatures. The first argument of the function is the input value, the second argument is an optional context object. If it is defined here, it must be passed as the third argument in {@linkcode resolve()}.
 * @example ```ts
 * const ac = new AbortController();
 * const { abort: removeAllMixins } = ac;
 * 
 * const mathMixins = new Mixins<{
 *   // supports sync and async functions:
 *   foo: (val: number, ctx: { baz: string }) => Promise<number>;
 *   // first argument and return value have to be of the same type:
 *   bar: (val: bigint) => bigint;
 *   // ...
 * }>({
 *   autoIncrementPriority: true,
 *   defaultPriority: 0,
 *   defaultSignal: ac.signal,
 * });
 * 
 * // will be applied last due to base priority of 0:
 * mathMixins.add("foo", (val, ctx) => Promise.resolve(val * 2 + ctx.baz.length));
 * // will be applied second due to manually set priority of 1:
 * mathMixins.add("foo", (val) => val + 1, { priority: 1 });
 * // will be applied first, even though the above ones were called first, because of the auto-incrementing priority of 2:
 * mathMixins.add("foo", (val) => val / 2);
 * 
 * const result = await mathMixins.resolve("foo", 10, { baz: "this has a length of 23" });
 * // order of application:
 * // input value: 10
 * // 10 / 2 = 5
 * // 5 + 1 = 6
 * // 6 * 2 + 23 = 35
 * // result = 35
 * 
 * // removes all mixins added without a `signal` property:
 * removeAllMixins();
 * ```
 */
export class Mixins<
  TMixinMap extends Record<string, (arg: any, ctx?: any) => any>,
  TMixinKey extends Extract<keyof TMixinMap, string> = Extract<keyof TMixinMap, string>,
> {
  /** List of all registered mixins */
  protected mixins: MixinObj<any, any>[] = [];

  /** Default configuration object for mixins */
  protected readonly defaultMixinCfg: MixinConfig;

  /** Whether the priorities should auto-increment if not specified */
  protected readonly autoIncPrioEnabled: boolean;
  /** The current auto-increment priority counter */
  protected autoIncPrioCounter: Map<TMixinKey, number> = new Map<TMixinKey, number>();

  /**
   * Creates a new Mixins instance.
   * @param config Configuration object to customize the behavior.
   */
  constructor(config: Partial<MixinsConstructorConfig> = {}) {
    this.defaultMixinCfg = purifyObj({
      priority: config.defaultPriority ?? 0,
      stopPropagation: config.defaultStopPropagation ?? false,
      signal: config.defaultSignal,
    });
    this.autoIncPrioEnabled = config.autoIncrementPriority ?? false;
  }

  //#region public

  /**
   * Adds a mixin function to the given {@linkcode mixinKey}.  
   * If no priority is specified, it will be calculated via the protected method {@linkcode calcPriority()} based on the constructor configuration, or fall back to the default priority.
   * @param mixinKey The key to identify the mixin function.
   * @param mixinFn The function to be called to apply the mixin. The first argument is the input value, the second argument is the context object (if any).
   * @param config Configuration object to customize the mixin behavior, or just the priority if a number is passed.
   * @returns Returns a cleanup function, to be called when this mixin is no longer needed.
   */
  public add<
    TKey extends TMixinKey,
    TArg extends Parameters<TMixinMap[TKey]>[0],
    TCtx extends Parameters<TMixinMap[TKey]>[1],
  >(
    mixinKey: TKey,
    mixinFn: (arg: TArg, ...ctx: TCtx extends undefined ? [void] : [TCtx]) => ReturnType<TMixinMap[TKey]> extends Promise<any> ? ReturnType<TMixinMap[TKey]> | Awaited<ReturnType<TMixinMap[TKey]>> : ReturnType<TMixinMap[TKey]>,
    config: Partial<MixinConfig> | number = purifyObj({}),
  ): () => void {
    const calcPrio = typeof config === "number" ? config : this.calcPriority(mixinKey, config);
    const mixin = purifyObj({
      ...this.defaultMixinCfg,
      key: mixinKey as string,
      fn: mixinFn,
      ...(typeof config === "object" ? config : {}),
      ...(typeof calcPrio === "number" && !isNaN(calcPrio) ? { priority: calcPrio } : {}),
    }) as MixinObj<TArg, TCtx>;
    this.mixins.push(mixin);

    const rem = (): void => {
      this.mixins = this.mixins.filter((m) => m !== mixin);
    };
    if(mixin.signal)
      mixin.signal.addEventListener("abort", rem, { once: true });

    return rem;
  }

  /** Returns a list of all added mixins with their keys and configuration objects, but not their functions */
  public list(): ({ key: string; } & MixinConfig)[] {
    return this.mixins.map(({ fn: _f, ...rest }) => rest);
  }

  /**
   * Applies all mixins with the given key to the input value, respecting the priority and stopPropagation settings.  
   * If additional context is set in the MixinMap, it will need to be passed as the third argument.  
   * @returns The modified value after all mixins have been applied. The method will return a Promise if at least one of the mixins is async. If all mixins are indicated to be synchronous in TS, but at least one of them turns out to be asynchronous, the return type will be a Promise. With `await`, this will not make a difference, but `.then().catch()` could be affected.
   */
  public resolve<
    TKey extends TMixinKey,
    TArg extends Parameters<TMixinMap[TKey]>[0],
    TCtx extends Parameters<TMixinMap[TKey]>[1],
  >(
    mixinKey: TKey,
    inputValue: TArg,
    ...inputCtx: TCtx extends undefined ? [void] : [TCtx]
  ): ReturnType<TMixinMap[TKey]> extends Promise<any> ? ReturnType<TMixinMap[TKey]> : ReturnType<TMixinMap[TKey]> {
    const mixins = this.mixins.filter((m) => m.key === mixinKey);
    const sortedMixins = [...mixins].sort((a, b) => b.priority - a.priority);
    let result = inputValue;

    // start resolving synchronously:
    for(let i = 0; i < sortedMixins.length; i++) {
      const mixin = sortedMixins[i]!;
      result = mixin.fn(result, ...inputCtx);
      if((result as unknown) instanceof Promise) {
        // if one of the mixins is async, switch to async resolution:
        return (async () => {
          result = await result;
          if(mixin.stopPropagation)
            return result;
          for(let j = i + 1; j < sortedMixins.length; j++) {
            const mixin = sortedMixins[j]!;
            result = await mixin.fn(result, ...inputCtx);
            if(mixin.stopPropagation)
              break;
          }
          return result;
        })() as ReturnType<TMixinMap[TKey]> extends Promise<any> ? ReturnType<TMixinMap[TKey]> : never;
      }
      else if(mixin.stopPropagation)
        break;
    }

    return result;
  }

  //#region protected

  /** Calculates the priority for a mixin based on the given configuration and the current auto-increment state of the instance */
  protected calcPriority(mixinKey: TMixinKey, config: Partial<MixinConfig>): number | undefined {
    // if prio specified, skip calculation
    if(config.priority !== undefined)
      return undefined;

    // if a-i disabled, use default prio
    if(!this.autoIncPrioEnabled)
      return config.priority ?? this.defaultMixinCfg.priority;

    // initialize a-i map to default prio
    if(!this.autoIncPrioCounter.has(mixinKey))
      this.autoIncPrioCounter.set(mixinKey, this.defaultMixinCfg.priority);

    // increment a-i prio until unique
    let prio = this.autoIncPrioCounter.get(mixinKey)!;
    while(this.mixins.some((m) => m.key === mixinKey && m.priority === prio))
      prio++;
    this.autoIncPrioCounter.set(mixinKey, prio + 1);

    return prio;
  }

  /**
   * Removes all mixins with the given key.  
   * Note: this method is protected to avoid third-party code from removing mixins. If needed, you can extend the Mixins class and expose this method publicly.
   */
  protected removeAll(mixinKey: TMixinKey): void {
    this.mixins.filter((m) => m.key === mixinKey);
    this.mixins = this.mixins.filter((m) => m.key !== mixinKey);
  }
}
