import pluginVue from 'eslint-plugin-vue'
import pluginCypress from 'eslint-plugin-cypress/flat'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    {
        name: 'app/files-to-lint',
        files: ['**/*.{js,mjs,jsx,ts,mts,tsx,vue}'],
    },
    {
        name: 'app/files-to-ignore',
        ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
    },
    {
        rules: {
            'object-curly-spacing': ['error', 'always'],
            'quotes': ['error', 'single', { 'avoidEscape': true }],
        },
    },
    pluginCypress.configs.recommended,
)
