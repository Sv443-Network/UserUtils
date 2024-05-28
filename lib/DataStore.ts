/* eslint-disable @typescript-eslint/no-explicit-any */

/** Function that takes the data in the old format and returns the data in the new format. Also supports an asynchronous migration. */
type MigrationFunc = (oldData: any) => any | Promise<any>;
/** Dictionary of format version numbers and the function that migrates to them from the previous whole integer */
export type DataMigrationsDict = Record<number, MigrationFunc>;

/** Options for the DataStore instance */
export type DataStoreOptions<TData> = {
  /** A unique internal ID for this data store - choose wisely as changing it is not supported yet. */
  id: string;
  /**
   * The default data object to use if no data is saved in persistent storage yet.  
   * Until the data is loaded from persistent storage with `loadData()`, this will be the data returned by `getData()`  
   *   
   * ⚠️ This has to be an object that can be serialized to JSON, so no functions or circular references are allowed, they will cause unexpected behavior.  
   */
  defaultData: TData;
  /**
   * An incremental, whole integer version number of the current format of data.  
   * If the format of the data is changed in any way, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively.  
   *   
   * ⚠️ Never decrement this number and optimally don't skip any numbers either!
   */
  formatVersion: number;
  /**
   * A dictionary of functions that can be used to migrate data from older versions to newer ones.  
   * The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value.  
   * The values should be functions that take the data in the old format and return the data in the new format.  
   * The functions will be run in order from the oldest to the newest version.  
   * If the current format version is not in the dictionary, no migrations will be run.
   */
  migrations?: DataMigrationsDict;
}
& ({
  /**
   * Function to use to encode the data prior to saving it in persistent storage.  
   * If this is specified, make sure to declare {@linkcode decodeData()} as well.  
   *   
   * You can make use of UserUtils' [`compress()`](https://github.com/Sv443-Network/UserUtils?tab=readme-ov-file#compress) function here to make the data use up less space at the cost of a little bit of performance.
   * @param data The input data as a serialized object (JSON string)
   */
  encodeData: (data: string) => string | Promise<string>,
  /**
   * Function to use to decode the data after reading it from persistent storage.  
   * If this is specified, make sure to declare {@linkcode encodeData()} as well.  
   *   
   * You can make use of UserUtils' [`decompress()`](https://github.com/Sv443-Network/UserUtils?tab=readme-ov-file#decompress) function here to make the data use up less space at the cost of a little bit of performance.
   * @returns The resulting data as a valid serialized object (JSON string)
   */
  decodeData: (data: string) => string | Promise<string>,
} | {
  encodeData?: never,
  decodeData?: never,
});

/**
 * Manages a sync & async persistent JSON database that is cached in memory and persistently saved across sessions.  
 * Supports migrating data from older format versions to newer ones and populating the cache with default data if no persistent data is found.  
 *   
 * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`  
 * ⚠️ Make sure to call {@linkcode loadData()} at least once after creating an instance, or the returned data will be the same as `options.defaultData`
 * 
 * @template TData The type of the data that is saved in persistent storage (will be automatically inferred from `defaultData`) - this should also be the type of the data format associated with the current `formatVersion`
 */
export class DataStore<TData = any> {
  public readonly id: string;
  public readonly formatVersion: number;
  public readonly defaultData: TData;
  private cachedData: TData;
  private migrations?: DataMigrationsDict;
  private encodeData: DataStoreOptions<TData>["encodeData"];
  private decodeData: DataStoreOptions<TData>["decodeData"];

  /**
   * Creates an instance of DataStore to manage a sync & async database that is cached in memory and persistently saved across sessions.  
   * Supports migrating data from older versions to newer ones and populating the cache with default data if no persistent data is found.  
   *   
   * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`  
   * ⚠️ Make sure to call {@linkcode loadData()} at least once after creating an instance, or the returned data will be the same as `options.defaultData`
   * 
   * @template TData The type of the data that is saved in persistent storage (will be automatically inferred from `options.defaultData`) - this should also be the type of the data format associated with the current `options.formatVersion`
   * @param options The options for this DataStore instance
  */
  constructor(options: DataStoreOptions<TData>) {
    this.id = options.id;
    this.formatVersion = options.formatVersion;
    this.defaultData = options.defaultData;
    this.cachedData = options.defaultData;
    this.migrations = options.migrations;
    this.encodeData = options.encodeData;
    this.decodeData = options.decodeData;
  }

