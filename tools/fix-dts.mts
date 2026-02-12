import { readdir, readFile, writeFile, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { styleText } from "node:util";

const dtsPath = resolve("./dist/lib/");

/** Adds two spaces to the end of each line in JSDoc comments to preserve the meticulous line breaks */
async function addTrailingSpaces(filePath: string): Promise<void> {
  const content = String(await readFile(filePath, "utf8"));

  const fixedContent = content.replace(/\/\*\*[\s\S]*?\*\//g, (m) =>
    m.replace(/\n/g, (m, i) =>
      i > 3 ? `  ${m}` : m
    )
  );

  await writeFile(filePath, fixedContent, "utf8");
}

/** Recursively processes all files in the given directory */
async function processRecursive(directory: string): Promise<void> {
  directory = resolve(directory);
  const files = await readdir(directory);

  for(const file of files) {
    const fullPath = join(directory, file);
    const stats = await lstat(fullPath);

    if(stats.isDirectory())
      await processRecursive(fullPath);
    else if(fullPath.endsWith(".d.ts"))
      await addTrailingSpaces(fullPath);
  }
}

async function run(): Promise<void> {
  try {
    await processRecursive(dtsPath);

    console.log(styleText("green", `\nSuccessfully fixed all .d.ts files in ${styleText("reset", `'${dtsPath}'`)}`));
  }
  catch(err) {
    console.error(styleText("red", `\nEncountered error while fixing .d.ts files in ${styleText("reset", `'${dtsPath}'`)}:\n`), err);
  }
}

run();
