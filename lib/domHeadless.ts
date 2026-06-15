/**
 * @module lib/domHeadless
 * This module contains various functions for working with the DOM, without requiring anything to be fully rendered - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#dom)
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

//#region isScrollable

/** Checks if an element is scrollable in the horizontal and vertical directions */
export function isScrollable(element: Element): Record<"vertical" | "horizontal", boolean> {
  const { overflowX, overflowY } = getComputedStyle(element);
  return {
    vertical: (overflowY === "scroll" || overflowY === "auto") && element.scrollHeight > element.clientHeight,
    horizontal: (overflowX === "scroll" || overflowX === "auto") && element.scrollWidth > element.clientWidth,
  };
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
 * - ⚠️ This function does not perform any sanitization and should thus be used with utmost caution, as it can easily lead to XSS vulnerabilities when used with untrusted input!
 * - ⚠️ Only use this function when absolutely necessary, prefer using `element.textContent = "foo"` or other safer alternatives like the [DOMPurify library](https://github.com/cure53/DOMPurify) whenever possible.
 */
export function setInnerHtmlUnsafe<TElement extends Element = HTMLElement>(element: TElement, html: string): TElement {
  // @ts-expect-error TrustedTypes API is not in lib.dom.ts yet
  if(!ttPolicy && typeof window?.trustedTypes?.createPolicy === "function") {
    // @ts-expect-error see above
    ttPolicy = window.trustedTypes.createPolicy("_uu_set_innerhtml_unsafe", {
      createHTML: (unsafeHtml: string) => unsafeHtml,
    });
  }

  element.innerHTML = ttPolicy?.createHTML?.(html) ?? html;

  return element;
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
