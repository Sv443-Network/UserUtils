/* eslint-disable @typescript-eslint/no-explicit-any */

/** Function that takes the data in the old format and returns the data in the new format. Also supports an asynchronous migration. */
type MigrationFunc = (oldData: any) => any | Promise<any>;
/** Dictionary of format version numbers and the function that migrates to them from the previous whole integer */
type MigrationsDict = Record<number, MigrationFunc>;

/** Options for the ConfigManager instance */
export interface ConfigManagerOptions<TData> {
  /** A unique internal ID for this configuration - choose wisely as changing it is not supported yet. */
  id: string;
  /**
   * The default config data object to use if no data is saved in persistent storage yet.  
   * Until the data is loaded from persistent storage with `loadData()`, this will be the data returned by `getData()`  
   *   
   * ⚠️ This has to be an object that can be serialized to JSON, so no functions or circular references are allowed, they will cause unexpected behavior.  
   */
  defaultConfig: TData;
  /**
   * An incremental, whole integer version number of the current format of config data.  
   * If the format of the data is changed, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively.  
   *   
   * ⚠️ Never decrement this number and optimally don't skip any numbers either!
   */
  formatVersion: number;
  /**
   * A dictionary of functions that can be used to migrate data from older versions of the configuration to newer ones.  
   * The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value.  
   * The values should be functions that take the data in the old format and return the data in the new format.  
   * The functions will be run in order from the oldest to the newest version.  
   * If the current format version is not in the dictionary, no migrations will be run.
   */
  migrations?: MigrationsDict;
}

/**
 * Manages a user configuration that is cached in memory and persistently saved across sessions.  
 * Supports migrating data from older versions of the configuration to newer ones and populating the cache with default data if no persistent data is found.  
 *   
 * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`  
 * ⚠️ Make sure to call `loadData()` at least once after creating an instance, or the returned data will be the same as `options.defaultConfig`
 * 
 * @template TData The type of the data that is saved in persistent storage (will be automatically inferred from `config.defaultConfig`) - this should also be the type of the data format associated with the current `options.formatVersion`
 */
export class ConfigManager<TData = any> {
  public readonly id: string;
  public readonly formatVersion: number;
  public readonly defaultConfig: TData;
  private cachedConfig: TData;
  private migrations?: MigrationsDict;

  /**
   * Creates an instance of ConfigManager to manage a user configuration that is cached in memory and persistently saved across sessions.  
   * Supports migrating data from older versions of the configuration to newer ones and populating the cache with default data if no persistent data is found.  
   *   
   * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`  
   * ⚠️ Make sure to call `loadData()` at least once after creating an instance, or the returned data will be the same as `options.defaultConfig`
   * 
   * @template TData The type of the data that is saved in persistent storage (will be automatically inferred from `config.defaultConfig`) - this should also be the type of the data format associated with the current `options.formatVersion`
   * @param options The options for this ConfigManager instance
  */
  constructor(options: ConfigManagerOptions<TData>) {
    this.id = options.id;
    this.formatVersion = options.formatVersion;
    this.defaultConfig = options.defaultConfig;
    this.cachedConfig = options.defaultConfig;
    this.migrations = options.migrations;
  }

  /**
   * Loads the data saved in persistent storage into the in-memory cache and also returns it.  
   * Automatically populates persistent storage with default data if it doesn't contain any data yet.  
   * Also runs all necessary migration functions if the data format has changed since the last time the data was saved.
   */
  public async loadData(): Promise<TData> {
    try {
      const gmData = await GM.getValue(`_uucfg-${this.id}`, this.defaultConfig);
      let gmFmtVer = Number(await GM.getValue(`_uucfgver-${this.id}`));

      if(typeof gmData !== "string") {
        await this.saveDefaultData();
        return this.defaultConfig;
      }

      if(isNaN(gmFmtVer))
        await GM.setValue(`_uucfgver-${this.id}`, gmFmtVer = this.formatVersion);

      let parsed = JSON.parse(gmData);

      if(gmFmtVer < this.formatVersion && this.migrations)
        parsed = await this.runMigrations(parsed, gmFmtVer);

      return this.cachedConfig = typeof parsed === "object" ? parsed : undefined;
    }
    catch(err) {
      await this.saveDefaultData();
      return this.defaultConfig;
    }
  }

  /** Returns a copy of the data from the in-memory cache. Use `loadData()` to get fresh data from persistent storage (usually not necessary since the cache should always exactly reflect persistent storage). */
  public getData(): TData {
    return this.deepCopy(this.cachedConfig);
  }

  /** Saves the data synchronously to the in-memory cache and asynchronously to the persistent storage */
  public setData(data: TData) {
    this.cachedConfig = data;
    return new Promise<void>(async (resolve) => {
      await Promise.allSettled([
        GM.setValue(`_uucfg-${this.id}`, JSON.stringify(data)),
        GM.setValue(`_uucfgver-${this.id}`, this.formatVersion),
      ]);
      resolve();
    });
  }

  /** Saves the default configuration data passed in the constructor synchronously to the in-memory cache and asynchronously to persistent storage */
  public async saveDefaultData() {
    this.cachedConfig = this.defaultConfig;
    return new Promise<void>(async (resolve) => {
      await Promise.allSettled([
        GM.setValue(`_uucfg-${this.id}`, JSON.stringify(this.defaultConfig)),
        GM.setValue(`_uucfgver-${this.id}`, this.formatVersion),
      ]);
      resolve();
    });
  }

  /**
   * Call this method to clear all persistently stored data associated with this ConfigManager instance.  
   * The in-memory cache will be left untouched, so you may still access the data with `getData()`.  
   * Calling `loadData()` or `setData()` after this method was called will recreate persistent storage with the cached or default data.  
   *   
   * ⚠️ This requires the additional directive `@grant GM.deleteValue`
   */
  public async deleteConfig() {
    await Promise.allSettled([
      GM.deleteValue(`_uucfg-${this.id}`),
      GM.deleteValue(`_uucfgver-${this.id}`),
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
          console.error(`Error while running migration function for format version ${fmtVer}:`, err);
        }
      }
    }

    await Promise.allSettled([
      GM.setValue(`_uucfg-${this.id}`, JSON.stringify(newData)),
      GM.setValue(`_uucfgver-${this.id}`, lastFmtVer),
    ]);

    return newData as TData;
  }

  /** Copies a JSON-compatible object and loses its internal references */
  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
