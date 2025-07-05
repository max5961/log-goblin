import type { Capture } from "./Capture.js";

/**
 * This allows for multiple instances of Capture to run at the same time.
 * It won't prevent overlap in the event `B` starts capturing before `A` has
 * stopped, but it will prevent `A` from having incomplete data if overlap occurs.
 */
export class Provider {
    public instances: Set<Capture>;
    private originalStdOutWrite: typeof process.stdout.write;
    private originalStdErrWrite: typeof process.stderr.write;

    constructor() {
        this.instances = new Set();
        this.originalStdOutWrite = process.stdout.write;
        this.originalStdErrWrite = process.stderr.write;
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

        process.stdout.write = overwrite("stdout") as typeof process.stdout.write;
        process.stderr.write = overwrite("stderr") as typeof process.stderr.write;
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
            process.stdout.write = this.originalStdOutWrite;
            process.stderr.write = this.originalStdErrWrite;
        }
    };
}

export const provider = new Provider();
