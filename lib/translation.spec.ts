import { describe, expect, it } from "vitest";
import { tr } from "./translation.js";

describe("Translation", () => {
  //#region base
  it("Base translation", () => {
    tr.addTranslations("en", {
      hello: "Hello",
      goodbye: "Goodbye",
    });
    tr.addTranslations("de", {
      hello: "Hallo",
    });
    expect(tr.getFallbackLanguage()).toBeUndefined();
    tr.setFallbackLanguage("en");
    expect(tr.getFallbackLanguage()).toBe("en");

    expect(tr.for("en", "hello")).toBe("Hello");
    expect(tr.for("de", "hello")).toBe("Hallo");
    expect(tr.for("de", "goodbye")).toBe("Goodbye");

    tr.deleteTranslations("de");
    expect(tr.for("de", "hello")).toBe("Hello");

    tr.setFallbackLanguage();
    expect(tr.for("de", "hello")).toBe("hello");

    expect(tr.getTranslations("en")?.hello).toBe("Hello");
    expect(tr.getTranslations("de")?.hello).toBeUndefined();

    const t = tr.use("en");
    expect(t("hello")).toBe("Hello");
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

    tr.deleteTransform(tr.transforms.percent[0]);
    expect(tr.for("en", "percent", "Jeff")).toBe("Hello, %1");
  });
});
