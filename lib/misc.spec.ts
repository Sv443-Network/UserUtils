import { describe, expect, it } from "vitest";
import { autoPlural, consumeGen, consumeStringGen, fetchAdvanced, getListLength, insertValues, pauseFor, purifyObj } from "./misc.js";

//#region autoPlural
describe("misc/autoPlural", () => {
  it("Tests if autoPlural uses the correct forms", () => {
    expect(autoPlural("apple", -1)).toBe("apples");
    expect(autoPlural("apple", 0)).toBe("apples");
    expect(autoPlural("apple", 1)).toBe("apple");
    expect(autoPlural("apple", 2)).toBe("apples");

    expect(autoPlural("cherry", -1)).toBe("cherries");
    expect(autoPlural("cherry", 0)).toBe("cherries");
    expect(autoPlural("cherry", 1)).toBe("cherry");
    expect(autoPlural("cherry", 2)).toBe("cherries");

    const cont = document.createElement("div");
    for(let i = 0; i < 3; i++) {
      const span = document.createElement("span");
      cont.append(span);
    }

    expect(autoPlural("cherry", [1])).toBe("cherry");
    expect(autoPlural("cherry", cont.querySelectorAll("span"))).toBe("cherries");
    expect(autoPlural("cherry", { count: 3 })).toBe("cherries");
  });

  it("Handles edge cases", () => {
    expect(autoPlural("apple", 2, "-ies")).toBe("applies");
    expect(autoPlural("cherry", 2, "-s")).toBe("cherrys");
  });
});

//#region insertValues
describe("misc/insertValues", () => {
  it("Stringifies and inserts values correctly", () => {
    expect(insertValues("a:%1,b:%2,c:%3", "A", "B", "C")).toBe("a:A,b:B,c:C");
    expect(insertValues("a:%1,b:%2,c:%3", "A", 2, true)).toBe("a:A,b:2,c:true");
    expect(insertValues("a:%1,b:%2,c:%3", { toString: () => "[A]" }, {})).toBe("a:[A],b:[object Object],c:%3");
  });
});

//#region pauseFor
describe("misc/pauseFor", () => {
  it("Pauses for the correct time and can be aborted", async () => {
    const startTs = Date.now();
    await pauseFor(100);

    expect(Date.now() - startTs).toBeGreaterThanOrEqual(80);

    const ac = new AbortController();
    const startTs2 = Date.now();

    setTimeout(() => ac.abort(), 20);
    await pauseFor(100, ac.signal);

    expect(Date.now() - startTs2).toBeLessThan(100);
  });
});

//#region fetchAdvanced
describe("misc/fetchAdvanced", () => {
  it("Fetches a resource correctly", async () => {
    try {
      const res = await fetchAdvanced("https://jsonplaceholder.typicode.com/todos/1");
      const json = await res.json();

      expect(json?.id).toBe(1);
    }
    catch(e) {
      expect(e).toBeUndefined();
    }
  });
});

//#region consumeGen
describe("misc/consumeGen", () => {
  it("Consumes a ValueGen properly", async () => {
    expect(await consumeGen(() => 1)).toBe(1);
    expect(await consumeGen(() => Promise.resolve(1))).toBe(1);
    expect(await consumeGen(1)).toBe(1);

    expect(await consumeGen(() => true)).toBe(true);
    expect(await consumeGen(async () => false)).toBe(false);

    // @ts-expect-error
    expect(await consumeGen()).toThrow(TypeError);
  });
});

//#region consumeStringGen
describe("misc/consumeStringGen", () => {
  it("Consumes a StringGen properly", async () => {
    expect(await consumeStringGen("a")).toBe("a");
    expect(await consumeStringGen(() => "b")).toBe("b");
    expect(await consumeStringGen(() => Promise.resolve("c"))).toBe("c");
  });
});

//#region getListLength
describe("misc/getListLength", () => {
  it("Resolves all types of ListWithLength", () => {
    const cont = document.createElement("div");
    for(let i = 0; i < 3; i++) {
      const span = document.createElement("span");
      cont.append(span);
    }
    expect(getListLength(cont.querySelectorAll("span"))).toBe(3);
    expect(getListLength([1, 2, 3])).toBe(3);
    expect(getListLength({ length: 3 })).toBe(3);
    expect(getListLength({ size: 3 })).toBe(3);
    expect(getListLength({ count: 3 })).toBe(3);

    // @ts-expect-error
    expect(getListLength({})).toThrow(TypeError);
  });
});

//#region purifyObj
describe("misc/purifyObj", () => {
  it("Removes the prototype chain of a passed object", () => {
    const obj = { a: 1, b: 2 };
    const pure = purifyObj(obj);

    // @ts-expect-error
    expect(obj.__proto__).toBeDefined();
    // @ts-expect-error
    expect(pure.__proto__).toBeUndefined();

    expect(pure.a).toBe(1);
    expect(pure.b).toBe(2);
  });
});
