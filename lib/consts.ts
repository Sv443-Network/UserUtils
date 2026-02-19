type ConstTypes = {
  coreUtilsVersion: string;
  userUtilsVersion: string;
};

/** Raw (unparsed) constants, injected by `tsup.config.mjs` using `tools/stringInjectPlugin.mjs` */
const rawConsts = {
  coreUtilsVersion: "#{{COREUTILS_VERSION}}",
  userUtilsVersion: "#{{USERUTILS_VERSION}}",
} as const satisfies ConstTypes;

/** Parses a raw constant or falls back to a default value */
function getConst<TKey extends keyof typeof rawConsts, TDefault extends string | number>(constKey: TKey, defaultVal: TDefault): ConstTypes[TKey] | TDefault {
  const val = rawConsts[constKey];
  return (val.match(/^#\{\{.+\}\}$/) ? defaultVal : val) as ConstTypes[TKey] | TDefault;
}

/** Contains the semver version strings of UserUtils and the bundled library CoreUtils. */
export const versions = {
  /** Semver version string of the bundled library CoreUtils. */
  CoreUtils: getConst("coreUtilsVersion", "ERR:unknown"),
  /** Semver version string of UserUtils. */
  UserUtils: getConst("userUtilsVersion", "ERR:unknown"),
};
