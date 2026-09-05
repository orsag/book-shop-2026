import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  ...baseConfig,
  {
    // Override rules to prevent the crash on path imports
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '@api',
            '@core',
            '@service',
            '@component',
            '@store',
            '@store/libs',
            '@store/shared-models',
            '@book-store-2026/libs',
            '@jsverse/transloco',
            '../eslint.base.config.mjs',
            '../../eslint.base.config.mjs',
            '../../../../../../prisma/createProduct',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];