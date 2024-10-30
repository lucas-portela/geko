import { InputWiring, OutputWiring, WireListener } from "./types";
export declare class Wire<ValueType> {
    protected _value?: ValueType;
    protected _listeners: WireListener<ValueType>[];
    private _pipedWires;
    private _syncedWith;
    private _syncListener;
    get value(): ValueType;
    set value(value: ValueType);
    constructor(_value?: ValueType);
    _applyPipe(): void;
    emit({ triggeredBySync, uniqueListener, }?: {
        triggeredBySync?: boolean;
        uniqueListener?: WireListener<ValueType>;
    }): boolean;
    wait(timeout?: number): Promise<ValueType>;
    attach(listener: WireListener<ValueType>, { skipEmit }?: {
        skipEmit?: boolean;
    }): boolean;
    detach(listener: WireListener<ValueType>): boolean;
    sync(wire: Wire<any>): this;
    unsync(): this;
    pipe(wires: Wire<ValueType>[] | undefined): this;
}
export declare class ComputedWire<ValueType> extends Wire<ValueType> {
    private _compute;
    constructor(_compute: () => ValueType);
    get value(): ValueType;
    set value(_: ValueType);
}
export declare class WireMultiplexer<ValueType> extends Wire<ValueType[]> {
    private _wires;
    private _chidrenListener;
    private _pauseChildrenListener;
    private _attached;
    constructor(wires: (Wire<ValueType> | ValueType)[]);
    get value(): ValueType[];
    set value(values: ValueType[]);
    attach(listener: WireListener<ValueType[]>, { skipEmit }?: {
        skipEmit?: boolean;
    }): boolean;
    detach(listener: WireListener<ValueType[]>): boolean;
}
export declare class NamedWireMultiplexer<NamedTypes extends Record<string, any>> extends Wire<Partial<NamedTypes>> {
    private _wires;
    private _chidrenListener;
    private _attached;
    constructor(wires: {
        [key in keyof NamedTypes]?: Wire<NamedTypes[key] | NamedTypes[key]>;
    });
    get value(): Partial<NamedTypes>;
    set value(values: Partial<NamedTypes>);
    attach(listener: WireListener<Partial<NamedTypes>>, { skipEmit }?: {
        skipEmit?: boolean;
    }): boolean;
    detach(listener: WireListener<Partial<NamedTypes>>): boolean;
}
export declare class WireTransformer<ValueType, TransformedType> extends Wire<TransformedType> {
    private _wire;
    private _childListener;
    private _attached;
    private _transformer;
    constructor(wire: Wire<ValueType>, transformer: (value: ValueType) => TransformedType);
    get value(): TransformedType;
    set value(value: TransformedType);
    attach(listener: WireListener<TransformedType>, { skipEmit }?: {
        skipEmit?: boolean;
    }): boolean;
    detach(listener: WireListener<TransformedType>): boolean;
}
export declare class Wiring<InputType = any, OutputType = any> {
    private _input;
    private _output;
    private _wireListeners;
    read<Key extends keyof InputType>(key: keyof InputType): InputType[Key];
    write<Key extends keyof OutputType>(key: Key, value: OutputType[Key]): void;
    watch<Key extends keyof InputType>(key: Key, listener: WireListener<InputType[Key]>): boolean;
    wait<Key extends keyof InputType>(key: Key, timeout?: number): Promise<InputType[Key]>;
    input(wiring: InputWiring<InputType>): this;
    output(wiring: OutputWiring<OutputType>): this;
    protected _attachWireListeners(): void;
    protected _detachWireListeners(): void;
}
