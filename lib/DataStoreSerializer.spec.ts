import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DataStoreSerializer } from "./DataStoreSerializer.js";
import { DataStore } from "./DataStore.js";
import { beforeEach } from "node:test";
import { compress, decompress } from "./crypto.js";

const store1 = new DataStore({
  id: "dss-test-1",
  defaultData: { a: 1, b: 2 },
  formatVersion: 1,
  storageMethod: "sessionStorage",
});

const store2 = new DataStore({
  id: "dss-test-2",
  defaultData: { c: 1, d: 2 },
  formatVersion: 1,
  storageMethod: "sessionStorage",
  encodeData: async (data) => await compress(data, "deflate-raw", "string"),
  decodeData: async (data) => await decompress(data, "deflate-raw", "string"),
});

const getStores = () => [
  store1,
  store2,
];

describe("DataStoreSerializer", () => {
  beforeEach(async () => {
    const ser = new DataStoreSerializer(getStores());
    await ser.deleteStoresData();
    await ser.resetStoresData();
    await ser.loadStoresData();
  });

  afterAll(async () => {
    await new DataStoreSerializer(getStores()).deleteStoresData();
  });

  it("Serialization", async () => {
    const ser = new DataStoreSerializer(getStores());
    await ser.loadStoresData();

    const full = await ser.serialize();
    expect(full).toEqual(`[{"id":"dss-test-1","data":"{\\"a\\":1,\\"b\\":2}","formatVersion":1,"encoded":false,"checksum":"43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"},{"id":"dss-test-2","data":"q1ZKVrIy1FFKUbIyqgUA","formatVersion":1,"encoded":true,"checksum":"b1020c3faac493009494fa622f701b831657c11ea53f8c8236f0689089c7e2d3"}]`);

    const partial = await ser.serializePartial(["dss-test-1"]);
    expect(partial).toEqual(`[{"id":"dss-test-1","data":"{\\"a\\":1,\\"b\\":2}","formatVersion":1,"encoded":false,"checksum":"43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777"}]`);

    const unencoded = await ser.serializePartial(["dss-test-2"], false);
    expect(unencoded).toEqual(`[{"id":"dss-test-2","data":"{\\"c\\":1,\\"d\\":2}","formatVersion":1,"encoded":false,"checksum":"86cada6157f4b726bf413e0371a2f461a82d2809e6eb3c095ec796fcfd8d72ee"}]`);

    const notStringified = await ser.serializePartial(["dss-test-2"], false, false);
    expect(DataStoreSerializer.isSerializedDataStoreObjArray(notStringified)).toBe(true);
    expect(DataStoreSerializer.isSerializedDataStoreObj(notStringified?.[0])).toBe(true);
    expect(notStringified).toEqual([
      {
        id: "dss-test-2",
        data: "{\"c\":1,\"d\":2}",
        encoded: false,
        formatVersion: 1,
        checksum: "86cada6157f4b726bf413e0371a2f461a82d2809e6eb3c095ec796fcfd8d72ee",
      },
    ]);
  });

  it("Deserialization", async () => {
    const stores = getStores();
    const ser = new DataStoreSerializer(stores);

    await ser.deserialize(`[{"id":"dss-test-2","data":"{\\"c\\":420,\\"d\\":420}","formatVersion":1,"encoded":false}]`);
    expect(store2.getData().c).toBe(420);

    await ser.resetStoresData();
    expect(store1.getData().a).toBe(1);
    expect(store2.getData().c).toBe(1);

    await ser.resetStoresData();
    await ser.deserializePartial(["dss-test-1"], `[{"id":"dss-test-1","data":"{\\"a\\":421,\\"b\\":421}","checksum":"ad33b8f6a1d18c781a80390496b1b7dfaf56d73cf25a9497cb156ba83214357d","formatVersion":1,"encoded":false}, {"id":"dss-test-2","data":"{\\"c\\":421,\\"d\\":421}","formatVersion":1,"encoded":false}]`);
    expect(store1.getData().a).toBe(421);
    expect(store2.getData().c).toBe(1);

    await ser.resetStoresData();
    await ser.deserializePartial(["dss-test-2"], `[{"id":"dss-test-1","data":"{\\"a\\":422,\\"b\\":422}","formatVersion":1,"encoded":false}, {"id":"dss-test-2","data":"{\\"c\\":422,\\"d\\":422}","checksum":"ab1d18cf13554369cea6bb517a9034e3d6548f19a40d176b16ac95c8e02d65bb","formatVersion":1,"encoded":false}]`);
    expect(store1.getData().a).toBe(1);
    expect(store2.getData().c).toBe(422);

    await ser.resetStoresData(() => false);
    expect(store1.getData().a).toBe(1);
    expect(store2.getData().c).toBe(422);
  });
});
