*Capture and save stdout/stderr*

```sh
npm install log-goblin
```

---

## Example Usage

#### Using Capture.exec

*This is recommended for simple **synchronous** use cases because you don't need
to remember to stop capturing output.  However, it does not handle async blocks
of code.*

```typescript
import { Capture } from "log-goblin";

const capture = new Capture();

capture
    .exec(() => {
        console.log("foo");
    })
    .handle(({stdout, stderr, output}) => {
        /* do something with the data */
    })
    .clear();

/*
 * NOTE:
 *    - The handle method is a utility for handling the data, but not required.
 *      Capture.stdout|stderr|output are all public variables.
 *    - You must decide when to clear data.  Capture does not decide when its
 *      convenient to do so.
 **/
```

---

#### Using Capture.start / Capture.stop

```typescript
import { Capture } from "capture-stdout";

const capture = new Capture()

capture.start();
console.log("foo");
capture.stop();

// capture.output and capture.stdout are both "foo\n"
// capture.stderr is ""

capture.start();
console.log("bar");
// capture.output and capture.stdout are now "foo\nbar\n"

capture.stop()

```

#### Writing To File

The `write` and `writeAsync` methods create a wrapper around the
`fs.writeFileSync` and `fs.promises.writeFile` methods.  The only differences
are that the file contents parameter is replaced by the options parameter which
contains a `contents` option for what gets written to the file.

```typescript
import { Capture } from "capture-stdout";

const capture = new Capture()

capture
    .exec(() => {
        console.error("foo")
    })
    .write("error.log", { flag: "a", contents: "stderr" })
    .clear();
```

#### Overlap behavior with multiple instances

```typescript
import { Capture } from "capture-stdout";

const c1 = new Capture()
const c2 = new Capture()

c1.start();
console.log("foo");
c2.start();
console.log("bar");
c1.stop();
console.log("baz")
c2.stop()

// c1.output is "foo\nbar\n"
// c2.output is "bar\nbaz\n"

```

---

### Capture

- `Constructor`
    - `{ stdout, stderr, stdout, log, error, warn, info, debug, dirxml }`
        - `stdout`
            - *type*: `boolean`
            - *default*: `false`
            - Determines if `process.stdout.write` is intercepted
        - `stderr`
            - *type*: `boolean`
            - *default*: `false`
            - Determines if `process.stderr.write` is intercepted
        - `log`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.log` is intercepted
        - `error`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.error` is intercepted
        - `warn`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.warn` is intercepted
        - `info`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.info` is intercepted
        - `debug`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.debug` is intercepted
        - `dirxml`
            - *type*: `boolean`
            - *default*: `true`
            - Determines if `console.dirxml` is intercepted

> NOTE:
> If `stdout` is set to `true`, and `log` is set to `false`, `console.log`
> statements will still be captured.  The same is true for `stderr` and
> `error`.  Many of the `console` methods ultimately call
> `process.stdout|stderr.write`

- `{ output, stderr, stdout, start, stop, exec, clear, write, writeAsync }`
    - `output`
        - *type*: `string`
        - Anything written to stdout or stderr is stored here.
    - `stdout`
        - *type*: `string`
        - Anything written to stdout is stored here.
    - `stderr`
        - *type*: `string`
        - Anything written to stderr is stored here.
    - `start`
        - *type*: ``() => Capture`
        - Starts saving stdout/stderr data to the instance.
    - `stop`
        - *type*: `() => Capture`
        - Stops saving stdout/stderr data to the instance.
    - `exec`
        - *type*: `(callback: () => unknown) => Capture`
        - Captures anything wrapped in the callback argument.
    - `clear`
        - *type*: `(...contents: ("stdout" | "stderr" | "output")[]) => Capture`
        - Resets stdout, stderr, and output back to empty string.
    - `write`
        - *type*: Same as `fs.writeFileSync` but without the 2nd argument.
          Returns the instance.
        - Specify whether saved `stdout`, `stderr`, or `output` is written to the file
          with the `{ contents: "stdout" | "stderr" | "output" }` option.
    - `writeAsync`
        - *type*:  Same as `write`, but uses `fs.promises.write` and returns a
          Promise that resolves to the Capture instance.
        - Same as `write`.
    - `handle`
        - *type*: `(cb: ({stdout: string; stderr: string; output: string}) => unknown) => Capture`
        - Utility designed for handling the saved data method chaining in mind
    - `setOpts`
        - same as Constructor












