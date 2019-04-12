import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'
// import webWorkerLoader from 'rollup-plugin-web-worker-loader';

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    {
      dir: pkg.main,
      format: 'cjs',
      sourcemap: true
    },
    {
      dir: pkg.module,
      format: 'es',
      sourcemap: true
    }
  ],
  // format: 'esm',
  plugins: [
    // webWorkerLoader({
    //   loadPath: 'worker/xhr-worker.js'
    // }),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    external(),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
    babel({
      exclude: 'node_modules/**'
    }),
    commonjs()
  ]
}
