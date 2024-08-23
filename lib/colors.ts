import { clamp } from "./math.js";

/** Converts a hex color string to a tuple of RGB values */
export function hexToRgb(hex: string): [red: number, green: number, blue: number] {
  hex = hex.trim();
  const bigint = parseInt(hex.startsWith("#") ? hex.slice(1) : hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = (bigint & 255);

  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
}

/** Converts RGB values to a hex color string */
export function rgbToHex(red: number, green: number, blue: number, withHash = true, upperCase = false): string {
  const toHexVal = (n: number) =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")[(upperCase ? "toUpperCase" : "toLowerCase")]();
  return `${withHash ? "#" : ""}${toHexVal(red)}${toHexVal(green)}${toHexVal(blue)}`;
}

/**
 * Lightens a CSS color value (in hex, RGB or RGBA format) by a given percentage.  
 * Will not exceed the maximum range (00-FF or 0-255).
 * @returns Returns the new color value in the same format as the input
 * @throws Throws if the color format is invalid or not supported
 */
export function lightenColor(color: string, percent: number): string {
  return darkenColor(color, percent * -1);
}

/**
 * Darkens a CSS color value (in hex, RGB or RGBA format) by a given percentage.  
 * Will not exceed the maximum range (00-FF or 0-255).
 * @returns Returns the new color value in the same format as the input
 * @throws Throws if the color format is invalid or not supported
 */
export function darkenColor(color: string, percent: number): string {
  color = color.trim();

  const darkenRgb = (r: number, g: number, b: number, percent: number): [number, number, number] => {
    r = Math.max(0, Math.min(255, r - (r * percent / 100)));
    g = Math.max(0, Math.min(255, g - (g * percent / 100)));
    b = Math.max(0, Math.min(255, b - (b * percent / 100)));
    return [r, g, b];
  };

  let r: number, g: number, b: number, a: number | undefined;

  const isHexCol = color.match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/);

  if(isHexCol)
    [r, g, b] = hexToRgb(color);
  else if(color.startsWith("rgb")) {
    const rgbValues = color.match(/\d+(\.\d+)?/g)?.map(Number);
    if (rgbValues)
      [r, g, b, a] = rgbValues as [number, number, number, number?];
    else
      throw new Error("Invalid RGB/RGBA color format");
  }
  else
    throw new Error("Unsupported color format");

  [r, g, b] = darkenRgb(r, g, b, percent);

  const upperCase = color.match(/[A-F]/) !== null;

  if(isHexCol)
    return rgbToHex(r, g, b, color.startsWith("#"), upperCase);
  else if(color.startsWith("rgba"))
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  else if(color.startsWith("rgb"))
    return `rgb(${r}, ${g}, ${b})`;
  else
    throw new Error("Unsupported color format");
}
