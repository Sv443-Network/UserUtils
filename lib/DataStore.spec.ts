import { describe, expect, it } from "vitest";
import { DataStore } from "./DataStore.js";
import { compress, decompress } from "./crypto.js";

class TestDataStore<TData extends object = object> extends DataStore<TData> {
  public async test_getValue<TValue extends GM.Value = string>(name: string, defaultValue: TValue): Promise<string | TValue> {
    return await this.getValue(name, defaultValue);
  }

  public async test_setValue(name: string, value: GM.Value): Promise<void> {
    return await this.setValue(name, value);
  }
}

describe("DataStore", () => {
  it("Basic usage", async () => {
    const store = new DataStore({
      id: "test-1",
      defaultData: { a: 1, b: 2 },
      formatVersion: 1,
      storageMethod: "sessionStorage",
    });

    // should equal defaultData:
    expect(store.getData().a).toBe(1);

    await store.loadData();

    // synchronous in-memory change:
    const prom = store.setData({ ...store.getData(), a: 2 });

    expect(store.getData().a).toBe(2);

    await prom;

    // only clears persistent data, not the stuff in memory:
    await store.deleteData();
    expect(store.getData().a).toBe(2);

    // refreshes memory data:
    await store.loadData();
    expect(store.getData().a).toBe(1);

    expect(store.encodingEnabled()).toBe(false);

    // restore initial state:
    await store.deleteData();
  });

  it("Works with encoding", async () => {
    const store = new DataStore({
      id: "test-2",
      defaultData: { a: 1, b: 2 },
      formatVersion: 1,
      storageMethod: "sessionStorage",
      encodeData: async (data) => await compress(data, "deflate-raw", "string"),
      decodeData: async (data) => await decompress(data, "deflate-raw", "string"),
    });

    await store.loadData();

    await store.setData({ ...store.getData(), a: 2 });

    await store.loadData();

    expect(store.getData()).toEqual({ a: 2, b: 2 });

    expect(store.encodingEnabled()).toBe(true);
  });

  it("Data and ID migrations work", async () => {
    const firstStore = new DataStore({
      id: "test-3",
      defaultData: { a: 1, b: 2 },
      formatVersion: 1,
      storageMethod: "sessionStorage",
    });

    await firstStore.loadData();

    await firstStore.setData({ ...firstStore.getData(), a: 2 });

    // new store with increased format version & new ID:
    const secondStore = new DataStore({
      id: "test-4",
      migrateIds: [firstStore.id],
      defaultData: { a: -1337, b: -1337, c: 69 },
      formatVersion: 2,
      storageMethod: "sessionStorage",
      migrations: {
        2: (oldData: Record<string, unknown>) => ({ ...oldData, c: 1 }),
      },
    });

    const data1 = await secondStore.loadData();

    expect(data1.a).toBe(2);
    expect(data1.b).toBe(2);
    expect(data1.c).toBe(1);

    await secondStore.saveDefaultData();
    const data2 = secondStore.getData();

    expect(data2.a).toBe(-1337);
    expect(data2.b).toBe(-1337);
    expect(data2.c).toBe(69);

    // migrate with migrateId method:
    const thirdStore = new TestDataStore({
      id: "test-5",
      defaultData: secondStore.defaultData,
      formatVersion: 3,
      storageMethod: "sessionStorage",
    });

    await thirdStore.migrateId(secondStore.id);
    const thirdData = await thirdStore.loadData();

    expect(thirdData.a).toBe(-1337);
    expect(thirdData.b).toBe(-1337);
    expect(thirdData.c).toBe(69);

    expect(await thirdStore.test_getValue("_uucfgver-test-5", "")).toBe("2");
    await thirdStore.setData(thirdStore.getData());
    expect(await thirdStore.test_getValue("_uucfgver-test-5", "")).toBe("3");

    expect(await thirdStore.test_getValue("_uucfgver-test-3", "")).toBe("");
    expect(await thirdStore.test_getValue("_uucfgver-test-4", "")).toBe("");
  });
});
