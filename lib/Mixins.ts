/**
 * @module lib/Mixins
 * Allows for defining and applying mixin functions to allow multiple sources to modify a value in a controlled way.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { purifyObj } from "./misc.js";

/** Full mixin object as it is stored in the instance's mixin array. */
export type MixinObj<TArg, TCtx> = {
  /** The public identifier key (purpose) of the mixin */
  key: string;
  /** The mixin function */
  fn: (arg: TArg, ctx?: TCtx) => TArg;
} & MixinConfig;

/** Configuration object for a mixin function */
export type MixinConfig = {
  /** The higher, the earlier the mixin will be applied. Supports floating-point and negative numbers too. 0 by default. */
  priority: number;
  /** If true, no further mixins will be applied after this one. */
  stopPropagation: boolean;
  /** If set, the mixin will only be applied if the given signal is not aborted. */
  signal?: AbortSignal;
}

/** Configuration object for the Mixins class */
export type MixinsConstructorConfig = {
  /** If true, when no priority is specified, an auto-incrementing integer priority will be used (unique per mixin key). Defaults to false. */
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
 * When calling {@linkcode resolve()}, all registered mixin functions with the same key will be applied to the input value in the order of their priority.  
 * If a mixin has the stopPropagation flag set to true, no further mixins will be applied after it.  
 * @template TMixinMap A map of mixin keys to their respective function signatures. The first argument of the function is the input value, the second argument is an optional context object. If it is defined here, it must be passed as the third argument in {@linkcode resolve()}.
 * @example ```ts
 * const ac = new AbortController();
 * const { abort: removeAllMixins } = ac;
 * 
 * const mathMixins = new Mixins<{
 *   foo: (val: number, ctx: { baz: string }) => number;
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
 * mathMixins.add("foo", (val, ctx) => val * 2 + ctx.baz.length);
 * // will be applied second due to manually set priority of 1:
 * mathMixins.add("foo", (val) => val + 1, { priority: 1 });
 * // will be applied first, even though the above ones were called first, because of the auto-incrementing priority of 2:
 * mathMixins.add("foo", (val) => val / 2);
 * 
 * const result = mathMixins.resolve("foo", 10, { baz: "my length is 15" });
 * // order of application:
 * // input value: 10
 * // 10 / 2 = 5
 * // 5 + 1 = 6
 * // 6 * 2 + 15 = 27
 * // result = 27
 * 
 * // removes all mixins added without a `signal` property:
 * removeAllMixins();
 * ```
 */
export class Mixins<TMixinMap extends Record<string, (arg: any, ctx?: any) => any>> {
  /** List of all registered mixins */
  protected mixins: MixinObj<any, any>[] = [];

  /** Default configuration object for mixins */
  protected readonly defaultMixinCfg: MixinConfig;

  /** Whether the priorities should auto-increment if not specified */
  protected readonly aiPriorityEnabled: boolean;
  /** The current auto-increment priority counter */
  protected aiPriorityCounter = new Map<string, number>();

  /**
   * Creates a new Mixins instance.
   * @param config Configuration object to customize the mixin behavior.
   */
  constructor(config: Partial<MixinsConstructorConfig> = {}) {
    this.defaultMixinCfg = purifyObj({
      priority: config.defaultPriority ?? 0,
      stopPropagation: config.defaultStopPropagation ?? false,
      signal: config.defaultSignal,
    });
    this.aiPriorityEnabled = config.autoIncrementPriority ?? false;
  }

  //#region public

  /**
   * Adds a mixin function to the given {@linkcode mixinKey}.  
   * If no priority is specified, it will be calculated via the protected method {@linkcode calcPriority()} based on the constructor configuration, or fall back to the default priority.
   * @param mixinKey The key to identify the mixin function.
   * @param mixinFn The function to be called to apply the mixin. The first argument is the input value, the second argument is the context object (if any).
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
    config: Partial<MixinConfig> = purifyObj({}),
  ): () => void {
    const calcPrio = this.calcPriority(mixinKey, config);
    const mixin = purifyObj({
      ...this.defaultMixinCfg,
      key: mixinKey as string,
      fn: mixinFn,
      ...config,
      ...(typeof calcPrio === "number" && !isNaN(calcPrio) ? { priority: calcPrio } : {}),
    }) as MixinObj<TArg, TCtx>;
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

  //#region protected

  /** Calculates the priority for a mixin based on the given configuration and the current auto-increment state of the instance */
  protected calcPriority(mixinKey: string, config: Partial<MixinConfig>): number | undefined {
    // if prio specified, skip calculation
    if(config.priority !== undefined)
      return undefined;

    // if a-i disabled, use default prio
    if(!this.aiPriorityEnabled)
      return config.priority ?? this.defaultMixinCfg.priority;

    // initialize a-i map to default prio
    if(!this.aiPriorityCounter.has(mixinKey))
      this.aiPriorityCounter.set(mixinKey, this.defaultMixinCfg.priority);

    // increment a-i prio until unique
    let prio = this.aiPriorityCounter.get(mixinKey)!;
    while(this.mixins.some((m) => m.key === mixinKey && m.priority === prio))
      prio++;
    this.aiPriorityCounter.set(mixinKey, prio + 1);

    return prio;
  }

  /** Removes all mixins with the given key */
  protected removeAll<TMixinKey extends keyof TMixinMap>(mixinKey: TMixinKey): void {
    this.mixins.filter((m) => m.key === mixinKey);
    this.mixins = this.mixins.filter((m) => m.key !== mixinKey);
  }
}
