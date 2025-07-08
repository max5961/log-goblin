import { describe, test, expect, beforeEach } from "vitest";
import { Capture } from "../src/Capture.js";

describe("Works with vitest", () => {
    const cprocess = new Capture({
        stdout: true,
        stderr: true,
    });

    const cconsole = new Capture();

    beforeEach(() => {
        cprocess.reset();
        cconsole.reset();
    });

    test("console.log", () => {
        cconsole
            .exec(() => {
                console.log("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("console.error", () => {
        cconsole
            .exec(() => {
                console.error("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("console.warn", () => {
        cconsole
            .exec(() => {
                console.warn("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("console.info", () => {
        cconsole
            .exec(() => {
                console.info("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("console.debug", () => {
        cconsole
            .exec(() => {
                console.debug("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    // Works in temu-jest
    test.todo("console.time", () => {
        new Capture()
            .exec(() => {
                console.time("foo");
            })
            .handle((data) => {
                expect(data.output).toBe("foo: 1\n");
            });
    });

    test("process.stdout.write", () => {
        cprocess
            .exec(() => {
                process.stdout.write("foo\n");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("process.stderr.write", () => {
        cprocess
            .exec(() => {
                process.stderr.write("foo\n");
            })
            .handle((data) => {
                expect(data.output).toBe("foo\n");
            });
    });

    test("...args logs", () => {
        cconsole
            .exec(() => {
                console.log("foo", "bar", "baz");
            })
            .handle((data) => {
                expect(data.output).toBe("foo bar baz\n");
            });
    });
});
