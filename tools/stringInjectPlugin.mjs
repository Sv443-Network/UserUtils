import * as path from "node:path";
import * as fs from "node:fs";

/**
 * @typedef {Object} StringInjectOptions
 * @property {RegExp | string} pattern  The regex or string pattern to match (applied globally). The `g` flag is automatically added to regex patterns if not present.
 * @property {string} replacement       The replacement string (supports `$1`, `$&`, etc.).
 */

/**
 * Creates a tsup plugin that performs global regex replacements on the output bundle files.
 * @param {StringInjectOptions | StringInjectOptions[]} replacements A single replacement or an array of replacements to apply.
 * @returns {import("tsup").Options["plugins"][number]}
 */
export function createStringInjectPlugin(replacements) {
  const entries = Array.isArray(replacements) ? replacements : [replacements];

  return {
    name: "string-inject",
    buildEnd(result) {
      try {
        for(const file of result.writtenFiles) {
          if(!file.name.endsWith(".js") && !file.name.endsWith(".mjs") && !file.name.endsWith(".cjs"))
            continue;

          const filePath = path.join(process.cwd(), file.name);
          let content = fs.readFileSync(filePath, "utf-8");

          for(const { pattern, replacement } of entries) {
            const regex = pattern instanceof RegExp
              ? new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : pattern.flags + "g")
              : new RegExp(pattern, "g");
            content = content.replace(regex, replacement);
          }

          fs.writeFileSync(filePath, content, "utf-8");
        }
      }
      catch(err) {
        console.error("[string-inject]", err);
      }
    },
  };
}
