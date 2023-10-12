/** Options for the `onSelector()` method of {@linkcode SelectorObserver} */
export type OnSelectorOptions<TElem extends Element = HTMLElement> = SelectorOptionsOne<TElem> | SelectorOptionsAll<TElem>;

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

/** Observes the children of the given element for changes */
export class SelectorObserver {
  private enabled = true;
  private baseElement: Element;
  private observer: MutationObserver;
  private observerOptions: MutationObserverInit;
  private listenerMap = new Map<string, OnSelectorOptions[]>();

  /**
   * Creates a new SelectorObserver that will observe the children of the given base element for changes (only creation and deletion of elements by default)
   * @param options fine-tune what triggers the MutationObserver's checking function - `subtree` and `childList` are set to true by default
   */
  constructor(baseElement: Element, observerOptions?: MutationObserverInit) {
    this.baseElement = baseElement;

    this.observer = new MutationObserver(this.checkSelectors);
    this.observerOptions = observerOptions ?? {};

    this.enable();
  }

  private checkSelectors() {
    for(const [selector, listeners] of this.listenerMap.entries()) {
      if(!this.enabled)
        return;

      const all = listeners.some(listener => listener.all);
      const one = listeners.some(listener => !listener.all);

      const allElements = all ? this.baseElement.querySelectorAll<HTMLElement>(selector) : null;
      const oneElement = one ? this.baseElement.querySelector<HTMLElement>(selector) : null;

      for(const options of listeners) {
        if(!this.enabled)
          return;
        if(options.all) {
          if(allElements && allElements.length > 0) {
            options.listener(allElements);
            if(!options.continuous)
              this.listenerMap.get(selector)!.splice(this.listenerMap.get(selector)!.indexOf(options), 1);
          }
        } else {
          if(oneElement) {
            options.listener(oneElement);
            if(!options.continuous)
              this.listenerMap.get(selector)!.splice(this.listenerMap.get(selector)!.indexOf(options), 1);
          }
        }
      }
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
  public addListener<TElem extends Element = HTMLElement>(selector: string, options: OnSelectorOptions<TElem>) {
    options = { all: false, continuous: false, debounce: 0, ...options };
    if(options.debounce && options.debounce > 0)
      options.listener = this.debounce(options.listener as ((arg: NodeListOf<Element> | Element) => void), options.debounce);
    if(this.listenerMap.has(selector))
      this.listenerMap.get(selector)!.push(options as OnSelectorOptions<Element>);
    else
      this.listenerMap.set(selector, [options as OnSelectorOptions<Element>]);
  }

  /** Disables the observation of the child elements */
  public disable() {
    if(!this.enabled)
      return;
    this.enabled = false;
    this.observer.disconnect();
  }

  /** Reenables the observation of the child elements */
  public enable() {
    if(this.enabled)
      return;
    this.enabled = true;
    this.observer.observe(this.baseElement, {
      childList: true,
      subtree: true,
      ...this.observerOptions,
    });
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
  public removeListener(selector: string, options: OnSelectorOptions) {
    const listeners = this.listenerMap.get(selector);
    if(!listeners)
      return false;
    const index = listeners.indexOf(options);
    if(index !== -1) {
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
