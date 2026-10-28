// echoes the prop with the given name from package.json

import { styleText } from "node:util";
import pkgJson from "../package.json" with { type: "json" };

const propName = process.argv[2];

if(typeof propName === "string" && propName in pkgJson)
  console.log(pkgJson[propName]);
else {
  console.log(styleText("red", "Error:"), `Couldn't find property '${propName}' in package.json:\n`, pkgJson);
  process.exit(1);
}

export {};
