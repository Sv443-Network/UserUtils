import { describe, it, expect } from "vitest";

describe("Consts", () => {
  it("Should export the versions", async () => {
    // need to import the final ESM bundle to get the injected version string:
    const UU = await import("../dist/UserUtils.mjs");
    expect(UU.versions.CoreUtils).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);
    expect(UU.versions.UserUtils).toMatch(/^\d+\.\d+\.\d+(-.+)?$/);
  });
});
