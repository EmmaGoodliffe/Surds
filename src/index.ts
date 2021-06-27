// import { appendFileSync as write } from "fs";

// TODO: try `is` instead of `instanceof`
// TODO: make `if` statements consistent

/** Sign of surd or number */
type Sign = -1 | 0 | 1;
/**
 * Factorisation represented as powers (keys are factors and values are powers)
 * @example
 * { "2": 2n, "3", 1n } // represents 2^2 * 3^1 = 12
 */
type PowerFactors = Record<string, bigint>;
/** Exact surd */
interface Surd {
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

// const digits = (x: bigint) => {
//   return `${x}`.split("").map(d => parseInt(d));
// };

// const sumDigits = (x: bigint) => digits(x).reduce((a, b) => a + b, 0);

/**
 * Check whether a surd is an integer of value zero
 * @param x - Surd
 * @returns Answer
 */
const isZero = (x: Surd) => x instanceof Int && x.compute() === 0n;

/**
 * Checks whether a surd is an integer of value one
 * @param x - Surd
 * @returns Answer
 */
const isOne = (x: Surd) => x instanceof Int && x.compute() === 1n;

/**
 * Remove item from array
 * @param arr - Array
 * @param x - Item to remove
 * @returns New array
 */
const remove = <T>(arr: T[], x: T) => {
  const result = [...arr];
  result.splice(result.indexOf(x), 1);
  return result;
};

/**
 * Remove factors
 * @param a - Original factors
 * @param b - Factors to remove
 * @returns New factors
 */
const removePowers = (a: PowerFactors, b: PowerFactors) => {
  const result: PowerFactors = {};
  for (const factor in a) {
    const newPower = a[factor] - (b[factor] || 0n);
    if (newPower < 0) throw new Error("Negative power in power factorisation");
    if (newPower > 0) {
      result[factor] = newPower;
    }
  }
  return result;
};

/**
 * Get overlapping values between two arrays
 * @param a - Array one
 * @param b - Array two
 * @returns Overlapping values
 */
const getOverlap = <T>(a: T[], b: T[]): T[] => {
  for (const i in a) {
    const x = a[i];
    if (b.includes(x))
      return [x, ...getOverlap(a.slice(parseInt(i) + 1), remove(b, x))];
  }
  return [];
};

/**
 * Get overlap of factorisations
 * @param a - Factorisation one
 * @param b - Factorisation two
 * @returns Highest common factor
 */
const getPowerOverlap = (a: PowerFactors, b: PowerFactors) => {
  const aFactors = Object.keys(a);
  const bFactors = Object.keys(b);
  const commonFactors = getOverlap(aFactors, bFactors);
  const result: PowerFactors = {};
  for (const factor of commonFactors) {
    const overlapPower = min(a[factor] || 0n, b[factor] || 0n);
    if (overlapPower > 0) {
      result[factor] = overlapPower;
    }
  }
  return result;
};

/**
 * Get unique values from array
 * @param arr - Array
 * @returns New array
 */
const unique = <T>(arr: T[]) => Array.from(new Set(arr));

/**
 * Count how many times a value appears in an array
 * @param arr - Array
 * @param x - Value
 * @returns Number of appearances
 */
const count = <T>(arr: T[], x: T) =>
  arr.reduce((a, v) => (x === v ? a + 1n : a), 0n);

// const log = (from: Surd, to: Surd) =>
//   write(
//     "./log.md",
//     ["$$", `${from.katex()} = ${to.katex()}`, "$$", "", ""].join("\n"),
//   );

/**
 * Convert to big integer
 * @param x - Value
 * @returns Big integer
 */
const toBI = (x: string | number | bigint) => {
  if (typeof x === "bigint") return x;
  if (`${x}`.includes("e")) throw new Error("Standard form");
  if (typeof x === "string") return BigInt(x);
  if (!(x === Math.floor(x))) throw new Error("Not integer");
  return BigInt(x);
};

/**
 * Convert to sign
 * @param x - Value
 * @returns Sign
 */
const toSign = (x: bigint) => (x > 0n ? 1 : x === 0n ? 0 : -1);

/**
 * Convert to absolute value
 * @param x - Value
 * @returns Absolute value
 */
const abs = (x: bigint) => (toSign(x) === -1 ? -1n * x : x);

// TODO: check that `exact` is documented as optional
/**
 * Convert to number
 * @param x - Value
 * @param exact - Whether to ensure returned number is not rounded
 * @returns Number
 */
const toNumber = (x: number | bigint, exact = false) => {
  if (typeof x === "number") return x;
  if (exact && x > Number.MAX_SAFE_INTEGER)
    throw new Error("Too big to convert");
  return Number(x);
};

/**
 * Get minimum value
 * @param a - Value one
 * @param b - Value two
 * @returns Minimum value
 */
const min = (a: bigint, b: bigint) => (a < b ? a : b);

/**
 * Checks whether array only contains big integers
 * @param arr - Array
 * @returns Answer
 */
const allInt = (arr: (number | bigint)[]): arr is bigint[] =>
  arr.length === arr.filter(x => typeof x === "bigint").length;

/** Integer */
export class Int implements Surd {
  x: bigint;
  /**
   * @param x - Value
   */
  constructor(x: number | bigint) {
    this.x = toBI(x);
  }
  simplify() {
    return this;
  }
  compute() {
    return this.x;
  }
  katex() {
    return `${this.x}`;
  }
  preferablyInt() {
    return this;
  }
}

/**
 * Variable (to define an abstraction such as a function and to be given a value before being computed)
 */
export class Variable implements Surd {
  /**
   * @param symbol - Symbol for variable such as "x"
   */
  constructor(public symbol: string) {}
  simplify() {
    return this;
  }
  compute(): never {
    throw new Error("Impossible to compute surd containing variable");
  }
  katex() {
    return this.symbol;
  }
  preferablyInt() {
    return this;
  }
}

/** Function */
export class Func<T extends Surd[]> implements Surd {
  /**
   * @param run - Function
   * @param args - Arbitrary array of surd arguments for function
   * @param symbol - Symbol for function (default: `"f"` for "f(x)")
   * @param argSymbols - Symbols for arguments (default: `["x"]` for "f(x)")
   */
  constructor(
    public run: (args: T) => Surd,
    public args: T,
    public symbol = "f",
    public argSymbols = ["x"],
  ) {}
  private maths() {
    // f(x) = f(x)
    const result = this.run(this.args);
    // log(this, result);
    return result;
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
  katex() {
    return `${this.symbol}(${this.argSymbols.join(", ")})`;
  }
  preferablyInt() {
    return this.maths().preferablyInt();
  }
}

/** Summation */
export class Summation implements Surd {
  /**
   * @param terms - Terms to sum
   */
  constructor(public terms: Surd[]) {}
  simplify(): Surd {
    const terms = this.terms.map(t => t.simplify().preferablyInt());
    const integers = terms
      .filter(t => t instanceof Int)
      .map(i => (i as Int).compute());
    const fractions = terms.filter(t => t instanceof Fraction) as Fraction[];
    const other = terms.filter(
      t => !(t instanceof Int || t instanceof Fraction),
    );
    // const possibleFacts = other.map(t => {
    //   try {
    //     return PowerFactorisation.from(t);
    //   } catch (err) {
    //     return t;
    //   }
    // });
    // const facts = possibleFacts.filter(
    //   t => t instanceof PowerFactorisation,
    // ) as PowerFactorisation[];
    // const otherOther = possibleFacts.filter(
    //   t => !(t instanceof PowerFactorisation),
    // );
    const otherOther = other;
    const intSum = integers.reduce((a, b) => a + b, 0n);
    const fractionSum =
      fractions.length === 0
        ? new Int(0n)
        : fractions.reduce((a, b) => Fraction.add(a, b)).simplify();
    // const factSum = PowerFactorisation.add(facts);
    // const simpleFactSum =
    //   factSum instanceof Summation
    //     ? new Summation(factSum.terms.map(t => t.simplify()))
    //     : factSum.simplify();
    const summedTerms = [
      new Int(intSum),
      fractionSum,
      // simpleFactSum,
      ...otherOther,
    ];
    const newTerms = summedTerms.filter(t => !isZero(t));
    const result = new Summation(newTerms);
    // log(this, result);
    if (newTerms.length === 0) return new Int(0n);
    if (newTerms.length === 1) return newTerms[0];
    return result;
  }
  compute() {
    const computed = this.terms.map(t => t.compute());
    if (allInt(computed)) return computed.reduce((a, t) => a + t, 0n);
    return computed.reduce((a, t) => toNumber(a) + toNumber(t), 0);
  }
  katex() {
    return `[${this.terms.map(t => `{(${t.katex()})}`).join(" + ")}]`;
  }
  preferablyInt() {
    const terms = this.terms.map(t => t.simplify().preferablyInt());
    const integers = terms
      .filter(t => t instanceof Int)
      .map(i => (i as Int).compute());
    if (integers.length === terms.length) {
      const result = new Int(integers.reduce((a, b) => a + b, 0n));
      // log(this, result);
      return result;
    }
    return this;
  }
}

/** Add */
export class Add extends Summation {
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(a: Surd, b: Surd) {
    super([a, b]);
  }
}

/** Subtraction */
export class Sub implements Surd {
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    const a = this.a.simplify();
    const b = this.b.simplify();
    return new Sub(a, b);
  }
  compute() {
    const a = this.a.compute();
    const b = this.b.compute();
    return typeof a === "bigint" && typeof b === "bigint"
      ? a - b
      : toNumber(a) - toNumber(b);
  }
  katex() {
    return `[{(${this.a.katex()})} - {(${this.b.katex()})}]`;
  }
  preferablyInt() {
    const a = this.a.simplify().preferablyInt();
    const b = this.b.simplify().preferablyInt();
    if (a instanceof Int && b instanceof Int) {
      const result = new Int(a.compute() - b.compute());
      // log(this, result);
      return result;
    }
    return this;
  }
}

/** Multiplication */
export class Mult implements Surd {
  /**
   * @param a - Term one
   * @param b - Term two
   */
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    const a = this.a.simplify();
    const b = this.b.simplify();
    if (isOne(a)) return b;
    if (isOne(b)) return a;
    return new Mult(a, b);
  }
  compute() {
    const a = this.a.compute();
    const b = this.b.compute();
    return typeof a === "bigint" && typeof b === "bigint"
      ? a * b
      : toNumber(a) * toNumber(b);
  }
  katex() {
    return `{${this.a.katex()}} \\times {${this.b.katex()}}`;
  }
  preferablyInt() {
    const a = this.a.simplify().preferablyInt();
    const b = this.b.simplify().preferablyInt();
    if (a instanceof Int && b instanceof Int) {
      try {
        return new Int(a.compute() * b.compute());
      } catch (err) {
        return this;
      }
    }
    return this;
  }
}

