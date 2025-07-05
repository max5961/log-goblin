import type { Mode, OpenMode, ObjectEncodingOptions, WriteFileOptions } from "node:fs";
import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { provider } from "./Provider.js";

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

export class Capture {
    public stdout!: string;
    public stderr!: string;
    public output!: string;

    constructor() {
        this.reset();
    }

    public reset = () => {
        this.stdout = "";
        this.stderr = "";
        this.output = "";
        return this;
    };

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

    public start = (): Capture => {
        provider.start(this);
        return this;
    };

    public stop = (): Capture => {
        provider.stop(this);
        return this;
    };

    public exec = (cb: () => unknown): Capture => {
        this.start();
        cb();
        this.stop();
        return this;
    };

    public write = (file: string, opts: SyncOpts = {}): Capture => {
        const contents = this.getContents(opts);
        writeFileSync(file, contents, opts);
        return this;
    };

    public writeAsync = async (file: string, opts: AsyncOpts = {}): Promise<Capture> => {
        const contents = this.getContents(opts);
        await writeFile(file, contents, opts);
        return this;
    };
}
