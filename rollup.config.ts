import createBanner from 'create-banner';
import typescript from 'rollup-plugin-typescript2';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import { eslint } from 'rollup-plugin-eslint'
import pkg from './package.json';

const name = 'loadScript';

const isDev = process.env.NODE_ENV !== 'production';

const banner = createBanner({
  data: {
    year: '2022-present',
  },
  template: 'inline',
});

export default {
  input: `src/index.ts`,
  output: [
    {
      file: pkg.main,
      name,
      format: 'umd',
      banner,
      compact: true,
      plugins: [!isDev && terser()],
      sourcemap: true,
    },
    {
      file: pkg.module,
      name,
      format: 'es',
      banner,
      compact: true,
      plugins: [!isDev && terser()],
      sourcemap: true,
    },
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    eslint(),
    // Compile TypeScript files
    typescript({ useTsconfigDeclarationDir: true }),
    // Resolve source maps to the original source
    sourceMaps(),
  ],
};
