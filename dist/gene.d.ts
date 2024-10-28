import { Kodo } from "./kodo";
import { Wiring } from "./wire";
export declare class Gene<InputType = any, OutputType = any> extends Wiring<InputType, OutputType> {
    private _kodo;
    private _isFrozen;
    get kodo(): Kodo;
    get isActive(): boolean;
    get isFrozen(): boolean;
    init(kodo: Kodo): void;
    freeze(): void;
    continue(): void;
    kill(): void;
    onInit(): void;
    onFreeze(): void;
    onResume(): void;
    onKill(): void;
}
