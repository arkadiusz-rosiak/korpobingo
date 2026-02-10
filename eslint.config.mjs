import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/",
      "**/.next/",
      "**/.sst/",
      "**/dist/",
      "**/sst-env.d.ts",
      "**/*.config.{js,mjs,cjs}",
      "storybook-static/",
      "**/.open-next/",
      "**/public/",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-namespace": "off",
      "prefer-const": "error",
      "no-param-reassign": "off",
    },
  },
  prettier,
);
