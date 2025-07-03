import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { type WriteFileOptions, type ObjectEncodingOptions } from "node:fs";

type Opts = {
    contents?: "stdout" | "stderr" | "output";
};

export class CaptureStdout {
    public stdout: string;
    public stderr: string;
    public output: string;

    constructor() {
        this.stdout = "";
        this.stderr = "";
        this.output = "";
    }

    private getContents = (contents?: "stdout" | "stderr" | "output") => {
        return contents === "stdout"
            ? this.stdout
            : contents === "stderr"
              ? this.stderr
              : this.output;
    };

    public write = (file: string, opts: WriteFileOptions & Opts = {}): CaptureStdout => {
        writeFileSync(file, this.getContents(opts.contents), opts);
        return this;
    };

    public writeAsync = async (
        file: string,
        opts: ObjectEncodingOptions & Opts = {},
    ): Promise<CaptureStdout> => {
        await writeFile(file, this.getContents(opts.contents), opts);
        return this;
    };
}
