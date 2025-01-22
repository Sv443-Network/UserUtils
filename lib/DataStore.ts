/**
 * @module lib/DataStore
 * This module contains the DataStore class, which is a general purpose, sync and async persistent JSON database - [see the documentation for more info](https://github.com/Sv443-Network/UserUtils/blob/main/docs.md#datastore)
 */

import type { Prettify } from "./types.js";

//#region types

/** Dictionary of format version numbers and the function that migrates to them from the previous whole integer */
export type DataMigrationsDict = Record<number, ((oldData: unknown) => unknown | Promise<unknown>)>;

/** Options for the DataStore instance */
export type DataStoreOptions<TData> = Prettify<
  & {
    /**
     * A unique internal ID for this data store.  
     * To avoid conflicts with other scripts, it is recommended to use a prefix that is unique to your script.  
     * If you want to change the ID, you should make use of the {@linkcode DataStore.migrateId()} method.
     */
    id: string;
    /**
     * The default data object to use if no data is saved in persistent storage yet.  
     * Until the data is loaded from persistent storage with {@linkcode DataStore.loadData()}, this will be the data returned by {@linkcode DataStore.getData()}.  
     *   
     * - ⚠️ This has to be an object that can be serialized to JSON using `JSON.stringify()`, so no functions or circular references are allowed, they will cause unexpected behavior.  
     */
    defaultData: TData;
    /**
     * An incremental, whole integer version number of the current format of data.  
     * If the format of the data is changed in any way, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively.  
     *   
     * - ⚠️ Never decrement this number and optimally don't skip any numbers either!
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
    /**
     * If an ID or multiple IDs are passed here, the data will be migrated from the old ID(s) to the current ID.  
     * This will happen once per page load, when {@linkcode DataStore.loadData()} is called.  
     * All future calls to {@linkcode DataStore.loadData()} in the session will not check for the old ID(s) anymore.  
     * To migrate IDs manually, use the method {@linkcode DataStore.migrateId()} instead.
     */
    migrateIds?: string | string[];
    /**
     * Where the data should be saved (`"GM"` by default).  
     * The protected methods {@linkcode DataStore.getValue()}, {@linkcode DataStore.setValue()}  and {@linkcode DataStore.deleteValue()} are used to interact with the storage.  
     * `"GM"` storage, `"localStorage"` and `"sessionStorage"` are supported out of the box, but in an extended class you can overwrite those methods to implement any other storage method.
     */
    storageMethod?: "GM" | "localStorage" | "sessionStorage";
  }
  & (
    | {
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
    }
    | {
      encodeData?: never,
      decodeData?: never,
    }
  )
>;

//#region class

/**
 * Manages a hybrid synchronous & asynchronous persistent JSON database that is cached in memory and persistently saved across sessions using [GM storage](https://wiki.greasespot.net/GM.setValue) (default), [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) or [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).  
 * Supports migrating data from older format versions to newer ones and populating the cache with default data if no persistent data is found.  
 * Can be overridden to implement any other storage method.  
 *   
 * All methods are `protected` or `public`, so you can easily extend this class and overwrite them to use a different storage method or to add other functionality.  
 * Remember that you can use `super.methodName()` in the subclass to call the original method if needed.  
 *   
 * - ⚠️ The data is stored as a JSON string, so only data compatible with [`JSON.stringify()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) can be used. Circular structures and complex objects (containing functions, symbols, etc.) will either throw an error on load and save or cause otherwise unexpected behavior. Properties with a value of `undefined` will be removed from the data prior to saving it, so use `null` instead.  
 * - ⚠️ If the storageMethod is left as the default of `"GM"`, the directives `@grant GM.getValue` and `@grant GM.setValue` are required. If you then also use the method {@linkcode DataStore.deleteData()}, the extra directive `@grant GM.deleteValue` is needed too.  
 * - ⚠️ Make sure to call {@linkcode loadData()} at least once after creating an instance, or the returned data will be the same as `options.defaultData`  
 * 
 * @template TData The type of the data that is saved in persistent storage for the currently set format version (will be automatically inferred from `defaultData` if not provided)
 */
export class DataStore<TData extends object = object> {
  public readonly id: string;
  public readonly formatVersion: number;
  public readonly defaultData: TData;
  public readonly encodeData: DataStoreOptions<TData>["encodeData"];
  public readonly decodeData: DataStoreOptions<TData>["decodeData"];
  public readonly storageMethod: Required<DataStoreOptions<TData>>["storageMethod"];
  private cachedData: TData;
  private migrations?: DataMigrationsDict;
  private migrateIds: string[] = [];

