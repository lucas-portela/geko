import { Kode } from "./kode";
export declare class Gene {
    private _kode;
    private _isFrozen;
    get kode(): Kode;
    get isActive(): boolean;
    get isFrozen(): boolean;
    init(kode: Kode): void;
    freeze(): void;
    continue(): void;
    kill(): void;
    onInit(): void;
    onFreeze(): void;
    onResume(): void;
    onKill(): void;
}
