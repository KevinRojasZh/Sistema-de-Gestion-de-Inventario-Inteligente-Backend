import js from'@eslint/js'
import globals from "globals";
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig,globalIgnores } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"], languageOptions: { globals: globals.node },
        plugins: { js, stylistic },
        extends: ["js/recommended"],
        rules: {
        'eqeqeq': 'error',                     // fuerza ===
        'no-trailing-spaces': 'error',         // sin espacios al final
        'object-curly-spacing': ['error', 'always'],  // espacios en {}
        'arrow-spacing': ['error', { before: true, after: true }], // espacio en flechas
        'no-console': 0                       // permite console.log
    },
    },
    globalIgnores(['./dist/'])
]);
