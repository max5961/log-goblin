import { capture } from "../src/index.js";

const results = { total: 0, passed: 0 };

function printResults() {
    console.log(
        `\x1b[36m\nResults:\n\x1b[33m${results.passed}\x1b[0m passed out of \x1b[33m${results.total}\x1b[0m tests.`,
    );
}

function test(s: string, message: string | undefined, cb: () => unknown) {
    const result = capture(cb);
    const msg = `${message ? "\n  - " : ""}${message ?? ""}`;
    const rawStr = `\x1b[33m${s.replace(/\n/g, "\\n")}\x1b[0m`;
    const rawRes = `\x1b[33m${result.replace(/\n/g, "\\n")}\x1b[0m`;

    if (result === s) {
        console.log(`\x1b[32mPass:\x1b[0m ${rawStr}${msg}`);
        ++results.passed;
    } else {
        console.log(`\x1b[31mFail:\x1b[0m ${msg}`);
        console.log(
            `    \x1b[32mExpected: ${rawStr}.\x1b[0m \x1b[31mReceived: ${rawRes}\x1b[0m`,
        );
    }
    ++results.total;
}

test("foo", "remove \\n from end", () => {
    console.log("foo");
});

test("foo\nbar", "multiple log statements and remove \\n from end", () => {
    console.log("foo");
    console.log("bar");
});

test("foo", "stderr", () => {
    console.error("foo");
});

test("foo\nbar", "stderr multiple log statements and remove \\n from end", () => {
    console.error("foo");
    console.error("bar");
});

console.log("\nThis stdout should not be captured");
test("foobar", "resets console.log", () => {
    console.log("foobar");
});

console.error("\nThis stderr should not be captured");
test("foobar", "resets console.error", () => {
    console.error("foobar");
});

test("foobar", "captures console.warn", () => {
    console.warn("foobar");
});

test("foobar", "captures process.stdout.write", () => {
    process.stdout.write("foobar\n");
});

test("foobar", "captures process.stderr.write", () => {
    process.stderr.write("foobar\n");
});

test("foo\nbar\nbaz\nban\nquz", "captures different log statements together", () => {
    console.log("foo");
    console.error("bar");
    console.warn("baz");
    process.stdout.write("ban\n");
    process.stderr.write("quz\n");
});

printResults();
