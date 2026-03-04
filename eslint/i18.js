import vueI18n from "@intlify/eslint-plugin-vue-i18n";
export default [
    {
        plugins: {
            '@intlify/vue-i18n': vueI18n
        },
        rules: {
            '@intlify/vue-i18n/no-v-html': 'off',
            '@intlify/vue-i18n/no-unused-keys': [
                'error',
                {
                    src: './src',
                    extensions: ['.js', '.ts', '.vue']
                }
            ],
            '@intlify/vue-i18n/no-raw-text': 'off'
        }
    }
];
//# sourceMappingURL=i18.js.map