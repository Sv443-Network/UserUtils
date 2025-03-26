import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/**/*.spec.ts"],
    environment: "jsdom",
    testTimeout: 10_000,
  },
});
