import type { Mode, OpenMode, ObjectEncodingOptions, WriteFileOptions } from "node:fs";
import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { provider } from "./Provider.js";
import { SetOpts, type Opts } from "./Opts.js";

type WriteOpts =
    | {
          contents?: "stdout" | "stderr" | "output";
          mode?: Mode;
          flag?: OpenMode;
          flush?: boolean;
      }
    | BufferEncoding
    | null;

type AsyncOpts = ObjectEncodingOptions & WriteOpts;
type SyncOpts = WriteFileOptions & WriteOpts;

export class Capture {
    public stdout!: string;
    public stderr!: string;
    public output!: string;
    public opts!: SetOpts;

    constructor(opts: Opts = {}) {
        this.reset();
        this.opts = new SetOpts(opts);
    }

    public reset = (): Capture => {
        this.stdout = "";
        this.stderr = "";
        this.output = "";
        return this;
    };

    public setOpts = (opts: Opts) => {
        this.opts.setOpts(opts);
    };

    private getWriteContents = (opts: WriteOpts) => {
        const type = typeof opts === "object" && opts !== null ? opts.contents : null;
        const contents =
            type === "stdout"
                ? this.stdout
                : type === "stderr"
                  ? this.stderr
                  : this.output;

        return contents + (contents.endsWith("\n") ? "" : "\n");
    };

    public handle = (
        cb: ({
            output,
            stdout,
            stderr,
        }: {
            output: string;
            stdout: string;
            stderr: string;
        }) => unknown,
    ): Capture => {
        cb({
            output: this.output,
            stdout: this.stdout,
            stderr: this.stderr,
        });

        return this;
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
        const contents = this.getWriteContents(opts);
        writeFileSync(file, contents, opts);
        return this;
    };

    public writeAsync = async (file: string, opts: AsyncOpts = {}): Promise<Capture> => {
        const contents = this.getWriteContents(opts);
        await writeFile(file, contents, opts);
        return this;
    };
}
