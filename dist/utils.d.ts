import { FlowControl } from "./flow";
import { Kodo } from "./kodo";
import { DeepFlowLogic, FlowLogic, FlowLogicItem } from "./types";
import { Wire } from "./wire";
export declare const $str: (...wires: (Wire<any> | string | number | undefined)[]) => import("./wire").WireTransformer<any[], string>;
export declare const $num: (wireNumber: Wire<number> | number) => import("./wire").WireTransformer<any, number>;
export declare const $if: (condition: () => boolean, ...doElseBlocks: DeepFlowLogic<ReturnType<typeof $else>>) => FlowLogicItem[];
export declare const $else: (...doBlock: DeepFlowLogic) => FlowLogic<{
    type: "$else";
}>;
export declare const $switch: (defaultBlock: ReturnType<typeof $default>, ...cases: ReturnType<typeof $case>[]) => FlowLogicItem[];
export declare const $case: (condition: () => boolean, ...doBlock: FlowLogic) => [() => boolean, FlowLogic];
export declare const $default: (...doBlock: FlowLogic) => FlowLogic<{
    type: "$default";
}>;
export declare const $while: (condition: () => boolean, ...doBlocks: DeepFlowLogic) => FlowLogicItem[];
export declare const $repeat: (times: Wire<number>, logic: (i: Wire<number>) => FlowLogic | FlowLogic[]) => FlowLogicItem[];
export declare const $split: (...deepBlocks: FlowLogic<ReturnType<typeof $thread>>[]) => (Kodo | FlowControl)[];
export declare const $thread: (...doBlock: DeepFlowLogic) => FlowLogic<{
    type: "$thread";
}>;
export declare const $flat: <ListType>(list: (ListType | ListType[])[]) => ListType[];
