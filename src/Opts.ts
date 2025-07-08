import { provider, type ConsoleMethods, type ProcessMethods } from "./Provider.js";

export type Opts = Partial<{
    [P in ConsoleMethods | ProcessMethods]: boolean;
}>;

export class SetOpts {
    #opts!: Required<Opts>;

    constructor(opts: Opts = {}) {
        this.setOpts(opts);
    }

    public setOpts = (opts: Opts) => {
        this.#opts = {
            log: opts.log ?? true,
            error: opts.error ?? true,
            warn: opts.warn ?? true,
            info: opts.info ?? true,
            debug: opts.debug ?? true,
            dirxml: opts.dirxml ?? true,
            stdout: opts.stdout ?? false,
            stderr: opts.stderr ?? false,
        };

        provider.overwrite();
    };

    /*
     * SETTERS
     */

    public set log(b: boolean) {
        this.#opts.log = b;
        provider.overwrite();
    }
    public set error(b: boolean) {
        this.#opts.error = b;
        provider.overwrite();
    }
    public set warn(b: boolean) {
        this.#opts.warn = b;
        provider.overwrite();
    }
    public set info(b: boolean) {
        this.#opts.info = b;
        provider.overwrite();
    }
    public set debug(b: boolean) {
        this.#opts.debug = b;
        provider.overwrite();
    }
    public set dirxml(b: boolean) {
        this.#opts.dirxml = b;
        provider.overwrite();
    }
    public set stdout(b: boolean) {
        this.#opts.stdout = b;
        provider.overwrite();
    }
    public set stderr(b: boolean) {
        this.#opts.stderr = b;
        provider.overwrite();
    }

    /*
     * GETTERS
     */
    public get log() {
        return this.#opts.log;
    }
    public get error() {
        return this.#opts.error;
    }
    public get warn() {
        return this.#opts.warn;
    }
    public get info() {
        return this.#opts.info;
    }
    public get debug() {
        return this.#opts.debug;
    }
    public get dirxml() {
        return this.#opts.dirxml;
    }
    public get stdout() {
        return this.#opts.stdout;
    }
    public get stderr() {
        return this.#opts.stderr;
    }
}
