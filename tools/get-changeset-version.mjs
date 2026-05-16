// echoes the version from the changeset version file at changeset-version.ignore.json
// generated with npx changeset status --output=changeset-version.ignore.json

import changesetJson from "../changeset-version.ignore.json" with { type: "json" };

if("releases" in changesetJson && Array.isArray(changesetJson.releases) && changesetJson.releases.length > 0)
  console.log(changesetJson.releases[0].newVersion);
else
  process.exit(1);

export {};
