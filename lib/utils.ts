import type { FetchAdvancedOpts } from "./types";

/**
 * Automatically appends an `s` to the passed `word`, if `num` is not equal to 1
 * @param word A word in singular form, to auto-convert to plural
 * @param num If this is an array or NodeList, the amount of items is used
 */
export function autoPlural(word: string, num: number | unknown[] | NodeList) {
  if(Array.isArray(num) || num instanceof NodeList)
    num = num.length;
  return `${word}${num === 1 ? "" : "s"}`;
}

/** Ensures the passed `value` always stays between `min` and `max` */
export function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

/** Pauses async execution for the specified time in ms */
export function pauseFor(time: number) {
  return new Promise((res) => {
    setTimeout(res, time);
  });
}

/**
 * Calls the passed `func` after the specified `timeout` in ms.  
 * Any subsequent calls to this function will reset the timer and discard previous calls.
 */
export function debounce<TFunc extends (...args: TArgs[]) => void, TArgs = any>(func: TFunc, timeout = 300) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let timer: number | undefined;
  return function(...args: TArgs[]) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout) as unknown as number;
  };
}

/**
 * Returns `unsafeWindow` if the `@grant unsafeWindow` is given, otherwise falls back to the regular `window`
 */
export function getUnsafeWindow() {
  try {
    // throws ReferenceError if the "@grant unsafeWindow" isn't present
    return unsafeWindow;
  }
  catch(e) {
    return window;
  }
}

/**
 * Inserts `afterElement` as a sibling just after the provided `beforeElement`
 * @returns Returns the `afterElement`
 */
export function insertAfter(beforeElement: HTMLElement, afterElement: HTMLElement) {
  beforeElement.parentNode?.insertBefore(afterElement, beforeElement.nextSibling);
  return afterElement;
}

/**
 * Adds a parent container around the provided element
 * @returns Returns the new parent element
 */
export function addParent(element: HTMLElement, newParent: HTMLElement) {
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
 */
export function addGlobalStyle(style: string) {
  const styleElem = document.createElement("style");
  styleElem.innerHTML = style;
  document.head.appendChild(styleElem);
}

/**
 * Preloads an array of image URLs so they can be loaded instantly from the browser cache later on
 * @param rejects If set to `true`, the returned PromiseSettledResults will contain rejections for any of the images that failed to load
 * @returns Returns an array of `PromiseSettledResult` - each resolved result will contain the loaded image element, while each rejected result will contain an `ErrorEvent`
 */
export function preloadImages(srcUrls: string[], rejects = false) {
  const promises = srcUrls.map(src => new Promise((res, rej) => {
    const image = new Image();
    image.src = src;
    image.addEventListener("load", () => res(image));
    image.addEventListener("error", (evt) => rejects && rej(evt));
  }));

  return Promise.allSettled(promises);
}

/** Calls the fetch API with special options like a timeout */
export async function fetchAdvanced(url: string, options: FetchAdvancedOpts = {}) {
  const { timeout = 10000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const res = await fetch(url, {
    ...options,
    signal: controller.signal,
  });

  clearTimeout(id);
  return res;
}

/**
 * Creates an invisible anchor with a `_blank` target and clicks it.  
 * Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
 *   
 * This function has to be run in relatively quick succession in response to a user interaction event, else the browser might reject it.
 */
export function openInNewTab(href: string) {
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

/**
 * Intercepts the specified event on the passed object and prevents it from being called if the called `predicate` function returns a truthy value.  
 * Calling this function will set the `stackTraceLimit` to 1000 to ensure the stack trace is preserved.
 */
export function interceptEvent<TEvtObj extends EventTarget>(eventObject: TEvtObj, eventName: Parameters<TEvtObj["addEventListener"]>[0], predicate: () => boolean) {  
  // default is between 10 and 100 on conventional browsers so this should hopefully be more than enough
  // @ts-ignore
  if(Error.stackTraceLimit < 1000) {
    // @ts-ignore
    Error.stackTraceLimit = 1000;
  }

  (function(original: typeof eventObject.addEventListener) {
    // @ts-ignore
    element.__proto__.addEventListener = function(...args: Parameters<typeof eventObject.addEventListener>) {
      if(args[0] === eventName && predicate())
        return;
      else
        return original.apply(this, args);
    };
    // @ts-ignore
  })(eventObject.__proto__.addEventListener);
}

/**
 * Intercepts the specified event on the window object and prevents it from being called if the called `predicate` function returns a truthy value.  
 * Calling this function will set the `stackTraceLimit` to 1000 to ensure the stack trace is preserved.
 */
export function interceptWindowEvent(eventName: keyof WindowEventMap, predicate: () => boolean) {  
  return interceptEvent(getUnsafeWindow(), eventName, predicate);
}
