import { describe, expect, it } from "vitest";
import { tr, TrKeys } from "./translation.js";

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
    expect(tr.getFallbackLanguage()).toBeUndefined();
    tr.setFallbackLanguage("en");
    expect(tr.getFallbackLanguage()).toBe("en");

    expect(tr.for("en", "hello")).toBe("Hello");
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
      templateLiteral: "Hello, ${name}",
    });

    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, %1");

    tr.addTransform(tr.transforms.percent);
    expect(tr.for("en", "percent")).toBe("Hello, %1");
    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, Jeff");

    tr.addTransform(tr.transforms.templateLiteral);
    expect(tr.for("en", "templateLiteral")).toBe("Hello, ${name}");
    expect(tr.for("en", "templateLiteral", "Jeff")).toBe("Hello, Jeff");
    expect(tr.for("en", "templateLiteral", { name: "Jeff" })).toBe("Hello, Jeff");
    expect(tr.for("en", "templateLiteral", { toString: () => "Jeff" })).toBe("Hello, Jeff");

    expect(tr.deleteTransform(tr.transforms.percent[0])).toBe(true);
    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, %1");
    expect(tr.deleteTransform(tr.transforms.percent[0])).toBe(false);

    tr.deleteTransform(tr.transforms.templateLiteral[1]);
    expect(tr.for("en", "templateLiteral", "Jeff")).toBe("Hello, ${name}");
  });
});
