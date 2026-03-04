import tsLint from "typescript-eslint";
export default [
    ...tsLint.configs.recommended,
    {
        files: ["*.vue", "**/*.vue"],
        languageOptions: {
            parserOptions: {
                parser: "@typescript-eslint/parser",
                sourceType: "module"
            }
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        }
    }
];
//# sourceMappingURL=ts.js.map