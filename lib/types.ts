//#SECTION selector exists

export type InitOnSelectorOpts = {
  /** Set to true if mutations to any element's attributes are to also trigger the onSelector check (warning: this might draw a lot of performance on larger sites) */
  attributes?: boolean;
  /** Set to true if mutations to any element's character data are to also trigger the onSelector check (warning: this might draw a lot of performance on larger sites) */
  characterData?: boolean;
}

export type OnSelectorOpts<TElem extends Element = HTMLElement> = SelectorOptsOne<TElem> | SelectorOptsAll<TElem>;

type SelectorOptsOne<TElem extends Element> = SelectorOptsBase & {
  /** Whether to use `querySelectorAll()` instead - default is false */
  all?: false;
  /** Gets called whenever the selector was found in the DOM */
  listener: (element: TElem) => void;
};

type SelectorOptsAll<TElem extends Element> = SelectorOptsBase & {
  /** Whether to use `querySelectorAll()` instead - default is false */
  all: true;
  /** Gets called whenever the selector was found in the DOM */
  listener: (elements: NodeListOf<TElem>) => void;
};

type SelectorOptsBase = {
  /** Whether to call the listener continuously instead of once - default is false */
  continuous?: boolean;
};

//#SECTION fetch advanced

export type FetchAdvancedOpts = RequestInit & Partial<{
  /** Timeout in milliseconds after which the fetch call will be canceled with an AbortController signal */
  timeout: number;
}>;
