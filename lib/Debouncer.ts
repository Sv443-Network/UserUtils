import { NanoEmitter } from "./NanoEmitter.js";

/**
 * The type of edge to use for the debouncer - [see this issue for an explanation and diagram.](https://github.com/Sv443-Network/UserUtils/issues/46)  
 * - `queuedImmediate`  
 *   (Default & recommended) calls the listeners at the very first call ("rising" edge) and queues the latest call until the timeout expires  
 *   Pros: reacts immediately, doesn't delete the last call  
 *   Cons: All subsequent calls are delayed by the timeout duration
 * - `queuedIdle`  
 *   Queues all calls until there are no more calls in the given timeout duration ("falling" edge), and only then executes the very last call  
 *   Pros: Always makes sure the last call is executed  
 *   Cons: Calls are always delayed by the timeout duration, first call is likely to be discarded, calls could get stuck in the queue indefinitely if the calls are made faster than the timeout
 * - `discardingImmediate`  
 *   Calls the listeners at the very last call ("falling" edge), then allows another through after the timeout expired, without queuing any calls  
 *   Pros: Always acts upon calls immediately without delaying them in a queue, interval is somewhat predictable with events that fire often  
 *   Cons: Likely to discard the latest call leading to a loss of data
 */
export type DebouncerEdgeType = "queuedImmediate" | "queuedIdle" | "discardingImmediate";

/**
 * A debouncer that calls all listeners after a specified timeout, discarding all calls in-between.  
 * It is very useful for event listeners that fire quickly, like `input` or `mousemove`, to prevent the listeners from being called too often and hogging resources.  
 *   
 * The exact behavior can be customized with the `edge` parameter.  
 */
export class Debouncer<TArgs> extends NanoEmitter<{
  call: (...args: TArgs[]) => void;
  change: (timeout: number, edge: DebouncerEdgeType) => void;
}> {
  /** All registered listener functions and the time they were attached */
  protected listeners: [time: number, fn: (...args: TArgs[]) => void | unknown][] = [];
  /** The latest call that was queued */
  protected queuedCall: typeof this.listeners[number] | undefined = undefined;

  constructor(protected timeout = 200, protected edge: DebouncerEdgeType = "queuedImmediate") {
    super();
  }

  /** Sets the timeout for the debouncer */
  public setTimeout(timeout: number) {
    this.emit("change", this.timeout = timeout, this.edge);
  }

  /** Sets the edge type for the debouncer */
  public setEdge(edge: DebouncerEdgeType) {
    this.emit("change", this.timeout, this.edge = edge);
  }

  /** Adds a listener function that will be called on timeout */
  public addListener(fn: (...args: TArgs[]) => void | unknown) {
    return this.listeners.push([Date.now(), fn]);
  }

  /** Removes the listener with the specified function reference */
  public removeListener(fn: (...args: TArgs[]) => void | unknown) {
    const idx = this.listeners.findIndex((l) => l[1] === fn);
    idx !== -1 && this.listeners.splice(idx, 1);
  }

  /** Use this to call the debouncer with the specified arguments that will be passed to all listener functions registered with {@linkcode addListener()} */
  public call(...args: TArgs[]) {
    void ["TODO:", args];
  }
}

export function debounce<
  TFunc extends (...args: TArgs[]) => void | unknown,
  TArgs,
> (fn: TFunc, timeout = 200, edge: DebouncerEdgeType = "queuedImmediate"): (...args: TArgs[]) => void {
  const debouncer = new Debouncer<TArgs>(timeout, edge);
  debouncer.addListener(fn);

  // TODO:
}