  /**
   * Creates an instance of DataStore to manage a sync & async database that is cached in memory and persistently saved across sessions.  
   * Supports migrating data from older versions to newer ones and populating the cache with default data if no persistent data is found.  
   *   
   * - ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue` if the storageMethod is left as the default of `"GM"`  
   * - ⚠️ Make sure to call {@linkcode loadData()} at least once after creating an instance, or the returned data will be the same as `options.defaultData`
   * 
   * @template TData The type of the data that is saved in persistent storage for the currently set format version (will be automatically inferred from `defaultData` if not provided) - **This has to be a JSON-compatible object!** (no undefined, circular references, etc.)
   * @param options The options for this DataStore instance
   */
  constructor(options: DataStoreOptions<TData>) {
    this.id = options.id;
    this.formatVersion = options.formatVersion;
    this.defaultData = options.defaultData;
    this.cachedData = options.defaultData;
    this.migrations = options.migrations;
    if(options.migrateIds)
      this.migrateIds = Array.isArray(options.migrateIds) ? options.migrateIds : [options.migrateIds];
    this.storageMethod = options.storageMethod ?? "GM";
    this.encodeData = options.encodeData;
    this.decodeData = options.decodeData;
  }

  //#region public

  /**
   * Loads the data saved in persistent storage into the in-memory cache and also returns it.  
   * Automatically populates persistent storage with default data if it doesn't contain any data yet.  
   * Also runs all necessary migration functions if the data format has changed since the last time the data was saved.
   */
  public async loadData(): Promise<TData> {
    try {
      if(this.migrateIds.length > 0) {
        await this.migrateId(this.migrateIds);
        this.migrateIds = [];
      }

      const gmData = await this.getValue(`_uucfg-${this.id}`, JSON.stringify(this.defaultData));
      let gmFmtVer = Number(await this.getValue(`_uucfgver-${this.id}`, NaN));

      if(typeof gmData !== "string") {
        await this.saveDefaultData();
        return { ...this.defaultData };
      }

      const isEncoded = Boolean(await this.getValue(`_uucfgenc-${this.id}`, false));

      let saveData = false;
      if(isNaN(gmFmtVer)) {
        await this.setValue(`_uucfgver-${this.id}`, gmFmtVer = this.formatVersion);
        saveData = true;
      }

      let parsed = await this.deserializeData(gmData, isEncoded);

      if(gmFmtVer < this.formatVersion && this.migrations)
        parsed = await this.runMigrations(parsed, gmFmtVer);

      if(saveData)
        await this.setData(parsed);

      this.cachedData = { ...parsed };
      return this.cachedData;
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
   * @param deepCopy Whether to return a deep copy of the data (default: `false`) - only necessary if your data object is nested and may have a bigger performance impact if enabled
   */
  public getData(deepCopy = false): TData {
    return deepCopy
      ? this.deepCopy(this.cachedData)
      : { ...this.cachedData };
  }

  /** Saves the data synchronously to the in-memory cache and asynchronously to the persistent storage */
  public setData(data: TData): Promise<void> {
    this.cachedData = data;
    const useEncoding = this.encodingEnabled();
    return new Promise<void>(async (resolve) => {
      await Promise.all([
        this.setValue(`_uucfg-${this.id}`, await this.serializeData(data, useEncoding)),
        this.setValue(`_uucfgver-${this.id}`, this.formatVersion),
        this.setValue(`_uucfgenc-${this.id}`, useEncoding),
      ]);
      resolve();
    });
  }

  /** Saves the default data passed in the constructor synchronously to the in-memory cache and asynchronously to persistent storage */
  public async saveDefaultData(): Promise<void> {
    this.cachedData = this.defaultData;
    const useEncoding = this.encodingEnabled();
    return new Promise<void>(async (resolve) => {
      await Promise.all([
        this.setValue(`_uucfg-${this.id}`, await this.serializeData(this.defaultData, useEncoding)),
        this.setValue(`_uucfgver-${this.id}`, this.formatVersion),
        this.setValue(`_uucfgenc-${this.id}`, useEncoding),
      ]);
      resolve();
    });
  }

  /**
   * Call this method to clear all persistently stored data associated with this DataStore instance.  
   * The in-memory cache will be left untouched, so you may still access the data with {@linkcode getData()}  
   * Calling {@linkcode loadData()} or {@linkcode setData()} after this method was called will recreate persistent storage with the cached or default data.  
   *   
   * - ⚠️ This requires the additional directive `@grant GM.deleteValue` if the storageMethod is left as the default of `"GM"`
   */
  public async deleteData(): Promise<void> {
    await Promise.all([
      this.deleteValue(`_uucfg-${this.id}`),
      this.deleteValue(`_uucfgver-${this.id}`),
      this.deleteValue(`_uucfgenc-${this.id}`),
    ]);
  }

  /** Returns whether encoding and decoding are enabled for this DataStore instance */
  public encodingEnabled(): this is Required<Pick<DataStoreOptions<TData>, "encodeData" | "decodeData">> {
    return Boolean(this.encodeData && this.decodeData);
  }

  //#region migrations

  /**
   * Runs all necessary migration functions consecutively and saves the result to the in-memory cache and persistent storage and also returns it.  
   * This method is automatically called by {@linkcode loadData()} if the data format has changed since the last time the data was saved.  
   * Though calling this method manually is not necessary, it can be useful if you want to run migrations for special occasions like a user importing potentially outdated data that has been previously exported.  
   *   
   * If one of the migrations fails, the data will be reset to the default value if `resetOnError` is set to `true` (default). Otherwise, an error will be thrown and no data will be saved.
   */
  public async runMigrations(oldData: unknown, oldFmtVer: number, resetOnError = true): Promise<TData> {
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
          if(!resetOnError)
            throw new Error(`Error while running migration function for format version '${fmtVer}'`);

          console.error(`Error while running migration function for format version '${fmtVer}' - resetting to the default value.`, err);

          await this.saveDefaultData();
          return this.getData();
        }
      }
    }

