import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog.js";

//TODO:FIXME: doesn't work because of random "DOMException {}"
describe.skip("Dialog", () => {
  it("Gets created, opened, closed and deleted properly", async () => {
    const dialog = new Dialog({
      id: "test-1",
      height: 100,
      width: 200,
      renderBody: () => document.createElement("div"),
    });

    expect(document.querySelector(".uu-dialog-bg")).toBeNull();

    await dialog.mount();

    expect(document.querySelector(".uu-dialog-bg")).not.toBeNull();

    expect(document.body.classList.contains("uu-no-select")).toBe(false);
    await dialog.open();
    expect(document.body.classList.contains("uu-no-select")).toBe(true);

    dialog.close();
    expect(document.body.classList.contains("uu-no-select")).toBe(false);

    dialog.unmount();
    expect(document.querySelector(".uu-dialog-bg")).toBeNull();
  });
});
