import js from'@eslint/js'
import globals from "globals";
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig,globalIgnores } from "eslint/config";
import prettierPlugin from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node },
        plugins: { js, stylistic, prettierPlugin },
        extends: ["js/recommended"], prettierConfig,
        rules: {
        'eqeqeq': 'error',                     // fuerza ===
        'no-trailing-spaces': 'error',         // sin espacios al final
        'object-curly-spacing': ['error', 'always'],  // espacios en {}
        'arrow-spacing': ['error', { before: true, after: true }], // espacio en flechas
        'no-console': 0                       // permite console.log
    },
    rules: {
      'no-unused-vars': 0,
      'no-constant-condition': 0,
      'prettier/prettier': 'error',
    },
    },
    globalIgnores(['./dist/'])
    
]);
