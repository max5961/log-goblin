/**
 * Poor man's version of Jest.  This was written for this project prior to when
 * I decided to patch console methods as a means of intercepting stdout.  Jest/Vitest
 * patches console methods itself, so patching process.stdout|stderr.write wasn't
 * doing anything.  Keeping this since it works, and also serves as a
 * 'non testing framework' environment.
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

    console.log(`${cyan(desc)}:\n`);
    cb();

    const totals = { passed: 0, failed: 0, total: 0 };

    for (let i = 0; i < callbacks.length; ++i) {
        if (callbacks[i] && results[i]) {
            for (const cb of beforeCbs) {
                await cb();
            }

            await callbacks[i](results[i]);
            const { actual, expected, desc } = results[i];

            const rawActual = `\x1b[33m${String(actual).replace(/\n/g, "\\n")}\x1b[0m`;
            const rawExpected = `\x1b[33m${String(expected).replace(/\n/g, "\\n")}\x1b[0m`;

            if (actual === expected) {
                console.log(`  ${yellow(desc + ":")}\n    ${green("pass")}`);
                ++totals.passed;
            } else {
                console.log(`  ${yellow(desc + ":")}\n    ${red("fail")}`);
                console.log(
                    `      Expected: '${blue(rawActual)}' to be '${cyan(rawExpected)}'`,
                );
                ++totals.failed;
            }
            ++totals.total;
        }
    }

    console.log(
        `\n${cyan(desc)}: ${yellow(totals.passed)} out of ${yellow(totals.total)} tests passed.`,
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
