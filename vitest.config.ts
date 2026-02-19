import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: [
        "lib/**/*.spec.ts",
        "lib/**/*.d.ts", // no need to include module references
        "lib/consts.ts", // injected at build time and tested via final bundle, so exclude from report to avoid confusion
        "lib/dom.ts",              // partially tested, but since some features can just never be tested, exclude the file from report.
        "lib/Dialog.ts",           // DOM-only features can't be tested for now cause they aren't properly rendered, just mounted into a pseudo-DOM
        "lib/SelectorObserver.ts", // same here ^
        "lib/Errors.ts",
        "lib/index.ts",
      ],
      reporter: ["text", "text-summary", "lcov"],
    },
    include: ["lib/**/*.spec.ts"],
    environment: "jsdom",
    testTimeout: 10_000,
  },
});
