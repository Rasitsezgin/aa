import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // TypeScript - uyarı olarak bırak, hata olarak değil
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",

      // React - Türkçe içerik için tırnak işaretleri sorun çıkarıyor
      "react/no-unescaped-entities": "off",

      // React Compiler kuralları - uyarı olarak ayarla
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",

      // Genel JS kuralları - uyarı olarak bırak
      "prefer-const": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
]);

export default eslintConfig;
