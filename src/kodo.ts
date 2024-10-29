import { Gene } from "./gene";
import { Criteria, GeneClass, Supression } from "./types";
import { Wiring } from "./wire";

export class Kodo {
  private _genes: Gene[] = [];
  private _genesFn: (() => Gene[])[] = [];
  private _isFrozen: boolean = true;
  private _isActive: boolean = false;
  private _suppressions: Supression<Gene>[] = [];
  private _executionResolver: (value: boolean) => void;
  public address: number;

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

  get isActive() {
    return this._isActive;
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

  async run(): Promise<boolean> {
    if (this._isActive) return false;
    this._isActive = true;
    this._isFrozen = false;

    this._genes = [];
    this._genesFn.forEach((geneFn) => {
      this._genes.push(...geneFn());
    });

    const genesToSuppress: Gene[] = this._suppressions.flatMap((supression) =>
      this.find(supression.gene, supression.criteria)
    );

    this._genes = this._genes.filter((gene) => !genesToSuppress.includes(gene));

    const executionPromise = new Promise<boolean>((resolve) => {
      this._executionResolver = resolve;
    });

    this._genes.forEach((gene) => {
      gene.init(this);
    });

    this._genes.forEach((gene) => {
      gene.onReady();
    });

    const processKeepAlive = () => {
      if (this.isActive) setTimeout(processKeepAlive, 500);
    };
    processKeepAlive();

    return await executionPromise;
  }

  freeze() {
    if (this._isFrozen || !this._isActive) return false;
    this._isFrozen = true;
    this._genes.forEach((gene) => gene.freeze());
    return true;
  }

  resume() {
    if (!this._isFrozen || !this._isActive) return false;
    this._isFrozen = false;
    this._genes.forEach((gene) => gene.continue());
    return true;
  }

  finish() {
    if (!this._isActive) return false;
    if (!this._isFrozen) {
      this._genes.forEach((gene) => gene.freeze());
      this._isFrozen = true;
    }
    this._isActive = false;
    this._genes.forEach((gene) => gene.kill());
    if (this._executionResolver) this._executionResolver(true);
    return true;
  }

  add(gene: () => Gene[]) {
    if (this._isActive) {
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
    if (this._isActive) {
      const genes = this.find(supression.gene, supression.criteria) as Gene[];
      genes.forEach((gene) => {
        if (!this._isFrozen) gene.freeze();
        if (this._isActive) gene.kill();
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
