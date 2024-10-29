import { DeepFlowLogic } from "./types";
export declare class FlowCursor {
    address: number;
    private _executionPromise;
    private _executionResolver;
    private _isActive;
    constructor(address: number);
    get isActive(): boolean;
    get result(): Promise<boolean>;
    success(): void;
    fail(): void;
}
export declare class Flow {
    private _cursors;
    private _flow;
    private _isActive;
    constructor(deepFlow: DeepFlowLogic);
    get flow(): import("./types").FlowLogicItem[];
    get isActive(): boolean;
    run(cursor?: FlowCursor): Promise<boolean>;
}
export declare class FlowControl {
    private _evaluator;
    readonly comment?: string;
    address: number;
    constructor(_evaluator: (cursor: FlowCursor, spawn?: (address: number) => FlowCursor) => Promise<number>, comment?: string);
    eval(cursor: FlowCursor, spawn: (address: number) => FlowCursor): Promise<void>;
}
