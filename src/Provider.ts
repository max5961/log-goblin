import type { Capture } from "./Capture.js";

type Opts = {
    process?: {
        stdout?: boolean;
        stderr?: boolean;
    };
    log?: boolean;
    error?: boolean;
    warn?: boolean;
    info?: boolean;
    debug?: boolean;
    dirxml?: boolean;
};

/**
 * This allows for multiple instances of Capture to run at the same time.
 * It won't prevent overlap in the event `B` starts capturing before `A` has
 * stopped, but it will prevent `A` from having incomplete data if overlap occurs.
 */
export class Provider {
    public instances: Set<Capture>;
    public resetCbs: (() => void)[];
    private opts!: Opts;

    constructor(opts: Opts = {}) {
        this.instances = new Set();
        this.resetCbs = [];
        this.setOpts(opts);
    }

    public setOpts = (opts: Opts) => {
        opts.process = opts.process ?? {};
        opts.process.stdout = opts.process.stdout ?? false;
        opts.process.stderr = opts.process.stderr ?? false;
        opts.log = opts.log ?? true;
        opts.error = opts.error ?? true;
        opts.warn = opts.warn ?? true;
        opts.info = opts.info ?? true;
        opts.debug = opts.debug ?? true;
        opts.dirxml = opts.dirxml ?? true;
        this.opts = opts;
    };

    private overwrite() {
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

    private wrapConsoleMethod = (
        name: keyof typeof console,
        type: "stdout" | "stderr",
    ): (() => void) => {
        const original = console[name] as typeof console.log;

        if (console[name] && this.opts[name as keyof typeof this.opts]) {
            (console[name] as typeof console.log) = (...data: unknown[]) => {
                for (let i = 0; i < data.length; ++i) {
                    const toAppend =
                        i === data.length - 1 ? `${data[i]}\n` : `${data[i]} `;
                    for (const instance of this.instances) {
                        instance[type] += toAppend;
                        instance.output += toAppend;
                    }
                }
            };
        }

        return () => ((console[name] as typeof console.log) = original);
    };

    private wrapProcessMethod = (type: "stdout" | "stderr"): (() => void) => {
        const original = process?.[type]?.write;
        if (!original) return () => {};

        process[type].write = ((buffer: Uint8Array | string): void => {
            const str = typeof buffer === "string" ? buffer : buffer.toString();
            for (const instance of this.instances) {
                instance[type] += str;
                instance.output += str;
            }
        }) as typeof process.stdout.write;

        return () => {
            // @ts-expect-error this will always return true in node, but not in the browser
            if (process?.[type]?.write) {
                process[type].write = original;
            }
        };
    };

    public start = (instance: Capture) => {
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
            this.resetOriginals();
        }
    };
}

export const provider = new Provider();
