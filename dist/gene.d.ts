import { Kodo } from "./kodo";
import { InputWiring, OutputWiring, WireListener } from "./types";
export declare class Gene<InputType = Record<string, any>, OutputType = Record<string, any>> {
    private _kodo;
    private _isFrozen;
    private _input;
    private _output;
    private _listeners;
    get kodo(): Kodo;
    get isActive(): boolean;
    get isFrozen(): boolean;
    protected read(key: keyof InputType): InputType[keyof InputType];
    protected write<Key extends keyof OutputType>(key: Key, value: OutputType[Key]): void;
    watch<Key extends keyof InputType>(key: Key, listener: WireListener<InputType[Key]>): boolean;
    wait<Key extends keyof InputType>(key: Key, timeout?: number): Promise<InputType[Key]>;
    input(wiring: InputWiring<InputType>): this;
    output(wiring: OutputWiring<OutputType>): this;
    private _attachListeners;
    private _detachListeners;
    init(kodo: Kodo): void;
    freeze(): void;
    continue(): void;
    kill(): void;
    onInit(): void;
    onFreeze(): void;
    onResume(): void;
    onKill(): void;
}
