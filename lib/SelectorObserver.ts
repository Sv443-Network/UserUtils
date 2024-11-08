import { debounce } from "./misc.js";
import type { Prettify } from "./types.js";

let domLoaded = false;
document.addEventListener("DOMContentLoaded", () => domLoaded = true);

/** Options for the `onSelector()` method of {@linkcode SelectorObserver} */
export type SelectorListenerOptions<TElem extends Element = HTMLElement> = Prettify<SelectorOptionsOne<TElem> | SelectorOptionsAll<TElem>>;

type SelectorOptionsOne<TElem extends Element> = SelectorOptionsCommon & {
  /** Whether to use `querySelectorAll()` instead - default is false */
  all?: false;
  /** Gets called whenever the selector was found in the DOM */
  listener: (element: TElem) => void;
};

type SelectorOptionsAll<TElem extends Element> = SelectorOptionsCommon & {
  /** Whether to use `querySelectorAll()` instead - default is false */
  all: true;
  /** Gets called whenever the selector was found in the DOM */
  listener: (elements: NodeListOf<TElem>) => void;
};

type SelectorOptionsCommon = {
  /** Whether to call the listener continuously instead of once - default is false */
  continuous?: boolean;
  /** Whether to debounce the listener to reduce calls to `querySelector` or `querySelectorAll` - set undefined or <=0 to disable (default) */
  debounce?: number;
  /** Whether to call the function at the very first call ("rising" edge) or the very last call ("falling" edge, default) */
  debounceEdge?: "rising" | "falling";
};

type UnsubscribeFunction = () => void;

export type SelectorObserverOptions = {
  /** If set, applies this debounce in milliseconds to all listeners that don't have their own debounce set */
  defaultDebounce?: number;
  /**
   * If set, applies this debounce edge to all listeners that don't have their own set.  
   * Edge = Whether to call the function at the very first call ("rising" edge) or the very last call ("falling" edge, default)
   */
  defaultDebounceEdge?: "rising" | "falling";
  /** Whether to disable the observer when no listeners are present - default is true */
  disableOnNoListeners?: boolean;
  /** Whether to ensure the observer is enabled when a new listener is added - default is true */
  enableOnAddListener?: boolean;
  /** If set to a number, the checks will be run on interval instead of on mutation events - in that case all MutationObserverInit props will be ignored */
  checkInterval?: number;
};

export type SelectorObserverConstructorOptions = Prettify<SelectorObserverOptions & MutationObserverInit>;

/** Observes the children of the given element for changes */
export class SelectorObserver {
  private enabled = false;
  private baseElement: Element | string;
  private observer?: MutationObserver;
  private observerOptions: MutationObserverInit;
  private customOptions: SelectorObserverOptions;
  private listenerMap: Map<string, SelectorListenerOptions[]>;

  /**
   * Creates a new SelectorObserver that will observe the children of the given base element selector for changes (only creation and deletion of elements by default)
   * @param baseElementSelector The selector of the element to observe
   * @param options Fine-tune what triggers the MutationObserver's checking function - `subtree` and `childList` are set to true by default
   */
  constructor(baseElementSelector: string, options?: SelectorObserverConstructorOptions)
  /**
   * Creates a new SelectorObserver that will observe the children of the given base element for changes (only creation and deletion of elements by default)
   * @param baseElement The element to observe
   * @param options Fine-tune what triggers the MutationObserver's checking function - `subtree` and `childList` are set to true by default
   */
  constructor(baseElement: Element, options?: SelectorObserverConstructorOptions)
  constructor(baseElement: Element | string, options: SelectorObserverConstructorOptions = {}) {
    this.baseElement = baseElement;

    this.listenerMap = new Map<string, SelectorListenerOptions[]>();

    const {
      defaultDebounce,
      defaultDebounceEdge,
      disableOnNoListeners,
      enableOnAddListener,
      ...observerOptions
    } = options;

    this.observerOptions = {
      childList: true,
      subtree: true,
      ...observerOptions,
    };

    this.customOptions = {
      defaultDebounce: defaultDebounce ?? 0,
      defaultDebounceEdge: defaultDebounceEdge ?? "rising",
      disableOnNoListeners: disableOnNoListeners ?? false,
      enableOnAddListener: enableOnAddListener ?? true,
    };

    if(typeof this.customOptions.checkInterval !== "number") {
      // if the arrow func isn't there, `this` will be undefined in the callback
      this.observer = new MutationObserver(() => this.checkAllSelectors());
    }
    else {
      this.checkAllSelectors();
      setInterval(() => this.checkAllSelectors(), this.customOptions.checkInterval);
    }
  }

  /** Call to check all selectors in the {@linkcode listenerMap} using {@linkcode checkSelector()} */
  protected checkAllSelectors(): void {
    if(!this.enabled || !domLoaded)
      return;

    for(const [selector, listeners] of this.listenerMap.entries())
      this.checkSelector(selector, listeners);
  }

