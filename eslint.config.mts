import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Fichiers à ignorer
  {
    ignores: [
      "node_modules/",
      "build/",
      "coverage/",
      "*.config.js",
      "jest.config.js",
      "babel.config.js"
    ]
  },
  // Configuration pour les fichiers TypeScript
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module"
      }
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-var-requires": "off", // Le projet utilise require() par endroits
      "@typescript-eslint/no-require-imports": "off" // Mix ES6/CommonJS dans le projet
    }
  }
);
