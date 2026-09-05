import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    // Allow importing from the same library (and shared projects) via aliases
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '@api',
            '@core',
            '@service',
            '@store',
            '@store/libs',
            '@store/shared-models',
            '@book-store-2026/libs',
            '@jsverse/transloco',
            '../eslint.base.config.mjs',
            '../../eslint.base.config.mjs',
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
    files: ['**/*.json'],
    rules: {
      '@nx/dependency-checks': [
        'error',
        {
          ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs,ts,cts,mts}'],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];