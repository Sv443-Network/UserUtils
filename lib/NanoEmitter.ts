/**
 * @module lib/NanoEmitter
 * This module contains the NanoEmitter class, which is a tiny event emitter powered by [nanoevents](https://www.npmjs.com/package/nanoevents) - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#nanoemitter)
 */

import { createNanoEvents, type DefaultEvents, type Emitter, type EventsMap, type Unsubscribe } from "nanoevents";

export interface NanoEmitterOptions {
  /** If set to true, allows emitting events through the public method emit() */
  publicEmit: boolean;
}

/** Class that can be extended or instantiated by itself to create an event emitter with helper methods and a strongly typed event map */
export class NanoEmitter<TEvtMap extends EventsMap = DefaultEvents> {
  protected readonly events: Emitter<TEvtMap> = createNanoEvents<TEvtMap>();
  protected eventUnsubscribes: Unsubscribe[] = [];
  protected emitterOptions: NanoEmitterOptions;

  constructor(options: Partial<NanoEmitterOptions> = {}) {
    this.emitterOptions = {
      publicEmit: false,
      ...options,
    };
  }

  /** Subscribes to an event - returns a function that unsubscribes the event listener */
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

  /** Subscribes to an event and calls the callback or resolves the Promise only once */
  public once<TKey extends keyof TEvtMap>(event: TKey | "_", cb?: TEvtMap[TKey]): Promise<Parameters<TEvtMap[TKey]>> {
    return new Promise((resolve) => {
      // eslint-disable-next-line prefer-const
      let unsub: Unsubscribe | undefined;

      const onceProxy = ((...args: Parameters<TEvtMap[TKey]>) => {
        unsub!();
        cb?.(...args);
        resolve(args);
      }) as TEvtMap[TKey];

      unsub = this.on(event, onceProxy);
    });
  }

  /** Emits an event on this instance - Needs `publicEmit` to be set to true in the constructor! */
  public emit<TKey extends keyof TEvtMap>(event: TKey, ...args: Parameters<TEvtMap[TKey]>): boolean {
    if(this.emitterOptions.publicEmit) {
      this.events.emit(event, ...args);
      return true;
    }
    return false;
  }

  /** Unsubscribes all event listeners */
  public unsubscribeAll(): void {
    for(const unsub of this.eventUnsubscribes)
      unsub();
    this.eventUnsubscribes = [];
  }
}
