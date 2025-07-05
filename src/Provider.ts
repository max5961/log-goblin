import type { Capture } from "./Capture.js";

/**
 * This allows for multiple instances of Capture to run at the same time.
 * It won't prevent overlap in the event `B` starts capturing before `A` has
 * stopped, but it will prevent `A` from having incomplete data if overlap occurs.
 */
export class Provider {
    public instances: Set<Capture>;
    private originalStdOutWrite!: typeof process.stdout.write;
    private originalStdErrWrite!: typeof process.stderr.write;
    private originalClog!: typeof console.log;
    private originalCwarn!: typeof console.warn;
    private originalCerr!: typeof console.error;

    constructor() {
        this.instances = new Set();
        this.setOriginals();
    }

    private throwIfBrowser() {
        if (
            !process ||
            !process.stdout ||
            !process.stderr ||
            !process.stdout.write ||
            !process.stderr.write ||
            !process.version ||
            typeof process.version !== "string"
        ) {
            throw new Error("browser env");
        }
    }

    private setOriginals() {
        try {
            this.throwIfBrowser();
            this.originalStdOutWrite = process.stdout.write;
            this.originalStdErrWrite = process.stderr.write;
        } catch {
            this.originalClog = console.log;
            this.originalCwarn = console.warn;
            this.originalCerr = console.error;
        }
    }

    private resetOriginals() {
        try {
            this.throwIfBrowser();
            process.stdout.write = this.originalStdOutWrite;
            process.stderr.write = this.originalStdErrWrite;
        } catch {
            console.log = this.originalClog;
            console.error = this.originalCerr;
            console.warn = this.originalCwarn;
        }
    }

    private overwrite() {
        const overwrite =
            (type: "stdout" | "stderr") => (buffer: Uint8Array | string) => {
                const str = typeof buffer === "string" ? buffer : buffer.toString();

                for (const instance of this.instances) {
                    if (type == "stdout") instance.stdout += str;
                    if (type === "stderr") instance.stderr += str;
                    instance.output += str;
                }
            };

        try {
            process.stdout.write = overwrite("stdout") as typeof process.stdout.write;
            process.stderr.write = overwrite("stderr") as typeof process.stderr.write;
        } catch {
            console.log = overwrite("stdout") as typeof console.log;
            console.warn = overwrite("stderr") as typeof console.warn;
            console.error = overwrite("stderr") as typeof console.error;
        }
    }

    public start = (instance: Capture) => {
        this.instances.add(instance);
        this.overwrite();
    };

    public stop = (instance: Capture) => {
        this.instances.delete(instance);
        if (this.instances.size) {
            this.overwrite();
        } else {
            this.resetOriginals();
        }
    };
}

export const provider = new Provider();
