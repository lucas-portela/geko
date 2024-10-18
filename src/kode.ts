import { Gene } from "./gene";
import { Supression } from "./types";

export class Kode {
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
    return new Kode({
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
      this.findSupressionTargets(supression)
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
      const genes = this.findSupressionTargets(supression);
      genes.forEach((gene) => {
        if (!this._isFrozen) gene.freeze();
        if (this._isAlive) gene.kill();
      });
      this._genes = this._genes.filter((gene) => !genes.includes(gene));
    }

    return this;
  }

  findSupressionTargets<GeneType>(supression: Supression<GeneType>) {
    let genes = this.find(supression.gene) as Gene[];
    if (supression.criteria)
      genes = genes.filter((gene) => {
        for (let field in supression.criteria) {
          if ((gene as any)[field] != (supression.criteria as any)[field])
            return false;
        }
        return true;
      });
    return genes;
  }

  find<GeneType>(geneClass: { new (...args: any): GeneType }) {
    return this._genes.filter(
      (gene) => gene instanceof geneClass
    ) as unknown[] as GeneType[];
  }

  findOne<GeneType>(geneClass: { new (...args: any): GeneType }) {
    return this._genes.find(
      (gene) => gene instanceof geneClass
    ) as unknown as GeneType;
  }
}
