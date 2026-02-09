import { defineConfig } from "tsup";
import pkg from "./package.json";
import { createUmdWrapper } from "./tools/umdWrapperPlugin.mjs";

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
      createUmdWrapper({
        libraryName: clientName,
        external: [],
      })
    ],
  },
  {
    // UMD bundle for userscript usage
    ...getBaseConfig(cliOpts),
    format: ["umd"],
    target: "es6",
    plugins: [
      createUmdWrapper({
        libraryName: clientName,
        external: [],
        banner: userLibraryHeader,
      }),
    ],
    outExtension: () => ({ js: ".user.js" }),
    sourcemap: false,
    clean: false,
    // 
    onSuccess: "tsc --emitDeclarationOnly --declaration --outDir dist && node --import tsx ./tools/fix-dts.mts",
  },
]));
