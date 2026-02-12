type ConstTypes = {
  coreUtilsVersion: string;
  userUtilsVersion: string;
};

/** Raw (unparsed) constants, injected by `tsup.config.mjs` using `tools/stringInjectPlugin.mjs` */
const rawConsts = {
  coreUtilsVersion: "#{{COREUTILS_VERSION}}",
  userUtilsVersion: "#{{USERUTILS_VERSION}}",
} as const satisfies Record<keyof ConstTypes, string>;

/** Parses a raw constant or falls back to a default value */
const getConst = <TKey extends keyof typeof rawConsts, TDefault extends string | number>(constKey: TKey, defaultVal: TDefault): ConstTypes[TKey] | TDefault => {
  const val = rawConsts[constKey];
  return (val.match(/^#\{\{.+\}\}$/) ? defaultVal : val) as ConstTypes[TKey] | TDefault;
};

export const versions = {
  CoreUtils: getConst("coreUtilsVersion", "ERR:unknown"),
  UserUtils: getConst("userUtilsVersion", "ERR:unknown"),
};
