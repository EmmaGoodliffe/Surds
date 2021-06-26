// import { appendFileSync as write } from "fs";

// TODO: try `is` instead of `instanceof`
// TODO: make `if` statements consistent

type Sign = -1 | 0 | 1;
type PowerFactors = Record<string, bigint>;
interface Surd {
  simplify(): Surd;
  compute(): bigint;
  katex(): string;
  preferablyInt(): Surd;
}

const digits = (x: bigint) => {
  return `${x}`.split("").map(d => parseInt(d));
};

const sumDigits = (x: bigint) => digits(x).reduce((a, b) => a + b, 0);

const isZero = (x: Surd) => x instanceof Int && x.compute() === 0n;

const isOne = (x: Surd) => x instanceof Int && x.compute() === 1n;

const remove = <T>(arr: T[], x: T) => {
  const result = [...arr];
  result.splice(result.indexOf(x), 1);
  return result;
};

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

const getOverlap = <T>(a: T[], b: T[]): T[] => {
  for (const i in a) {
    const x = a[i];
    if (b.includes(x)) {
      return [x, ...getOverlap(a.slice(parseInt(i) + 1), remove(b, x))];
    }
  }
  return [];
};

const getPowerOverlap = (a: PowerFactors, b: PowerFactors) => {
  const aFactors = Object.keys(a);
  const bFactors = Object.keys(b);
  const commonFactors = getOverlap(aFactors, bFactors).map(f => BI(f));
  const result: PowerFactors = {};
  for (const factor of commonFactors) {
    const overlapPower = min(a[factor] || 0n, b[factor] || 0n);
    if (overlapPower > 0) {
      result[factor] = overlapPower;
    }
  }
  return result;
};

const unique = <T>(arr: T[]) => Array.from(new Set(arr));

const count = <T>(arr: T[], x: T) =>
  arr.reduce((a, v) => (x === v ? a + 1n : a), 0n);

// const log = (from: Surd, to: Surd) =>
//   write(
//     "./log.md",
//     ["$$", `${from.katex()} = ${to.katex()}`, "$$", "", ""].join("\n"),
//   );

const log = (from: Surd, to: Surd) => {
  from;
  to;
};

const BI = (x: string | number | bigint) => {
  if (typeof x === "bigint") return x;
  if (`${x}`.includes("e")) throw new Error("Standard form");
  if (typeof x === "string") return BigInt(x);
  if (!(x === Math.floor(x))) throw new Error("Not integer");
  return BigInt(x);
};

const toSign = (x: bigint) => (x > 0n ? 1 : x === 0n ? 0 : -1);

const abs = (x: bigint) => (toSign(x) === -1 ? -1n * x : x);

const toNumber = (x: bigint) => {
  if (x > Number.MAX_SAFE_INTEGER) throw new Error("Too big to convert");
  return Number(x);
};

const min = (a: bigint, b: bigint) => (a < b ? a : b);

