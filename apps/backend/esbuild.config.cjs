const path = require('path');
const esbuildPluginTsc = require('esbuild-plugin-tsc');

// esbuild does not support TypeScript's `emitDecoratorMetadata`, which NestJS
// relies on for dependency injection. This plugin compiles only the files that
// contain decorators with the TypeScript compiler so that `design:paramtypes`
// metadata is emitted, while esbuild still handles everything else.
module.exports = {
  plugins: [
    esbuildPluginTsc({
      tsconfigPath: path.resolve(__dirname, 'tsconfig.app.json'),
      tsx: false,
    }),
  ],
};
