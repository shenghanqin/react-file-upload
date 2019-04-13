import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'
// import bundleWorker from 'rollup-plugin-bundle-worker'
// import workbox from 'rollup-plugin-workbox'
// rollup.config.js
// import loadz0r from "rollup-plugin-loadz0r";
// import workz0r from "rollup-plugin-workz0r";
import webworkify from 'rollup-plugin-webworkify';

import pkg from './package.json'

// const workerModules = new Set()

export default {
  input: 'src/index.js',
  output: [
    {
      dir: pkg.main,
      format: 'amd',
      // sourcemap: true,
      // exports: 'named'
    },
    {
      dir: pkg.module,
      format: 'es',
      // sourcemap: true,
      // exports: 'named'
    }
  ],
  // format: 'umd',
  plugins: [
    webworkify({
      // specifically patten files
      pattern: 'src/xhr-worker.js'  // Default: undefined (follow micromath globs)
    }),
    // workz0r({
    //   onWorkerModule: id => workerModules.add(id)
    // }),
    // loadz0r({
    //   // `prependLoader` will be called for every chunk. If it returns `true`,
    //   // the loader code will be prepended.
    //   prependLoader: (chunk, inputs) => {
    //     // If the chunk contains one of the worker modules, prepend a loader.
    //     if (Object.keys(chunk.modules).some(mod => workerModules.has(mod))) {
    //       return true;
    //     }
    //     // If not, fall back to the default behavior.
    //     return loadz0r.isEntryModule(chunk, inputs);
    //   }
    // }),
    // workbox({
    //   mode: 'injectManifest', // or 'injectManifest'
    //   options: {
    //     swDest: 'src/xhr-worker.js',
    //     globDirectory: 'dist',
    //     // other workbox-build options depending on the mode
    //   },
    // }),
    external(),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
    babel({
      exclude: 'node_modules/**',
      plugins: [ 'external-helpers' ]
    }),
    resolve(),
    commonjs()
  ]
}
