import { Gene } from "./gene";
import { Criteria, GeneClass, Supression } from "./types";
export declare class Kodo {
  private _genes;
  private _genesFn;
  private _isFrozen;
  private _isAlive;
  private _suppressions;
  constructor({
    genes,
    suppress,
  }: {
    genes?: () => Gene[];
    suppress?: Supression<Gene>[];
  });
  get genes(): Gene<any, any>[];
  get isAlive(): boolean;
  get isFrozen(): boolean;
  clone(): Kodo;
  init(): boolean;
  freeze(): boolean;
  resume(): boolean;
  kill(): boolean;
  add(gene: () => Gene[]): this;
  remove<GeneType>(supression: Supression<GeneType>): this;
  find<GeneType>(
    geneClass: GeneClass<GeneType>,
    criteria?: Criteria<GeneType>,
    limitOne?: boolean
  ): GeneType[];
  findOne<GeneType>(
    geneClass: GeneClass<GeneType>,
    criteria?: Criteria<GeneType>
  ): GeneType;
}
