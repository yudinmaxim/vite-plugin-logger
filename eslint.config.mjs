// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import baseConfig from './eslint/base.js'
import tsConfig from './eslint/ts.js'
import vueConfig from './eslint/vue.js'
import vueI18nConfig from './eslint/i18.js'

export default [
  ...baseConfig,
  ...tsConfig,
  ...vueConfig,
  ...vueI18nConfig
];