import { describe, expect, it } from "vitest";
import { observeElementProp, preloadImages, probeElementStyle } from "./dom.js";
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
