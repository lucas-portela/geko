export type Supression<GeneType> = {
    gene: {
        new (...args: any): GeneType;
    };
    criteria?: Partial<GeneType>;
};
