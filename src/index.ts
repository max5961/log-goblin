import { writeFileSync } from "fs";

export function capture(cb: () => unknown): string {
    const originalWrite = process.stdout.write;
    const originalError = process.stderr.write;
    let result = "";

    const overwrite = (buffer: Uint8Array | string) => {
        result += typeof buffer === "string" ? buffer : buffer.toString();
    };

    process.stdout.write = overwrite as typeof process.stdout.write;
    process.stderr.write = overwrite as typeof process.stderr.write;

    try {
        cb();
        if (result.endsWith("\n")) {
            result = result.slice(0, result.length - 1);
        }
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

export function redirect(
    file: string,
    cb: () => unknown,
    opts: { append?: boolean } = { append: true },
) {
    const result = capture(cb) + "\n";
    writeFileSync(file, result, {
        encoding: "utf-8",
        flag: opts.append ? "a" : undefined,
    });
}