export class Int implements Surd {
  x: bigint;
  constructor(x: bigint) {
    this.x = BI(x);
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

export class Variable implements Surd {
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

export class Func<T extends Surd[]> implements Surd {
  constructor(
    public run: (args: T) => Surd,
    public args: T,
    public symbol = "f",
    public argSymbols = ["x"],
  ) {}
  private maths() {
    // f(x) = f(x)
    const result = this.run(this.args);
    log(this, result);
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

export class Summation implements Surd {
  constructor(public terms: Surd[]) {}
  simplify(): Surd {
    const terms = this.terms.map(t => t.simplify().preferablyInt());
    const integers = terms.filter(t => t instanceof Int).map(i => i.compute());
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
    log(this, result);
    if (newTerms.length === 0) return new Int(0n);
    if (newTerms.length === 1) return newTerms[0];
    return result;
  }
  compute() {
    return this.terms.reduce((a, t) => a + t.compute(), 0n);
  }
  katex() {
    return `[${this.terms.map(t => `{(${t.katex()})}`).join(" + ")}]`;
  }
  preferablyInt() {
    const terms = this.terms.map(t => t.simplify().preferablyInt());
    const integers = terms.filter(t => t instanceof Int).map(i => i.compute());
    if (integers.length === terms.length) {
      const result = new Int(integers.reduce((a, b) => a + b, 0n));
      log(this, result);
      return result;
    }
    return this;
  }
}

export class Add extends Summation {
  constructor(a: Surd, b: Surd) {
    super([a, b]);
  }
}

export class Sub implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    const a = this.a.simplify();
    const b = this.b.simplify();
    return new Sub(a, b);
  }
  compute() {
    return this.a.compute() - this.b.compute();
  }
  katex() {
    return `[{(${this.a.katex()})} - {(${this.b.katex()})}]`;
  }
  preferablyInt() {
    const a = this.a.simplify().preferablyInt();
    const b = this.b.simplify().preferablyInt();
    if (a instanceof Int && b instanceof Int) {
      const result = new Int(a.compute() - b.compute());
      log(this, result);
      return result;
    }
    return this;
  }
}

export class Mult implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    const a = this.a.simplify();
    const b = this.b.simplify();
    if (isOne(a)) return b;
    if (isOne(b)) return a;
    return new Mult(a, b);
  }
  compute() {
    return this.a.compute() * this.b.compute();
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

export class Factorisation implements Surd {
  factors: bigint[];
  sign: Sign;
  constructor(...factors: bigint[]) {
    const intFactors = factors.map(f => BI(f));
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
    if (this.factors.length === 0) return new Int(BI(this.sign));
    if (this.factors.length === 1) {
      return new Int(BI(this.sign) * this.factors[0]);
    }
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
  toPfs() {
    const pfs: bigint[] = [];
    for (const f of this.factors) {
      pfs.push(...Factorisation.pfs(f));
    }
    return new Factorisation(...pfs);
  }
  static from(x: Surd): Factorisation {
    if (x instanceof Factorisation) return x;
    if (x instanceof Int) return new Factorisation(x.compute());
    if (x instanceof Mult) {
      return new Factorisation(
        ...Factorisation.from(x.a).factors,
        ...Factorisation.from(x.b).factors,
      );
    }
    if (x instanceof Power && x.exponent instanceof Int) {
      const ex = x.exponent.compute();
      const surds = Array(toNumber(ex)).fill(x.base);
      const factorisations = surds.map(s => Factorisation.from(s));
      const factors = factorisations.map(f => f.factors).flat();
      return new Factorisation(...factors);
    }
    if (x instanceof Factorial) return Factorisation.from(x.simplify());
    const intX = x.simplify().preferablyInt();
    if (intX instanceof Int) return Factorisation.from(intX);
    throw new Error("Impossible to convert to factorisation");
  }
  static pf(x: bigint) {
    const lastDig = BI(digits(x).slice(-1)[0]);
    const restDigits = BI(digits(x).slice(0, -1).join(""));
    const sum = sumDigits(x);
    if (lastDig === 0n) return [2n, 5n];
    if (sum % 9 === 0) return [3n, 3n];
    if ((restDigits - 2n * lastDig) % 7n === 0n) return [7n];
    if (lastDig === 5n) return [5n];
    if (sum % 3 === 0) return [3n];
    if (lastDig % 2n === 0n) return [2n];
    // No brute force
    return [1n];
  }
  static pfs(x: bigint): bigint[] {
    const factors = Factorisation.pf(x);
    const leftOver = x / factors.reduce((a, b) => a * b, 1n);
    if (factors[0] === 1n) return [leftOver];
    return [...factors, ...Factorisation.pfs(leftOver)].filter(f => f !== 1n);
  }
}

export class PowerFactorisation implements Surd {
  constructor(public factors: PowerFactors = {}, public sign: Sign) {
    for (const factor in factors) {
      if (BI(factor) < 0n) {
        throw new Error("Negative factor of power factorisation");
      }
      if (BI(factor) === 0n) return new PowerFactorisation({}, 0);
    }
  }
  simplify(): Surd {
    if (this.sign === 0) return new Int(0n);
    const factors = Object.keys(this.factors);
    if (factors.length === 0) return new Int(BI(this.sign));
    if (factors.length === 1) {
      const factor = factors[0];
      const power = this.factors[factor];
      const absolute = new Power(new Int(BI(factor)), new Int(power));
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
      total *= BI(factor) ** power;
    }
    return BI(this.sign) * total;
  }
  toPfs() {
    const result: PowerFactors = {};
    for (const parentKey in this.factors) {
      const parentFactor = BI(parentKey);
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

export class Fraction implements Surd {
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
      log(this, result);
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
    return this.num.compute() / this.den.compute();
  }
  katex() {
    return `\\frac{${this.num.katex()}}{${this.den.katex()}}`;
  }
  preferablyInt() {
    return this;
  }
  static add(a: Fraction, b: Fraction) {
    try {
      // TODO: make comment more explicit
      // (w/x) + (y/z)
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

export class Power implements Surd {
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
    return this.base.compute() ** this.exponent.compute();
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

export class Factorial implements Surd {
  constructor(public x: bigint) {}
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

export class Choose implements Surd {
  constructor(public n: bigint, public r: bigint) {}
  private maths() {
    // nCr = (n!)/(r!(n - r)!)
    const num = new Factorial(this.n);
    const den = new Mult(new Factorial(this.r), new Factorial(this.n - this.r));
    const result = new Fraction(num, den);
    log(this, result);
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

export class Permute implements Surd {
  constructor(public n: bigint, public r: bigint) {}
  private maths() {
    // nPr = (n!)/((n - r)!)
    const num = new Factorial(this.n);
    const den = new Factorial(this.n - this.r);
    const result = new Fraction(num, den);
    log(this, result);
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

export class SigmaSummation implements Surd {
  constructor(
    public lowerBound: Int,
    public upperBound: Int,
    public term: (x: Int | Variable) => Surd,
    public indexSymbol = "i",
  ) {
    if (lowerBound > upperBound) {
      throw new Error("Lower bigger than upper bound");
    }
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
    log(this, result);
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
