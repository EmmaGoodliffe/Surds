type Sign = -1 | 0 | 1;
type PowerFactors = Record<number, number>;

interface Surd {
  simplify(): Surd;
  compute(): number;
}

const digits = (x: number) => {
  if (`${x}`.includes("e")) throw new Error("Standard form");
  return `${x}`.split("").map(d => parseInt(d));
};

const sumDigits = (x: number) => digits(x).reduce((a, b) => a + b);

const isInt = (x: number) => x === Math.floor(x);

const remove = <T>(arr: T[], x: T) => {
  const result = [...arr];
  result.splice(result.indexOf(x), 1);
  return result;
};

const removeMany = <T>(arr: T[], xs: T[]) => {
  let result = [...arr];
  for (const x of xs) {
    result = remove(result, x);
  }
  return result;
};

const removePowers = (a: PowerFactors, b: PowerFactors) => {
  const result: PowerFactors = {};
  for (const i in a) {
    const factor = parseInt(i);
    const newPower = a[factor] - (b[factor] || 0);
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
  const commonFactors = getOverlap(aFactors, bFactors).map(f => parseInt(f));
  const result: PowerFactors = {};
  for (const factor of commonFactors) {
    const overlapPower = Math.min(a[factor] || 0, b[factor] || 0);
    if (overlapPower > 0) {
      result[factor] = overlapPower;
    }
  }
  return result;
};

const unique = <T>(arr: T[]) => Array.from(new Set(arr));

const count = <T>(arr: T[], x: T) =>
  arr.reduce((a, v) => (x === v ? a + 1 : a), 0);

class Int implements Surd {
  constructor(public x: number) {
    if (!isInt(x)) throw new Error("Not integer");
  }
  simplify() {
    return this;
  }
  compute() {
    return this.x;
  }
}

class Summation implements Surd {
  constructor(public terms: Surd[]) {}
  simplify() {
    return new Summation(this.terms.map(t => t.simplify()));
  }
  compute() {
    return this.terms.reduce((a, t) => a + t.compute(), 0);
  }
}

class Add extends Summation {
  constructor(a: Surd, b: Surd) {
    super([a, b]);
  }
}

class Sub extends Add {
  constructor(a: Surd, b: Surd) {
    const negativeB = new Mult(new Int(-1), b);
    super(a, negativeB);
  }
}

class Mult implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    return this;
  }
  compute() {
    return this.a.compute() * this.b.compute();
  }
}

class Factorisation implements Surd {
  factors: number[];
  sign: Sign;
  constructor(...factors: number[]) {
    if (factors.filter(f => !isInt(f)).length) throw new Error("Not integer");
    if (factors.includes(0)) {
      this.sign = 0;
    } else {
      const negatives = factors.filter(f => Math.sign(f) === -1).length;
      this.sign = negatives % 2 === 0 ? 1 : -1;
    }
    this.factors = factors.map(n => Math.abs(n)).filter(f => f !== 1);
  }
  simplify() {
    if (this.sign === 0) return new Int(0);
    if (this.factors.length === 0) return new Int(this.sign);
    if (this.factors.length === 1) return new Int(this.sign * this.factors[0]);
    return this;
  }
  compute() {
    return this.factors.reduce((a, b) => a * b);
  }
  toPfs() {
    const pfs: number[] = [];
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
    if (x instanceof Factorial) return Factorisation.from(x.simplify());
    throw new Error("Impossible to convert to factorisation");
  }
  static pf(x: number) {
    if (!isInt) throw new Error("Not integer");
    const lastDig = digits(x).slice(-1)[0];
    const sum = sumDigits(x);
    if (lastDig === 0) return [2, 5];
    if (sum % 9 === 0) return [3, 3];
    if (lastDig === 5) return [5];
    if (sum % 3 === 0) return [3];
    if (lastDig % 2 === 0) return [2];
    // TODO: brute force
    return [1];
  }
  static pfs(x: number): number[] {
    const factors = Factorisation.pf(x);
    const leftOver = x / factors.reduce((a, b) => a * b);
    if (factors[0] === 1) return [leftOver];
    return [...factors, ...Factorisation.pfs(leftOver)].filter(f => f !== 1);
  }
}

