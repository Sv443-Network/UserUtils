import { describe, expect, it } from "vitest";
import { ChecksumMismatchError, MigrationError, PlatformError } from "./errors.js";

describe("errors", () => {
  it("Has a \"date\" property", () => {
    expect(new ChecksumMismatchError("").name).toBe("ChecksumMismatchError");
    expect(new MigrationError("").name).toBe("MigrationError");
    expect(new PlatformError("").name).toBe("PlatformError");

    expect(new PlatformError("").message).toBe("");
    expect(new PlatformError("").date).toBeInstanceOf(Date);
  });
});
