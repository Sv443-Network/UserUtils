/**
 * @module lib/errors
 * Contains custom error classes
 */

import { DatedError } from "@sv443-network/coreutils";

/** Error due to the platform, like using a feature that's not supported by the browser */
export class PlatformError extends DatedError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PlatformError";
  }
}
