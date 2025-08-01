import type { Capture } from "./Capture.js";

export type Handler = (data: string) => unknown;
export type DataType = "stdout" | "stderr" | "output";

export class DataHandlers {
    private handlers: {
        stdout: Map<Capture, Set<Handler>>;
        stderr: Map<Capture, Set<Handler>>;
        output: Map<Capture, Set<Handler>>;
    };

    constructor() {
        this.handlers = {
            stdout: new Map(),
            stderr: new Map(),
            output: new Map(),
        };
    }

    public handle(instance: Capture, type: DataType, data: string) {
        const map = this.handlers[type];
        const instanceHandlers = map?.get(instance);
        if (!instanceHandlers) return;

        instanceHandlers.forEach((h) => {
            h(data);
        });
    }

    public addHandler(instance: Capture, type: DataType, handler: Handler) {
        if (!this.handlers[type].get(instance)) {
            this.handlers[type].set(instance, new Set([handler]));
        } else {
            this.handlers[type].get(instance)!.add(handler);
        }

        return () => {
            this.handlers[type].get(instance)!.delete(handler);
        };
    }

    public removeHandler(instance: Capture, type: DataType, handler: Handler) {
        if (!this.handlers[type].get(instance)) {
            return; // No handlers, there is nothing to remove.
        } else {
            this.handlers[type].get(instance)!.delete(handler);
        }
    }
}

export const handlers = new DataHandlers();
