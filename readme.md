*Capture and save stdout/stderr in Node*

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
    .handle(({stdout, stderr, output, entries}) => {
        /* do something with the data */
    })
    .clear();

/*
 * - The handle method is a utility for handling the data, but not required.
 *   Capture.stdout|stderr|output are all public variables.
 * - You must decide when to clear data.  Capture does not decide when its
 *   convenient to do so.
 **/
```

---

#### Using Capture.start / Capture.stop

```typescript
import { Capture } from "log-goblin";

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

```typescript
import { Capture } from "log-goblin";

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
import { Capture } from "log-goblin";

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

#### Options (Constructor)
- Configures which output sources are used to capture output.
- All properties are publicly accessible booleans indicating whether to override
  specific functions.  These can be set in the constructor or after
  instantiation, e.g.: `capture.opts.log = true;`

- property `stdout` - should the instance capture output from `process.stdout.write`?
    - Defaults to `false`.
- property `stderr` - should the instance capture output from `process.stderr.write`?
    - Defaults to `false`.
- property `log` - should the instance capture output from `console.log`?
    - Defaults to `true`.
- property `error` - should the instance capture output from `console.error`?
    - Defaults to `true`.
- property `warn` - should the instance capture output from `console.warn`?
    - Defaults to `true`.
- property `info` - should the instance capture output from `console.info`?
    - Defaults to `true`.
- property `debug` - should the instance capture output from `console.debug`?
    - Defaults to `true`.
- property `dirxml` - should the instance capture output from `console.dirxml`?
    - Defaults to `true`.

> NOTE:
> If `stdout` is set to `true`, and `log` is set to `false`, console.log
> statements will still be captured.  The same is true for stderr and
> console.error. Many of the `console` methods ultimately call
> `process.stdout|stderr.write`

### Methods & Properties

#### stdout
- *type*: `string`
- Captured `stdout` data

#### stderr
- *type*: `string`
- Captured `stderr` data

#### output
- *type*: `string`
- Combination of captured `stdout` and `stderr` data.

#### entries
- *type*: `{ stdout: string[]; stderr: string[]; output: string[] }`
- Object containing the data stored in arrays, rather than a continuous string.
  Each array index represents the data from a single function call.
  `console.log("foo", "bar")` for example would store in `["foo bar\n"]` rather
  than `["foo\n", "bar\n"]`.

#### start
- *type*: `() => Capture`
- Start capturing output according to the current options.

#### stop
- *type*: `() => Capture`
- Stops capturing output.

#### clear
- *type*: `(...contents: ("stdout" | "stderr" | "output")[]) => Capture`
- Clears all captured data stored on the instance. If specific keys are
  provided, only those will be cleared.

#### exec
- *type*: `(callback: () => unknown) => Capture`
- Capture all specified output generated during the execution of the
  *synchronous* callback argument.
- NOTE: Does **not** handle asynchronous callbacks.

#### write
- Writes the captured output to a file using `fs.writeFileSync`.
- By default, writes `Capture.output`, which comprises both stdout and
  stderr. You can optionally specify which captured output to write
  using the `contents` option: `"stdout"` | `"stderr"` | `"output"`. All
  other options are passed directly to fs.writeFileSync.

#### writeAsync
- Writes the captured output to a file using `fs.promises.writeFile`.
- By default, writes `Capture.output`, which comprises both stdout and
  stderr. You can optionally specify which captured output to write
  using the `contents` option: `"stdout"` | `"stderr"` | `"output"`. All
  other options are passed directly to fs.promises.writeFile.

#### handle
- *type*: `(cb: ({stdout: string; stderr: string; output: string; entries:
  Capture["entries"]}) =>
  unknown) => Capture`
- Utility for handling captured output with method chaining in mind. Since
  `Capture.output|stdout|stderr` are all public variables, this method is a
  convenience, not a necessity.

#### setOpts
- same as Constructor












