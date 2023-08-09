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

/**
 * Creates an invisible anchor with a `_blank` target and clicks it.  
 * Contrary to `window.open()`, this has a lesser chance to get blocked by the browser's popup blocker and doesn't open the URL as a new window.  
 *   
 * This function has to be run in response to a user interaction event, else the browser might reject it.
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
 * This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
 * Calling this function will set the `Error.stackTraceLimit` to 1000 to ensure the stack trace is preserved.
 */
export function interceptEvent<TEvtObj extends EventTarget>(eventObject: TEvtObj, eventName: Parameters<TEvtObj["addEventListener"]>[0], predicate: () => boolean) {  
  // default is between 10 and 100 on conventional browsers so this should hopefully be more than enough
  // @ts-ignore
  if(typeof Error.stackTraceLimit === "number" && Error.stackTraceLimit < 1000) {
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
 * This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
 * Calling this function will set the `Error.stackTraceLimit` to 1000 to ensure the stack trace is preserved.
 */
export function interceptWindowEvent(eventName: keyof WindowEventMap, predicate: () => boolean) {  
  return interceptEvent(getUnsafeWindow(), eventName, predicate);
}

/**
 * Amplifies the gain of the passed media element's audio by the specified multiplier.  
 * This function supports any media element like `<audio>` or `<video>`  
 *   
 * This function has to be run in response to a user interaction event, else the browser will reject it because of the strict autoplay policy.  
 *   
 * @returns Returns an object with the following properties:
 * | Property | Description |
 * | :-- | :-- |
 * | `mediaElement` | The passed media element |
 * | `amplify()` | A function to change the amplification level |
 * | `getAmpLevel()` | A function to return the current amplification level |
 * | `context` | The AudioContext instance |
 * | `source` | The MediaElementSourceNode instance |
 * | `gain` | The GainNode instance |
 */
export function amplifyMedia<TElem extends HTMLMediaElement>(mediaElement: TElem, multiplier = 1.0) {
  // @ts-ignore
  const context = new (window.AudioContext || window.webkitAudioContext);
  const result = {
    mediaElement,
    amplify: (multiplier: number) => { result.gain.gain.value = multiplier; },
    getAmpLevel: () => result.gain.gain.value,
    context: context,
    source: context.createMediaElementSource(mediaElement),
    gain: context.createGain(),
  };

  result.source.connect(result.gain);
  result.gain.connect(context.destination);
  result.amplify(multiplier);

  return result;
}
