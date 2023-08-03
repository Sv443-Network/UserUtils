## Development & Contributing Guide
Thanks to Matt Pocock for his video on how to set up a modern TypeScript library: https://youtu.be/eh89VE3Mk5g

<br>

### Initial setup:
1. Have Node.js and npm installed
2. Clone or download and extract the repository
3. Run `npm i` in the project root to install dependencies

<br>

### Commands:
| Command | Description |
| :-- | :-- |
| `npm run lint` | Run TSC and ESLint to lint the code |
| `npm run build` | Build the project with tsup, outputting minified CJS and ESM bundles to `dist/` |
| `npm run dev` | Watch for changes and build the project without minification |

<br>

### Testing locally:
1. Run `npm link` in the project root of UserUtils to create a global symlink to the package
2. Run `npm link @sv443-network/userutils` in the project root of the project you want to test the package in to bind to the symlink
3. Run `npm run dev` in the project root of UserUtils to watch for changes and rebuild the package automatically
4. Run your project and test the changes :)

<br>

### Publishing a new version:
1. Create a changeset with `npx changeset` (modify the description in `.changeset/random-name.md` if needed)
2. Commit the changeset and push the changes
3. Merge the commit that contains the changeset into `main`  
  After the Actions workflow completes, a pull request will be opened
4. Merge the pull request to automatically publish the new version to npm
