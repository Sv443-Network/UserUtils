import { describe, expect, it } from "vitest";
import { darkenColor, hexToRgb, lightenColor, rgbToHex } from "./colors.js";

//#region hexToRgb
describe("colors/hexToRgb", () => {
  it("Converts a hex color string to an RGB tuple", () => {
    const hex = "#FF0000";
    const [r, g, b, a] = hexToRgb(hex);

    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
    expect(a).toBeUndefined();
  });

  it("Converts a hex color string with an alpha channel to an RGBA tuple", () => {
    const hex = "#FF0000FF";
    const [r, g, b, a] = hexToRgb(hex);

    expect(r).toBe(255);
    expect(g).toBe(0);
    expect(b).toBe(0);
    expect(a).toBe(1);
  });

  it("Works as expected with invalid input", () => {
    expect(hexToRgb("")).toEqual([0, 0, 0, undefined]);
  });
});

//#region rgbToHex
describe("colors/rgbToHex", () => {
  it("Converts an RGB tuple to a hex color string", () => {
    expect(rgbToHex(255, 0, 0, undefined, true, true)).toBe("#FF0000");
    expect(rgbToHex(255, 0, 0, undefined, true, false)).toBe("#ff0000");
    expect(rgbToHex(255, 0, 0, undefined, false, false)).toBe("ff0000");
    expect(rgbToHex(255, 0, 127, 0.5, false, false)).toBe("ff007f80");
    expect(rgbToHex(0, 0, 0, 1)).toBe("#000000ff");
  });

  it("Handles special values as expected", () => {
    expect(rgbToHex(NaN, Infinity, -1, 255)).toBe("#nanff00ff");
    expect(rgbToHex(256, -1, 256, -1, false, true)).toBe("FF00FF00");
  });

  it("Works as expected with invalid input", () => {
    expect(rgbToHex(0, 0, 0, 0)).toBe("#000000");
    //@ts-ignore
    expect(rgbToHex(NaN, "ello", 0, -1)).toBe("#nannan0000");
  });
});

//#region lightenColor
describe("colors/lightenColor", () => {
  it("Lightens a color by a given percentage", () => {
    expect(lightenColor("#ab35de", 50)).toBe("#ff50ff");
    expect(lightenColor("ab35de", Infinity, true)).toBe("FFFFFF");
    expect(lightenColor("rgba(255, 50, 127, 0.5)", 50)).toBe("rgba(255, 75, 190.5, 0.5)");
    expect(lightenColor("rgb(255, 50, 127)", 50)).toBe("rgb(255, 75, 190.5)");
  });
});

//#region darkenColor
describe("colors/darkenColor", () => {
  it("Darkens a color by a given percentage", () => {
    // since both functions are the exact same but with a different sign, only one test is needed:
    expect(darkenColor("#1affe3", 50)).toBe(lightenColor("#1affe3", -50));
  });
});
