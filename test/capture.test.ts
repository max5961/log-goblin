import { capture } from "../src/capture.js";
import fs from "fs";

const results = { total: 0, passed: 0 };

async function printResults() {
    console.log(
        `\x1b[33m${results.passed}\x1b[0m passed out of \x1b[33m${results.total}\x1b[0m tests.`,
    );
}

function expect(actual: string, expected: string) {
    const rawRes = `\x1b[33m${actual.replace(/\n/g, "\\n")}\x1b[0m`;
    const rawExp = `\x1b[33m${expected.replace(/\n/g, "\\n")}\x1b[0m`;
    const res = actual === expected;
    ++results.total;

    if (res) {
        console.log(`\x1b[32mPass:\x1b[0m ${rawRes}`);
        ++results.passed;
    } else {
        console.log(`\x1b[31mFail:\x1b[0m`);
        console.log(
            `    \x1b[32mExpected: ${rawExp}.\x1b[0m \x1b[31mReceived: ${rawRes}\x1b[0m`,
        );
    }
}

function test(msg: string, cb: () => unknown) {
    cb();
    console.log(`\x1b[36m  - ${msg}\n\x1b[0m`);

    return { printResults };
}

test("remove \\n from end", () => {
    const result = capture(() => {
        console.log("foo");
    });
    expect(result.output, "foo");
});

test("multiple log statements and remove \\n from end", () => {
    const result = capture(() => {
        console.log("foo");
        console.log("bar");
    });
    expect(result.output, "foo\nbar");
});

test("...args log statement", () => {
    const result = capture(() => {
        console.log("foo", "bar");
    });
    expect(result.output, "foo bar");
});

test("captures stderr", () => {
    const result = capture(() => {
        console.error("foobar");
    });
    expect(result.stderr, "foobar");
    expect(result.stdout, "");
    expect(result.output, "foobar");
});

test("multiple stderr", () => {
    const result = capture(() => {
        console.error("foo");
        console.error("bar", "baz");
    });
    expect(result.output, "foo\nbar baz");
    expect(result.stderr, "foo\nbar baz");
    expect(result.stdout, "");
});

test("can handle predefined fns with console.log", () => {
    const cb = () => console.log("foo");
    const result = capture(cb);
    expect(result.output, "foo");
});

test("can handle predefined fns with console.log", () => {
    const cb = () => console.log("foo");
    const result = capture(cb);
    expect(result.output, "foo");
});

console.log("\x1b[34mThis stdout should not be captured\x1b[0m");
test("resets console.log", () => {
    const result = capture(() => console.log("foobar"));
    expect(result.stdout, "foobar");
});

console.error("\x1b[34mThis stderr should not be captured\x1b[0m");
test("resets console.error", () => {
    const result = capture(() => console.error("foobar"));
    expect(result.stderr, "foobar");
});

console.warn("\x1b[34mThis stderr [warn] should not be captured\x1b[0m");
test("resets console.warn", () => {
    const result = capture(() => console.warn("foobar"));
    expect(result.stderr, "foobar");
});

test("captures process.stdout.write", () => {
    const result = capture(() => {
        process.stdout.write("foobar");
    });
    expect(result.stdout, "foobar");
});

test("captures process.stderr.write", () => {
    const result = capture(() => {
        process.stderr.write("foobar");
    });
    expect(result.stderr, "foobar");
});

test("captures different logging methods together", () => {
    const result = capture(() => {
        console.log("foo");
        console.error("bar");
        console.warn("baz");
        process.stdout.write("ban\n");
        process.stderr.write("quz\n");
    });
    expect(result.output, "foo\nbar\nbaz\nban\nquz");
});

test("writes to file", () => {
    const file = "foo.txt";
    capture(() => {
        console.log("foo");
    }).write(file);
    expect(fs.readFileSync(file, { encoding: "utf-8" }), "foo");
    fs.rmSync(file);
});

test("writes to file async", async () => {
    const file = "foo.txt";
    const result = capture(() => {
        console.log("foo");
    });
    await result.writeAsync(file);
    expect(fs.readFileSync(file, { encoding: "utf-8" }), "foo");
    fs.rmSync(file);
}).printResults();
