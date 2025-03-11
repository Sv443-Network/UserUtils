/**
 * @module lib/colors
 * This module contains various functions for working with colors - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#colors)
 */

import { clamp } from "./math.js";

/**
 * Converts a hex color string in the format `#RRGGBB`, `#RRGGBBAA` (or even `RRGGBB` and `RGB`) to a tuple.  
 * @returns Returns a tuple array where R, G and B are an integer from 0-255 and alpha is a float from 0 to 1, or undefined if no alpha channel exists.
 */
export function hexToRgb(hex: string): [red: number, green: number, blue: number, alpha?: number] {
  hex = (hex.startsWith("#") ? hex.slice(1) : hex).trim();
  const a = hex.length === 8 || hex.length === 4 ? parseInt(hex.slice(-(hex.length / 4)), 16) / (hex.length === 8 ? 255 : 15) : undefined;

  if(!isNaN(Number(a)))
    hex = hex.slice(0, -(hex.length / 4));

  if(hex.length === 3 || hex.length === 4)
    hex = hex.split("").map(c => c + c).join("");

  const bigint = parseInt(hex, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255), typeof a === "number" ? clamp(a, 0, 1) : undefined];
}

/** Converts RGB or RGBA number values to a hex color string in the format `#RRGGBB` or `#RRGGBBAA` */
export function rgbToHex(red: number, green: number, blue: number, alpha?: number, withHash = true, upperCase = false): string {
  const toHexVal = (n: number): string =>
    clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0")[(upperCase ? "toUpperCase" : "toLowerCase")]();
  return `${withHash ? "#" : ""}${toHexVal(red)}${toHexVal(green)}${toHexVal(blue)}${alpha ? toHexVal(alpha * 255) : ""}`;
}

/**
 * Lightens a CSS color value (in #HEX, rgb() or rgba() format) by a given percentage.  
 * Will not exceed the maximum range (00-FF or 0-255).
 * @returns Returns the new color value in the same format as the input
 * @throws Throws if the color format is invalid or not supported
 */
export function lightenColor(color: string, percent: number, upperCase = false): string {
  return darkenColor(color, percent * -1, upperCase);
}

/**
 * Darkens a CSS color value (in #HEX, rgb() or rgba() format) by a given percentage.  
 * Will not exceed the maximum range (00-FF or 0-255).
 * @returns Returns the new color value in the same format as the input
 * @throws Throws if the color format is invalid or not supported
 */
export function darkenColor(color: string, percent: number, upperCase = false): string {
  color = color.trim();

  const darkenRgb = (r: number, g: number, b: number, percent: number): [number, number, number] => {
    r = Math.max(0, Math.min(255, r - (r * percent / 100)));
    g = Math.max(0, Math.min(255, g - (g * percent / 100)));
    b = Math.max(0, Math.min(255, b - (b * percent / 100)));
    return [r, g, b];
  };

  let r: number, g: number, b: number, a: number | undefined;

  const isHexCol = color.match(/^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/);

  if(isHexCol)
    [r, g, b, a] = hexToRgb(color);
  else if(color.startsWith("rgb")) {
    const rgbValues = color.match(/\d+(\.\d+)?/g)?.map(Number);
    if(!rgbValues)
      throw new Error("Invalid RGB/RGBA color format");
    [r, g, b, a] = rgbValues as [number, number, number, number?];
  }
  else
    throw new Error("Unsupported color format");

  [r, g, b] = darkenRgb(r, g, b, percent);

  if(isHexCol)
    return rgbToHex(r, g, b, a, color.startsWith("#"), upperCase);
  else if(color.startsWith("rgba"))
    return `rgba(${r}, ${g}, ${b}, ${a ?? NaN})`;
  else if(color.startsWith("rgb"))
    return `rgb(${r}, ${g}, ${b})`;
  else
    throw new Error("Unsupported color format");
}
