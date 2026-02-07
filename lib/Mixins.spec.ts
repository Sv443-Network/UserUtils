import { describe, it, expect } from "vitest";
import { Mixins, type MixinsConstructorConfig } from "./Mixins.js";

class TestMixins<
  TMixinMap extends Record<string, (arg: any, ctx?: any) => any>,
  TMixinKey extends Extract<keyof TMixinMap, string> = Extract<keyof TMixinMap, string>,
> extends Mixins<TMixinMap, TMixinKey> {
  constructor(config: Partial<MixinsConstructorConfig> = {}) {
    super(config);
  }

  public test_removeAll(key: TMixinKey) {
    return this.removeAll(key);
  }
}

class TestMixins<
  TMixinMap extends Record<string, (arg: any, ctx?: any) => any>,
  TMixinKey extends Extract<keyof TMixinMap, string> = Extract<keyof TMixinMap, string>,
> extends Mixins<TMixinMap, TMixinKey> {
  public removeAll(key: TMixinKey) {
    super.removeAll(key);
  }
}

describe("Mixins", () => {
  //#region base
  it("Base resolution", () => {
    const mixins = new TestMixins<{ foo: (v: number, ctx: { a: number }) => number; }>({
      autoIncrementPriority: true,
    });

    mixins.add("foo", (v) => v ^ 0b0001); // 1 (prio 0)
    mixins.add("foo", (v) => v ^ 0b1000); // 2 (prio 1)
    mixins.add("foo", (v, c) => v ^ c.a); // 3 (prio 2)

    // input: 0b1100
    // 1: 0b1100 ^ 0b0001 = 0b1101
    // 2: 0b1101 ^ 0b1000 = 0b0101
    // 3: 0b0101 ^ 0b0100 = 0b0001
    // result: 0b0001 = 1

    expect(mixins.resolve("foo", 0b1100, { a: 0b0100 })).toBe(1);

    expect(mixins.list()).toHaveLength(3);
    expect(mixins.list().every(m => m.key === "foo")).toBe(true);

    mixins.removeAll("foo");
    expect(mixins.list()).toHaveLength(0);
  });

  //#region priority
  it("Priority resolution", () => {
    const mixins = new Mixins<{ foo: (v: number) => number; }>();

    mixins.add("foo", (v) => v / 2, 1); // 2 (prio 1)
    mixins.add("foo", (v) => Math.round(Math.log(v) * 10), -1); // 4 (prio -1, index 0)
    mixins.add("foo", (v) => v + 2, -1); // 5 (prio -1, index 1)
    mixins.add("foo", (v) => v ** 2); // 3 (prio 0)
    mixins.add("foo", (v) => Math.sqrt(v), Number.MAX_SAFE_INTEGER); // 1 (prio max)

    // input: 100
    // 1: sqrt(100) = 10
    // 2: 10 / 2 = 5
    // 3: 5 ** 2 = 25
    // 4: round(log(25) * 10) = round(32.188758248682006) = 32
    // 5: 32 + 2 = 34

    expect(mixins.resolve("foo", 100)).toBe(34);
  });

  //#region sync/async & cleanup
  it("Sync/async resolution & cleanup", async () => {
    const acAll = new AbortController();

    const mixins = new Mixins<{ foo: (v: number) => Promise<number>; }>({
      defaultSignal: acAll.signal,
    });

    const ac1 = new AbortController();

    mixins.add("foo", (v) => Math.sqrt(v), { signal: ac1.signal }); // 1 (prio 0, index 0)
    mixins.add("foo", (v) => Math.pow(v, 4)); // 2 (prio 0, index 1)
    const rem3 = mixins.add("foo", async (v) => { // 3 (prio 0, index 2)
      await new Promise((r) => setTimeout(r, 50));
      return v + 2;
    });
    const rem4 = mixins.add("foo", async (v) => v); // 4 (prio 0, index 3)

    const res1 = mixins.resolve("foo", 100);
    expect(res1).toBeInstanceOf(Promise);
    expect(await res1).toBe(10002);

    rem3();
    rem4();

    const res2 = mixins.resolve("foo", 100);
    expect(res2).not.toBeInstanceOf(Promise);
    expect(res2).toBe(10000);

    ac1.abort();

    const res3 = mixins.resolve("foo", 100);
    expect(res3).not.toBeInstanceOf(Promise);
    expect(res3).toBe(100000000);

    acAll.abort();

    const res4 = mixins.resolve("foo", 100);
    expect(res4).not.toBeInstanceOf(Promise);
    expect(res4).toBe(100);
  });

  //#region removeAll
  it("removeAll()", () => {
    const mixins = new TestMixins<{
      foo: (v: number) => number;
        }>({ autoIncrementPriority: true });

    mixins.add("foo", (v) => v + 1);
    mixins.add("foo", (v) => v + 2);
    mixins.add("foo", (v) => v + 3);

    expect(mixins.list()).toHaveLength(3);

    mixins.test_removeAll("foo");

    expect(mixins.list()).toHaveLength(0);
  });
});
