import { access, constants as fsconstants, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import pkg from "../package.json" assert { type: "json" };

const { exit } = process;

/** Path to the global / IIFE bundle built by tsup */
const iifeBundlePath = resolve("dist/index.global.js");

async function run() {
  if(!await exists(iifeBundlePath)) {
    console.error(`No global script found at path '${iifeBundlePath}'`);
    setImmediate(() => exit(1));
    return;
  }

  const libHeader = `\
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
// @author       Sv443
// ==/OpenUserJS==
`;

  const initialScript = await readFile(iifeBundlePath, "utf8");

  const finalScript = `${libHeader}\nvar UserUtils = ${initialScript}`
    .replace(/^\s*'use strict';\s*(\r?\n){1,2}/gm, "");

  await writeFile(iifeBundlePath, finalScript, "utf8");
  console.log(`Global script at path '${iifeBundlePath}' has been updated`);

  setImmediate(() => exit(0));
}

async function exists(path: string) {
  try {
    await access(path, fsconstants.R_OK | fsconstants.W_OK);
    return true;
  }
  catch(err) {
    return false;
  }
}

run();
