const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  resolve: {
    plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.app.json' })],
  },
  output: {
    path: join(__dirname, '../../dist/apps/backend'),
    clean: true,
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMap: true,
      // 👉 ADD THIS TRANSFORMER BLOCK:
      transformers: [
        {
          name: '@nestjs/swagger/plugin',
          options: {
            classValidatorShim: true,
            // If your DTOs are in shared libs outside apps/backend/src,
            // you can also specify file suffix patterns if needed:
            dtoFileNameSuffix: ['.dto.ts', '.entity.ts'],
          },
        },
      ],
    }),
  ],
  watchOptions: {
    aggregateTimeout: 600,
    ignored: [
      join(__dirname, '../../dist/**'),
      // join(__dirname, '../../generated/**'),
      // join(__dirname, '../../libs/**'),
      // join(__dirname, '../../prisma/**'),
      join(__dirname, '../../node_modules/**'),
      '**/node_modules/**',
      '**/workspace_modules/**',
      '**/package.json',
      '**/package-lock.json',
      '**/dist/**',
      '**/.git/**',
      '**/libs/**',
      '**/*.log',
      '**/generated/**',
      '**/generated/prisma/**',
      '**/prisma/.client/**',
    ],
  },
};
