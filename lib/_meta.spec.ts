import { describe, expect, it } from "vitest";

function testStorage(storage: Storage) {
  expect(typeof storage).toBe("object");

  storage.setItem("__meta_test_key", "test_value");
  expect(storage.getItem("__meta_test_key")).toBe("test_value");
  storage.removeItem("__meta_test_key");
  expect(storage.getItem("__meta_test_key")).toBe(null);
}

describe("Verify DOM env", () => {
  it("localStorage", () => {
    testStorage(localStorage);
  });

  it("sessionStorage", () => {
    testStorage(sessionStorage);
  });
});
