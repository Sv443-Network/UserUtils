/**
 * @module lib/NanoEmitter
 * This module contains the NanoEmitter class, which is a tiny event emitter powered by [nanoevents](https://www.npmjs.com/package/nanoevents) - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#nanoemitter)
 */

import { createNanoEvents, type DefaultEvents, type Emitter, type EventsMap, type Unsubscribe } from "nanoevents";

export interface NanoEmitterOptions {
  /** If set to true, allows emitting events through the public method emit() */
  publicEmit: boolean;
}

/**
 * Class that can be extended or instantiated by itself to create a lightweight event emitter with helper methods and a strongly typed event map.  
 * If extended from, you can use `this.events.emit()` to emit events, even if the `emit()` method doesn't work because `publicEmit` is not set to true in the constructor.
 */
export class NanoEmitter<TEvtMap extends EventsMap = DefaultEvents> {
  protected readonly events: Emitter<TEvtMap> = createNanoEvents<TEvtMap>();
  protected eventUnsubscribes: Unsubscribe[] = [];
  protected emitterOptions: NanoEmitterOptions;

  /** Creates a new instance of NanoEmitter - a lightweight event emitter with helper methods and a strongly typed event map */
  constructor(options: Partial<NanoEmitterOptions> = {}) {
    this.emitterOptions = {
      publicEmit: false,
      ...options,
    };
  }

  /**
   * Subscribes to an event and calls the callback when it's emitted.  
   * @param event The event to subscribe to. Use `as "_"` in case your event names aren't thoroughly typed (like when using a template literal, e.g. \`event-${val}\` as "_")
   * @returns Returns a function that can be called to unsubscribe the event listener
   * @example ```ts
   * const emitter = new NanoEmitter<{
   *   foo: (bar: string) => void;
   * }>({
   *   publicEmit: true,
   * });
   * 
   * let i = 0;
   * const unsub = emitter.on("foo", (bar) => {
   *   // unsubscribe after 10 events:
   *   if(++i === 10) unsub();
   *   console.log(bar);
   * });
   * 
   * emitter.emit("foo", "bar");
   * ```
   */
  public on<TKey extends keyof TEvtMap>(event: TKey | "_", cb: TEvtMap[TKey]): () => void {
    // eslint-disable-next-line prefer-const
    let unsub: Unsubscribe | undefined;

    const unsubProxy = (): void => {
      if(!unsub)
        return;
      unsub();
      this.eventUnsubscribes = this.eventUnsubscribes.filter(u => u !== unsub);
    };

    unsub = this.events.on(event, cb);

    this.eventUnsubscribes.push(unsub);
    return unsubProxy;
  }

  /**
   * Subscribes to an event and calls the callback or resolves the Promise only once when it's emitted.  
   * @param event The event to subscribe to. Use `as "_"` in case your event names aren't thoroughly typed (like when using a template literal, e.g. \`event-${val}\` as "_")
   * @param cb The callback to call when the event is emitted - if provided or not, the returned Promise will resolve with the event arguments
   * @returns Returns a Promise that resolves with the event arguments when the event is emitted
   * @example ```ts
   * const emitter = new NanoEmitter<{
   *   foo: (bar: string) => void;
   * }>();
   * 
   * // Promise syntax:
   * const [bar] = await emitter.once("foo");
   * console.log(bar);
   * 
   * // Callback syntax:
   * emitter.once("foo", (bar) => console.log(bar));
   * ```
   */
  public once<TKey extends keyof TEvtMap>(event: TKey | "_", cb?: TEvtMap[TKey]): Promise<Parameters<TEvtMap[TKey]>> {
    return new Promise((resolve) => {
      // eslint-disable-next-line prefer-const
      let unsub: Unsubscribe | undefined;

      const onceProxy = ((...args: Parameters<TEvtMap[TKey]>) => {
        cb?.(...args);
        unsub?.();
        resolve(args);
      }) as TEvtMap[TKey];

      unsub = this.events.on(event, onceProxy);
      this.eventUnsubscribes.push(unsub);
    });
  }

  /**
   * Emits an event on this instance.  
   * ⚠️ Needs `publicEmit` to be set to true in the NanoEmitter constructor or super() call!
   * @param event The event to emit
   * @param args The arguments to pass to the event listeners
   * @returns Returns true if `publicEmit` is true and the event was emitted successfully
   */
  public emit<TKey extends keyof TEvtMap>(event: TKey, ...args: Parameters<TEvtMap[TKey]>): boolean {
    if(this.emitterOptions.publicEmit) {
      this.events.emit(event, ...args);
      return true;
    }
    return false;
  }

  /** Unsubscribes all event listeners from this instance */
  public unsubscribeAll(): void {
    for(const unsub of this.eventUnsubscribes)
      unsub();
    this.eventUnsubscribes = [];
  }
}