/** Factorisation (multiplication of integers) */
export class Factorisation implements Surd {
  factors: bigint[];
  sign: Sign;
  /**
   * @param factors - Factors
   */
  constructor(...factors: bigint[]) {
    const intFactors = factors.map(f => toBI(f));
    if (intFactors.includes(0n)) {
      this.sign = 0;
    } else {
      const negatives = intFactors.filter(f => toSign(f) === -1).length;
      this.sign = negatives % 2 === 0 ? 1 : -1;
    }
    this.factors = intFactors.map(n => abs(n)).filter(f => f !== 1n);
  }
  simplify() {
    if (this.sign === 0) return new Int(0n);
    if (this.factors.length === 0) return new Int(toBI(this.sign));
    if (this.factors.length === 1)
      return new Int(toBI(this.sign) * this.factors[0]);
    return this;
  }
  compute() {
    return this.factors.reduce((a, b) => a * b, 1n);
  }
  katex() {
    return [this.sign, ...this.factors].join(" \\times ");
  }
  preferablyInt() {
    return new Int(this.compute());
  }
  /**
   * Convert factorisation to prime factorisation
   * @returns Prime factorisation
   */
  toPfs() {
    const pfs: bigint[] = [];
    for (const f of this.factors) {
      pfs.push(...Factorisation.pfs(f));
    }
    return new Factorisation(...pfs);
  }
  /**
   * Convert surd to factorisation
   * @param x - Value
   * @returns Factorisation
   */
  static from(x: Surd): Factorisation {
    if (x instanceof Factorisation) return x;
    if (x instanceof Int) return new Factorisation(x.compute());
    if (x instanceof Mult)
      return new Factorisation(
        ...Factorisation.from(x.a).factors,
        ...Factorisation.from(x.b).factors,
      );
    if (x instanceof Power && x.exponent instanceof Int) {
      const ex = x.exponent.compute();
      const surds = Array(toNumber(ex, true)).fill(x.base);
      const factorisations = surds.map(s => Factorisation.from(s));
      const factors = factorisations.map(f => f.factors).flat();
      return new Factorisation(...factors);
    }
    if (x instanceof Factorial) return Factorisation.from(x.simplify());
    const intX = x.simplify().preferablyInt();
    if (intX instanceof Int) return Factorisation.from(intX);
    throw new Error("Impossible to convert to factorisation");
  }
  /**
   * Get arbitrary prime factor (under 100) of an integer
   * @param x - Value
   * @returns Prime factor
   */
  static pf(x: bigint) {
    // TODO: return integer, not array
    // const lastDig = BI(digits(x).slice(-1)[0]);
    // const restDigits = BI(digits(x).slice(0, -1).join(""));
    // const sum = sumDigits(x);
    // if (lastDig === 0n) return [2n, 5n];
    // if (sum % 9 === 0) return [3n, 3n];
    // if ((restDigits - 2n * lastDig) % 7n === 0n) return [7n];
    // if (lastDig === 5n) return [5n];
    // if (sum % 3 === 0) return [3n];
    // if (lastDig % 2n === 0n) return [2n];
    const primes = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67,
      71, 73, 79, 83, 89, 97,
    ].map(toBI);
    for (const prime of primes) {
      if (x % prime === 0n) return [prime];
    }
    // No brute force
    return [1n];
  }
  /**
   * Convert integer to prime factors (under 100)
   * @param x - Value
   * @returns Prime factors
   */
  static pfs(x: bigint): bigint[] {
    const factors = Factorisation.pf(x);
    const leftOver = x / factors.reduce((a, b) => a * b, 1n);
    if (factors[0] === 1n) return [leftOver];
    return [...factors, ...Factorisation.pfs(leftOver)].filter(f => f !== 1n);
  }
}

