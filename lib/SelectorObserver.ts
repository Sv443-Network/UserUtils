/** Options for the `onSelector()` method of {@linkcode SelectorObserver} */
export type SelectorListenerOptions<TElem extends Element = HTMLElement> = SelectorOptionsOne<TElem> | SelectorOptionsAll<TElem>;

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
};

export type SelectorObserverOptions = MutationObserverInit & {
  /** If set, applies this debounce in milliseconds to all listeners that don't have their own debounce set */
  defaultDebounce?: number;
};

/** Observes the children of the given element for changes */
export class SelectorObserver {
  private enabled = false;
  private baseElement: Element | string;
  private observer: MutationObserver;
  private observerOptions: SelectorObserverOptions;
  private listenerMap: Map<string, SelectorListenerOptions[]>;

  /**
   * Creates a new SelectorObserver that will observe the children of the given base element selector for changes (only creation and deletion of elements by default)
   * @param baseElementSelector The selector of the element to observe
   * @param options Fine-tune what triggers the MutationObserver's checking function - `subtree` and `childList` are set to true by default
   */
  constructor(baseElementSelector: string, options: SelectorObserverOptions)
  /**
   * Creates a new SelectorObserver that will observe the children of the given base element for changes (only creation and deletion of elements by default)
   * @param baseElement The element to observe
   * @param options Fine-tune what triggers the MutationObserver's checking function - `subtree` and `childList` are set to true by default
   */
  constructor(baseElement: Element, options: SelectorObserverOptions)
  constructor(baseElement: Element | string, options: SelectorObserverOptions = {}) {
    this.baseElement = baseElement;

    this.listenerMap = new Map<string, SelectorListenerOptions[]>();
    // if the arrow func isn't there, `this` will be undefined in the callback
    this.observer = new MutationObserver(() => this.checkAllSelectors());
    this.observerOptions = {
      childList: true,
      subtree: true,
      ...options,
    };
  }

  private checkAllSelectors() {
    for(const [selector, listeners] of this.listenerMap.entries())
      this.checkSelector(selector, listeners);
  }

  private checkSelector(selector: string, listeners: SelectorListenerOptions[]) {
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
    }
  }

  private debounce<TArgs>(func: (...args: TArgs[]) => void, time: number): (...args: TArgs[]) => void {
    let timeout: number;
    return function(...args: TArgs[]) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), time) as unknown as number;
    };
  }

  /**
   * Starts observing the children of the base element for changes to the given {@linkcode selector} according to the set {@linkcode options}
   * @param selector The selector to observe
   * @param options Options for the selector observation
   * @param options.listener Gets called whenever the selector was found in the DOM
   * @param [options.all] Whether to use `querySelectorAll()` instead - default is false
   * @param [options.continuous] Whether to call the listener continuously instead of just once - default is false
   * @param [options.debounce] Whether to debounce the listener to reduce calls to `querySelector` or `querySelectorAll` - set undefined or <=0 to disable (default)
   */
  public addListener<TElem extends Element = HTMLElement>(selector: string, options: SelectorListenerOptions<TElem>) {
    options = { all: false, continuous: false, debounce: 0, ...options };
    if((options.debounce && options.debounce > 0) || (this.observerOptions.defaultDebounce && this.observerOptions.defaultDebounce > 0)) {
      options.listener = this.debounce(
        options.listener as ((arg: NodeListOf<Element> | Element) => void),
        (options.debounce || this.observerOptions.defaultDebounce)!,
      );
    }
    if(this.listenerMap.has(selector))
      this.listenerMap.get(selector)!.push(options as SelectorListenerOptions<Element>);
    else
      this.listenerMap.set(selector, [options as SelectorListenerOptions<Element>]);

    this.checkSelector(selector, [options as SelectorListenerOptions<Element>]);
  }

  /** Disables the observation of the child elements */
  public disable() {
    if(!this.enabled)
      return;
    this.enabled = false;
    this.observer.disconnect();
  }

  /**
   * Enables or reenables the observation of the child elements.
   * @param immediatelyCheckSelectors Whether to immediately check if all previously registered selectors exist (default is true)
   * @returns Returns true when the observation was enabled, false otherwise (e.g. when the base element wasn't found)
   */
  public enable(immediatelyCheckSelectors = true) {
    const baseElement = typeof this.baseElement === "string" ? document.querySelector(this.baseElement) : this.baseElement;
    if(this.enabled || !baseElement)
      return false;
    this.enabled = true;
    this.observer.observe(baseElement, this.observerOptions);
    if(immediatelyCheckSelectors)
      this.checkAllSelectors();
    return true;
  }

  /** Returns whether the observation of the child elements is currently enabled */
  public isEnabled() {
    return this.enabled;
  }

  /** Removes all listeners that have been registered with {@linkcode addListener()} */
  public clearListeners() {
    this.listenerMap.clear();
  }

  /**
   * Removes all listeners for the given {@linkcode selector} that have been registered with {@linkcode addListener()}
   * @returns Returns true when all listeners for the associated selector were found and removed, false otherwise
   */
  public removeAllListeners(selector: string) {
    return this.listenerMap.delete(selector);
  }

  /**
   * Removes a single listener for the given {@linkcode selector} and {@linkcode options} that has been registered with {@linkcode addListener()}
   * @returns Returns true when the listener was found and removed, false otherwise
   */
  public removeListener(selector: string, options: SelectorListenerOptions) {
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
  public getAllListeners() {
    return this.listenerMap;
  }

  /** Returns all listeners for the given {@linkcode selector} that have been registered with {@linkcode addListener()} */
  public getListeners(selector: string) {
    return this.listenerMap.get(selector);
  }
}
