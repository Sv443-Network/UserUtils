/**
 * @module lib/dom
 * This module contains various functions for working with the DOM - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#dom)
 */

import { PlatformError } from "./Errors.js";

//#region unsafeWindow

/**
 * Returns `unsafeWindow` if the `@grant unsafeWindow` is given, otherwise falls back to the regular `window`
 */
export function getUnsafeWindow(): Window {
  try {
    // throws ReferenceError if the "@grant unsafeWindow" isn't present
    return unsafeWindow;
  }
  catch {
    return window;
  }
}

//#region addParent

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

//#region addGlobalStyle

/**
 * Adds global CSS style in the form of a `<style>` element in the document's `<head>`  
 * This needs to be run after the `DOMContentLoaded` event has fired on the document object (or instantly if `@run-at document-end` is used).
 * @param style CSS string
 * @returns Returns the created style element
 */
export function addGlobalStyle(style: string): HTMLStyleElement {
  const styleElem = document.createElement("style");
  setInnerHtmlUnsafe(styleElem, style);
  document.head.appendChild(styleElem);
  return styleElem;
}

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
    image.addEventListener("error", (evt) => rejects && rej(evt), { once: true });
    image.src = src;
  }));

  return Promise.allSettled(promises);
}

//#region openInNewTab

/**
 * Tries to use `GM.openInTab` to open the given URL in a new tab, otherwise if the grant is not given, creates an invisible anchor element and clicks it.  
 * For the fallback to work, this function needs to be run in response to a user interaction event, else the browser might reject it.
 * @param href The URL to open in a new tab
 * @param background If set to `true`, the tab will be opened in the background - set to `undefined` (default) to use the browser's default behavior
 * @param additionalProps Additional properties to set on the anchor element (only applies when `GM.openInTab` is not available)
 */
export function openInNewTab(href: string, background?: boolean, additionalProps?: Partial<HTMLAnchorElement>): void {
  try {
    if(typeof window.GM === "object")
      GM.openInTab(href, background);
  }
  catch {
    const openElem = document.createElement("a");
    Object.assign(openElem, {
      className: "userutils-open-in-new-tab",
      target: "_blank",
      rel: "noopener noreferrer",
      tabIndex: -1,
      ariaHidden: "true",
      href,
      ...additionalProps,
    });
    Object.assign(openElem.style, {
      display: "none",
      pointerEvents: "none",
    });

    document.body.appendChild(openElem);
    openElem.click();

    // schedule removal after the click event has been processed
    setTimeout(() => {
      try {
        openElem.remove();
      }
      catch {
        void 0;
      }
    }, 0);
  }
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
  // @ts-expect-error
  if(typeof window.GM === "object" && GM?.info?.scriptHandler && GM.info.scriptHandler === "FireMonkey" && (eventObject === window || eventObject === getUnsafeWindow()))
    throw new PlatformError("Intercepting window events is not supported on FireMonkey due to the isolated context the userscript is forced to run in.");

  // default is 25 on FF so this should hopefully be more than enough
  if(isNaN(Error.stackTraceLimit = Math.max(Error.stackTraceLimit, 100)))
    Error.stackTraceLimit = 100;

  (function(original: typeof eventObject.addEventListener) {
    // @ts-expect-error
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
    // @ts-expect-error
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

//#region isScrollable

/** Checks if an element is scrollable in the horizontal and vertical directions */
export function isScrollable(element: Element): Record<"vertical" | "horizontal", boolean> {
  const { overflowX, overflowY } = getComputedStyle(element);
  return {
    vertical: (overflowY === "scroll" || overflowY === "auto") && element.scrollHeight > element.clientHeight,
    horizontal: (overflowX === "scroll" || overflowX === "auto") && element.scrollWidth > element.clientWidth,
  };
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
        // @ts-expect-error
        // eslint-disable-next-line prefer-rest-params
        return descriptor?.get?.apply(this, arguments);
      },
      set: function() {
        const oldValue = this[property];
        // @ts-expect-error
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

//#region getSiblingsFrame

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

//#region setInnerHtmlUnsafe

let ttPolicy: { createHTML: (html: string) => string } | undefined;

/**
 * Sets the innerHTML property of the provided element without any sanitation or validation.  
 * Uses a [Trusted Types policy](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API) on Chromium-based browsers to trick the browser into thinking the HTML is safe.  
 * Use this if the page makes use of the CSP directive `require-trusted-types-for 'script'` and throws a "This document requires 'TrustedHTML' assignment" error on Chromium-based browsers.  
 *   
 * - ⚠️ This function does not perform any sanitization and should thus be used with utmost caution, as it can easily lead to XSS vulnerabilities!
 */
export function setInnerHtmlUnsafe<TElement extends Element = HTMLElement>(element: TElement, html: string): TElement {
  // @ts-expect-error
  if(!ttPolicy && typeof window?.trustedTypes?.createPolicy === "function") {
    // @ts-expect-error
    ttPolicy = window.trustedTypes.createPolicy("_uu_set_innerhtml_unsafe", {
      createHTML: (unsafeHtml: string) => unsafeHtml,
    });
  }

  element.innerHTML = ttPolicy?.createHTML?.(html) ?? html;

  return element;
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

let domReady = false;
document.addEventListener("DOMContentLoaded", () => domReady = true, { once: true });

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
