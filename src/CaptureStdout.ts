import type { Mode, OpenMode, ObjectEncodingOptions, WriteFileOptions } from "node:fs";
import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

type Opts =
    | {
          contents?: "stdout" | "stderr" | "output";
          mode?: Mode;
          flag?: OpenMode;
          flush?: boolean;
      }
    | BufferEncoding
    | null;

type AsyncOpts = ObjectEncodingOptions & Opts;
type SyncOpts = WriteFileOptions & Opts;

export class CaptureStdout {
    public stdout: string;
    public stderr: string;
    public output: string;

    constructor() {
        this.stdout = "";
        this.stderr = "";
        this.output = "";
    }

    private getContents = (opts: Opts) => {
        const type = typeof opts === "object" && opts !== null ? opts.contents : null;
        const contents =
            type === "stdout"
                ? this.stdout
                : type === "stderr"
                  ? this.stderr
                  : this.output;

        return contents + (contents.endsWith("\n") ? "" : "\n");
    };

    public write = (file: string, opts: SyncOpts = {}): CaptureStdout => {
        const contents = this.getContents(opts);
        writeFileSync(file, contents, opts);
        return this;
    };

    public writeAsync = async (
        file: string,
        opts: AsyncOpts = {},
    ): Promise<CaptureStdout> => {
        const contents = this.getContents(opts);
        await writeFile(file, contents, opts);
        return this;
    };
}
