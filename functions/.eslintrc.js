module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    // "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": ["warn", "double"],
    "indent": ["error", 2],
    "import/no-unresolved": 0,
    "max-len": ["warn", { code: 120}],
    "@typescript-eslint/no-var-requires": "off",
    "no-multiple-empty-lines": ["warn", {max: 2}],
    "no-trailing-spaces": "warn",
    "padded-blocks": "off",
    "object-curly-spacing": ["warn", "always"],
    "require-jsdoc": "off" 
  },
};
