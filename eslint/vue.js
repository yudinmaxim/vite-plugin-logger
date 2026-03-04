import vuePlugin from "eslint-plugin-vue";
import vueLint from "eslint-plugin-vue";
export default [
    ...vueLint.configs["flat/essential"],
    ...vuePlugin.configs['flat/recommended'],
    {
        files: ["*.vue", "**/*.vue"],
        rules: {
            'vue/attribute-hyphenation': ['error', 'never'],
            'vue/singleline-html-element-content-newline': [
                'error',
                {
                    ignoreWhenNoAttributes: true,
                    ignoreWhenEmpty: true
                }
            ],
            'vue/max-attributes-per-line': [
                'error',
                {
                    singleline: 3
                }
            ],
            'vue/no-v-html': 'off',
            'vue/multi-word-component-names': 'off',
        }
    }
];
//# sourceMappingURL=vue.js.map