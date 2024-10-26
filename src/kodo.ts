import { Gene } from "./gene";
import { Criteria, GeneClass, Supression } from "./types";

export class Kodo {
  private _genes: Gene[] = [];
  private _genesFn: (() => Gene[])[] = [];
  private _isFrozen: boolean = true;
  private _isAlive: boolean = false;
  private _suppressions: Supression<Gene>[] = [];

  constructor({
    genes = () => [],
    suppress = [],
  }: {
    genes?: () => Gene[];
    suppress?: Supression<Gene>[];
  }) {
    this._suppressions = [...suppress];
    this._genesFn = [];
    this._genesFn.push(genes);
  }

  get genes() {
    return [...this._genes];
  }

  get isAlive() {
    return this._isAlive;
  }

  get isFrozen() {
    return this._isFrozen;
  }

  clone() {
    return new Kodo({
      genes: () => this._genesFn.map((fn) => fn()).flat(),
      suppress: this._suppressions,
    });
  }

  init() {
    if (this._isAlive) return false;
    this._isAlive = true;
    this._isFrozen = false;

    this._genes = [];
    this._genesFn.forEach((geneFn) => {
      this._genes.push(...geneFn());
    });

    const genesToSuppress: Gene[] = this._suppressions.flatMap((supression) =>
      this.find(supression.gene, supression.criteria)
    );

    this._genes = this._genes.filter((gene) => !genesToSuppress.includes(gene));

    this._genes.forEach((gene) => {
      gene.init(this);
    });
    return true;
  }

  freeze() {
    if (this._isFrozen || !this._isAlive) return false;
    this._isFrozen = true;
    this._genes.forEach((gene) => gene.freeze());
    return true;
  }

  resume() {
    if (!this._isFrozen || !this._isAlive) return false;
    this._isFrozen = false;
    this._genes.forEach((gene) => gene.continue());
    return true;
  }

  kill() {
    if (!this._isAlive) return false;
    if (!this._isFrozen) {
      this._genes.forEach((gene) => gene.freeze());
      this._isFrozen = true;
    }
    this._isAlive = false;
    this._genes.forEach((gene) => gene.kill());
    return true;
  }

  add(gene: () => Gene[]) {
    if (this._isAlive) {
      gene().forEach((geneInstance) => {
        this._genes.push(geneInstance);
        geneInstance.init(this);
        if (this._isFrozen) geneInstance.freeze();
      });
    }
    this._genesFn.push(gene);
    return this;
  }

  remove<GeneType>(supression: Supression<GeneType>) {
    this._suppressions.push(supression as Supression<Gene>);
    if (this._isAlive) {
      const genes = this.find(supression.gene, supression.criteria) as Gene[];
      genes.forEach((gene) => {
        if (!this._isFrozen) gene.freeze();
        if (this._isAlive) gene.kill();
      });
      this._genes = this._genes.filter((gene) => !genes.includes(gene));
    }

    return this;
  }

  find<GeneType>(
    geneClass: GeneClass<GeneType>,
    criteria: Criteria<GeneType> = {},
    limitOne = false
  ) {
    const filterFn = (gene: Gene) => {
      if (!(gene instanceof geneClass)) return false;
      for (let field in criteria) {
        if ((gene as any)[field] != (criteria as any)[field]) return false;
      }
      return true;
    };

    const results: GeneType[] = [];
    if (limitOne) {
      const foundGene = this._genes.find(filterFn) as GeneType;
      if (foundGene) results.push(foundGene);
    } else
      results.push(
        ...(this._genes.filter(filterFn) as unknown[] as GeneType[])
      );

    return results;
  }

  findOne<GeneType>(
    geneClass: GeneClass<GeneType>,
    criteria: Criteria<GeneType> = {}
  ) {
    return this.find(geneClass, criteria, true)[0] || null;
  }
}
