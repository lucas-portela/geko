import { Gene } from "./gene";
import { Criteria, GeneClass, Supression } from "./types";
export declare class Kodo {
    private _genes;
    private _genesFn;
    private _isFrozen;
    private _isActive;
    private _suppressions;
    private _executionResolver;
    address: number;
    constructor({ genes, suppress, }: {
        genes?: () => Gene[];
        suppress?: Supression<Gene>[];
    });
    get genes(): Gene<any, any>[];
    get isActive(): boolean;
    get isFrozen(): boolean;
    clone(): Kodo;
    run(): Promise<boolean>;
    freeze(): boolean;
    resume(): boolean;
    finish(): boolean;
    add(gene: () => Gene[]): this;
    remove<GeneType>(supression: Supression<GeneType>): this;
    find<GeneType>(geneClass: GeneClass<GeneType>, criteria?: Criteria<GeneType>, limitOne?: boolean): GeneType[];
    findOne<GeneType>(geneClass: GeneClass<GeneType>, criteria?: Criteria<GeneType>): GeneType;
}
