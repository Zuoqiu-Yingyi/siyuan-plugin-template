// Copyright (C) 2024 Zuoqiu Yingyi
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { resolve } from "node:path";

import { svelte } from "@sveltejs/vite-plugin-svelte";
import { sveltePreprocess } from "svelte-preprocess";
import { defineConfig } from "vite";

import type { BuildOptions } from "vite";

// https://vitejs.dev/config/
export default defineConfig((env) => ({
    base: `./`,
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [
        svelte({
            preprocess: [
                sveltePreprocess({
                    typescript: true,
                    less: true,
                }),
            ],
        }),
    ],
    // eslint-disable-next-line ts/no-use-before-define
    build: build(env.mode),
}));

function build(mode: string): BuildOptions {
    const build: BuildOptions = {
        minify: true,
        // sourcemap: "inline",
        rollupOptions: {
            external: [
                "siyuan",
                /^@electron\/.*$/,
            ],
            output: {
                entryFileNames: (chunkInfo) => {
                    // console.log(chunkInfo);
                    switch (chunkInfo.name) {
                        case "index":
                        case "kernel":
                            return "[name].js";

                        default:
                            return "assets/[name]-[hash].js";
                    }
                },
                assetFileNames: (assetInfo) => {
                    // console.log(chunkInfo);
                    switch (assetInfo.name) {
                        case "style.css":
                        case "index.css":
                            return "index.css";

                        default:
                            return "assets/[name]-[hash][extname]";
                    }
                },
            },
        },
    };

    switch (mode) {
        /* 内核插件 dist/kernel.js: 思源内核用 goja 以普通脚本 (非 ES module) 执行, 产物中不能出现 import/export */
        case "kernel":
            build.lib = {
                entry: resolve(import.meta.dirname, "src/kernel.ts"),
                fileName: "kernel",
                formats: ["es"],
            };
            // 在 plugin 模式之后构建, 不能清空 dist 中已生成的前端插件产物
            build.emptyOutDir = false;
            break;

        /* 前端插件 dist/index.js */
        case "plugin":
        default:
            build.lib = {
                entry: resolve(import.meta.dirname, "src/index.ts"),
                fileName: "index",
                formats: ["cjs"],
            };
            build.emptyOutDir = true;
            break;
    }

    return build;
}