class PowerFactorisation implements Surd {
  constructor(public factors: PowerFactors = {}, public sign: Sign) {
    for (const factor in factors) {
      if (parseInt(factor) < 0) {
        throw new Error("Negative factor of power factorisation");
      }
      if (parseInt(factor) === 0) return new PowerFactorisation({}, 0);
    }
  }
  simplify(): Surd {
    if (this.sign === 0) return new Int(0);
    const factors = Object.keys(this.factors);
    if (factors.length === 0) return new Int(this.sign);
    if (factors.length === 1) {
      const factor = parseInt(factors[0]);
      const power = this.factors[factor];
      return new Power(new Int(this.sign * factor), new Int(power)).simplify();
    }
    return this;
  }
  compute() {
    let total = 1;
    for (const factor in this.factors) {
      const power = this.factors[factor];
      total *= parseInt(factor) ** power;
    }
    return total;
  }
  toPfs() {
    const result: PowerFactors = {};
    for (const parentKey in this.factors) {
      const parentFactor = parseInt(parentKey);
      const parentPower = this.factors[parentFactor];
      const pfs = Factorisation.pfs(parentFactor);
      const powerPfs = PowerFactorisation.from(new Factorisation(...pfs));
      for (const key in powerPfs.factors) {
        const factor = parseInt(key);
        const power = powerPfs.factors[factor];
        const totalPower = parentPower * power;
        result[factor] = (result[factor] || 0) + totalPower;
      }
    }
    return new PowerFactorisation(result, this.sign);
  }
  static from(x: Surd) {
    if (x instanceof PowerFactorisation) return x;
    const f = Factorisation.from(x);
    const result: PowerFactors = {};
    for (const factor of unique(f.factors)) {
      const power = count(f.factors, factor);
      result[factor] = power;
    }
    return new PowerFactorisation(result, f.sign);
  }
}

class Fraction implements Surd {
  constructor(public num: Surd, public den: Surd) {}
  simplify(): Surd {
    if (
      this.num instanceof PowerFactorisation &&
      this.den instanceof PowerFactorisation
    ) {
      if (this.num.sign === 0) return new Int(0);
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
      if (den instanceof Int && den.compute() === 1) return num;
      return new Fraction(num, den);
    }
    return new Fraction(
      PowerFactorisation.from(this.num),
      PowerFactorisation.from(this.den),
    ).simplify();
  }
  compute() {
    return this.num.compute() / this.den.compute();
  }
}

class Power implements Surd {
  constructor(public base: Surd, public exponent: Surd) {}
  simplify() {
    const base = this.base.simplify();
    const ex = this.exponent.simplify();
    if (ex instanceof Int && ex.compute() === 1) return base;
    if (base instanceof Int && base.compute() === 0) return base;
    if (base instanceof Int && base.compute() === 1) return base;
    return new Power(base, ex);
  }
  compute() {
    return this.base.compute() ** this.exponent.compute();
  }
}

class Factorial implements Surd {
  constructor(public x: number) {
    if (!isInt(x)) throw new Error("Not integer");
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
}

class Choose implements Surd {
  constructor(public n: number, public r: number) {
    if (!(isInt(n) && isInt(r))) throw new Error("Not integer");
  }
  private maths() {
    // nCr = (n!)/(r!(n - r)!)
    const num = new Factorial(this.n);
    const den = new Mult(new Factorial(this.r), new Factorial(this.n - this.r));
    return new Fraction(num, den);
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
}

class Permute implements Surd {
  constructor(public n: number, public r: number) {
    if (!(isInt(n) && isInt(r))) throw new Error("Not integer");
  }
  private maths() {
    // nPr = (n!)/((n - r)!)
    const num = new Factorial(this.n);
    const den = new Factorial(this.n - this.r);
    return new Fraction(num, den);
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
}

class SigmaSummation implements Surd {
  constructor(
    public lowerBound: Int,
    public upperBound: Int,
    public term: (x: number) => Surd,
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
      const term = this.term(i);
      terms.push(term);
    }
    return new Summation(terms);
  }
  simplify() {
    return this.maths().simplify();
  }
  compute() {
    return this.maths().compute();
  }
}
