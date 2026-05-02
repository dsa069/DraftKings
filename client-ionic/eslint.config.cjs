// Migrated from .eslintrc.json to eslint.config.cjs for ESLint v9+

const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat();

module.exports = [
  ...compat.config({
    root: true,
    ignorePatterns: ["projects/**/*"],
    overrides: [
      {
        files: ["*.ts"],
        parserOptions: {
          project: ["tsconfig.json"],
          createDefaultProgram: true,
        },
        extends: [
          "plugin:@angular-eslint/recommended",
          "plugin:@angular-eslint/template/process-inline-templates",
        ],
        rules: {
          "@angular-eslint/component-class-suffix": [
            "error",
            { suffixes: ["Page", "Component"] },
          ],
          "@angular-eslint/component-selector": [
            "error",
            { type: "element", prefix: "app", style: "kebab-case" },
          ],
          "@angular-eslint/directive-selector": [
            "error",
            { type: "attribute", prefix: "app", style: "camelCase" },
          ],
        },
      },
      {
        files: ["*.html"],
        extends: ["plugin:@angular-eslint/template/recommended"],
        rules: {},
      },
    ],
  }),
];