    await Promise.all([
      this.setValue(`_uucfg-${this.id}`, await this.serializeData(newData as TData)),
      this.setValue(`_uucfgver-${this.id}`, lastFmtVer),
      this.setValue(`_uucfgenc-${this.id}`, this.encodingEnabled()),
    ]);

    return this.cachedData = { ...newData as TData };
  }

  /**
   * Tries to migrate the currently saved persistent data from one or more old IDs to the ID set in the constructor.  
   * If no data exist for the old ID(s), nothing will be done, but some time may still pass trying to fetch the non-existent data.
   */
  public async migrateId(oldIds: string | string[]): Promise<void> {
    const ids = Array.isArray(oldIds) ? oldIds : [oldIds];
    await Promise.all(ids.map(async id => {
      const data = await this.getValue(`_uucfg-${id}`, JSON.stringify(this.defaultData));
      const fmtVer = Number(await this.getValue(`_uucfgver-${id}`, NaN));
      const isEncoded = Boolean(await this.getValue(`_uucfgenc-${id}`, false));

      if(data === undefined || isNaN(fmtVer))
        return;

      const parsed = await this.deserializeData(data, isEncoded);
      await Promise.allSettled([
        this.setValue(`_uucfg-${this.id}`, await this.serializeData(parsed)),
        this.setValue(`_uucfgver-${this.id}`, fmtVer),
        this.setValue(`_uucfgenc-${this.id}`, isEncoded),
        this.deleteValue(`_uucfg-${id}`),
        this.deleteValue(`_uucfgver-${id}`),
        this.deleteValue(`_uucfgenc-${id}`),
      ]);
    }));
  }

  //#region serialization

  /** Serializes the data using the optional this.encodeData() and returns it as a string */
  protected async serializeData(data: TData, useEncoding = true): Promise<string> {
    const stringData = JSON.stringify(data);
    if(!this.encodingEnabled() || !useEncoding)
      return stringData;

    const encRes = this.encodeData(stringData);
    if(encRes instanceof Promise)
      return await encRes;
    return encRes;
  }

  /** Deserializes the data using the optional this.decodeData() and returns it as a JSON object */
  protected async deserializeData(data: string, useEncoding = true): Promise<TData> {
    let decRes = this.encodingEnabled() && useEncoding ? this.decodeData(data) : undefined;
    if(decRes instanceof Promise)
      decRes = await decRes;

    return JSON.parse(decRes ?? data) as TData;
  }

  //#region misc

  /** Copies a JSON-compatible object and loses all its internal references in the process */
  protected deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  //#region storage

  /** Gets a value from persistent storage - can be overwritten in a subclass if you want to use something other than the default storage methods */
  protected async getValue<TValue extends GM.Value = string>(name: string, defaultValue: TValue): Promise<string | TValue> {
    switch(this.storageMethod) {
    case "localStorage":
      return localStorage.getItem(name) as TValue ?? defaultValue;
    case "sessionStorage":
      return sessionStorage.getItem(name) as string ?? defaultValue;
    default: 
      return GM.getValue<TValue>(name, defaultValue);
    }
  }

  /**
   * Sets a value in persistent storage - can be overwritten in a subclass if you want to use something other than the default storage methods.  
   * The default storage engines will stringify all passed values like numbers or booleans, so be aware of that.
   */
  protected async setValue(name: string, value: GM.Value): Promise<void> {
    switch(this.storageMethod) {
    case "localStorage":
      return localStorage.setItem(name, String(value));
    case "sessionStorage":
      return sessionStorage.setItem(name, String(value));
    default:
      return GM.setValue(name, String(value));
    }
  }

  /** Deletes a value from persistent storage - can be overwritten in a subclass if you want to use something other than the default storage methods */
  protected async deleteValue(name: string): Promise<void> {
    switch(this.storageMethod) {
    case "localStorage":
      return localStorage.removeItem(name);
    case "sessionStorage":
      return sessionStorage.removeItem(name);
    default:
      return GM.deleteValue(name);
    }
  }
}
