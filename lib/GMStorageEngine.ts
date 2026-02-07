import { DataStoreEngine, type DataStoreData, type DataStoreEngineDSOptions, type SerializableVal } from "@sv443-network/coreutils";

/** Options for the {@linkcode GMStorageEngine} class */
export type GMStorageEngineOptions = {
  /**
   * Specifies the necessary options for storing data.  
   * - ⚠️ Only specify this if you are using this instance standalone! The parent DataStore will set this automatically.
   */
  dataStoreOptions?: DataStoreEngineDSOptions<DataStoreData>;
};

/**
 * Storage engine for the {@linkcode DataStore} class that uses GreaseMonkey's `GM.getValue` and `GM.setValue` functions.  
 *   
 * - ⚠️ Requires the grants `GM.getValue`, `GM.setValue`, `GM.deleteValue`, and `GM.listValues` in your userscript metadata.
 * - ⚠️ Don't reuse engine instances, always create a new one for each {@linkcode DataStore} instance.
 */
export class GMStorageEngine<TData extends DataStoreData> extends DataStoreEngine<TData> {
  protected options: GMStorageEngineOptions;// & Required<Pick<GMStorageEngineOptions, "extraPropFoo">>;

  /**
   * Creates an instance of `GMStorageEngine`.  
   *   
   * - ⚠️ Requires the grants `GM.getValue`, `GM.setValue`, `GM.deleteValue`, and `GM.listValues` in your userscript metadata.
   * - ⚠️ Don't reuse engine instances, always create a new one for each {@linkcode DataStore} instance.
   */
  constructor(options?: GMStorageEngineOptions) {
    super(options?.dataStoreOptions);
    this.options = {
      ...options,
    };
  }

  /** Fetches a value from persistent storage */
  public async getValue<TValue extends SerializableVal = string>(name: string, defaultValue: TValue): Promise<string | TValue> {
    try {
      const value = await GM.getValue(name, defaultValue);
      return value === undefined ? defaultValue : value;
    }
    catch(err) {
      console.error(`Error getting value for key "${name}":`, err);
      throw err;
    }
  }

  /** Sets a value in persistent storage */
  public async setValue<TValue extends SerializableVal = string>(name: string, value: TValue): Promise<void> {
    try {
      await GM.setValue(name, value as GM.Value);
    }
    catch(err) {
      console.error(`Error setting value for key "${name}":`, err);
      throw err;
    }
  }

  /** Deletes a value from persistent storage */
  public async deleteValue(name: string): Promise<void> {
    try {
      await GM.deleteValue(name);
    }
    catch(err) {
      console.error(`Error deleting value for key "${name}":`, err);
      throw err;
    }
  }

  /** Deletes the file that contains the data of this DataStore. */
  public async deleteStorage(): Promise<void> {
    try {
      const keys = await GM.listValues();
      for(const key of keys) {
        await GM.deleteValue(key);
      }
    }
    catch(err) {
      console.error("Error deleting storage:", err);
      throw err;
    }
  }
}
