declare type Sign = -1 | 0 | 1;
declare type PowerFactors = Record<string, bigint>;
/** Exact surd */
interface Surd {
    /**
     * Simplify exactly
     * @returns Simplified surd
     */
    simplify(): Surd;
    /**
     * Compute with floating point maths
     * @returns Computed value
     */
    compute(): number | bigint;
    /**
     * Convert to KATEX ({@link https://katex.org/})
     * @returns KATEX
     */
    katex(): string;
    /**
     * Attempt to convert to Int
     * @returns Int or Surd
     */
    preferablyInt(): Int | Surd;
}
export declare class Int implements Surd {
    x: bigint;
    constructor(x: number | bigint);
    simplify(): this;
    compute(): bigint;
    katex(): string;
    preferablyInt(): this;
}
export declare class Variable implements Surd {
    symbol: string;
    constructor(symbol: string);
    simplify(): this;
    compute(): never;
    katex(): string;
    preferablyInt(): this;
}
export declare class Func<T extends Surd[]> implements Surd {
    run: (args: T) => Surd;
    args: T;
    symbol: string;
    argSymbols: string[];
    constructor(run: (args: T) => Surd, args: T, symbol?: string, argSymbols?: string[]);
    private maths;
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Surd | Int;
}
export declare class Summation implements Surd {
    terms: Surd[];
    constructor(terms: Surd[]);
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Int | this;
}
export declare class Add extends Summation {
    constructor(a: Surd, b: Surd);
}
export declare class Sub implements Surd {
    a: Surd;
    b: Surd;
    constructor(a: Surd, b: Surd);
    simplify(): Sub;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Int | this;
}
export declare class Mult implements Surd {
    a: Surd;
    b: Surd;
    constructor(a: Surd, b: Surd);
    simplify(): Surd | Mult;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Int | this;
}
export declare class Factorisation implements Surd {
    factors: bigint[];
    sign: Sign;
    constructor(...factors: bigint[]);
    simplify(): Int | this;
    compute(): bigint;
    katex(): string;
    preferablyInt(): Int;
    toPfs(): Factorisation;
    static from(x: Surd): Factorisation;
    static pf(x: bigint): bigint[];
    static pfs(x: bigint): bigint[];
}
export declare class PowerFactorisation implements Surd {
    factors: PowerFactors;
    sign: Sign;
    constructor(factors: PowerFactors, sign: Sign);
    simplify(): Surd;
    katex(): string;
    preferablyInt(): Int | this;
    compute(): bigint;
    toPfs(): PowerFactorisation;
    static add(terms: PowerFactorisation[]): Int | Summation | Mult;
    static from(x: Surd): PowerFactorisation;
}
export declare class Fraction implements Surd {
    num: Surd;
    den: Surd;
    constructor(num: Surd, den: Surd);
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): this;
    static add(a: Fraction, b: Fraction): Fraction;
}
export declare class Power implements Surd {
    base: Surd;
    exponent: Surd;
    constructor(base: Surd, exponent: Surd);
    simplify(): Surd | Power;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Int | this;
}
export declare class Factorial implements Surd {
    x: bigint;
    constructor(x: bigint);
    private maths;
    simplify(): Int | Factorisation;
    compute(): bigint;
    katex(): string;
    preferablyInt(): Int;
}
export declare class Choose implements Surd {
    n: bigint;
    r: bigint;
    constructor(n: bigint, r: bigint);
    private maths;
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Fraction;
}
export declare class Permute implements Surd {
    n: bigint;
    r: bigint;
    constructor(n: bigint, r: bigint);
    private maths;
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Fraction;
}
export declare class SigmaSummation implements Surd {
    lowerBound: Int;
    upperBound: Int;
    term: (x: Int | Variable) => Surd;
    indexSymbol: string;
    constructor(lowerBound: Int, upperBound: Int, term: (x: Int | Variable) => Surd, indexSymbol?: string);
    private maths;
    simplify(): Surd;
    compute(): number | bigint;
    katex(): string;
    preferablyInt(): Int | Summation;
}
export {};
//# sourceMappingURL=index.d.ts.map