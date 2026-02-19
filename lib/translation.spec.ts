import { describe, expect, it } from "vitest";
import { tr, TrKeys } from "./translation.js";
import { pureObj } from "@sv443-network/coreutils";

describe("Translation", () => {
  //#region base
  it("Base translation", () => {
    const trEn = {
      hello: "Hello",
      goodbye: "Goodbye",
      nested: {
        foo: {
          bar: "Baz",
        },
      },
    } as const;
    tr.addTranslations("en", trEn);
    tr.addTranslations("de", {
      hello: "Hallo",
    });

    // @ts-expect-error use "" as lang when no fallback lang is set
    expect(tr.for(undefined, "hello")).toBe("hello");

    // side effect is a double layered fallback:
    tr.addTranslations("", {
      hello: "Hello (default)",
    });
    expect(Object.keys(tr.getAllTranslations()).length).toEqual(3);
    // @ts-expect-error
    expect(tr.for(undefined, "hello")).toBe("Hello (default)");

    expect(tr.getFallbackLanguage()).toBeUndefined();
    tr.setFallbackLanguage("en");
    expect(tr.getFallbackLanguage()).toBe("en");

    // @ts-expect-error use fallback lang
    expect(tr.for(undefined, "hello")).toBe("Hello");

    expect(tr.for("de", "hello")).toBe("Hallo");
    expect(tr.for("de", "goodbye")).toBe("Goodbye");

    expect(tr.deleteTranslations("de")).toBe(true);
    expect(tr.for("de", "hello")).toBe("Hello");
    expect(tr.deleteTranslations("de")).toBe(false);

    tr.setFallbackLanguage();
    expect(tr.for("de", "hello")).toBe("hello");

    expect(tr.getTranslations("en")?.hello).toBe("Hello");
    expect(tr.getTranslations("de")?.hello).toBeUndefined();

    const t = tr.use<TrKeys<typeof trEn>>("en");
    expect(t("hello")).toBe("Hello");

    expect(t("nested.foo.bar")).toBe("Baz");
    expect(tr.hasKey("en", "nested.foo.bar")).toBe(true);
  });

  it("Doesn't infinitely recurse", () => {
    tr.addTranslations("en", {
      hello: "Hello",
    });
    tr.addTranslations("de", {
      hello: "Hallo",
    });

    tr.setFallbackLanguage("en");

    expect(tr.for("de", "nonexistent.key")).toBe("nonexistent.key");
  });

  //#region transforms
  it("Transforms", () => {
    tr.addTranslations("en", {
      percent: "Hello, %1",
      percentMulti: "%1 %2 %3",
      templateLiteral: "Hello, ${name}",
      i18n: "Hello, {{name}}",
    });

    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, %1");

    tr.addTransform(tr.transforms.percent);
    expect(tr.for("en", "percent")).toBe("Hello, %1");
    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, Jeff");

    // percent transform should skip after a match when args are undefined:
    expect(tr.for("en", "percent")).toBe("Hello, %1");
    expect(tr.for("en", "percentMulti", "A", "B")).toBe("A B %3");

    tr.addTransform(tr.transforms.templateLiteral);
    expect(tr.for("en", "templateLiteral")).toBe("Hello, ${name}");
    expect(tr.for("en", "templateLiteral", "Jeff")).toBe("Hello, Jeff");
    expect(tr.for("en", "templateLiteral", { name: "Jeff" })).toBe("Hello, Jeff");
    expect(tr.for("en", "templateLiteral", { toString: () => "Jeff" })).toBe("Hello, Jeff");

    // template literal transform with a non-stringifiable args object should use named mapping:
    expect(tr.for("en", "templateLiteral", pureObj({ name: "Jeff" }))).toBe("Hello, Jeff");

    expect(tr.deleteTransform(tr.transforms.percent[0])).toBe(true);
    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, %1");
    expect(tr.deleteTransform(tr.transforms.percent[0])).toBe(false);

    tr.deleteTransform(tr.transforms.templateLiteral[1]);
    expect(tr.for("en", "templateLiteral", "Jeff")).toBe("Hello, ${name}");

    // i18n transform behaves the same as template literal transform, just with different delimiters:
    tr.addTransform(tr.transforms.i18n);
    expect(tr.for("en", "i18n", { name: "Jeff" })).toBe("Hello, Jeff");
  });
});