  /**
   * Loads the data saved in persistent storage into the in-memory cache and also returns it.  
   * Automatically populates persistent storage with default data if it doesn't contain any data yet.  
   * Also runs all necessary migration functions if the data format has changed since the last time the data was saved.
   */
  public async loadData(): Promise<TData> {
    try {
      const gmData = await GM.getValue(`_uucfg-${this.id}`, this.defaultData);
      let gmFmtVer = Number(await GM.getValue(`_uucfgver-${this.id}`));

      if(typeof gmData !== "string") {
        await this.saveDefaultData();
        return { ...this.defaultData };
      }

      const isEncoded = await GM.getValue(`_uucfgenc-${this.id}`, false);

      if(isNaN(gmFmtVer))
        await GM.setValue(`_uucfgver-${this.id}`, gmFmtVer = this.formatVersion);

      let parsed = await this.deserializeData(gmData, isEncoded);

      if(gmFmtVer < this.formatVersion && this.migrations)
        parsed = await this.runMigrations(parsed, gmFmtVer);

      return { ...(this.cachedData = parsed) };
    }
    catch(err) {
      console.warn("Error while parsing JSON data, resetting it to the default value.", err);
      await this.saveDefaultData();
      return this.defaultData;
    }
  }

  /**
   * Returns a copy of the data from the in-memory cache.  
   * Use {@linkcode loadData()} to get fresh data from persistent storage (usually not necessary since the cache should always exactly reflect persistent storage).
   */
  public getData(): TData {
    return this.deepCopy(this.cachedData);
  }

  /** Saves the data synchronously to the in-memory cache and asynchronously to the persistent storage */
  public setData(data: TData): Promise<void> {
    this.cachedData = data;
    const useEncoding = Boolean(this.encodeData && this.decodeData);
    return new Promise<void>(async (resolve) => {
      await Promise.all([
        GM.setValue(`_uucfg-${this.id}`, await this.serializeData(data, useEncoding)),
        GM.setValue(`_uucfgver-${this.id}`, this.formatVersion),
        GM.setValue(`_uucfgenc-${this.id}`, useEncoding),
      ]);
      resolve();
    });
  }

  /** Saves the default data passed in the constructor synchronously to the in-memory cache and asynchronously to persistent storage */
  public async saveDefaultData(): Promise<void> {
    this.cachedData = this.defaultData;
    const useEncoding = Boolean(this.encodeData && this.decodeData);
    return new Promise<void>(async (resolve) => {
      await Promise.all([
        GM.setValue(`_uucfg-${this.id}`, await this.serializeData(this.defaultData, useEncoding)),
        GM.setValue(`_uucfgver-${this.id}`, this.formatVersion),
        GM.setValue(`_uucfgenc-${this.id}`, useEncoding),
      ]);
      resolve();
    });
  }

  /**
   * Call this method to clear all persistently stored data associated with this DataStore instance.  
   * The in-memory cache will be left untouched, so you may still access the data with {@linkcode getData()}  
   * Calling {@linkcode loadData()} or {@linkcode setData()} after this method was called will recreate persistent storage with the cached or default data.  
   *   
   * ⚠️ This requires the additional directive `@grant GM.deleteValue`
   */
  public async deleteData(): Promise<void> {
    await Promise.all([
      GM.deleteValue(`_uucfg-${this.id}`),
      GM.deleteValue(`_uucfgver-${this.id}`),
      GM.deleteValue(`_uucfgenc-${this.id}`),
    ]);
  }

  /** Runs all necessary migration functions consecutively - may be overwritten in a subclass */
  protected async runMigrations(oldData: any, oldFmtVer: number): Promise<TData> {
    if(!this.migrations)
      return oldData as TData;

    let newData = oldData;
    const sortedMigrations = Object.entries(this.migrations)
      .sort(([a], [b]) => Number(a) - Number(b));

    let lastFmtVer = oldFmtVer;

    for(const [fmtVer, migrationFunc] of sortedMigrations) {
      const ver = Number(fmtVer);
      if(oldFmtVer < this.formatVersion && oldFmtVer < ver) {
        try {
          const migRes = migrationFunc(newData);
          newData = migRes instanceof Promise ? await migRes : migRes;
          lastFmtVer = oldFmtVer = ver;
        }
        catch(err) {
          console.error(`Error while running migration function for format version '${fmtVer}' - resetting to the default value.`, err);

          await this.saveDefaultData();
          return this.getData();
        }
      }
    }

    await Promise.all([
      GM.setValue(`_uucfg-${this.id}`, await this.serializeData(newData)),
      GM.setValue(`_uucfgver-${this.id}`, lastFmtVer),
      GM.setValue(`_uucfgenc-${this.id}`, Boolean(this.encodeData && this.decodeData)),
    ]);

    return newData as TData;
  }

  /** Serializes the data using the optional this.encodeData() and returns it as a string */
  private async serializeData(data: TData, useEncoding = true): Promise<string> {
    const stringData = JSON.stringify(data);
    if(!this.encodeData || !this.decodeData || !useEncoding)
      return stringData;

    const encRes = this.encodeData(stringData);
    if(encRes instanceof Promise)
      return await encRes;
    return encRes;
  }

  /** Deserializes the data using the optional this.decodeData() and returns it as a JSON object */
  private async deserializeData(data: string, useEncoding = true): Promise<TData> {
    let decRes = this.decodeData && this.encodeData && useEncoding ? this.decodeData(data) : undefined;
    if(decRes instanceof Promise)
      decRes = await decRes;

    return JSON.parse(decRes ?? data) as TData;
  }

  /** Copies a JSON-compatible object and loses its internal references */
  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
