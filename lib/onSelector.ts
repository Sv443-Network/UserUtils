import type { InitOnSelectorOpts, OnSelectorOpts } from "./types";

const selectorMap = new Map<string, OnSelectorOpts[]>();

/**
 * Calls the `listener` as soon as the `selector` exists in the DOM.  
 * Listeners are deleted when they are called once, unless `options.continuous` is set.  
 * Multiple listeners with the same selector may be registered.
 * @param selector The selector to listen for
 * @param options Used for switching to `querySelectorAll()` and for calling the listener continuously
 * @template TElem The type of element that the listener will return as its argument (defaults to the generic HTMLElement)
 */
export function onSelector<TElem extends Element = HTMLElement>(
  selector: string,
  options: OnSelectorOpts<TElem>,
) {
  let selectorMapItems: OnSelectorOpts[] = [];
  if(selectorMap.has(selector))
    selectorMapItems = selectorMap.get(selector)!;

  // I don't feel like dealing with intersecting types, this should work just fine at runtime
  // @ts-ignore
  selectorMapItems.push(options);

  selectorMap.set(selector, selectorMapItems);
  checkSelectorExists(selector, selectorMapItems);
}

/**
 * Removes all listeners registered in `onSelector()` that have the given selector
 * @returns Returns true when all listeners with the associated selector were found and removed, false otherwise
 */
export function removeOnSelector(selector: string) {
  return selectorMap.delete(selector);
}

function checkSelectorExists<TElem extends Element = HTMLElement>(selector: string, options: OnSelectorOpts<TElem>[]) {
  const deleteIndices: number[] = [];
  options.forEach((option, i) => {
    try {
      const elements = option.all ? document.querySelectorAll<HTMLElement>(selector) : document.querySelector<HTMLElement>(selector);
      if(elements) {
        // I don't feel like dealing with intersecting types, this should work just fine at runtime
        // @ts-ignore
        option.listener(elements);
        if(!option.continuous)
          deleteIndices.push(i);
      }
    }
    catch(err) {
      console.error(`Couldn't call listener for selector '${selector}'`, err);
    }
  });
  if(deleteIndices.length > 0) {
    const newOptsArray = options.filter((_, i) => !deleteIndices.includes(i));
    if(newOptsArray.length === 0)
      selectorMap.delete(selector);
    else {
      // once again laziness strikes
      // @ts-ignore
      selectorMap.set(selector, newOptsArray);
    }
  }
}

/**
 * Initializes a MutationObserver that checks for all registered selectors whenever an element is added to or removed from the `<body>`
 * @param opts For fine-tuning when the MutationObserver checks for the selectors
 */
export function initOnSelector(opts: InitOnSelectorOpts = {}) {
  const observer = new MutationObserver(() => {
    for(const [selector, options] of selectorMap.entries())
      checkSelectorExists(selector, options);
  });

  observer.observe(document.body, {
    ...opts,
    // subtree: true, // this setting applies the options to the childList (which isn't necessary in this use case)
    childList: true,
  });
}