  /** Checks if the element(s) with the given {@linkcode selector} exist in the DOM and calls the respective {@linkcode listeners} accordingly */
  protected checkSelector(selector: string, listeners: SelectorListenerOptions[]): void {
    if(!this.enabled)
      return;

    const baseElement = typeof this.baseElement === "string" ? document.querySelector(this.baseElement) : this.baseElement;

    if(!baseElement)
      return;

    const all = listeners.some(listener => listener.all);
    const one = listeners.some(listener => !listener.all);

    const allElements = all ? baseElement.querySelectorAll<HTMLElement>(selector) : null;
    const oneElement = one ? baseElement.querySelector<HTMLElement>(selector) : null;

    for(const options of listeners) {
      if(options.all) {
        if(allElements && allElements.length > 0) {
          options.listener(allElements);
          if(!options.continuous)
            this.removeListener(selector, options);
        }
      }
      else {
        if(oneElement) {
          options.listener(oneElement);
          if(!options.continuous)
            this.removeListener(selector, options);
        }
      }
      if(this.listenerMap.get(selector)?.length === 0)
        this.listenerMap.delete(selector);
      if(this.listenerMap.size === 0 && this.customOptions.disableOnNoListeners)
        this.disable();
    }
  }

  /**
   * Starts observing the children of the base element for changes to the given {@linkcode selector} according to the set {@linkcode options}
   * @param selector The selector to observe
   * @param options Options for the selector observation
   * @param options.listener Gets called whenever the selector was found in the DOM
   * @param [options.all] Whether to use `querySelectorAll()` instead - default is false
   * @param [options.continuous] Whether to call the listener continuously instead of just once - default is false
   * @param [options.debounce] Whether to debounce the listener to reduce calls to `querySelector` or `querySelectorAll` - set undefined or <=0 to disable (default)
   * @returns Returns a function that can be called to remove this listener more easily
   */
  public addListener<TElem extends Element = HTMLElement>(selector: string, options: SelectorListenerOptions<TElem>): UnsubscribeFunction {
    options = {
      all: false,
      continuous: false,
      debounce: 0,
      ...options,
    };

    if((options.debounce && options.debounce > 0) || (this.customOptions.defaultDebounce && this.customOptions.defaultDebounce > 0)) {
      options.listener = debounce(
        options.listener as ((arg: NodeListOf<Element> | Element) => void),
        (options.debounce || this.customOptions.defaultDebounce)!,
        (options.debounceEdge || this.customOptions.defaultDebounceEdge),
      ) as (arg: NodeListOf<Element> | Element) => void;
    }

    if(this.listenerMap.has(selector))
      this.listenerMap.get(selector)!.push(options as SelectorListenerOptions<Element>);
    else
      this.listenerMap.set(selector, [options as SelectorListenerOptions<Element>]);

    if(this.enabled === false && this.customOptions.enableOnAddListener)
      this.enable();

    this.checkSelector(selector, [options as SelectorListenerOptions<Element>]);

    return () => this.removeListener(selector, options as SelectorListenerOptions<Element>);
  }

  /** Disables the observation of the child elements */
  public disable(): void {
    if(!this.enabled)
      return;
    this.enabled = false;
    this.observer?.disconnect();
  }

  /**
   * Enables or reenables the observation of the child elements.
   * @param immediatelyCheckSelectors Whether to immediately check if all previously registered selectors exist (default is true)
   * @returns Returns true when the observation was enabled, false otherwise (e.g. when the base element wasn't found)
   */
  public enable(immediatelyCheckSelectors = true): boolean {
    const baseElement = typeof this.baseElement === "string" ? document.querySelector(this.baseElement) : this.baseElement;
    if(this.enabled || !baseElement)
      return false;
    this.enabled = true;
    this.observer?.observe(baseElement, this.observerOptions);
    if(immediatelyCheckSelectors)
      this.checkAllSelectors();
    return true;
  }

  /** Returns whether the observation of the child elements is currently enabled */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /** Removes all listeners that have been registered with {@linkcode addListener()} */
  public clearListeners(): void {
    this.listenerMap.clear();
  }

  /**
   * Removes all listeners for the given {@linkcode selector} that have been registered with {@linkcode addListener()}
   * @returns Returns true when all listeners for the associated selector were found and removed, false otherwise
   */
  public removeAllListeners(selector: string): boolean {
    return this.listenerMap.delete(selector);
  }

  /**
   * Removes a single listener for the given {@linkcode selector} and {@linkcode options} that has been registered with {@linkcode addListener()}
   * @returns Returns true when the listener was found and removed, false otherwise
   */
  public removeListener(selector: string, options: SelectorListenerOptions): boolean {
    const listeners = this.listenerMap.get(selector);
    if(!listeners)
      return false;
    const index = listeners.indexOf(options);
    if(index > -1) {
      listeners.splice(index, 1);
      return true;
    }
    return false;
  }

  /** Returns all listeners that have been registered with {@linkcode addListener()} */
  public getAllListeners(): Map<string, SelectorListenerOptions<HTMLElement>[]> {
    return this.listenerMap;
  }

  /** Returns all listeners for the given {@linkcode selector} that have been registered with {@linkcode addListener()} */
  public getListeners(selector: string): SelectorListenerOptions<HTMLElement>[] | undefined {
    return this.listenerMap.get(selector);
  }
}
