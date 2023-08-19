/* eslint-disable @typescript-eslint/no-explicit-any */

/** Function that takes the data in the old format and returns the data in the new format. Also supports an asynchronous migration. */
type MigrationFunc = <TOldData = any>(oldData: TOldData) => any | Promise<any>;
/** Dictionary of format version numbers and the function that migrates from them to the next whole integer. */
type MigrationsDict = Record<number, MigrationFunc>;

export interface ConfigManagerOptions<TData> {
  /** A unique ID for this configuration */
  id: string;
  /** The default config data to use if no data is saved in persistent storage yet. Until the data is loaded from persistent storage, this will be the data returned by `getData()` */
  defaultConfig: TData;
  /** An incremental version of the data format. If the format of the data is changed, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively. Never decrement this number, but you may skip numbers if you need to for some reason. */
  formatVersion: number;
  /** A dictionary of functions that can be used to migrate data from older versions of the configuration to newer ones. The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value. The values should be functions that take the data in the old format and return the data in the new format. The functions will be run in order from the oldest to the newest version. If the current format version is not in the dictionary, no migrations will be run. */
  migrations?: MigrationsDict;
  /** If set to true, the already stored data in persistent storage is loaded asynchronously as soon as this instance is created. Note that this might cause race conditions as it is uncertain when the internal data cache gets populated. */
  autoLoad?: boolean;
}

/**
 * Manages a user configuration that is cached in memory and persistently saved across sessions.  
 * Supports migrating data from older versions of the configuration to newer ones and populating the cache with default data if no persistent data is found.  
 *   
 * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`
 * 
 * @template TData The type of the data that is saved in persistent storage (will be automatically inferred from `config.defaultConfig`) - this should also be the type of the data format associated with the `options.formatVersion`
 */
export class ConfigManager<TData = any> {
  public readonly id: string;
  public readonly formatVersion: number;
  public readonly defaultConfig: TData;
  private cachedConfig: TData;
  private migrations?: MigrationsDict;

  /**
   * Creates an instance of ConfigManager.  
   * Make sure to call `loadData()` after creating an instance if you didn't set `autoLoad` to true.
   * @param options The options for this ConfigManager instance
   */
  constructor(options: ConfigManagerOptions<TData>) {
    this.id = options.id;
    this.formatVersion = options.formatVersion;
    this.defaultConfig = options.defaultConfig;
    this.cachedConfig = options.defaultConfig;
    this.migrations = options.migrations;

    if(options.autoLoad === true)
      this.loadData();
  }

  /** Loads the data saved in persistent storage into the in-memory cache and also returns it. Automatically populates persistent storage with default data if it doesn't contain data yet. */
  public async loadData(): Promise<TData> {
    try {
      const gmData = await GM.getValue(this.id, this.defaultConfig);
      let gmFmtVer = Number(await GM.getValue(`_uufmtver-${this.id}`));

      if(typeof gmData !== "string")
        return await this.saveDefaultData();

      if(isNaN(gmFmtVer))
        await GM.setValue(`_uufmtver-${this.id}`, gmFmtVer = this.formatVersion);

      let parsed = JSON.parse(gmData);

      if(gmFmtVer < this.formatVersion)
        parsed = await this.runMigrations(parsed, gmFmtVer);

      return this.cachedConfig = typeof parsed === "object" ? parsed : undefined;
    }
    catch(err) {
      return await this.saveDefaultData();
    }
  }

  /** Returns a copy of the data from the in-memory cache. Use `loadData()` to get fresh data from persistent storage (usually not necessary since the cache should always exactly reflect persistent storage). */
  public getData(): TData {
    return this.deepCopy(this.cachedConfig);
  }

  /** Saves the data synchronously to the in-memory cache and asynchronously to the persistent storage */
  public setData(data: TData) {
    this.cachedConfig = data;
    return new Promise<TData>(async (resolve) => {
      await GM.setValue(this.id, JSON.stringify(data));
      await GM.setValue(`_uufmtver-${this.id}`, this.formatVersion);
      resolve(data);
    });
  }

  /** Saves the default configuration data passed in the constructor synchronously to the in-memory cache and asynchronously to persistent storage */
  public async saveDefaultData() {
    this.cachedConfig = this.defaultConfig;
    return new Promise<TData>(async (resolve) => {
      await GM.setValue(this.id, JSON.stringify(this.defaultConfig));
      await GM.setValue(`_uufmtver-${this.id}`, this.formatVersion);
      resolve(this.defaultConfig);
    });
  }

  /**
   * Call this method to clear all persistently stored data associated with this ConfigManager instance.  
   * The in-memory cache will be left untouched, so you may still access the data with `getData()`  
   * Calling `loadData()` or `setData()` after this method was called will recreate persistent storage with the cached or default data.  
   *   
   * ⚠️ This requires the additional directive `@grant GM.deleteValue`
   */
  public async deleteConfig() {
    await GM.deleteValue(this.id);
    await GM.deleteValue(`_uufmtver-${this.id}`);
  }

  /** Runs all necessary migration functions consecutively - may be overwritten in a subclass */
  protected async runMigrations(oldData: any, oldFmtVer: number): Promise<TData> {
    console.info("#DEBUG#-- RUNNING MIGRATIONS", oldFmtVer, "->", this.formatVersion, "- oldData:", oldData);

    if(!this.migrations)
      return oldData as TData;

    // TODO: verify
    let newData = oldData;
    const sortedMigrations = Object.entries(this.migrations)
      .sort(([a], [b]) => Number(a) - Number(b));

    for(const [fmtVer, migrationFunc] of sortedMigrations) {
      const ver = Number(fmtVer);
      if(oldFmtVer < this.formatVersion && oldFmtVer < ver) {
        const migRes = migrationFunc(newData);
        newData = migRes instanceof Promise ? await migRes : migRes;
        oldFmtVer = ver;
      }
    }

    await GM.setValue(`_uufmtver-${this.id}`, this.formatVersion);
    return newData as TData;
  }

  protected deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