/** Factorisation represented as powers of integers */
export class PowerFactorisation implements Surd {
  /**
   * @param factors - Factors
   * @param sign - Sign
   */
  constructor(public factors: PowerFactors = {}, public sign: Sign) {
    for (const factor in factors) {
      if (toBI(factor) < 0n)
        throw new Error("Negative factor of power factorisation");
      if (toBI(factor) === 0n) return new PowerFactorisation({}, 0);
    }
  }
  simplify(): Surd {
    if (this.sign === 0) return new Int(0n);
    const factors = Object.keys(this.factors);
    if (factors.length === 0) return new Int(toBI(this.sign));
    if (factors.length === 1) {
      const factor = factors[0];
      const power = this.factors[factor];
      const absolute = new Power(new Int(toBI(factor)), new Int(power));
      const signed =
        this.sign === -1 ? new Mult(new Int(-1n), absolute) : absolute;
      return signed.simplify();
    }
    return this;
  }
  katex() {
    return `${this.sign} \\times ${Object.keys(this.factors)
      .map(key => `{${key}}^{${this.factors[key]}}`)
      .join(" \\times ")}`;
  }
  preferablyInt() {
    try {
      return new Int(this.compute());
    } catch (err) {
      return this;
    }
  }
  compute() {
    let total = 1n;
    for (const factor in this.factors) {
      const power = this.factors[factor];
      total *= toBI(factor) ** power;
    }
    return toBI(this.sign) * total;
  }
  /**
   * Convert power factorisation to prime factorisation
   * @returns Prime factorisation
   */
  toPfs() {
    const result: PowerFactors = {};
    for (const parentKey in this.factors) {
      const parentFactor = toBI(parentKey);
      const parentPower = this.factors[`${parentFactor}`];
      const pfs = Factorisation.pfs(parentFactor);
      const powerPfs = PowerFactorisation.from(new Factorisation(...pfs));
      for (const key in powerPfs.factors) {
        const factor = key;
        const power = powerPfs.factors[factor];
        const totalPower = parentPower * power;
        result[factor] = (result[factor] || 0n) + totalPower;
      }
    }
    return new PowerFactorisation(result, this.sign);
  }
  /**
   * Attempt to add power factorisations via factorisation
   * @param terms - Terms
   * @returns Result
   */
  static add(terms: PowerFactorisation[]) {
    // xy + xz = x(y + z)
    if (!terms.length) return new Int(0n);
    const overlap = terms
      .map(t => t.factors)
      .reduce((a, b) => getPowerOverlap(a, b));
    const factor = new PowerFactorisation(overlap, 1).simplify();
    const newTerms = terms.map(t => new Fraction(t, factor).simplify());
    if (isOne(factor)) return new Summation(newTerms);
    return new Mult(factor, new Summation(newTerms));
  }
  /**
   * Convert surd to power factorisation
   * @param x - Value
   * @returns Power factorisation
   */
  static from(x: Surd) {
    if (x instanceof PowerFactorisation) return x;
    const f = Factorisation.from(x);
    const result: PowerFactors = {};
    for (const factor of unique(f.factors)) {
      const power = count(f.factors, factor);
      result[`${factor}`] = power;
    }
    return new PowerFactorisation(result, f.sign);
  }
}

