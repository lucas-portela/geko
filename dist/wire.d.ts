import { WireListener } from "./types";
export declare class Wire<ValueType> {
    private _value?;
    private _listeners;
    get value(): ValueType;
    set value(value: ValueType);
    constructor(_value?: ValueType);
    wait(timeout?: number): Promise<ValueType>;
    attach(listener: WireListener<ValueType>): boolean;
    detach(listener: WireListener<ValueType>): boolean;
}
