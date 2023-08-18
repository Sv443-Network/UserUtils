/**
 * Describes an object or primitive value that can be serialized as JSON  
 * [Source](https://github.com/microsoft/TypeScript/issues/1897#issuecomment-338650717)
 */
export type JSONCompatible = boolean | number | string | null | JSONArray | JSONMap;
interface JSONMap { [key: string]: JSONCompatible; }
interface JSONArray extends Array<JSONCompatible> {}

/** Function that takes the data in the old format and returns the data in the new format. Also supports an asynchronous migration. */
type MigrationFunc = <TOldData extends JSONCompatible, TNewData extends JSONCompatible>(oldData: TOldData) => TNewData | Promise<TNewData>;
/** Dictionary of format version numbers and the function that migrates from them to the next whole integer. */
type MigrationsDict = Record<number, MigrationFunc>;


/**
 * Manages a user configuration that is cached in memory and persistently saved across sessions.  
 * Supports migrating data from older versions of the configuration to newer ones and populating the cache with default data if no persistent data is found.  
 *   
 * ⚠️ Requires the directives `@grant GM.getValue` and `@grant GM.setValue`
 */
export class Config<TData extends JSONCompatible = JSONCompatible> {
  public readonly id: string;
  public readonly formatVersion: number;
  public readonly defaultData: TData;
  public readonly migrations?: MigrationsDict;
  private cachedData: TData;

  /**
   * Creates an instance of Config.
   * @param id A unique ID for this configuration
   * @param defaultData The default data to use if no data is saved yet. Until the data is loaded from persistent storage, this will be the data returned by `getData()`
   * @param formatVersion An incremental version of the data format. If the format of the data is changed, this number should be incremented, in which case all necessary functions of the migrations dictionary will be run consecutively. Never decrement this number, but you may skip numbers if you need to for some reason.
   * @param migrations A dictionary of functions that can be used to migrate data from older versions of the configuration to newer ones. The keys of the dictionary should be the format version that the functions can migrate to, from the previous whole integer value. The values should be functions that take the data in the old format and return the data in the new format. The functions will be run in order from the oldest to the newest version. If the current format version is not in the dictionary, no migrations will be run.
   */
  constructor(id: string, formatVersion: number, defaultData: TData, migrations?: MigrationsDict) {
    this.id = id;
    this.formatVersion = formatVersion;
    this.defaultData = this.cachedData = defaultData;
    this.migrations = migrations;

    this.loadData();
  }

  /** Loads the data saved in persistent storage into the in-memory cache and also returns it */
  public async loadData(): Promise<TData | undefined> {
    try {
      const gmData = await GM.getValue(this.id, this.defaultData);
      const gmFmtVer = await GM.getValue(`_uufmtver-${this.id}`);

      if(typeof gmData !== "string" || typeof gmFmtVer !== "number")
        return undefined;

      let parsed = JSON.parse(gmData);

      if(this.formatVersion > gmFmtVer)
        parsed = await this.runMigrations(parsed, gmFmtVer);

      return this.cachedData = typeof parsed === "object" ? parsed : undefined;
    }
    catch(err) {
      return undefined;
    }
  }

  /** Returns the data from the in-memory cache. Use `loadData()` to get fresh data from persistent storage (usually not necessary). */
  public getData(): TData {
    return this.cachedData;
  }

  /** Saves the data synchronously to the in-memory cache and asynchronously to the persistent storage */
  public setData(data: TData) {
    this.cachedData = data;
    return new Promise<void>(async (resolve) => {
      await GM.setValue(this.id, JSON.stringify(data));
      await GM.setValue(`_uufmtver-${this.id}`, this.formatVersion);
      resolve();
    });
  }

  /** Runs all necessary migration functions consecutively */
  protected async runMigrations(oldData: JSONCompatible, oldFmtVer: number): Promise<TData> {
    return new Promise(async (resolve) => {
      if(!this.migrations)
        return resolve(oldData as TData);

      // TODO: verify
      let newData: JSONCompatible = oldData;
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
      resolve(newData as TData);
    });
  }
}
