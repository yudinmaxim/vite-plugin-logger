import jsLint from "@eslint/js"
export default [
    jsLint.configs.recommended,
    {
        rules: {
            'array-bracket-spacing': ['error', 'always'],
            'keyword-spacing': ['error', { after: true }],
            'max-len': ['error', { code: 130, ignorePattern: '^\\s*<path' }],
            'no-console': 'off',
            'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
            'no-extra-boolean-cast': 'error',
            'no-multi-spaces': ['error'],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'no-param-reassign': [2, { props: false }],
            'no-trailing-spaces': 'error',
            'no-unsafe-optional-chaining': 'error',
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            'object-curly-spacing': ['error', 'always'],
            'object-property-newline': ['off', { allowAllPropertiesOnSameLine: true }],
            'padded-blocks': 'off',
            indent: ['error', 2, { SwitchCase: 1 }],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
            'space-before-function-paren': [
                'error',
                { anonymous: 'never', named: 'never', asyncArrow: 'always' }
            ],
            'object-curly-newline': [
                'error',
                {
                    consistent: true,
                    multiline: true
                }
            ],
        }
    }
]
//# sourceMappingURL=base.js.map