/** Fraction */
export class Fraction implements Surd {
  /**
   * @param num - Numerator
   * @param den - Denominator
   */
  constructor(public num: Surd, public den: Surd) {}
  simplify(): Surd {
    if (
      this.num instanceof PowerFactorisation &&
      this.den instanceof PowerFactorisation
    ) {
      if (this.num.sign === 0) return new Int(0n);
      if (this.den.sign === 0) throw new Error("0 division");
      const sign = this.num.sign === this.den.sign ? 1 : -1;
      const overlap = getPowerOverlap(this.num.factors, this.den.factors);
      const newA = removePowers(this.num.factors, overlap);
      const newB = removePowers(this.den.factors, overlap);
      const aPfs = new PowerFactorisation(newA, 1).toPfs();
      const bPfs = new PowerFactorisation(newB, 1).toPfs();
      const pfOverlap = getPowerOverlap(aPfs.factors, bPfs.factors);
      const newAPfs = removePowers(aPfs.factors, pfOverlap);
      const newBPfs = removePowers(bPfs.factors, pfOverlap);
      const num = new PowerFactorisation(newAPfs, sign).simplify();
      const den = new PowerFactorisation(newBPfs, 1).simplify();
      const result = new Fraction(num, den);
      // log(this, result);
      if (isOne(den)) return num;
      return result;
    }
    try {
      return new Fraction(
        PowerFactorisation.from(this.num.simplify()),
        PowerFactorisation.from(this.den.simplify()),
      ).simplify();
    } catch (err) {
      if (!`${err}`.includes("factorisation")) throw err;
      return new Fraction(this.num.simplify(), this.den.simplify());
    }
  }
  compute() {
    const num = this.num.compute();
    const den = this.den.compute();
    if (typeof num === "bigint" && typeof den === "bigint") {
      if (num % den === 0n) return num / den;
    }
    return toNumber(num) / toNumber(den);
  }
  katex() {
    return `\\frac{${this.num.katex()}}{${this.den.katex()}}`;
  }
  preferablyInt() {
    return this;
  }
  /**
   * Attempt to add fractions via a common denominator
   * @param a - Term one
   * @param b - Term two
   * @returns Result
   */
  static add(a: Fraction, b: Fraction) {
    try {
      // (w/ox) + (y/oz) = (wz + yx)/(oxz)
      const w = PowerFactorisation.from(a.num);
      const x = PowerFactorisation.from(a.den).toPfs();
      const y = PowerFactorisation.from(b.num);
      const z = PowerFactorisation.from(b.den).toPfs();
      const aSign = w.sign === x.sign ? 1 : -1;
      const bSign = y.sign === z.sign ? 1 : -1;
      const overlap = getPowerOverlap(x.factors, z.factors);
      const multiplier1 = new PowerFactorisation(
        removePowers(z.factors, overlap),
        aSign,
      );
      const multiplier2 = new PowerFactorisation(
        removePowers(x.factors, overlap),
        bSign,
      );
      const commonDenominator = new Mult(
        new Mult(multiplier1, multiplier2),
        new PowerFactorisation(overlap, 1),
      );
      const absW = new PowerFactorisation(w.factors, 1);
      const absY = new PowerFactorisation(y.factors, 1);
      const num = new Add(
        new Mult(multiplier1, absW),
        new Mult(multiplier2, absY),
      );
      const den = commonDenominator;
      return new Fraction(num, den);
    } catch (err) {
      // (w/x) + (y/z) = (wz + xy)/(xz)
      const w = a.num;
      const x = a.den;
      const y = b.num;
      const z = b.den;
      const num = new Add(new Mult(w, z), new Mult(x, y));
      const den = new Mult(x, z);
      return new Fraction(num, den);
    }
  }
}

