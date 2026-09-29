// Copyright (C) 2026 Zuoqiu Yingyi
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

import CONSTANTS from "./constants";

import type * as kernel from "siyuan/kernel";

/**
 * 内核插件, 构建为 dist/kernel.js。
 * 运行在思源内核的 goja 运行时中 (没有 DOM), 只能通过全局对象 siyuan 调用内核能力,
 * 通过 siyuan.rpc 暴露方法给前端插件。
 * kernel.js 以普通脚本 (非 ES module) 执行: 本文件不能 export, 也不能从 external 模块 (如 siyuan) 导入运行时值。
 * Kernel plugin, built to dist/kernel.js. Runs in the goja runtime of the
 * SiYuan kernel (no DOM); uses the global `siyuan` object for kernel
 * capabilities and exposes RPC methods to the frontend via siyuan.rpc.
 * kernel.js is evaluated as a plain script, not an ES module: do not export
 * from this file or import runtime values from external modules (e.g. siyuan).
 */
class TemplateKernelPlugin {
    private readonly siyuan: kernel.ISiyuan = siyuan;

    constructor() {
        // 绑定生命周期钩子, 内核会等待钩子返回的 Promise 后再进入下一阶段。
        // Wire lifecycle hooks; the kernel awaits returned Promises before advancing.
        this.siyuan.plugin.lifecycle.onload = this.onload.bind(this);
        this.siyuan.plugin.lifecycle.onrunning = this.onrunning.bind(this);
        this.siyuan.plugin.lifecycle.onunload = this.onunload.bind(this);
    }

    /* 加载 */
    private async onload(): Promise<void> {
        /* 绑定 RPC 方法 */
        await this.siyuan.rpc.bind(CONSTANTS.KERNEL_RPC_METHOD.ECHO, this.rpcEcho.bind(this), "Return the arguments as is.");
    }

    /* 运行中 */
    private async onrunning(): Promise<void> { }

    /* 卸载 */
    private async onunload(): Promise<void> {
        /* 解绑 RPC 方法 */
        await this.siyuan.rpc.unbind(CONSTANTS.KERNEL_RPC_METHOD.ECHO);
    }

    /**
     * RPC: echo
     * 前端插件调用: `await this.kernel.rpc.call[CONSTANTS.KERNEL_RPC_METHOD.ECHO]?.(...args)`
     */
    private rpcEcho(...args: unknown[]): unknown[] {
        return args;
    }
}

void new TemplateKernelPlugin();
