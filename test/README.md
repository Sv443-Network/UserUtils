### Setup
1. Initialize submodules with `git submodule update --init --recursive`
2. Link main project with `npm link`
3. Run `npm run dev` to watch and recompile the main project
4. Run `npm run test-serve` to start the test page webserver
5. Checkout submodules
6. Go to test userscript with `cd test/TestScript`
7. Install deps with `npm i`
8. Link with `npm link @sv443-network/userutils`
9. Watch and recompile test userscript with `npm run dev` (or `npm run test-dev` when in the main project root)

To quickly run everything in parallel, use these commands in the root UserUtils project: `npm test` and `npm run dev`
