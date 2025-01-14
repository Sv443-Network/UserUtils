import { NanoEmitter } from "./NanoEmitter.js";

//#region types

/**
 * The type of edge to use for the debouncer - [see this issue for an explanation and diagram.](https://github.com/Sv443-Network/UserUtils/issues/46)  
 * - `queuedImmediate`  
 *   - (Default & recommended) calls the listeners at the very first call ("rising" edge) and queues the latest call until the timeout expires  
 *   - Pros: reacts immediately, doesn't delete the last call  
 *   - Cons: All subsequent calls are delayed by the timeout duration
 * - `queuedIdle`  
 *   - Queues all calls until there are no more calls in the given timeout duration ("falling" edge), and only then executes the very last call  
 *   - Pros: Always makes sure the last call is executed  
 *   - Cons: Calls are always delayed by the timeout duration, first call is likely to be discarded, calls could get stuck in the queue indefinitely if the calls are made faster than the timeout
 * - `discardingImmediate`  
 *   - Calls the listeners at the very last call ("falling" edge), then allows another through after the timeout expired, without queuing any calls  
 *   - Pros: Always acts upon calls immediately without delaying them in a queue, interval is somewhat predictable with events that fire often  
 *   - Cons: Likely to discard the latest call leading to a loss of data
 */
export type DebouncerType = "queuedImmediate" | "queuedIdle" | "discardingImmediate";

export type DebouncerFunc<TArgs> = (...args: TArgs[]) => void | unknown;

export type DebouncerListener<TArgs> = [time: number, fn: DebouncerFunc<TArgs>];

//#region class

/**
 * A debouncer that calls all listeners after a specified timeout, discarding all calls in-between.  
 * It is very useful for event listeners that fire quickly, like `input` or `mousemove`, to prevent the listeners from being called too often and hogging resources.  
 * The exact behavior can be customized with the `type` parameter.  
 *   
 * The instance inherits from NanoEmitter and emits the following events:  
 * - `call` - emitted when the debouncer calls all listeners
 * - `change` - emitted when the timeout or edge type is changed
 */
export class Debouncer<TArgs> extends NanoEmitter<{
  call: DebouncerFunc<TArgs>;
  change: (timeout: number, type: DebouncerType) => void;
}> {
  /** All registered listener functions and the time they were attached */
  protected listeners: DebouncerListener<TArgs>[] = [];

  /** The latest call that was queued */
  protected queuedListener: DebouncerListener<TArgs> | undefined = undefined;

  /** Whether the timeout is currently active */
  protected timeoutActive = false;

  /**
   * Creates a new debouncer with the specified timeout and edge type.
   * @param timeout Timeout in milliseconds between letting through calls - defaults to 200
   * @param type The type of edge to use for the debouncer - see {@linkcode DebouncerType} for details or [this issue for an explanation and diagram](https://github.com/Sv443-Network/UserUtils/issues/46) - defaults to "queuedImmediate"
   */
  constructor(protected timeout = 200, protected type: DebouncerType = "queuedImmediate") {
    super();
  }

  //#region listeners

  /** Adds a listener function that will be called on timeout */
  public addListener(fn: DebouncerFunc<TArgs>) {
    return this.listeners.push([Date.now(), fn]);
  }

  /** Removes the listener with the specified function reference */
  public removeListener(fn: DebouncerFunc<TArgs>) {
    const idx = this.listeners.findIndex((l) => l[1] === fn);
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
    return this.timeoutActive;
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
    const cl = () => {
      this.emit("call", ...args);
      this.timeoutActive = false;
      this.queuedListener = undefined;
    };

    if(this.timeoutActive) {
      this.queuedListener = [Date.now(), cl];
      return;
    }

    this.timeoutActive = true;

    switch(this.type) {
    case "queuedImmediate":
      cl();
      setTimeout(() => this.timeoutActive = false, this.timeout);
      break;
    case "queuedIdle":
      setTimeout(() => {
        if(this.queuedListener) {
          this.emit("call", ...args);
          this.timeoutActive = false;
          this.queuedListener = undefined;
        }
      }, this.timeout);
      break;
    case "discardingImmediate":
      setTimeout(() => this.timeoutActive = false, this.timeout);
      cl();
      break;
    default:
      throw new Error(`Unknown debouncer edge type: ${this.type}`);
    }
  }
}

//#region debounce fn

/**
 * Creates a {@linkcode Debouncer} instance with the specified timeout and edge type and attaches the passed function as a listener.  
 * The returned function can be called with any arguments and will execute the `call()` method of the debouncer.  
 * The debouncer instance is accessible via the `debouncer` property of the returned function.
 */
export function debounce<
  TFunc extends DebouncerFunc<TArgs>,
  TArgs,
> (
  fn: TFunc,
  timeout = 200,
  edge: DebouncerType = "queuedImmediate"
): DebouncerFunc<TArgs> & { debouncer: Debouncer<TArgs> } {
  const debouncer = new Debouncer<TArgs>(timeout, edge);
  debouncer.addListener(fn);

  const func = (...args: TArgs[]) => debouncer.call(...args);
  func.debouncer = debouncer;

  return func;
}

//#region #DBG old

// TODO:FIXME: https://github.com/Sv443-Network/UserUtils/issues/46
/**
 * Calls the passed {@linkcode func} after the specified {@linkcode timeout} in ms (defaults to 300).  
 * Any subsequent calls to this function will reset the timer and discard all previous calls.
 * @param func The function to call after the timeout
 * @param timeout The time in ms to wait before calling the function
 * @param edge Whether to call the function at the very first call ("rising" edge) or the very last call ("falling" edge, default)
 * @deprecated Replaced by {@linkcode Debouncer} and {@linkcode debounce()}
 */
export function debounceOld<
  TFunc extends (...args: TArgs[]) => void,
  TArgs = unknown,
> (
  func: TFunc,
  timeout = 300,
  edge: "rising" | "falling" = "falling"
): (...args: TArgs[]) => void {
  let id: ReturnType<typeof setTimeout> | undefined;

  return function(...args: TArgs[]) {
    if(edge === "rising") {
      if(!id) {
        func.apply(this, args);
        id = setTimeout(() => id = undefined, timeout);
      }
    }
    else {
      clearTimeout(id);
      id = setTimeout(() => func.apply(this, args), timeout);
    }
  };
}
