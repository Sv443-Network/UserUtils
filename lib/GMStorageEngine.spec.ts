import { DataStore, type SerializableVal } from "@sv443-network/coreutils";
import { GMStorageEngine } from "./GMStorageEngine";
import { describe, expect, it, beforeEach, afterEach } from "vitest"
import { PlatformError } from "./Errors";

describe("GMStorageEngine", () => {
  beforeEach(() => {
    const storageKeyPrefix = "gm_polyfill_test_";
    const GM = {
      async getValue(key: string, defaultValue: SerializableVal) {
        const value = localStorage.getItem(`${storageKeyPrefix}${key}`);
        return value === null ? defaultValue : JSON.parse(value);
      },
      async setValue(key: string, value: SerializableVal) {
        localStorage.setItem(`${storageKeyPrefix}${key}`, JSON.stringify(value));
        return Promise.resolve();
      },
      async deleteValue(key: string) {
        localStorage.removeItem(`${storageKeyPrefix}${key}`);
        return Promise.resolve();
      },
      async listValues() {
        const keys = [];
        for(let i = 0; i < localStorage.length; i++) {
          const fullKey = localStorage.key(i);
          if(fullKey?.startsWith(storageKeyPrefix))
            keys.push(fullKey.substring(storageKeyPrefix.length));
        }
        return Promise.resolve(keys);
      },
    };
    globalThis.GM = GM as any;
  });
  
  afterEach(() => {
    delete (globalThis as any).GM;
  });

  it("Full DataStore integration test", async () => {
    const id = "integration-test-uncompressed";
    const defaultData = { a: 1, b: 2 };
    const store = new DataStore({
      id,
      defaultData,
      formatVersion: 1,
      engine: new GMStorageEngine(),
      compressionFormat: null,
    });

    const data = await store.loadData();

    expect(data).toEqual(defaultData);

    // parse file manually and check for contents:
    // __ds_fmt_ver = 1
    // __ds-integration-test-uncompressed-ver = 1
    // __ds-integration-test-uncompressed-enf = null
    // __ds-integration-test-uncompressed-dat = {"a":1,"b":2}

    expect(await store.engine.getValue(`__ds_fmt_ver`, "error")).toBe(1);
    expect(await store.engine.getValue(`__ds-${id}-ver`, "error")).toBe(1);
    expect(await store.engine.getValue(`__ds-${id}-enf`, "error")).toBe(null);
    expect(await store.engine.getValue(`__ds-${id}-dat`, "error")).toBe(JSON.stringify(defaultData));

    const newData = { a: 3, b: 4 };

    await store.setData(newData);

    expect(await store.engine.getValue(`__ds-${id}-dat`, "error")).toBe(JSON.stringify(newData));

    await store.deleteData();

    expect(await store.engine.getValue(`__ds-${id}-dat`, "error")).toBe("error");

    await store.engine.deleteStorage?.();

    expect(await store.engine.getValue(`__ds_fmt_ver`, "error")).toBe("error");
    expect(await store.engine.getValue(`__ds-${id}-ver`, "error")).toBe("error");
    expect(await store.engine.getValue(`__ds-${id}-enf`, "error")).toBe("error");
    expect(await store.engine.getValue(`__ds-${id}-dat`, "error")).toBe("error");
  });

  it("Throws if GM is not available", async () => {
    delete (globalThis as any).GM;

    const eng = new GMStorageEngine({
      dataStoreOptions: {
        id: "test",
      },
    });

    await expect(eng.getValue("key", "default")).rejects.toThrow();
    await expect(eng.setValue("key", "value")).rejects.toThrow();
    await expect(eng.deleteValue("key")).rejects.toThrow();
    await expect(eng.deleteStorage()).rejects.toThrow();
  });
});