/** Power (index) */
export class Power implements Surd {
  /**
   * @param base - Base
   * @param exponent - Exponent
   */
  constructor(public base: Surd, public exponent: Surd) {}
  simplify() {
    const base = this.base.simplify();
    const ex = this.exponent.simplify();
    if (isOne(ex)) return base;
    if (isZero(base)) return base;
    if (isOne(base)) return base;
    return new Power(base, ex);
  }
  compute() {
    const base = this.base.compute();
    const exponent = this.exponent.compute();
    return typeof base === "bigint" && typeof exponent === "bigint"
      ? base ** exponent
      : toNumber(base) ** toNumber(exponent);
  }
  katex() {
    return `{${this.base.katex()}}^{${this.exponent.katex()}}`;
  }
  preferablyInt() {
    const base = this.base.simplify().preferablyInt();
    const ex = this.exponent.simplify().preferablyInt();
    if (base instanceof Int && ex instanceof Int) {
      try {
        return new Int(base.compute() ** ex.compute());
      } catch (err) {
        return this;
      }
    }
    return this;
  }
}

/** Factorial (x!) */
export class Factorial implements Surd {
  /**
   * @param x - Value
   */
  constructor(public x: bigint) {
    try {
      toNumber(x, true);
    } catch (err) {
      throw new Error("Factorial is too large");
    }
  }
  private maths() {
    // x! = x * (x - 1) * ... * 2 * 1
    const factors = [];
    for (let n = this.x; n >= 1; n--) {
      factors.push(n);
    }
    return new Factorisation(...factors);
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
  katex() {
    return `${this.x}!`;
  }
  preferablyInt() {
    return this.maths().preferablyInt();
  }
}

/** Choose (nCr) */
export class Choose implements Surd {
  /**
   * @param n - n
   * @param r - r
   */
  constructor(public n: bigint, public r: bigint) {}
  private maths() {
    // nCr = (n!)/(r!(n - r)!)
    const num = new Factorial(this.n);
    const den = new Mult(new Factorial(this.r), new Factorial(this.n - this.r));
    const result = new Fraction(num, den);
    // log(this, result);
    return result;
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
  katex() {
    return `{${this.n} \\choose ${this.r}}`;
  }
  preferablyInt() {
    return this.maths().preferablyInt();
  }
}

/** Permute (nPr) */
export class Permute implements Surd {
  /**
   * @param n - n
   * @param r - r
   */
  constructor(public n: bigint, public r: bigint) {}
  private maths() {
    // nPr = (n!)/((n - r)!)
    const num = new Factorial(this.n);
    const den = new Factorial(this.n - this.r);
    const result = new Fraction(num, den);
    // log(this, result);
    return result;
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
  katex() {
    return `{}_{${this.n}}P^{${this.r}}`;
  }
  preferablyInt() {
    return this.maths().preferablyInt();
  }
}

/** Summation in capital-sigma notation */
export class SigmaSummation implements Surd {
  /**
   * @param lowerBound - Lower bound (under sigma in notation)
   * @param upperBound - Upper bound (above sigma in notation)
   * @param term - Function returning term (argument of sigma in notation)
   * @param indexSymbol - Index symbol (under sigma in notation and usually "x", "n", "r" or "i")
   */
  constructor(
    public lowerBound: Int,
    public upperBound: Int,
    public term: (x: Int | Variable) => Surd,
    public indexSymbol = "x",
  ) {
    if (lowerBound > upperBound)
      throw new Error("Lower bigger than upper bound");
  }
  private maths() {
    const l = this.lowerBound.compute();
    const u = this.upperBound.compute();
    const terms = [];
    for (let i = l; i <= u; i++) {
      const term = this.term(new Int(i));
      terms.push(term);
    }
    const result = new Summation(terms);
    // log(this, result);
    return result;
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
  katex() {
    const l = this.lowerBound.compute();
    const u = this.upperBound.compute();
    const term = this.term(new Variable(this.indexSymbol)).katex();
    return `\\sum_{${this.indexSymbol} = ${l}}^{${u}} {${term}}`;
  }
  preferablyInt() {
    return this.maths().preferablyInt();
  }
}
