import { describe, expect, it } from "vitest";
import { addGlobalStyle, addParent, getSiblingsFrame, getUnsafeWindow, interceptWindowEvent, isDomLoaded, observeElementProp, onDomLoad, openInNewTab, preloadImages, probeElementStyle, setInnerHtmlUnsafe } from "./dom.js";
import { PlatformError } from "./Errors.js";

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

//#region preloadImages
//TODO:FIXME: no workis
describe.skip("dom/preloadImages", () => {
  it("Preloads images", async () => {
    const res = await preloadImages(["https://picsum.photos/50/50"]);

    expect(Array.isArray(res)).toBe(true);
    expect(res.every(r => r.status === "fulfilled")).toBe(true);
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

//#region interceptWindowEvent
describe("dom/interceptWindowEvent", () => {
  it("Intercepts a window event", () => {
    let amount = 0;
    const inc = () => amount++;

    window.addEventListener("foo", inc);
    Error.stackTraceLimit = NaN;
    // @ts-expect-error
    interceptWindowEvent("foo", () => true);
    window.addEventListener("foo", inc);

    window.dispatchEvent(new Event("foo"));

    expect(amount).toBe(1);

    window.removeEventListener("foo", inc);
  });

  it("Throws when GM platform is FireMonkey", () => {
    // @ts-expect-error
    window.GM = { info: { scriptHandler: "FireMonkey" } };

    // @ts-expect-error
    expect(() => interceptWindowEvent("foo", () => true)).toThrow(PlatformError);

    // @ts-expect-error
    delete window.GM;
  });
});

//#region observeElementProp
//TODO:FIXME: no workio
describe.skip("dom/observeElementProp", () => {
  it("Observes an element property", () => {
    const el = document.createElement("input");
    el.type = "text";
    document.body.appendChild(el);

    let newVal = "";
    observeElementProp(el, "value", (_oldVal, newVal) => {
      newVal = newVal;
    });

    el.value = "foo";

    expect(newVal).toBe("foo");
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

//#region probeElementStyle
//TODO:FIXME: no workiong
describe.skip("dom/probeElementStyle", () => {
  it("Resolves a CSS variable", async () => {
    addGlobalStyle(`:root { --foo: #f00; --bar: var(--foo, #00f); }`);

    const tryResolveCol = (i = 0) => new Promise<string>((res, rej) => {
      if(i > 100)
        return rej(new Error("Could not resolve color after 100 tries"));

      const probedCol = probeElementStyle(
        (style) => style.backgroundColor,
        () => {
          const elem = document.createElement("span");
          elem.style.backgroundColor = "var(--foo, #000)";
          return elem;
        },
        true,
      );

      if(probedCol.length === 0 || probedCol.match(/^rgba?\((?:(?:255,\s?255,\s?255)|(?:0,\s?0,\s?0))/) || probedCol.match(/^#(?:fff(?:fff)?|000(?:000)?)/))
        return setTimeout(async () => res(await tryResolveCol(++i)), 100);

      return res(probedCol);
    });

    const val = await tryResolveCol();

    expect(val).toBe("rgb(255, 0, 0)");
  });
});

//#region onDomLoad & isDomLoaded
describe("dom/onDomLoad", () => {
  it("Resolves when the DOM is loaded", async () => {
    let cb = false;
    const res = onDomLoad(() => cb = true);
    document.dispatchEvent(new Event("DOMContentLoaded"));
    await res;

    expect(cb).toBe(true);
    expect(isDomLoaded()).toBe(true);

    cb = false;
    onDomLoad(() => cb = true);
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(cb).toBe(true);
  });
});
