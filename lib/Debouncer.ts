import { NanoEmitter } from "./NanoEmitter.js";

//#region types

/**
 * The type of edge to use for the debouncer - [see the docs for a diagram and explanation.](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#debouncer)  
 * - `immediate` - (default & recommended) - calls the listeners at the very first call ("rising" edge) and queues the latest call until the timeout expires  
 *   - Pros:  
 *     - First call is let through immediately  
 *   - Cons:  
 *     - After all calls stop, the JS engine's event loop will continue to run until the last timeout expires (doesn't really matter on the web, but could cause a process exit delay in Node.js)
 * - `idle` - queues all calls until there are no more calls in the given timeout duration ("falling" edge), and only then executes the very last call  
 *   - Pros:  
 *     - Makes sure there are zero calls in the given `timeoutDuration` before executing the last call
 *   - Cons:
 *     - Calls are always delayed by at least `1 * timeoutDuration`
 *     - Calls could get stuck in the queue indefinitely if there is no downtime between calls that is greater than the `timeoutDuration`
 */
export type DebouncerType = "immediate" | "idle";

export type DebouncerFunc<TArgs> = (...args: TArgs[]) => void | unknown;

/** Event map for the {@linkcode Debouncer} */
export type DebouncerEventMap<TArgs> = {
  /** Emitted when the debouncer calls all registered listeners, as a pub-sub alternative */
  call: DebouncerFunc<TArgs>;
  /** Emitted when the timeout or edge type is changed after the instance was created */
  change: (timeout: number, type: DebouncerType) => void;
};

//#region debounce class

/**
 * A debouncer that calls all listeners after a specified timeout, discarding all calls in-between.  
 * It is very useful for event listeners that fire quickly, like `input` or `mousemove`, to prevent the listeners from being called too often and hogging resources.  
 * The exact behavior can be customized with the `type` parameter.  
 *   
 * The instance inherits from {@linkcode NanoEmitter} and emits the following events:  
 * - `call` - emitted when the debouncer calls all listeners - use this as a pub-sub alternative to the default callback-style listeners
 * - `change` - emitted when the timeout or edge type is changed after the instance was created
 */
export class Debouncer<TArgs> extends NanoEmitter<DebouncerEventMap<TArgs>> {
  /** All registered listener functions and the time they were attached */
  protected listeners: DebouncerFunc<TArgs>[] = [];

  /** The currently active timeout */
  protected activeTimeout: ReturnType<typeof setTimeout> | undefined;

  /** The latest queued call */
  protected queuedCall: DebouncerFunc<TArgs> | undefined;

  /**
   * Creates a new debouncer with the specified timeout and edge type.
   * @param timeout Timeout in milliseconds between letting through calls - defaults to 200
   * @param type The edge type to use for the debouncer - see {@linkcode DebouncerType} for details or [the documentation for an explanation and diagram](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#debouncer) - defaults to "immediate"
   */
  constructor(protected timeout = 200, protected type: DebouncerType = "immediate") {
    super();
  }

  //#region listeners

  /** Adds a listener function that will be called on timeout */
  public addListener(fn: DebouncerFunc<TArgs>) {
    this.listeners.push(fn);
  }

  /** Removes the listener with the specified function reference */
  public removeListener(fn: DebouncerFunc<TArgs>) {
    const idx = this.listeners.findIndex((l) => l === fn);
    idx !== -1 && this.listeners.splice(idx, 1);
  }

  /** Removes all listeners */
  public removeAllListeners() {
    this.listeners = [];
  }

  //#region timeout

  /** Sets the timeout for the debouncer */
  public setTimeout(timeout: number) {
    this.emit("change", this.timeout = timeout, this.type);
  }

  /** Returns the current timeout */
  public getTimeout() {
    return this.timeout;
  }

  /** Whether the timeout is currently active, meaning any latest call to the {@linkcode call()} method will be queued */
  public isTimeoutActive() {
    return typeof this.activeTimeout !== "undefined";
  }

  //#region type

  /** Sets the edge type for the debouncer */
  public setType(type: DebouncerType) {
    this.emit("change", this.timeout, this.type = type);
  }

  /** Returns the current edge type */
  public getType() {
    return this.type;
  }

  //#region call

  /** Use this to call the debouncer with the specified arguments that will be passed to all listener functions registered with {@linkcode addListener()} */
  public call(...args: TArgs[]) {
    /** When called, calls all registered listeners */
    const cl = (...a: TArgs[]) => {
      this.queuedCall = undefined;
      this.emit("call", ...a);
      this.listeners.forEach((l) => l.apply(this, a));
    };

    /** Sets a timeout that will call the latest queued call and then set another timeout if there was a queued call */
    const setRepeatTimeout = () => {
      this.activeTimeout = setTimeout(() => {
        if(this.queuedCall) {
          this.queuedCall();
          setRepeatTimeout();
        }
        else
          this.activeTimeout = undefined;
      }, this.timeout);
    };

    switch(this.type) {
    case "immediate":
      if(typeof this.activeTimeout === "undefined") {
        cl(...args);
        setRepeatTimeout();
      }
      else
        this.queuedCall = () => cl(...args);

      break;
    case "idle":
      if(this.activeTimeout)
        clearTimeout(this.activeTimeout);

      this.activeTimeout = setTimeout(() => {
        cl(...args);
        this.activeTimeout = undefined;
      }, this.timeout);

      break;
    default:
      throw new Error(`Invalid debouncer type: ${this.type}`);
    }
  }
}

//#region debounce fn

/**
 * Creates a {@linkcode Debouncer} instance with the specified timeout and edge type and attaches the passed function as a listener.  
 * The returned function can be called with any arguments and will execute the `call()` method of the debouncer.  
 * The debouncer instance is accessible via the `debouncer` property of the returned function.  
 *   
 * Refer to the {@linkcode Debouncer} class definition or the [Debouncer documentation](https://github.com/Sv443-Network/UserUtils/blob/main/README.md#debouncer) for more information.
 */
export function debounce<
  TFunc extends DebouncerFunc<TArgs>,
  TArgs,
> (
  fn: TFunc,
  timeout = 200,
  type: DebouncerType = "immediate"
): DebouncerFunc<TArgs> & { debouncer: Debouncer<TArgs> } {
  const debouncer = new Debouncer<TArgs>(timeout, type);
  debouncer.addListener(fn);

  const func = (...args: TArgs[]) => debouncer.call(...args);
  func.debouncer = debouncer;

  return func;
}
