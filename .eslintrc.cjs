// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  ignorePatterns: ["*.map", "dist/**", "test.(ts|js)"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    GM: "readonly",
    unsafeWindow: "writable",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-unreachable": "off",
    quotes: ["error", "double"],
    semi: ["error", "always"],
    "eol-last": ["error", "always"],
    "no-async-promise-executor": "off",
    indent: [
      "error",
      2,
      {
        ignoredNodes: ["VariableDeclaration[declarations.length=0]"],
      },
    ],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/ban-types": [
      "error",
      {
        types: {
          "{}": false,
        },
        extendDefaults: true,
      },
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowConciseArrowFunctionExpressionsStartingWithVoid: true,
        allowExpressions: true,
        allowFunctionsWithoutTypeParameters: true,
        allowIIFEs: true,
      }
    ],
    "comma-dangle": ["error", "only-multiline"],
    "no-misleading-character-class": "off",
  },
};
