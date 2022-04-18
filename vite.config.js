const path = require("path");
const react = require("@vitejs/plugin-react");
const { defineConfig } = require("vite");
const { babel } = require("@rollup/plugin-babel");
// const { terser } = require("rollup-plugin-terser");

const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

module.exports = defineConfig(() => {
  return {
    plugins: [

      // terser({
      //   compress: {
      //     drop_console: process.env.DEBUG != 1,
      //   },
      // }),

      // ts, tsx, js, jsx ファイルを transpile
      babel(/** @type {import("@rollup/plugin-babel").RollupBabelInputPluginOptions} */{
        extensions: FILE_EXTENSIONS,
        exclude: "node_modules/**",
        babelHelpers: 'bundled',
        configFile: false,
        babelrc: false,
        presets:[
          ["@babel/preset-env", {
            modules: false,
            targets: {
              chrome: "40",
            },
            debug: true,
          }],
        ],
      }),
      // tsx, jsx ファイルを transpile
      react(),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/lib/index.ts"),
        name: "Lib",
        formats: ["cjs"],
        fileName: () => `index.js`,
      },
      outDir: process.env.DEBUG ? "dist/debug" : "dist",
      rollupOptions: {
        // 依存関係を外部化
        external: ["react", "react-dom", "react/jsx-runtime"],
      },
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: process.env.DEBUG != 1,
        },
        format: {
          preamble: "/** @license see https://github.com/yuki153/react-spatial-navigation/blob/main/LICENSE */",
        }
      }
    },
  }
});
