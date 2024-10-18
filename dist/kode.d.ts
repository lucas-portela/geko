import { Gene } from "./gene";
import { Supression } from "./types";
export declare class Kode {
    private _genes;
    private _genesFn;
    private _isFrozen;
    private _isAlive;
    private _suppressions;
    constructor({ genes, suppress, }: {
        genes?: () => Gene[];
        suppress?: Supression<Gene>[];
    });
    get genes(): Gene[];
    get isAlive(): boolean;
    get isFrozen(): boolean;
    clone(): Kode;
    init(): boolean;
    freeze(): boolean;
    resume(): boolean;
    kill(): boolean;
    add(gene: () => Gene[]): this;
    remove<GeneType>(supression: Supression<GeneType>): this;
    findSupressionTargets<GeneType>(supression: Supression<GeneType>): Gene[];
    find<GeneType>(geneClass: {
        new (...args: any): GeneType;
    }): GeneType[];
    findOne<GeneType>(geneClass: {
        new (...args: any): GeneType;
    }): GeneType;
}
