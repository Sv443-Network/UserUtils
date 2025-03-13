/**
 * @module lib/errors
 * Contains custom error classes
 */

/** Base class for all UserUtils errors - adds a `date` prop set to the error throw time */
export class UUError extends Error {
  public readonly date: Date;
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.date = new Date();
  }
}

/** Error while validating checksum */
export class ChecksumMismatchError extends UUError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ChecksumMismatchError";
  }
}

/** Error while migrating data */
export class MigrationError extends UUError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "MigrationError";
  }
}

/** Error due to the platform, like using a feature that's not supported by the browser */
export class PlatformError extends UUError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PlatformError";
  }
}
