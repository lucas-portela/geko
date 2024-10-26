import { WireListener } from "./types";
export declare class Wire<ValueType> {
    protected _value?: ValueType;
    protected _listeners: WireListener<ValueType>[];
    get value(): ValueType;
    set value(value: ValueType);
    constructor(_value?: ValueType);
    emit(): void;
    wait(timeout?: number): Promise<ValueType>;
    attach(listener: WireListener<ValueType>): boolean;
    detach(listener: WireListener<ValueType>): boolean;
}
export declare class WireMultiplexer<ValueType> extends Wire<ValueType[]> {
    private _wires;
    constructor(_wires: Wire<ValueType>[]);
    get value(): ValueType[];
    set value(values: ValueType[]);
}
export declare class WireTransformer<ValueType, TransformedType> extends Wire<TransformedType> {
    constructor(wire: Wire<ValueType>, transformer: (value: ValueType) => TransformedType);
    get value(): TransformedType;
    set value(_: TransformedType);
}
