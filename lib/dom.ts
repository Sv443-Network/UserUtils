/**
 * Returns `unsafeWindow` if the `@grant unsafeWindow` is given, otherwise falls back to the regular `window`
 */
export function getUnsafeWindow(): Window {
  try {
    // throws ReferenceError if the "@grant unsafeWindow" isn't present
    return unsafeWindow;
  }
  catch(e) {
    return window;
  }
}

/**
 * Adds a parent container around the provided element
 * @returns Returns the new parent element
 */
export function addParent<TElem extends Element, TParentElem extends Element>(element: TElem, newParent: TParentElem): TParentElem {
  const oldParent = element.parentNode;

  if(!oldParent)
    throw new Error("Element doesn't have a parent node");

  oldParent.replaceChild(newParent, element);
  newParent.appendChild(element);

  return newParent;
}

/**
 * Adds global CSS style in the form of a `<style>` element in the document's `<head>`  
 * This needs to be run after the `DOMContentLoaded` event has fired on the document object (or instantly if `@run-at document-end` is used).
 * @param style CSS string
 * @returns Returns the created style element
 */
export function addGlobalStyle(style: string): HTMLStyleElement {
  const styleElem = document.createElement("style");
  styleElem.innerHTML = style;
  document.head.appendChild(styleElem);
  return styleElem;
}

/**
 * Preloads an array of image URLs so they can be loaded instantly from the browser cache later on
 * @param rejects If set to `true`, the returned PromiseSettledResults will contain rejections for any of the images that failed to load
 * @returns Returns an array of `PromiseSettledResult` - each resolved result will contain the loaded image element, while each rejected result will contain an `ErrorEvent`
 */
export function preloadImages(srcUrls: string[], rejects = false): Promise<PromiseSettledResult<HTMLImageElement>[]> {
  const promises = srcUrls.map(src => new Promise<HTMLImageElement>((res, rej) => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", () => res(image));
    image.addEventListener("error", (evt) => rejects && rej(evt));
  }));

  return Promise.allSettled(promises);
}

/**
 * Tries to use `GM.openInTab` to open the given URL in a new tab, otherwise if the grant is not given, creates an invisible anchor element and clicks it.  
 * For the fallback to work, this function needs to be run in response to a user interaction event, else the browser might reject it.
 * @param href The URL to open in a new tab
 * @param background If set to `true`, the tab will be opened in the background - set to `undefined` (default) to use the browser's default behavior
 */
export function openInNewTab(href: string, background?: boolean) {
  try {
    GM.openInTab(href, background);
  }
  catch(e) {
    const openElem = document.createElement("a");
    Object.assign(openElem, {
      className: "userutils-open-in-new-tab",
      target: "_blank",
      rel: "noopener noreferrer",
      href,
    });
    openElem.style.display = "none";

    document.body.appendChild(openElem);
    openElem.click();
    // timeout just to be safe
    setTimeout(openElem.remove, 50);
  }
}

/**
 * Intercepts the specified event on the passed object and prevents it from being called if the called {@linkcode predicate} function returns a truthy value.  
 * If no predicate is specified, all events will be discarded.  
 * This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
 * Calling this function will set `Error.stackTraceLimit = 100` (if not already higher) to ensure the stack trace is preserved.
 */
export function interceptEvent<
  TEvtObj extends EventTarget,
  TPredicateEvt extends Event
> (
  eventObject: TEvtObj,
  eventName: Parameters<TEvtObj["addEventListener"]>[0],
  predicate: (event: TPredicateEvt) => boolean = () => true,
): void {
  // default is 25 on FF so this should hopefully be more than enough
  // @ts-ignore
  Error.stackTraceLimit = Math.max(Error.stackTraceLimit, 100);
  if(isNaN(Error.stackTraceLimit))
    Error.stackTraceLimit = 100;

  (function(original: typeof eventObject.addEventListener) {
    // @ts-ignore
    eventObject.__proto__.addEventListener = function(...args: Parameters<typeof eventObject.addEventListener>) {
      const origListener = typeof args[1] === "function" ? args[1] : args[1]?.handleEvent ?? (() => void 0);
      args[1] = function(...a) {
        if(args[0] === eventName && predicate((Array.isArray(a) ? a[0] : a) as TPredicateEvt))
          return;
        else
          return origListener.apply(this, a);
      };
      original.apply(this, args);
    };
    // @ts-ignore
  })(eventObject.__proto__.addEventListener);
}

/**
 * Intercepts the specified event on the window object and prevents it from being called if the called {@linkcode predicate} function returns a truthy value.  
 * If no predicate is specified, all events will be discarded.  
 * This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
 * Calling this function will set `Error.stackTraceLimit = 100` (if not already higher) to ensure the stack trace is preserved.
 */
