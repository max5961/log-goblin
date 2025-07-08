import type { Capture } from "./Capture.js";

const Defaults = {
    log: console.log,
    info: console.info,
    error: console.error,
    warn: console.warn,
    debug: console.debug,
    dirxml: console.dirxml,
    stdout: process?.stdout?.write,
    stderr: process?.stderr?.write,
} as const;

type ConsoleLog = typeof console.log;

/**
 * This allows for multiple instances of Capture to run at the same time.
 * It won't prevent overlap in the event `B` starts capturing before `A` has
 * stopped, but it will prevent `A` from having incomplete data if overlap occurs.
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

        const pushReset = (...args: Parameters<typeof this.wrapConsoleMethod>) => {
            this.resetCbs.push(this.wrapConsoleMethod(...args));
        };

        pushReset("log", "stdout");
        pushReset("info", "stdout");
        pushReset("error", "stderr");
        pushReset("warn", "stderr");
        pushReset("debug", "stdout");
        pushReset("dirxml", "stdout");

        this.resetCbs.push(this.wrapProcessMethod("stdout"));
        this.resetCbs.push(this.wrapProcessMethod("stderr"));
    }

    private resetOriginals() {
        this.resetCbs.forEach((cb) => cb());
        this.resetCbs = [];
    }

    public start = (instance: Capture) => {
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
        name: keyof typeof console,
        type: "stdout" | "stderr",
    ): (() => void) => {
        const original = console[name] as ConsoleLog;

        if (console[name]) {
            (console[name] as ConsoleLog) = (...data: unknown[]) => {
                let toAppend = "";
                for (let i = 0; i < data.length; ++i) {
                    toAppend += i === data.length - 1 ? `${data[i]}\n` : `${data[i]} `;
                }

                for (const instance of this.instances) {
                    if (instance.opts[name as keyof typeof instance.opts]) {
                        instance[type] += toAppend;
                        instance.output += toAppend;
                    } else {
                        original(...data);
                    }
                }
            };
        }

        return () => {
            (console[name] as ConsoleLog) =
                Defaults[name as keyof typeof Defaults] ?? original;
        };
    };

    private wrapProcessMethod = (type: "stdout" | "stderr"): (() => void) => {
        const original = Defaults[type];
        if (!process?.stdout?.write || !original) return () => {};

        process[type].write = ((buffer: Uint8Array | string): void => {
            const str = typeof buffer === "string" ? buffer : buffer.toString();
            for (const instance of this.instances) {
                if (instance.opts[type]) {
                    instance[type] += str;
                    instance.output += str;
                }
            }
        }) as typeof process.stdout.write;

        return () => {
            process[type].write = original;
        };
    };
}

export const provider = new Provider();
