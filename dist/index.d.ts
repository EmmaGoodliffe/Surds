/**
 * Sign of surd or number
 * @public
 */
export declare type Sign = -1 | 0 | 1;
/**
 * Factorisation represented as powers (keys are factors and values are powers)
 * @example
 * \{ "2": 2n, "3", 1n \} // represents 2^2 * 3^1 = 12
 * @public
 */
export declare type PowerFactors = Record<string, bigint>;
/**
 * Exact surd
 * @public
 */
export interface Surd {
  /**
   * Simplify exactly
   * @returns Simplified surd
   */
  simplify(): Surd;
  /**
   * Compute with floating point maths
   * @returns Rounded value
   */
  compute(): number | bigint;
  /**
   * Convert to {@link https://katex.org/ | KATEX}
   * @returns KATEX
   */
  katex(): string;
  /**
   * Attempt to convert to Int
   * @returns Int or Surd
   */
  preferablyInt(): Int | Surd;
}
/**
 * Integer
 * @public
 */
export declare class Int implements Surd {
  x: bigint;
  /**
   * @param x - Value
   */
  constructor(x: number | bigint);
  simplify(): this;
  compute(): bigint;
  katex(): string;
  preferablyInt(): this;
}
/**
 * Variable (to define an abstraction such as a function and to be given a value before being computed)
 * @public
 */
export declare class Variable implements Surd {
  symbol: string;
  /**
   * @param symbol - Symbol for variable such as "x"
   */
  constructor(symbol: string);
  simplify(): this;
  compute(): never;
  katex(): string;
  preferablyInt(): this;
}
/**
 * Function
 * @public
 */
export declare class Func<T extends Surd[]> implements Surd {
  run: (args: T) => Surd;
  args: T;
  symbol: string;
  argSymbols: string[];
  /**
   * @param run - Function
   * @param args - Arbitrary array of surd arguments for function
   * @param symbol - Symbol for function (default: `"f"` for "f(x)")
   * @param argSymbols - Symbols for arguments (default: `["x"]` for "f(x)")
   */
  constructor(
    run: (args: T) => Surd,
    args: T,
    symbol?: string,
    argSymbols?: string[],
  );
  private maths;
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Surd | Int;
}
/**
 * Summation
 * @public
 */
export declare class Summation implements Surd {
  terms: Surd[];
  /**
   * @param terms - Terms to sum
   */
  constructor(terms: Surd[]);
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Int | this;
}
/**
 * Add
 * @public
 */
export declare class Add extends Summation {
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(a: Surd, b: Surd);
}
/**
 * Subtraction
 * @public
 */
export declare class Sub implements Surd {
  a: Surd;
  b: Surd;
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(a: Surd, b: Surd);
  simplify(): Sub;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Int | this;
}
/**
 * Multiplication
 * @public
 */
export declare class Mult implements Surd {
  a: Surd;
  b: Surd;
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(a: Surd, b: Surd);
  simplify(): Surd | Mult;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Int | this;
}
/**
 * Factorisation (multiplication of integers)
 * @public
 */
export declare class Factorisation implements Surd {
  factors: bigint[];
  sign: Sign;
  /**
   * @param factors - Factors
   */
  constructor(...factors: bigint[]);
  simplify(): Int | this;
  compute(): bigint;
  katex(): string;
  preferablyInt(): Int;
  /**
   * Convert factorisation to prime factorisation
   * @returns Prime factorisation
   */
  toPfs(): Factorisation;
  /**
   * Convert surd to factorisation
   * @param x - Value
   * @returns Factorisation
   */
  static from(x: Surd): Factorisation;
  /**
   * Get arbitrary prime factor (under 100) of an integer
   * @param x - Value
   * @returns Prime factor
   */
  static pf(x: bigint): bigint[];
  /**
   * Convert integer to prime factors (under 100)
   * @param x - Value
   * @returns Prime factors
   */
  static pfs(x: bigint): bigint[];
}
/**
 * Factorisation represented as powers of integers
 * @public
 */
export declare class PowerFactorisation implements Surd {
  factors: PowerFactors;
  sign: Sign;
  /**
   * @param factors - Factors
   * @param sign - Sign
   */
  constructor(factors: PowerFactors, sign: Sign);
  simplify(): Surd;
  katex(): string;
  preferablyInt(): Int | this;
  compute(): bigint;
  /**
   * Convert power factorisation to prime factorisation
   * @returns Prime factorisation
   */
  toPfs(): PowerFactorisation;
  /**
   * Attempt to add power factorisations via factorisation
   * @param terms - Terms
   * @returns Result
   */
  static add(terms: PowerFactorisation[]): Int | Summation | Mult;
  /**
   * Convert surd to power factorisation
   * @param x - Value
   * @returns Power factorisation
   */
  static from(x: Surd): PowerFactorisation;
}
/**
 * Fraction
 * @public
 */
export declare class Fraction implements Surd {
  num: Surd;
  den: Surd;
  /**
   * @param num - Numerator
   * @param den - Denominator
   */
  constructor(num: Surd, den: Surd);
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): this;
  /**
   * Attempt to add fractions via a common denominator
   * @param a - Term one
   * @param b - Term two
   * @returns Result
   */
  static add(a: Fraction, b: Fraction): Fraction;
}
/**
 * Power (index)
 * @public
 */
export declare class Power implements Surd {
  base: Surd;
  exponent: Surd;
  /**
   * @param base - Base
   * @param exponent - Exponent
   */
  constructor(base: Surd, exponent: Surd);
  simplify(): Surd | Power;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Int | this;
}
/**
 * Factorial (x!)
 * @public
 */
export declare class Factorial implements Surd {
  x: bigint;
  /**
   * @param x - Value
   */
  constructor(x: bigint);
  private maths;
  simplify(): Int | Factorisation;
  compute(): bigint;
  katex(): string;
  preferablyInt(): Int;
}
/**
 * Choose (nCr)
 * @public
 */
export declare class Choose implements Surd {
  n: bigint;
  r: bigint;
  /**
   * @param n - n
   * @param r - r
   */
  constructor(n: bigint, r: bigint);
  private maths;
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Fraction;
}
/**
 * Permute (nPr)
 * @public
 */
export declare class Permute implements Surd {
  n: bigint;
  r: bigint;
  /**
   * @param n - n
   * @param r - r
   */
  constructor(n: bigint, r: bigint);
  private maths;
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Fraction;
}
/**
 * Summation in capital-sigma notation
 * @public
 */
export declare class SigmaSummation implements Surd {
  lowerBound: Int;
  upperBound: Int;
  term: (x: Int | Variable) => Surd;
  indexSymbol: string;
  /**
   * @param lowerBound - Lower bound (under sigma in notation)
   * @param upperBound - Upper bound (above sigma in notation)
   * @param term - Function returning term (argument of sigma in notation)
   * @param indexSymbol - Index symbol (under sigma in notation and usually "x", "n", "r" or "i")
   */
  constructor(
    lowerBound: Int,
    upperBound: Int,
    term: (x: Int | Variable) => Surd,
    indexSymbol?: string,
  );
  private maths;
  simplify(): Surd;
  compute(): number | bigint;
  katex(): string;
  preferablyInt(): Int | Summation;
}
//# sourceMappingURL=index.d.ts.map