export function interceptWindowEvent<TEvtKey extends keyof WindowEventMap>(
  eventName: TEvtKey,
  predicate: (event: WindowEventMap[TEvtKey]) => boolean = () => true,
): void {  
  return interceptEvent(getUnsafeWindow(), eventName, predicate);
}

/** Checks if an element is scrollable in the horizontal and vertical directions */
export function isScrollable(element: Element): Record<"vertical" | "horizontal", boolean> {
  const { overflowX, overflowY } = getComputedStyle(element);
  return {
    vertical: (overflowY === "scroll" || overflowY === "auto") && element.scrollHeight > element.clientHeight,
    horizontal: (overflowX === "scroll" || overflowX === "auto") && element.scrollWidth > element.clientWidth,
  };
}

/**
 * Executes the callback when the passed element's property changes.  
 * Contrary to an element's attributes, properties can usually not be observed with a MutationObserver.  
 * This function shims the getter and setter of the property to invoke the callback.  
 *   
 * [Source](https://stackoverflow.com/a/61975440)
 * @param property The name of the property to observe
 * @param callback Callback to execute when the value is changed
 */
export function observeElementProp<
  TElem extends Element = HTMLElement,
  TPropKey extends keyof TElem = keyof TElem,
> (
  element: TElem,
  property: TPropKey,
  callback: (oldVal: TElem[TPropKey], newVal: TElem[TPropKey]) => void
): void {
  const elementPrototype = Object.getPrototypeOf(element);
  // eslint-disable-next-line no-prototype-builtins
  if(elementPrototype.hasOwnProperty(property)) {
    const descriptor = Object.getOwnPropertyDescriptor(elementPrototype, property);
    Object.defineProperty(element, property, {
      get: function() {
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        return descriptor?.get?.apply(this, arguments);
      },
      set: function() {
        const oldValue = this[property];
        // @ts-ignore
        // eslint-disable-next-line prefer-rest-params
        descriptor?.set?.apply(this, arguments);
        const newValue = this[property];
        if(typeof callback === "function") {
          // @ts-ignore
          callback.bind(this, oldValue, newValue);
        }
        return newValue;
      }
    });
  }
}

/**
 * Returns a "frame" of the closest siblings of the {@linkcode refElement}, based on the passed amount of siblings and {@linkcode refElementAlignment}
 * @param refElement The reference element to return the relative closest siblings from
 * @param siblingAmount The amount of siblings to return
 * @param refElementAlignment Can be set to `center-top` (default), `center-bottom`, `top`, or `bottom`, which will determine where the relative location of the provided {@linkcode refElement} is in the returned array
 * @param includeRef If set to `true` (default), the provided {@linkcode refElement} will be included in the returned array at the corresponding position
 * @template TSibling The type of the sibling elements that are returned
 * @returns An array of sibling elements
 */
export function getSiblingsFrame<
  TSibling extends Element = HTMLElement,
> (
  refElement: Element,
  siblingAmount: number,
  refElementAlignment: "center-top" | "center-bottom" | "top" | "bottom" = "center-top",
  includeRef = true,
): TSibling[] {
  const siblings = [...refElement.parentNode?.childNodes ?? []] as TSibling[];
  const elemSiblIdx = siblings.indexOf(refElement as TSibling);

  if(elemSiblIdx === -1)
    throw new Error("Element doesn't have a parent node");

  if(refElementAlignment === "top")
    return [...siblings.slice(elemSiblIdx + Number(!includeRef), elemSiblIdx + siblingAmount + Number(!includeRef))];
  else if(refElementAlignment.startsWith("center-")) {
    // if the amount of siblings is even, one of the two center ones will be decided by the value of `refElementAlignment`
    const halfAmount = (refElementAlignment === "center-bottom" ? Math.ceil : Math.floor)(siblingAmount / 2);
    const startIdx = Math.max(0, elemSiblIdx - halfAmount);
    // if the amount of siblings is even, the top offset of 1 will be applied whenever `includeRef` is set to true
    const topOffset = Number(refElementAlignment === "center-top" && siblingAmount % 2 === 0 && includeRef);
    // if the amount of siblings is odd, the bottom offset of 1 will be applied whenever `includeRef` is set to true
    const btmOffset = Number(refElementAlignment === "center-bottom" && siblingAmount % 2 !== 0 && includeRef);
    const startIdxWithOffset = startIdx + topOffset + btmOffset;

    // filter out the reference element if `includeRef` is set to false,
    // then slice the array to the desired framing including the offsets
    return [
      ...siblings
        .filter((_, idx) => includeRef || idx !== elemSiblIdx)
        .slice(startIdxWithOffset, startIdxWithOffset + siblingAmount)
    ];
  }
  else if(refElementAlignment === "bottom")
    return [...siblings.slice(elemSiblIdx - siblingAmount + Number(includeRef), elemSiblIdx + Number(includeRef))];

  return [] as TSibling[];
}
