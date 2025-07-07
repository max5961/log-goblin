import { provider } from "./Provider.js";

export type Opts = {
    log?: boolean;
    error?: boolean;
    warn?: boolean;
    info?: boolean;
    debug?: boolean;
    dirxml?: boolean;
    stdout?: boolean;
    stderr?: boolean;
};

export class SetOpts {
    #log!: boolean;
    #error!: boolean;
    #warn!: boolean;
    #info!: boolean;
    #debug!: boolean;
    #dirxml!: boolean;
    #stdout!: boolean;
    #stderr!: boolean;

    constructor(opts: Opts = {}) {
        this.setOpts(opts);
    }

    public setOpts = (opts: Opts) => {
        this.#log = opts.log ?? true;
        this.#error = opts.error ?? true;
        this.#warn = opts.warn ?? true;
        this.#info = opts.info ?? true;
        this.#debug = opts.debug ?? true;
        this.#dirxml = opts.dirxml ?? true;
        this.#stdout = opts.stdout ?? false;
        this.#stderr = opts.stderr ?? false;

        provider.overwrite();
    };

    /*
     * GETTERS
     */
    public get log() {
        return this.#log;
    }
    public get error() {
        return this.#error;
    }
    public get warn() {
        return this.#warn;
    }
    public get info() {
        return this.#info;
    }
    public get debug() {
        return this.#debug;
    }
    public get dirxml() {
        return this.#dirxml;
    }
    public get stdout() {
        return this.#stdout;
    }
    public get stderr() {
        return this.#stderr;
    }

    /*
     * SETTERS
     */

    public set log(b: boolean) {
        this.#log = b;
        provider.overwrite();
    }
    public set error(b: boolean) {
        this.#error = b;
        provider.overwrite();
    }
    public set warn(b: boolean) {
        this.#warn = b;
        provider.overwrite();
    }
    public set info(b: boolean) {
        this.#info = b;
        provider.overwrite();
    }
    public set debug(b: boolean) {
        this.#debug = b;
        provider.overwrite();
    }
    public set dirxml(b: boolean) {
        this.#dirxml = b;
        provider.overwrite();
    }
    public set stdout(b: boolean) {
        this.#stdout = b;
        provider.overwrite();
    }
    public set stderr(b: boolean) {
        this.#stderr = b;
        provider.overwrite();
    }
}
