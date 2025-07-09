import { describe, test, beforeEach } from "./temu-jest.js";
import { Capture } from "../src/Capture.js";
import fs from "fs";

/**
 * *Caveat*: If stdout is true, it captures all console methods that log to stdout,
 * with the same being true for stderr.  This is because the console methods
 * ultimately call process.stdout|stderr.write.  However, testing frameworks
 * and the browser aren't compatible with process methods since they either don't
 * have them (browser) or they hijack the console methods (to be compat) with the
 * browser.  This is the reasoning behind the 'temu-jest', so that we can test
 * what happens when we hijack process.stdout|stderr.write.
 */

describe("Capture", () => {
    const capture = new Capture({
        stdout: true,
        stderr: true,
        log: false,
        error: false,
        warn: false,
        debug: false,
        info: false,
        dirxml: false,
    });

    beforeEach(async () => {
        capture.clear();
        const rm = (f: string) => {
            try {
                fs.rmSync(f);
            } catch {
                //
            }
        };
        rm("foo.txt");
        rm("bar.txt");
        rm("baz.txt");
    });

    test("does not intercept when not recording", async (t) => {
        console.log("Pre start");
        capture.start();
        capture.stop();
        console.log("Pre start");

        t.actual = "";
        t.expected = "";
    });

    test("does not intercept when not recording - exec", async (t) => {
        console.log("Pre start - this should be vis in tests");
        capture.exec(() => {
            //
        });
        console.log("Post stop - this should be vis in tests");

        t.actual = "";
        t.expected = "";
    });

    test("single log to output", async (t) => {
        capture.start();
        console.log("foo");
        capture.stop();
        t.actual = capture.output;
        t.expected = "foo\n";
    });

    test("single error log to output", async (t) => {
        capture.start();
        console.error("foo");
        capture.stop();
        t.actual = capture.output;
        t.expected = "foo\n";
    });

    test("single error log to stderr", async (t) => {
        capture.start();
        console.error("foo");
        capture.stop();
        t.actual = capture.stderr;
        t.expected = "foo\n";
    });

    test("single log to stdout", async (t) => {
        capture.start();
        console.log("foo");
        capture.stop();
        t.actual = capture.stdout;
        t.expected = "foo\n";
    });

    test("does not log stdout to stderr", async (t) => {
        capture.start();
        console.log("foo");
        capture.stop();
        t.actual = capture.stderr;
        t.expected = "";
    });

    test("does not log stderr to stdout", async (t) => {
        capture.start();
        console.error("foo");
        capture.stop();
        t.actual = capture.stdout;
        t.expected = "";
    });

    test("process.(stdout | stderr).write", async (t) => {
        capture.start();
        process.stdout.write("foo\n");
        process.stderr.write("bar\n");
        capture.stop();

        t.actual = JSON.stringify({
            stdout: capture.stdout,
            stderr: capture.stderr,
        });

        t.expected = JSON.stringify({
            stdout: "foo\n",
            stderr: "bar\n",
        });
    });

    test("...args log statements", async (t) => {
        capture.start();
        console.log("foo", "bar", "baz");
        console.error("foo", "bar", "baz");
        console.warn("foo", "bar", "baz");
        capture.stop();
        t.actual = capture.output;
        t.expected = "foo bar baz\nfoo bar baz\nfoo bar baz\n";
    });

    test("multiple log statements", async (t) => {
        capture.start();
        console.log("foo");
        console.log("bar");
        console.error("baz");
        capture.stop();

        t.actual = capture.output;
        t.expected = "foo\nbar\nbaz\n";
    });

    test("handles warn", async (t) => {
        capture.start();
        console.warn("foo");
        capture.stop();

        t.actual = capture.output;
        t.expected = "foo\n";
    });

    test("warn logs to stdout/output only", async (t) => {
        capture.start();
        console.warn("foo");
        capture.stop();

        t.actual = capture.stderr + capture.stdout;
        t.expected = "foo\n";
    });

    test("capture.exec", async (t) => {
        capture.exec(() => {
            console.log("foo");
            console.log("bar");
            console.log("baz");
        });

        t.actual = capture.stdout;
        t.expected = "foo\nbar\nbaz\n";
    });

    test("writes to file", async (t) => {
        capture
            .exec(() => {
                console.log("foo");
                console.log("bar");
            })
            .write("foo.txt", {});

        t.actual = fs.readFileSync("foo.txt").toString();
        t.expected = "foo\nbar\n";
    });

    test("writes to file async", async (t) => {
        await capture
            .exec(() => {
                console.log("foo");
                console.log("bar");
            })
            .writeAsync("foo.txt", {});

        t.actual = fs.readFileSync("foo.txt").toString();
        t.expected = "foo\nbar\n";
    });

    test("appends to file", async (t) => {
        await capture
            .exec(() => {
                console.log("foo");
            })
            .writeAsync("foo.txt", { flag: "a" })
            .then((c) => c.clear());

        await capture
            .exec(() => {
                console.log("bar");
            })
            .writeAsync("foo.txt", { flag: "a" });

        t.actual = fs.readFileSync("foo.txt").toString();
        t.expected = "foo\nbar\n";
    });

    test("write 'contents' opt Selectively appends type of output to file", async (t) => {
        capture
            .exec(() => {
                console.log("foo");
                console.error("bar");
            })
            .write("foo.txt", { contents: "stdout" })
            .write("bar.txt", { contents: "stderr" })
            .write("baz.txt", { contents: "output" })

            // clear if performing another capture.
            .clear();

        t.actual = JSON.stringify({
            foo: fs.readFileSync("foo.txt").toString(),
            bar: fs.readFileSync("bar.txt").toString(),
            baz: fs.readFileSync("baz.txt").toString(),
        });

        t.expected = JSON.stringify({
            foo: "foo\n",
            bar: "bar\n",
            baz: "foo\nbar\n",
        });
    });

    test("handles overlap of multiple instances of Capture", async (t) => {
        const c1 = new Capture();
        const c2 = new Capture();

        c1.start();
        console.log("foo");
        c2.start();
        console.log("bar");
        c1.stop();
        console.log("baz");
        c2.stop();

        t.actual = JSON.stringify({
            c1: c1.output,
            c2: c2.output,
        });

        t.expected = JSON.stringify({
            c1: "foo\nbar\n",
            c2: "bar\nbaz\n",
        });
    });

    test("handles overlap of multiple instances of Capture with exec", async (t) => {
        const c1 = new Capture();
        const c2 = new Capture();

        c1.exec(() => {
            console.log("foo");
            c2.start();
            console.log("bar");
        });

        console.log("baz");
        c2.stop();

        t.actual = JSON.stringify({
            c1: c1.output,
            c2: c2.output,
        });

        t.expected = JSON.stringify({
            c1: "foo\nbar\n",
            c2: "bar\nbaz\n",
        });
    });

    test("multiple instances with different configs", async (t) => {
        const c1 = new Capture({
            log: false,
            error: true,
        });
        const c2 = new Capture({
            log: true,
            error: false,
        });

        c1.start();
        c2.start();

        console.error("foo");
        console.log("bar");

        c1.stop();
        c2.stop();

        t.actual = JSON.stringify({
            c1: c1.output,
            c2: c2.output,
        });

        t.expected = JSON.stringify({
            c1: "foo\n",
            c2: "bar\n",
        });
    });

    test("config w/ stdout/stderr true + all console methods true", async (t) => {
        const c = new Capture({
            stdout: true,
            stderr: true,
            // console methods are true by default
        });

        c.start();
        process.stdout.write("foo\n");
        process.stderr.write("bar\n");
        console.log("baz", "ban");
        console.error("quz", "quux");
        c.stop();

        t.actual = c.output;
        t.expected = "foo\nbar\nbaz ban\nquz quux\n";
    });

    test("logging undefined", async (t) => {
        capture.start();
        console.log(undefined);
        capture.stop();

        t.actual = replaceEsc(capture.output);
        t.expected = "undefined\n";
    });

    test("logging null", async (t) => {
        capture.start();
        console.log(null);
        capture.stop();

        t.actual = replaceEsc(capture.output);
        t.expected = "null\n";
    });

    test("logging objects", async (t) => {
        capture.start();
        console.log({ foo: "foo" });
        capture.stop();

        t.actual = replaceEsc(capture.output);
        t.expected = "{ foo: 'foo' }\n";
    });

    test("logging arrays", async (t) => {
        capture.start();
        console.log(["foo"]);
        capture.stop();

        t.actual = replaceEsc(capture.output);
        t.expected = "[ 'foo' ]\n";
    });

    test("console.count", async (t) => {
        capture.start();
        console.count("foo");
        capture.stop();

        t.actual = capture.output;
        t.expected = "foo: 1\n";
    });

    test("modify config timing during a capture", async (t) => {
        const c = new Capture();

        c.start();
        console.log("foo");
        c.setOpts({ log: false });
        console.log("Modify config during capture - this should be written to stdout");
        c.stop();

        t.actual = c.output;
        t.expected = "foo\n";
    });

    test("multiple instances w/ uncaptured console.log do not log more than once", async (t) => {
        const c1 = new Capture({ log: false });
        const c2 = new Capture({ log: false });

        c1.start();
        c2.start();

        console.log("this should be logged");

        c1.stop();
        c2.stop();

        t.actual = "foo\n";
        t.expected = "foo\n";
    });

    test("if any instances opt in to capture a specific console method, output should not be logged even if there is an instance operating on the same block that chooses to not capture that method", async (t) => {
        const c1 = new Capture({
            log: false,
            error: true,
        });
        const c2 = new Capture({
            log: true,
            error: false,
        });

        c1.start();
        c2.start();

        const errmsg = "this should not be logged - err";
        const logmsg = "this should not be logged - log";
        console.error(errmsg);
        console.log(logmsg);

        c1.stop();
        c2.stop();

        t.actual = JSON.stringify({
            c1: c1.output,
            c2: c2.output,
        });

        t.expected = JSON.stringify({
            c1: `${errmsg}\n`,
            c2: `${logmsg}\n`,
        });
    });

    test("same as above test but for process.stdout|stderr.write", async (t) => {
        const c1 = new Capture({
            stdout: true,
            stderr: false,
        });
        const c2 = new Capture({
            stdout: false,
            stderr: true,
        });

        c1.start();
        c2.start();

        const errmsg = "this should not be logged - err\n";
        const logmsg = "this should not be logged - log\n";
        process.stderr.write(errmsg);
        process.stdout.write(logmsg);

        c1.stop();
        c2.stop();

        t.actual = JSON.stringify({
            c1: c1.output,
            c2: c2.output,
        });

        t.expected = JSON.stringify({
            c1: logmsg,
            c2: errmsg,
        });
    });
});

function replaceEsc(s: string): string {
    // eslint-disable-next-line no-control-regex
    return s.replace(/\x1b\[[0-9;]*m/g, "");
}
