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
            '@ngrx',
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
          // apps/libs is a standalone package that only owns axios. Everything
          // else is installed and versioned by the workspace root.
          ignoredDependencies: [
            '@analogjs/vitest-angular',
            '@angular/cdk',
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/router',
            '@jsverse/transloco',
            '@ngrx/effects',
            '@ngrx/operators',
            '@ngrx/signals',
            '@ngrx/store',
            '@swc/helpers',
            'rxjs',
            'vite',
            'vite-tsconfig-paths',
            // axios lives in apps/libs/node_modules, so it is not part of the
            // root install that Nx builds its external dependency graph from.
            'axios',
          ],
        },
      ],
    },
    languageOptions: {
      parser: await import('jsonc-eslint-parser'),
    },
  },
];