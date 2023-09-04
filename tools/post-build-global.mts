import { access, constants as fsconstants, readFile, writeFile } from "fs/promises";
import { resolve } from "path";
import packageJson from "../package.json" assert { type: "json" };

const { exit } = process;

const iifeScriptPath = resolve("dist/index.global.js");

async function run() {
  if(!await exists(iifeScriptPath)) {
    console.error(`No global script found at path '${iifeScriptPath}'`);
    setImmediate(() => exit(1));
    return;
  }

  const libHeader = `\
// ==UserScript==
// @name         UserUtils
// @description  ${packageJson.description}
// @namespace    ${packageJson.homepage}
// @version      ${packageJson.version}
// @license      ${packageJson.license}
// @author       ${packageJson.author.name}
// @copyright    ${packageJson.author.name} (${packageJson.author.url})
// @supportURL   ${packageJson.bugs.url}
// @homepageURL  ${packageJson.homepage}#readme
// ==/UserScript==
`;

  const initialScript = await readFile(iifeScriptPath, "utf8");
  let finalScript = `\
${libHeader}
var UserUtils = ${initialScript}`;
  finalScript = finalScript.replace(/^\s*'use strict';\s*\r?\n{1,2}/gm, "");

  await writeFile(iifeScriptPath, finalScript, "utf8");
  console.log(`Global script at path '${iifeScriptPath}' has been updated`);

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
