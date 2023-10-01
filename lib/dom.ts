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
export function insertAfter(beforeElement: Element, afterElement: Element) {
  beforeElement.parentNode?.insertBefore(afterElement, beforeElement.nextSibling);
  return afterElement;
}

/**
 * Adds a parent container around the provided element
 * @returns Returns the new parent element
 */
export function addParent(element: Element, newParent: Element) {
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
export function interceptEvent<TEvtObj extends EventTarget, TPredicateEvt extends Event>(
  eventObject: TEvtObj,
  eventName: Parameters<TEvtObj["addEventListener"]>[0],
  predicate: (event: TPredicateEvt) => boolean,
) {  
  // default is between 10 and 100 on conventional browsers so this should hopefully be more than enough
  // @ts-ignore
  if(typeof Error.stackTraceLimit === "number" && Error.stackTraceLimit < 1000) {
    // @ts-ignore
    Error.stackTraceLimit = 1000;
  }

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
 * Intercepts the specified event on the window object and prevents it from being called if the called `predicate` function returns a truthy value.  
 * This function should be called as soon as possible (I recommend using `@run-at document-start`), as it will only intercept events that are added after this function is called.  
 * Calling this function will set the `Error.stackTraceLimit` to 1000 to ensure the stack trace is preserved.
 */
export function interceptWindowEvent<TEvtKey extends keyof WindowEventMap>(
  eventName: TEvtKey,
  predicate: (event: WindowEventMap[TEvtKey]) => boolean,
) {  
  return interceptEvent(getUnsafeWindow(), eventName, predicate);
}

/**
 * Amplifies the gain of the passed media element's audio by the specified multiplier.  
 * Also applies a limiter to prevent clipping and distortion.  
 * This function supports any MediaElement instance like `<audio>` or `<video>`  
 *   
 * This is the audio processing workflow:  
 * `MediaElement (source)` => `DynamicsCompressorNode (limiter)` => `GainNode` => `AudioDestinationNode (output)`  
 *   
 * ⚠️ This function has to be run in response to a user interaction event, else the browser will reject it because of the strict autoplay policy.  
 * ⚠️ Make sure to call the returned function `enable()` after calling this function to actually enable the amplification.  
 *   
 * @param mediaElement The media element to amplify (e.g. `<audio>` or `<video>`)
 * @param initialMultiplier The initial gain multiplier to apply (floating point number, default is `1.0`)
 * @returns Returns an object with the following properties:
 * | Property | Description |
 * | :-- | :-- |
 * | `setGain()` | Used to change the gain multiplier |
 * | `getGain()` | Returns the current gain multiplier |
 * | `enable()` | Call to enable the amplification for the first time or if it was disabled before |
 * | `disable()` | Call to disable amplification |
 * | `setLimiterOptions()` | Used for changing the [options of the DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode#options) - the default is `{ threshold: -2, knee: 40, ratio: 12, attack: 0.003, release: 0.25 }` |
 * | `context` | The AudioContext instance |
 * | `source` | The MediaElementSourceNode instance |
 * | `gainNode` | The GainNode instance |
 * | `limiterNode` | The DynamicsCompressorNode instance used for limiting clipping and distortion |
 */
export function amplifyMedia<TElem extends HTMLMediaElement>(mediaElement: TElem, initialMultiplier = 1.0) {
  // @ts-ignore
  const context = new (window.AudioContext || window.webkitAudioContext);
  const props = {
    /** Sets the gain multiplier */
    setGain(multiplier: number) {
      props.gainNode.gain.setValueAtTime(multiplier, props.context.currentTime);
    },
    /** Returns the current gain multiplier */
    getGain() {
      return props.gainNode.gain.value;
    },
    /** Enable the amplification for the first time or if it was disabled before */
    enable() {
      props.source.connect(props.limiterNode);
      props.limiterNode.connect(props.gainNode);
      props.gainNode.connect(props.context.destination);
    },
    /** Disable the amplification */
    disable() {
      props.source.disconnect(props.limiterNode);
      props.limiterNode.disconnect(props.gainNode);
      props.gainNode.disconnect(props.context.destination);

      props.source.connect(props.context.destination);
    },
    /**
     * Set the options of the [limiter / DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode#options)  
     * The default is `{ threshold: -2, knee: 40, ratio: 12, attack: 0.003, release: 0.25 }`
     */
    setLimiterOptions(options: Partial<Record<"threshold" | "knee" | "ratio" | "attack" | "release", number>>) {
      for(const [key, val] of Object.entries(options))
        props.limiterNode[key as keyof typeof options]
          .setValueAtTime(val, props.context.currentTime);
    },
    context: context,
    source: context.createMediaElementSource(mediaElement),
    gainNode: context.createGain(),
    limiterNode: context.createDynamicsCompressor(),
  };

  props.setLimiterOptions({
    threshold: -2,
    knee: 40,
    ratio: 12,
    attack: 0.003,
    release: 0.25,
  });
  props.setGain(initialMultiplier);

  return props;
}

/** An object which contains the results of `amplifyMedia()` */
export type AmplifyMediaResult = ReturnType<typeof amplifyMedia>;

/** Checks if an element is scrollable in the horizontal and vertical directions */
export function isScrollable(element: Element) {
  const { overflowX, overflowY } = getComputedStyle(element);
  return {
    vertical: (overflowY === "scroll" || overflowY === "auto") && element.scrollHeight > element.clientHeight,
    horizontal: (overflowX === "scroll" || overflowX === "auto") && element.scrollWidth > element.clientWidth,
  };
}
