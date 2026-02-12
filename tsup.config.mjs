import { defineConfig } from "tsup";
import { createStringInjectPlugin } from "./tools/stringInjectPlugin.mjs";
import { createUmdWrapperPlugin } from "./tools/umdWrapperPlugin.mjs";
import pkg from "./package.json" with { type: "json" };
import coreUtilsPkg from "./node_modules/@sv443-network/coreutils/package.json" with { type: "json" };

// #region types, consts, header

/** @typedef {import("tsup").Options} TsupOpts */

const clientName = "UserUtils";
const externalDependencies = Object.keys(pkg.dependencies);
const isDevelopmentMode = process.env.NODE_ENV === "development";

const userLibraryHeader = `\
// ==UserScript==
// @namespace    ${pkg.homepage}
// @exclude      *
// @author       ${pkg.author.name}
// @supportURL   ${pkg.bugs.url}
// @homepageURL  ${pkg.homepage}

// ==UserLibrary==
// @name         ${pkg.libName}
// @description  ${pkg.description}
// @version      ${pkg.version}
// @license      ${pkg.license}
// @copyright    ${pkg.author.name} (${pkg.author.url})

// ==/UserScript==
// ==/UserLibrary==

// ==OpenUserJS==
// @author       ${pkg.author.name}
// ==/OpenUserJS==
`;

// #region constant injection

/** @type {() => TsupOpts["plugins"][number]} */
const getStringInjectPlugin = () => {
  const coreutilsVersion = coreUtilsPkg.version?.replace(/^[^0-9]*/, "") ?? "ERR:unknown";
  const userutilsVersion = pkg.version;

  const isSemverBasic = (version) => /^\d+\.\d+\.\d+(-.+)?$/.test(version);

  if(!isSemverBasic(coreutilsVersion))
    throw new Error(`Invalid CoreUtils version: "${coreutilsVersion}"`);
  if(!isSemverBasic(userutilsVersion))
    throw new Error(`Invalid UserUtils version: "${userutilsVersion}"`);

  return createStringInjectPlugin([
    { pattern: /#\{\{COREUTILS_VERSION\}\}/, replacement: coreutilsVersion },
    { pattern: /#\{\{USERUTILS_VERSION\}\}/, replacement: userutilsVersion },
  ]);
};

// #region base config

/** @type {(cliOpts: TsupOpts) => Promise<TsupOpts | TsupOpts[]> | TsupOpts | TsupOpts[]} */
const getBaseConfig = (cliOpts) => {
  /** @type {TsupOpts} */
  const opts = {
    entry: {
      [clientName]: "lib/index.ts",
    },
    outDir: "dist",
    outExtension: ({ format, options }) => ({
      js: `.${options.minify ? "min." : ""}${({
        cjs: "cjs",
        esm: "mjs",
        umd: "umd.js",
      })[format] ?? "js"}`,
    }),
    plugins: [
      getStringInjectPlugin(),
    ],
    platform: "browser",
    format: ["cjs", "esm"],
    noExternal: externalDependencies,
    target: ["chrome90", "edge90", "firefox90", "opera98", "safari15"],
    name: "@sv443-network/userutils",
    globalName: clientName,
    legacyOutput: false,
    bundle: true,
    esbuildPlugins: [],
    minify: false,
    splitting: false,
    sourcemap: true,
    dts: false,
    clean: true,
    watch: cliOpts.watch,
    metafile: cliOpts.watch || isDevelopmentMode,
  };
  return opts;
};

// #region bundle configs

export default defineConfig((cliOpts) => ([
  {
    // base CJS and ESM bundles
    ...getBaseConfig(cliOpts),
  },
  {
    // regular UMD bundle
    ...getBaseConfig(cliOpts),
    format: ["umd"],
    target: "es6",
    plugins: [
      createUmdWrapperPlugin({
        libraryName: clientName,
        external: [],
      }),
      getStringInjectPlugin(),
    ],
  },
  {
    // UMD bundle for userscript usage
    ...getBaseConfig(cliOpts),
    format: ["umd"],
    target: "es6",
    plugins: [
      createUmdWrapperPlugin({
        libraryName: clientName,
        external: [],
        banner: userLibraryHeader,
      }),
      getStringInjectPlugin(),
    ],
    outExtension: () => ({ js: ".user.js" }),
    sourcemap: false,
    clean: false,
    // 
    onSuccess: "tsc --emitDeclarationOnly --declaration --outDir dist && node --import tsx ./tools/fix-dts.mts",
  },
]));
