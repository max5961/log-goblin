import type { Capture } from "./Capture.js";

export type ConsoleMethods = "log" | "info" | "error" | "warn" | "debug" | "dirxml";
export type ProcessMethods = "stdout" | "stderr";
export type ConsoleLog = typeof console.log;

const DefaultConsole: Record<ConsoleMethods, ConsoleLog> = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    debug: console.debug.bind(console),
    dirxml: console.dirxml.bind(console),
} as const;

const DefaultProcess: Record<ProcessMethods, typeof process.stdout.write> = {
    stdout: process?.stdout?.write.bind(process.stdout),
    stderr: process?.stderr?.write.bind(process.stderr),
} as const;

/**
 * This allows for multiple instances of Capture to run at the same time.
 */
export class Provider {
    public instances: Set<Capture>;
    public resetCbs: (() => void)[];
    private listening: boolean;

    constructor() {
        this.instances = new Set();
        this.resetCbs = [];
        this.listening = false;
    }

    public overwrite() {
        if (!this.listening) return;

        this.resetOriginals();

        // console methods
        this.resetCbs.push(this.wrapConsoleMethod("log", "stdout"));
        this.resetCbs.push(this.wrapConsoleMethod("error", "stderr"));
        this.resetCbs.push(this.wrapConsoleMethod("warn", "stderr"));
        this.resetCbs.push(this.wrapConsoleMethod("info", "stdout"));
        this.resetCbs.push(this.wrapConsoleMethod("debug", "stdout"));
        this.resetCbs.push(this.wrapConsoleMethod("dirxml", "stdout"));

        // process.stdout|stderr.write
        this.resetCbs.push(this.wrapProcessMethod("stdout"));
        this.resetCbs.push(this.wrapProcessMethod("stderr"));
    }

    private resetOriginals() {
        this.resetCbs.forEach((cb) => cb());
        this.resetCbs = [];
    }

    public start = (instance: Capture) => {
        // Do we really need the listening variable?
        this.listening = true;
        this.instances.add(instance);
        this.overwrite();
    };

    public stop = (instance: Capture) => {
        this.instances.delete(instance);

        // Still need to overwrite again here so the overwritten methods don't
        // include the instance that was just removed
        if (this.instances.size) {
            this.overwrite();
        } else {
            this.listening = false;
            this.resetOriginals();
        }
    };

    private wrapConsoleMethod = (
        name: ConsoleMethods,
        type: "stdout" | "stderr",
    ): (() => void) => {
        const original = DefaultConsole[name];

        if (!console[name] || !original) return () => {};

        const capturedMethods = new Set<ConsoleMethods>();
        console[name] = (...data: unknown[]) => {
            let toAppend = "";
            for (let i = 0; i < data.length; ++i) {
                toAppend += i === data.length - 1 ? `${data[i]}\n` : `${data[i]} `;
            }

            for (const instance of this.instances) {
                if (instance.opts[name]) capturedMethods.add(name);
            }

            let count = 0;
            for (const instance of this.instances) {
                if (instance.opts[name]) {
                    instance[type] += toAppend;
                    instance.output += toAppend;
                    instance.entries[type].push(toAppend);
                    instance.entries.output.push(toAppend);
                } else if (!count++ && !capturedMethods.has(name)) {
                    original(...data);
                }
            }
        };

        return () => {
            console[name] = original;
        };
    };

    private wrapProcessMethod = (type: "stdout" | "stderr"): (() => void) => {
        const original = DefaultProcess[type];

        if (!process?.stdout?.write || !original) return () => {};

        process[type].write = ((buffer: Uint8Array | string): void => {
            const str = typeof buffer === "string" ? buffer : buffer.toString();

            const capturedMethods = new Set<ProcessMethods>();
            for (const instance of this.instances) {
                if (instance.opts[type]) capturedMethods.add(type);
            }

            let count = 0;
            for (const instance of this.instances) {
                if (instance.opts[type]) {
                    instance[type] += str;
                    instance.output += str;
                    instance.entries[type].push(str);
                    instance.entries.output.push(str);
                } else if (!count++ && !capturedMethods.has(type)) {
                    original(buffer);
                }
            }
        }) as typeof process.stdout.write;

        return () => {
            process[type].write = original;
        };
    };
}

export const provider = new Provider();
