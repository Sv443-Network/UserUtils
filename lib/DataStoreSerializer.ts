/**
 * @module lib/DataStoreSerializer
 * This module contains the DataStoreSerializer class, which allows you to import and export serialized DataStore data - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#datastoreserializer)
 */

import { computeHash } from "./crypto.js";
import { getUnsafeWindow } from "./dom.js";
import { ChecksumMismatchError } from "./errors.js";
import type { DataStore } from "./DataStore.js";

export type DataStoreSerializerOptions = {
  /** Whether to add a checksum to the exported data */
  addChecksum?: boolean;
  /** Whether to ensure the integrity of the data when importing it (unless the checksum property doesn't exist) */
  ensureIntegrity?: boolean;
};

/** Serialized data of a DataStore instance */
export type SerializedDataStore = {
  /** The ID of the DataStore instance */
  id: string;
  /** The serialized data */
  data: string;
  /** The format version of the data */
  formatVersion: number;
  /** Whether the data is encoded */
  encoded: boolean;
  /** The checksum of the data - key is not present for data without a checksum */
  checksum?: string;
};

/** Result of {@linkcode DataStoreSerializer.loadStoresData()} */
export type LoadStoresDataResult = {
  /** The ID of the DataStore instance */
  id: string;
  /** The in-memory data object */
  data: object;
}

/**
 * Allows for easy serialization and deserialization of multiple DataStore instances.  
 *   
 * All methods are at least `protected`, so you can easily extend this class and overwrite them to use a different storage method or to add additional functionality.  
 * Remember that you can call `super.methodName()` in the subclass to access the original method.  
 *   
 * - ⚠️ Needs to run in a secure context (HTTPS) due to the use of the SubtleCrypto API if checksumming is enabled.  
 */
export class DataStoreSerializer {
  protected stores: DataStore[];
  protected options: Required<DataStoreSerializerOptions>;

  constructor(stores: DataStore[], options: DataStoreSerializerOptions = {}) {
    if(!getUnsafeWindow().crypto || !getUnsafeWindow().crypto.subtle)
      throw new Error("DataStoreSerializer has to run in a secure context (HTTPS)!");

    this.stores = stores;
    this.options = {
      addChecksum: true,
      ensureIntegrity: true,
      ...options,
    };
  }

  /** Calculates the checksum of a string */
  protected async calcChecksum(input: string): Promise<string> {
    return computeHash(input, "SHA-256");
  }

  /**
   * Serializes the data stores into a string.  
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serialize(useEncoding?: boolean, stringified?: true): Promise<string>;
  /**
   * Serializes the data stores into a string.  
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serialize(useEncoding?: boolean, stringified?: false): Promise<SerializedDataStore[]>;
  /**
   * Serializes the data stores into a string.  
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serialize(useEncoding = true, stringified = true): Promise<string | SerializedDataStore[]> {
    const serData: SerializedDataStore[] = [];

    for(const storeInst of this.stores) {
      const data = useEncoding && storeInst.encodingEnabled()
        ? await storeInst.encodeData(JSON.stringify(storeInst.getData()))
        : JSON.stringify(storeInst.getData());

      serData.push({
        id: storeInst.id,
        data,
        formatVersion: storeInst.formatVersion,
        encoded: useEncoding && storeInst.encodingEnabled(),
        checksum: this.options.addChecksum
          ? await this.calcChecksum(data)
          : undefined,
      });
    }

    return stringified ? JSON.stringify(serData) : serData;
  }

  /**
   * Deserializes the data exported via {@linkcode serialize()} and imports it into the DataStore instances.  
   * Also triggers the migration process if the data format has changed.
   */
  public async deserialize(serializedData: string | SerializedDataStore[]): Promise<void> {
    const deserStores: SerializedDataStore[] = typeof serializedData === "string" ? JSON.parse(serializedData) : serializedData;

    if(!Array.isArray(deserStores) || !deserStores.every(DataStoreSerializer.isSerializedDataStore))
      throw new TypeError("Invalid serialized data format! Expected an array of SerializedDataStore objects.");

    for(const storeData of deserStores) {
      const storeInst = this.stores.find(s => s.id === storeData.id);
      if(!storeInst)
        throw new Error(`DataStore instance with ID "${storeData.id}" not found! Make sure to provide it in the DataStoreSerializer constructor.`);

      if(this.options.ensureIntegrity && typeof storeData.checksum === "string") {
        const checksum = await this.calcChecksum(storeData.data);
        if(checksum !== storeData.checksum)
          throw new ChecksumMismatchError(`Checksum mismatch for DataStore with ID "${storeData.id}"!\nExpected: ${storeData.checksum}\nHas: ${checksum}`);
      }

      const decodedData = storeData.encoded && storeInst.encodingEnabled()
        ? await storeInst.decodeData(storeData.data)
        : storeData.data;

      if(storeData.formatVersion && !isNaN(Number(storeData.formatVersion)) && Number(storeData.formatVersion) < storeInst.formatVersion)
        await storeInst.runMigrations(JSON.parse(decodedData), Number(storeData.formatVersion), false);
      else
        await storeInst.setData(JSON.parse(decodedData));
    }
  }

  /**
   * Loads the persistent data of the DataStore instances into the in-memory cache.  
   * Also triggers the migration process if the data format has changed.
   * @returns Returns a PromiseSettledResult array with the results of each DataStore instance in the format `{ id: string, data: object }`
   */
  public async loadStoresData(): Promise<PromiseSettledResult<LoadStoresDataResult>[]> {
    return Promise.allSettled(this.stores.map(
      async store => ({
        id: store.id,
        data: await store.loadData(),
      })
    ));
  }

  /** Resets the persistent data of the DataStore instances to their default values. */
  public async resetStoresData(): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(this.stores.map(store => store.saveDefaultData()));
  }

  /**
   * Deletes the persistent data of the DataStore instances.  
   * Leaves the in-memory data untouched.
   */
  public async deleteStoresData(): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(this.stores.map(store => store.deleteData()));
  }

  /** Checks if a given value is a SerializedDataStore object */
  public static isSerializedDataStore(obj: unknown): obj is SerializedDataStore {
    return typeof obj === "object" && obj !== null && "id" in obj && "data" in obj && "formatVersion" in obj && "encoded" in obj;
  }
}
