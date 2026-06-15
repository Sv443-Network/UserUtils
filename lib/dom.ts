/**
 * @module lib/dom
 * This module contains various functions for working with the DOM - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#dom)
 */

import { getUnsafeWindow } from "./domHeadless.js";
import { PlatformError } from "./Errors.js";

//#region preloadImages

/**
 * Preloads an array of image URLs so they can be loaded instantly from the browser cache later on
 * @param rejects If set to `true`, the returned PromiseSettledResults will contain rejections for any of the images that failed to load. Is set to `false` by default.
 * @returns Returns an array of `PromiseSettledResult` - each resolved result will contain the loaded image element, while each rejected result will contain an `ErrorEvent`
 */
export function preloadImages(srcUrls: string[], rejects = false): Promise<PromiseSettledResult<HTMLImageElement>[]> {
  const promises = srcUrls.map(src => new Promise<HTMLImageElement>((res, rej) => {
    const image = new Image();
    image.addEventListener("load", () => res(image), { once: true });
    image.addEventListener("error", (evt) => rejects ? rej(evt) : res(image), { once: true });
    image.src = src;
  }));

  return Promise.allSettled(promises);
}

//#region observeElementProp

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
        // @ts-expect-error generic typing issue
        // eslint-disable-next-line prefer-rest-params
        return descriptor?.get?.apply(this, arguments);
      },
      set: function() {
        const oldValue = this[property];
        // @ts-expect-error generic typing issue
        // eslint-disable-next-line prefer-rest-params
        descriptor?.set?.apply(this, arguments);
        const newValue = this[property];
        if(typeof callback === "function")
          callback.bind(this, oldValue, newValue);
        return newValue;
      }
    });
  }
}

//#region isScrollable

/** Checks if an element is scrollable in the horizontal and vertical directions */
export function isScrollable(element: Element): Record<"vertical" | "horizontal", boolean> {
  const { overflowX, overflowY } = getComputedStyle(element);
  return {
    vertical: (overflowY === "scroll" || overflowY === "auto") && element.scrollHeight > element.clientHeight,
    horizontal: (overflowX === "scroll" || overflowX === "auto") && element.scrollWidth > element.clientWidth,
  };
}

//#region interceptEvent

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
  if(typeof window.GM === "object" && GM?.info?.scriptHandler && GM.info.scriptHandler === "FireMonkey" && ((eventObject as unknown as Window) === window || (eventObject as unknown as Window) === getUnsafeWindow()))
    throw new PlatformError("Intercepting window events is not supported on FireMonkey due to the isolated context the userscript is forced to run in.");

  // default is 25 on FF so this should hopefully be more than enough
  if("stackTraceLimit" in Error) {
    Error.stackTraceLimit = Math.max(Number(Error.stackTraceLimit), 100);
    if(isNaN(Number(Error.stackTraceLimit)))
      Error.stackTraceLimit = 100;
  }

  (function(original: typeof eventObject.addEventListener) {
    // @ts-expect-error TS never likes proto fiddling
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
    // @ts-expect-error same as above
  })(eventObject.__proto__.addEventListener);
}

//#region interceptWindowEvent

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

//#region probeElementStyle

/**
 * Creates an invisible temporary element to probe its rendered style.  
 * Has to be run after the `DOMContentLoaded` event has fired on the document object.
 * @param probeStyle Function to probe the element's style. First argument is the element's style object from [`window.getComputedStyle()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle), second argument is the element itself
 * @param element The element to probe, or a function that creates and returns the element - should not be added to the DOM prior to calling this function! - all probe elements will have the class `_uu_probe_element` added to them
 * @param hideOffscreen Whether to hide the element offscreen, enabled by default - disable if you want to probe the position style properties of the element
 * @param parentElement The parent element to append the probe element to, defaults to `document.body`
 * @returns The value returned by the `probeElement` function
 */
export function probeElementStyle<
  TValue,
  TElem extends HTMLElement = HTMLSpanElement,
> (
  probeStyle: (style: CSSStyleDeclaration, element: TElem) => TValue,
  element?: TElem | (() => TElem),
  hideOffscreen = true,
  parentElement = document.body,
): TValue {
  const el = element
    ? typeof element === "function" ? element() : element
    : document.createElement("span") as TElem;

  if(hideOffscreen) {
    el.style.position = "absolute";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    el.style.zIndex = "-9999";
  }

  el.classList.add("_uu_probe_element");
  parentElement.appendChild(el);

  const style = window.getComputedStyle(el);
  const result = probeStyle(style, el);

  setTimeout(() => el.remove(), 1);
  return result;
}

//#region isDomLoaded

let domReady = document.readyState !== "loading";
!domReady && document.addEventListener("DOMContentLoaded", () => domReady = true, { once: true });

/** Returns whether or not the DOM has finished loading */
export function isDomLoaded(): boolean {
  return domReady;
}

//#region onDomLoad

/**
 * Executes a callback and/or resolves the returned Promise when the DOM has finished loading.  
 * Immediately executes/resolves if the DOM is already loaded.
 * @param cb Callback to execute when the DOM has finished loading
 * @returns Returns a Promise that resolves when the DOM has finished loading
 */
export function onDomLoad(cb?: () => void): Promise<void> {
  return new Promise((res) => {
    if(domReady) {
      cb?.();
      res();
    }
    else
      document.addEventListener("DOMContentLoaded", () => {
        cb?.();
        res();
      }, { once: true });
  });
}
