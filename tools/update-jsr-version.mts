import { readFile, writeFile } from "node:fs/promises";

async function run(): Promise<void> {
  try {
    const pkgJson = JSON.parse(String(await readFile("package.json", "utf8")));
    const { version } = pkgJson;

    const jsrJson = JSON.parse(String(await readFile("jsr.json", "utf8")));

    jsrJson.version = version;

    await writeFile("jsr.json", JSON.stringify(jsrJson, undefined, 2) + "\n");
    console.log(`Updated jsr.json to version ${version}`);

    setImmediate(() => process.exit(0));
  }
  catch(err) {
    console.error("Couldn't update jsr.json:", err);
    setImmediate(() => process.exit(1));
  }
}

run();
