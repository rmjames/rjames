import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "vendor/**",
      ".gemini/**",
      "artifacts/**",
      "temp/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "build/**",
      ".agents/**",
      ".claude/**",
      ".jules/**",
      ".antigravitycli/**",
      "evals/**"
    ]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        dataLayer: true,
        gtag: true
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-inner-declarations": "warn",
      "no-empty": "warn",
      "no-useless-escape": "warn"
    }
  }
];
