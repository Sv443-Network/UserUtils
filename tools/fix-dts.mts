import { readdir, readFile, writeFile, lstat } from "node:fs/promises";
import { join, resolve } from "node:path";

/** Adds two spaces to the end of each line in JSDoc comments to preserve the meticulous line breaks */
async function addTrailingSpaces(filePath: string) {
  const content = String(await readFile(filePath, "utf8"));

  const fixedContent = content.replace(/\/\*\*[\s\S]*?\*\//g, (m) =>
    m.replace(/\n/g, (m, i) =>
      i > 3 ? `  ${m}` : m
    )
  );

  await writeFile(filePath, fixedContent, "utf8");
}

/** Recursively processes all files in the given directory */
async function processRecursive(directory: string) {
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

processRecursive("./dist/lib");
