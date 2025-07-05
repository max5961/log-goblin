import { describe, test, beforeEach } from "./temu-jest.js";
import { Capture } from "../src/Capture.js";

describe("Capture", () => {
    let capture = new Capture();

    beforeEach(async () => {
        capture = new Capture();
    });

    test("foo1", async (t) => {
        capture.start();
        console.log("foo");
        capture.stop();
        t.actual = capture.output;
        t.expected = "foo";
    });
    test("foo2", async (t) => {
        t.actual = "foo";
        t.expected = "bar";
    });
});
