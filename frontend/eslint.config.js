import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // Indentación de 4 espacios
      indent: ["error", 4, { SwitchCase: 1 }],
      // Punto y coma obligatorio
      semi: ["error", "always"],
      // Comillas simples
      quotes: ["error", "single", { avoidEscape: true }],
      // Espacios antes de llaves
      "space-before-blocks": "error",
      // Sin espacios múltiples
      "no-multi-spaces": "error",
      // Espacios en objetos
      "object-curly-spacing": ["error", "always"],
      // Espacios en arrays
      "array-bracket-spacing": ["error", "never"],
      // Console permitido (útil para desarrollo)
      "no-console": "warn",
      // Variables no usadas como warning
      "@typescript-eslint/no-unused-vars": "warn",
      // Permitir any explícito
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);
