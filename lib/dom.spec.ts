import { describe, expect, it } from "vitest";
import { isDomLoaded, observeElementProp, onDomLoad, preloadImages, probeElementStyle } from "./dom.js";
import { addGlobalStyle } from "./domHeadless.js";

// TODO:FIXME: jsdom's headless rendering doesn't allow any of these tests to pass:

//#region preloadImages
describe.skip("dom/preloadImages", () => {
  it("Preloads images", async () => {
    const res = await preloadImages(["https://picsum.photos/50/50"]);

    expect(Array.isArray(res)).toBe(true);
    expect(res.every(r => r.status === "fulfilled")).toBe(true);
  });
});

//#region observeElementProp
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

//#region interceptWindowEvent
describe.skip("dom/interceptWindowEvent", () => {
  it("Intercepts a window event", () => {
    let interceptFoo = false;

    // @ts-expect-error
    interceptWindowEvent("foo", () => interceptFoo);

    let amount = 0;
    const inc = () => amount++;
    window.addEventListener("foo", inc);

    window.dispatchEvent(new Event("foo"));

    interceptFoo = true;

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

//#region onDomLoad & isDomLoaded
describe.skip("dom/onDomLoad", () => {
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

//#region probeElementStyle
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
