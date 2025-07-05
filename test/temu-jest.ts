/**
 * Poor man's version of Jest that doesn't capture stdout/stderr
 * (tailored specifically to this proj)
 */

type TestResult = { actual: unknown; expected: unknown; desc: string };
type SN = string | number | unknown;

const callbacks: ((t: TestResult) => unknown)[] = [];
const results: TestResult[] = [];
const beforeCbs: (() => Promise<unknown>)[] = [];

export async function describe(desc: string, cb: () => unknown) {
    const yellow = (s: SN) => `\x1b[33m${String(s)}\x1b[0m`;
    const cyan = (s: SN) => `\x1b[36m${String(s)}\x1b[0m`;
    const blue = (s: SN) => `\x1b[34m${String(s)}\x1b[0m`;
    const green = (s: SN) => `\x1b[32m${String(s)}\x1b[0m`;
    const red = (s: SN) => `\x1b[31m${String(s)}\x1b[0m`;

    console.log(`${cyan(desc)}:`);
    cb();

    const totals = { passed: 0, failed: 0, total: 0 };

    for (let i = 0; i < callbacks.length; ++i) {
        if (callbacks[i] && results[i]) {
            for (const cb of beforeCbs) {
                await cb();
            }

            await callbacks[i](results[i]);
            const { actual, expected, desc } = results[i];
            if (actual === expected) {
                console.log(`  ${yellow(desc + ":")} ${green("pass")}`);
                ++totals.passed;
            } else {
                console.log(`  ${yellow(desc + ":")} ${red("fail")}`);
                console.log(`    Expected: '${blue(actual)}' to be '${cyan(expected)}'`);
                ++totals.failed;
            }
            ++totals.total;
        }
    }

    console.log(
        `${cyan(desc)}: ${yellow(totals.passed)} out of ${yellow(totals.total)} tests passed.`,
    );
}

export function beforeEach(cb: () => Promise<unknown>) {
    beforeCbs.push(cb);
}

export function test(desc: string, cb: (t: TestResult) => Promise<unknown>): void {
    const t = { actual: "", expected: "", desc };
    results.push(t);
    callbacks.push(cb);
}

test.skip = function (...args: Parameters<typeof test>) {
    console.log(`Skipping test: ${args[0]}`);
};
