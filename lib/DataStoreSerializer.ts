/**
 * @module lib/DataStoreSerializer
 * This module contains the DataStoreSerializer class, which allows you to import and export serialized DataStore data - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#datastoreserializer)
 */

import { computeHash } from "./crypto.js";
import { getUnsafeWindow } from "./dom.js";
import { ChecksumMismatchError } from "./errors.js";
import type { DataStore } from "./DataStore.js";

export type DataStoreSerializerOptions = {
  /** Whether to add a checksum to the exported data. Defaults to `true` */
  addChecksum?: boolean;
  /** Whether to ensure the integrity of the data when importing it by throwing an error (doesn't throw when the checksum property doesn't exist). Defaults to `true` */
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
  /** The checksum of the data - key is not present when `addChecksum` is `false` */
  checksum?: string;
};

/** Result of {@linkcode DataStoreSerializer.loadStoresData()} */
export type LoadStoresDataResult = {
  /** The ID of the DataStore instance */
  id: string;
  /** The in-memory data object */
  data: object;
}

/** A filter for selecting data stores */
export type StoreFilter = string[] | ((id: string) => boolean);

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
   * Serializes only a subset of the data stores into a string.  
   * @param stores An array of store IDs or functions that take a store ID and return a boolean
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serializePartial(stores: StoreFilter, useEncoding?: boolean, stringified?: true): Promise<string>;
  /**
   * Serializes only a subset of the data stores into a string.  
   * @param stores An array of store IDs or functions that take a store ID and return a boolean
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serializePartial(stores: StoreFilter, useEncoding?: boolean, stringified?: false): Promise<SerializedDataStore[]>;
  /**
   * Serializes only a subset of the data stores into a string.  
   * @param stores An array of store IDs or functions that take a store ID and return a boolean
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serializePartial(stores: StoreFilter, useEncoding?: boolean, stringified?: boolean): Promise<string | SerializedDataStore[]>;
  /**
   * Serializes only a subset of the data stores into a string.  
   * @param stores An array of store IDs or functions that take a store ID and return a boolean
   * @param useEncoding Whether to encode the data using each DataStore's `encodeData()` method
   * @param stringified Whether to return the result as a string or as an array of `SerializedDataStore` objects
   */
  public async serializePartial(stores: StoreFilter, useEncoding = true, stringified = true): Promise<string | SerializedDataStore[]> {
    const serData: SerializedDataStore[] = [];

    for(const storeInst of this.stores.filter(s => typeof stores === "function" ? stores(s.id) : stores.includes(s.id))) {
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
    return this.serializePartial(this.stores.map(s => s.id), useEncoding, stringified);
  }

  /**
   * Deserializes the data exported via {@linkcode serialize()} and imports only a subset into the DataStore instances.  
   * Also triggers the migration process if the data format has changed.
   */
  public async deserializePartial(stores: StoreFilter, data: string | SerializedDataStore[]): Promise<void> {
    const deserStores: SerializedDataStore[] = typeof data === "string" ? JSON.parse(data) : data;

    if(!Array.isArray(deserStores) || !deserStores.every(DataStoreSerializer.isSerializedDataStore))
      throw new TypeError("Invalid serialized data format! Expected an array of SerializedDataStore objects.");

    for(const storeData of deserStores.filter(s => typeof stores === "function" ? stores(s.id) : stores.includes(s.id))) {
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
   * Deserializes the data exported via {@linkcode serialize()} and imports the data into all matching DataStore instances.  
   * Also triggers the migration process if the data format has changed.
   */
  public async deserialize(data: string | SerializedDataStore[]): Promise<void> {
    return this.deserializePartial(this.stores.map(s => s.id), data);
  }

  /**
   * Loads the persistent data of the DataStore instances into the in-memory cache.  
   * Also triggers the migration process if the data format has changed.
   * @param stores An array of store IDs or a function that takes the store IDs and returns a boolean - if omitted, all stores will be loaded
   * @returns Returns a PromiseSettledResult array with the results of each DataStore instance in the format `{ id: string, data: object }`
   */
  public async loadStoresData(stores?: StoreFilter): Promise<PromiseSettledResult<LoadStoresDataResult>[]> {
    return Promise.allSettled(
      this.getStoresFiltered(stores)
        .map(async (store) => ({
          id: store.id,
          data: await store.loadData(),
        })),
    );
  }

  /**
   * Resets the persistent and in-memory data of the DataStore instances to their default values.
   * @param stores An array of store IDs or a function that takes the store IDs and returns a boolean - if omitted, all stores will be affected
   */
  public async resetStoresData(stores?: StoreFilter): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(
      this.getStoresFiltered(stores).map(store => store.saveDefaultData()),
    );
  }

  /**
   * Deletes the persistent data of the DataStore instances.  
   * Leaves the in-memory data untouched.  
   * @param stores An array of store IDs or a function that takes the store IDs and returns a boolean - if omitted, all stores will be affected
   */
  public async deleteStoresData(stores?: StoreFilter): Promise<PromiseSettledResult<void>[]> {
    return Promise.allSettled(
      this.getStoresFiltered(stores).map(store => store.deleteData()),
    );
  }

  /** Checks if a given value is a SerializedDataStore object */
  public static isSerializedDataStore(obj: unknown): obj is SerializedDataStore {
    return typeof obj === "object" && obj !== null && "id" in obj && "data" in obj && "formatVersion" in obj && "encoded" in obj;
  }

  /** Returns the DataStore instances whose IDs match the provided array or function */
  protected getStoresFiltered(stores?: StoreFilter): DataStore[] {
    return this.stores.filter(s => typeof stores === "undefined" ? true : Array.isArray(stores) ? stores.includes(s.id) : stores(s.id));
  }
}
