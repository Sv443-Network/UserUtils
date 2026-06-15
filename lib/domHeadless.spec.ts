import { describe, expect, it } from "vitest";
import { addGlobalStyle, addParent, getSiblingsFrame, getUnsafeWindow, openInNewTab, setInnerHtmlUnsafe } from "./domHeadless.js";

//#region getUnsafeWindow
describe("dom/getUnsafeWindow", () => {
  it("Returns the correct window objects", () => {
    expect(getUnsafeWindow()).toBe(window);
    var unsafeWindow = window;
    expect(getUnsafeWindow()).toBe(unsafeWindow);
  });
});

//#region addParent
describe("dom/addParent", () => {
  it("Adds a parent to an element", () => {
    const container = document.createElement("div");
    container.id = "container";

    const child = document.createElement("div");
    child.id = "child";

    document.body.appendChild(child);

    addParent(child, container);

    expect(child.parentNode).toBe(container);

    container.remove();
  });
});

//#region addGlobalStyle
describe("dom/addGlobalStyle", () => {
  it("Adds a global style to the document", () => {
    const el = addGlobalStyle(`body { background-color: red; }`);
    el.id = "test-style";

    expect(document.querySelector("head #test-style")).toBe(el);
  });
});
//#region openInNewTab
describe("dom/openInNewTab", () => {
  it("Via GM.openInTab", () => {
    let link = "", bg;
    // @ts-expect-error
    window.GM = {
      openInTab(href: string, background?: boolean) {
        link = href;
        bg = background;
      }
    };

    openInNewTab("https://example.org", true);

    expect(link).toBe("https://example.org");
    expect(bg).toBe(true);

    // @ts-expect-error
    window.GM = {
      openInTab(_href: string, _background?: boolean) {
        throw new Error("Error");
      }
    }

    openInNewTab("https://example.org", true);
    expect(document.querySelector(".userutils-open-in-new-tab")).not.toBeNull();

    // @ts-expect-error
    delete window.GM;
  });
});

//#region getSiblingsFrame
describe("dom/getSiblingsFrame", () => {
  it("Returns the correct frame", () => {
    const container = document.createElement("div");
    for(let i = 0; i < 10; i++) {
      const el = document.createElement("div");
      el.id = `e${i}`;
      container.appendChild(el);
    }

    const cntrEl = container.querySelector<HTMLElement>("#e5")!;

    expect(getSiblingsFrame(cntrEl, 2).map(e => e.id)).toEqual(["e5", "e6"]);
    expect(getSiblingsFrame(cntrEl, 2, "top", false).map(e => e.id)).toEqual(["e6", "e7"]);
    expect(getSiblingsFrame(cntrEl, 2, "bottom", false).map(e => e.id)).toEqual(["e3", "e4"]);
    expect(getSiblingsFrame(cntrEl, 2, "center-top", false).map(e => e.id)).toEqual(["e4", "e6"]);
    expect(getSiblingsFrame(cntrEl, 3, "center-top", true).map(e => e.id)).toEqual(["e4", "e5", "e6"]);
    expect(getSiblingsFrame(cntrEl, 4, "center-top", true).map(e => e.id)).toEqual(["e4", "e5", "e6", "e7"]);
    expect(getSiblingsFrame(cntrEl, 4, "center-bottom", true).map(e => e.id)).toEqual(["e3", "e4", "e5", "e6"]);
    // @ts-expect-error
    expect(getSiblingsFrame(cntrEl, 2, "invalid")).toHaveLength(0);
  });
});

//#region setInnerHtmlUnsafe
describe("dom/setInnerHtmlUnsafe", () => {
  it("Sets inner HTML", () => {
    // @ts-expect-error
    window.trustedTypes = {
      createPolicy: (_name: string, opts: { createHTML: (html: string) => string }) => ({
        createHTML: opts.createHTML,
      }),
    };

    const el = document.createElement("div");
    setInnerHtmlUnsafe(el, "<div>foo</div>");

    expect(el.querySelector("div")?.textContent).toBe("foo");
  });
});
