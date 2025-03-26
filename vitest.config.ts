import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: [
        "lib/**/*.spec.ts",
        "lib/Dialog.ts", // DOM-only features can't be tested for now cause they aren't rendered
        "lib/SelectorObserver.ts", // ^
        "lib/index.ts",
        "lib/types.ts",
      ],
      reporter: ["text", "text-summary", "html", "lcov"],
    },
    include: ["lib/**/*.spec.ts"],
    environment: "jsdom",
    testTimeout: 10_000,
  },
});
