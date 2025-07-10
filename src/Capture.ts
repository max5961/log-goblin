import fs from "node:fs";
import { writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { provider } from "./Provider.js";
import { SetOpts, type Opts } from "./Opts.js";

type WriteOpts =
    | {
          contents?: "stdout" | "stderr" | "output";
          mode?: fs.Mode;
          flag?: fs.OpenMode;
          flush?: boolean;
      }
    | BufferEncoding
    | null;

type AsyncOpts = fs.ObjectEncodingOptions & WriteOpts;
type SyncOpts = fs.WriteFileOptions & WriteOpts;

export class Capture {
    /**
     * Captured `stdout` data
     */
    public stdout!: string;

    /**
     * Captured `stderr` data
     */
    public stderr!: string;

    /**
     * Combination of captured `stdout` and `stderr` data.
     */
    public output!: string;

    /**
     * Configures which output sources are used to capture output.
     * All properties are booleans indicating whether to override specific functions
     *
     * @property stdout - should the instance capture output from `process.stdout.write`?
     * - Defaults to `false`.
     * - NOTE: If true, all `console` methods that write to stdout will also be captured
     *   as well since they ultimately call process.stdout.write.
     *
     * @property stderr - should the instance capture output from `process.stderr.write`?
     * - Defaults to `false`.
     * - NOTE: If true, all `console` methods that write to stderr will also be captured
     *   as well since they ultimately call process.stderr.write.
     *
     * @property log - should the instance capture output from `console.log`?
     * - Defaults to `true`.
     *
     * @property error - should the instance capture output from `console.error`?
     * - Defaults to `true`.
     *
     * @property warn - should the instance capture output from `console.warn`?
     * - Defaults to `true`.
     *
     * @property info - should the instance capture output from `console.info`?
     * - Defaults to `true`.
     *
     * @property debug - should the instance capture output from `console.debug`?
     * - Defaults to `true`.
     *
     * @property dirxml - should the instance capture output from `console.dirxml`?
     * - Defaults to `true`.
     */
    public opts!: SetOpts;

    constructor(opts: Opts = {}) {
        this.clear();
        this.opts = new SetOpts(opts);
    }

    /**
     * Clears all captured data stored on the instance.
     * If specific keys are provided, only those will be cleared.
     *
     * @example
     * ```typescript
     * // Clears all captured data
     * capture.clear();
     *
     * // Clears only capture.stdout and capture.output, leaving capture.stderr untouched
     * capture.clear("stdout", "output");
     * ```
     */
    public clear = (...contents: ("stdout" | "stderr" | "output")[]): Capture => {
        const toClear = contents.length ? contents : ["stdout", "stderr", "output"];
        toClear.forEach((c) => {
            this[c as "stdout" | "stderr" | "output"] = "";
        });

        return this;
    };

    /**
     * Updates the capture options on this instance.
     * Equivalent to reinitializing the instance with new options.
     *
     * You can also update options directly via `capture.opts`, e.g.:
     * `capture.opts.log = true` to enable capturing console.log output
     */
    public setOpts = (opts: Opts) => {
        this.opts.setOpts(opts);
    };

    /**
     * Utility for handling captured output with method chaining in mind.
     * Since `Capture.output|stdout|stderr` are all public variables, this method
     * is a convenience, not a necessity.
     */
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

    /**
     * Start capturing output according to the current options.
     */
    public start = (): Capture => {
        provider.start(this);
        return this;
    };

    /**
     * Stops capturing output.
     */
    public stop = (): Capture => {
        provider.stop(this);
        return this;
    };

    /**
     * Capture all specified output generated during the execution of the
     * *synchronous* callback argument.
     *
     * Does **not** handle asynchronous callbacks.
     */
    public exec = (cb: () => unknown): Capture => {
        this.start();
        cb();
        this.stop();
        return this;
    };

    /**
     * Writes the captured output to a file using `fs.writeFileSync`.
     *
     * By default, writes `Capture.output`, which comprises both stdout and stderr.
     * You can optionally specify which captured output to write using the `contents`
     * option: `"stdout"` | `"stderr"` | `"output"`.  All other options are passed
     * directly to fs.writeFileSync.
     *
     * @example
     * // All captured output (default)
     * Capture.write("output.log", { flag: "a" })
     *
     * // Only captured stderr
     * Capture.write("error.log", { flag: "a", contents: "stderr" })
     */
    public write = (file: string, opts: SyncOpts = {}): Capture => {
        const contents = this.getWriteContents(opts);
        writeFileSync(file, contents, opts);
        return this;
    };

    /**
     * Writes the captured output to a file using `fs.promises.writeFile`.
     *
     * By default, writes `Capture.output`, which comprises both stdout and stderr.
     * You can optionally specify which captured output to write using the `contents`
     * option: `"stdout"` | `"stderr"` | `"output"`.  All other options are passed
     * directly to fs.promises.writeFile.
     *
     * @example
     * // All captured output (default)
     * await Capture.writeAsync("output.log", { flag: "a" })
     *
     * // Only captured stderr
     * await Capture.writeAsync("error.log", { flag: "a", contents: "stderr" })
     */
    public writeAsync = async (file: string, opts: AsyncOpts = {}): Promise<Capture> => {
        const contents = this.getWriteContents(opts);
        await writeFile(file, contents, opts);
        return this;
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
}
