import { describe, expect, it } from "vitest";
import { randomItem, randomItemIndex, randomizeArray, takeRandomItem } from "./array.js";

//#region randomItem
describe("array/randomItem", () => {
  it("Returns a random item", () => {
    const arr = [1, 2, 3, 4];
    const items = [] as number[];

    for(let i = 0; i < 500; i++)
      items.push(randomItem(arr)!);

    const missing = arr.filter(item => !items.some(i => i === item));
    expect(missing).toHaveLength(0);
  });

  it("Returns undefined for an empty array", () => {
    expect(randomItem([])).toBeUndefined();
  });
});

//#region randomItemIndex
describe("array/randomItemIndex", () => {
  it("Returns a random item with the correct index", () => {
    const arr = [1, 2, 3, 4];
    const items = [] as [number, number][];

    for(let i = 0; i < 500; i++)
      items.push(randomItemIndex(arr) as [number, number]);

    const missing = arr.filter((item, index) => !items.some(([it, idx]) => it === item && idx === index));
    expect(missing).toHaveLength(0);
  });

  it("Returns undefined for an empty array", () => {
    expect(randomItemIndex([])).toEqual([undefined, undefined]);
  });
});

//#region takeRandomItem
describe("array/takeRandomItem", () => {
  it("Returns a random item and removes it from the array", () => {
    const arr = [1, 2];

    const itm = takeRandomItem(arr);
    expect(arr).not.toContain(itm);

    takeRandomItem(arr);

    const itm2 = takeRandomItem(arr);
    expect(itm2).toBeUndefined();
    expect(arr).toHaveLength(0);
  });

  it("Returns undefined for an empty array", () => {
    expect(takeRandomItem([])).toBeUndefined();
  });
});

//#region randomizeArray
describe("array/randomizeArray", () => {
  it("Returns a copy of the array with a random item order", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const randomized = randomizeArray(arr);

    expect(randomized === arr).toBe(false);
    expect(randomized).toHaveLength(arr.length);

    const sameItems = arr.filter((item, i) => randomized[i] === item);
    expect(sameItems.length).toBeLessThan(arr.length);
  });

  it("Returns an empty array as-is", () => {
    const arr = [] as number[];
    const randomized = randomizeArray(arr);

    expect(randomized === arr).toBe(false);
    expect(randomized).toHaveLength(0);
  });
});
