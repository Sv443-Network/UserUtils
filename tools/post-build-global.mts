import { access, constants as fsconstants, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import k from "kleur";
import pkg from "../package.json" with { type: "json" };

const { exit } = process;

/** Path to the global / IIFE bundle built by tsup */
const iifeBundlePath = resolve("dist/index.global.js");

async function run(): Promise<void> {
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

  const initialBundle = await readFile(iifeBundlePath, "utf8");

  const finalBundle = `${libHeader}\nvar UserUtils = ${initialBundle}`
    .replace(/^\s*'use strict';\s*(\r?\n){1,2}/gm, "");

  await writeFile(iifeBundlePath, finalBundle, "utf8");
  console.log(k.green(`Successfully updated global bundle at path ${k.reset(`'${iifeBundlePath}'`)}\n`));

  setImmediate(() => exit(0));
}

/** Checks if a path exists / is readable and writable (by default) */
async function exists(path: string, mode = fsconstants.R_OK | fsconstants.W_OK): Promise<boolean> {
  try {
    await access(path, mode);
    return true;
  }
  catch {
    return false;
  }
}

run();
