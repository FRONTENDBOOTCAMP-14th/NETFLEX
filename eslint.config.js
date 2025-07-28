import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // 들여쓰기 2칸 강제
      indent: ["error", 2],

      // 세미콜론 강제
      semi: ["error", "always"],

      // 큰따옴표 사용
      quotes: ["error", "double", { avoidEscape: true }],

      // var 사용 금지
      "no-var": "error",

      // 가능한 경우 const 사용
      "prefer-const": "error",

      // 화살표 함수 일관성
      "prefer-arrow-callback": "error",

      // 일관된 공백 사용
      "space-before-function-paren": ["error", "never"],
      "space-before-blocks": ["error", "always"],

      // 주석 스타일
      "spaced-comment": ["error", "always"],

      // 콤마 스타일
      "comma-dangle": ["error", "always-multiline"],

      // 객체 속성 간격
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],

      // 연산자 간격
      "space-infix-ops": "error",
    },
  },
]);
