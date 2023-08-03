export type SelectorExistsOpts = {
  /** The selector to check for */
  selector: string;
  /** Whether to use `querySelectorAll()` instead */
  all?: boolean;
  /** Whether to call the listener continuously instead of once */
  continuous?: boolean;
};

export type FetchAdvancedOpts = RequestInit & Partial<{
  timeout: number;
}>;
