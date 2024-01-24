import path from "path";
import { defineConfig } from "vite";
import babel from "@rollup/plugin-babel";

const FILE_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];

export default defineConfig(() => {
  return {
    // Inject react-jsx/runtime instead of createElement when transpiling JSX
    // @see https://vitejs.dev/guide/features.html#jsx
    // @see https://esbuild.github.io/content-types/#auto-import-for-jsx
    // @see https://github.com/evanw/esbuild/issues/334#issuecomment-1013374809
    esbuild: {
      jsx: "automatic",
    },
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
            debug: false,
          }],
        ],
      }),
    ],
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/lib/index.ts"),
        name: "Lib",
        // Use CJS-build that will be deprecated due to fact that libraries using react17 is not able to use as ESM.
        //   The reason they is not able to use as ESM is that react-jsx/runtime can not resolve path.
        // @see https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated
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
