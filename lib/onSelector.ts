import { SelectorExistsOpts } from "./types";

/**
 * Calls the `listener` as soon as the `selector` exists in the DOM.  
 * Listeners are deleted when they are called once, unless `options.continuous` is set.  
 * Multiple listeners with the same selector may be registered.
 * @template TElem The type of element that this selector will return - FIXME: listener inferring doesn't work when this generic is given
 */
export function onSelector<TElem = HTMLElement, TOpts extends SelectorExistsOpts = SelectorExistsOpts>(
  options: TOpts,
  listener: (element: TOpts["all"] extends true ? (TElem extends HTMLElement ? NodeListOf<TElem> : TElem) : TElem) => void,
) {
  // TODO:
  void [options, listener];
}

/** Removes all listeners registered in `onSelector()` with a matching selector property */
export function removeOnSelector(selector: string) {
  // TODO:
  void [selector];
}
