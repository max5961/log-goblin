*Capture stdout/stderr in Node.  Should capture console.log, console.warn, and
console.error statements in browser (untested)*

---

## Example Usage

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
capture.stop();

// capture.output and capture.stdout are now both "foo\nbar\n"

capture
    // Append capture.output to foo.txt
    .write("foo.txt", { flag: "a", contents: "output" })

    // Writing to file does not reset capture.stdout, capture.stderr, or capture.output
    // Saved data must be manually reset
    .reset()
```

#### Using Capture.exec

```typescript
import { Capture } from "capture-stdout";

const capture = new Capture()

capture
    .exec(() => {
        console.error("foo")
    })
    .write("foo.txt", { flag: "a", contents: "stderr" })
    .reset();
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

- `{ output, stderr, stdout, start, stop, exec, reset, write, writeAsync }`
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
    - `reset`
        - *type*: `() => Capture`
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












