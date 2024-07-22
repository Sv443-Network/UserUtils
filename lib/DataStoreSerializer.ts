import { getUnsafeWindow, type DataStore } from ".";

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

/**
 * Allows for easy serialization and deserialization of multiple DataStore instances.  
 * Needs to run in a secure context (HTTPS) due to the use of the Web Crypto API.
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
    const encoder = new TextEncoder();
    const data = encoder.encode(input);

    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, "0")).join("");

    return hashHex;
  }

  /** Serializes a DataStore instance */
  protected async serializeStore(store: DataStore): Promise<SerializedDataStore> {
    const data = store.encodingEnabled()
      ? await store.encodeData(JSON.stringify(store.getData()))
      : JSON.stringify(store.getData());
    const checksum = this.options.addChecksum
      ? await this.calcChecksum(data)
      : undefined;

    return {
      id: store.id,
      data,
      formatVersion: store.formatVersion,
      encoded: store.encodingEnabled(),
      checksum,
    };
  }

  /** Serializes the data stores into a string */
  public async serialize(): Promise<string> {
    const serData: SerializedDataStore[] = [];

    for(const store of this.stores)
      serData.push(await this.serializeStore(store));

    return JSON.stringify(serData);
  }

  /**
   * Deserializes the data exported via {@linkcode serialize()} and imports it into the DataStore instances.  
   * Also triggers the migration process if the data format has changed.
   */
  public async deserialize(serializedData: string): Promise<void> {
    const deserStores: SerializedDataStore[] = JSON.parse(serializedData);

    for(const storeData of deserStores) {
      const storeInst = this.stores.find(s => s.id === storeData.id);
      if(!storeInst)
        throw new Error(`DataStore instance with ID "${storeData.id}" not found! Make sure to provide it in the DataStoreSerializer constructor.`);

      if(this.options.ensureIntegrity && typeof storeData.checksum === "string") {
        const checksum = await this.calcChecksum(storeData.data);
        if(checksum !== storeData.checksum)
          throw new Error(`Checksum mismatch for DataStore with ID "${storeData.id}"!\nExpected: ${storeData.checksum}\nHas: ${checksum}`);
      }

      const decodedData = storeData.encoded && storeInst.encodingEnabled()
        ? await storeInst.decodeData(storeData.data)
        : storeData.data;

      if(storeData.formatVersion && !isNaN(Number(storeData.formatVersion)) && Number(storeData.formatVersion) < storeInst.formatVersion) {
        console.log("[BetterYTM/#DEBUG] UU - running migrations");
        await storeInst.runMigrations(JSON.parse(decodedData), Number(storeData.formatVersion), false);
      }
      else {
        console.log("[BetterYTM/#DEBUG] UU - setting directly", JSON.parse(decodedData));
        await storeInst.setData(JSON.parse(decodedData));
      }
    }
  }
}
