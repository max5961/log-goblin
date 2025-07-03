import { CaptureStdout } from "./CaptureStdout.js";

export function capture(cb: () => unknown): CaptureStdout {
    const result = new CaptureStdout();

    const originalWrite = process.stdout.write;
    const originalError = process.stderr.write;

    const overwrite = (type: "stdout" | "stderr") => (buffer: Uint8Array | string) => {
        const str = typeof buffer === "string" ? buffer : buffer.toString();
        if (type == "stdout") result.stdout += str;
        if (type === "stderr") result.stderr += str;
        result.output += str;
    };

    process.stdout.write = overwrite("stdout") as typeof process.stdout.write;
    process.stderr.write = overwrite("stderr") as typeof process.stderr.write;

    try {
        cb();
        const trimNl = (s: string) => {
            if (s.endsWith("\n")) {
                return s.slice(0, s.length - 1);
            }
            return s;
        };
        result.stdout = trimNl(result.stdout);
        result.stderr = trimNl(result.stderr);
        result.output = trimNl(result.output);
    } catch (err) {
        if (err instanceof Error) {
            originalWrite(err.message);
        }
    } finally {
        process.stdout.write = originalWrite;
        process.stderr.write = originalError;
    }

    return result;
}
