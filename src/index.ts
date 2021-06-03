type Sign = -1 | 0 | 1;

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

const getOverlap = <T>(a: T[], b: T[]): T[] => {
  for (const i in a) {
    const x = a[i];
    if (b.includes(x)) {
      return [x, ...getOverlap(a.slice(parseInt(i) + 1), remove(b, x))];
    }
  }
  return [];
};

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

class Add implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    return this;
  }
  compute() {
    return this.a.compute() + this.b.compute();
  }
}

class Sub implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    return this;
  }
  compute() {
    return this.a.compute() - this.b.compute();
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
    if (this.factors.length === 0) return new Int(1);
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

class Fraction implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify(): Surd {
    if (this.a instanceof Factorisation && this.b instanceof Factorisation) {
      if (this.a.sign === 0) return new Int(0);
      if (this.b.sign === 0) throw new Error("0 division");
      const sign = this.a.sign === this.b.sign ? 1 : -1;
      const overlap = getOverlap(this.a.factors, this.b.factors);
      const newA = removeMany(this.a.factors, overlap);
      const newB = removeMany(this.b.factors, overlap);
      const aPfs = new Factorisation(...newA).toPfs();
      const bPfs = new Factorisation(...newB).toPfs();
      const pfOverlap = getOverlap(aPfs.factors, bPfs.factors);
      const newAPfs = removeMany(aPfs.factors, pfOverlap);
      const newBPfs = removeMany(bPfs.factors, pfOverlap);
      const num = new Factorisation(...newAPfs, sign).simplify();
      const den = new Factorisation(...newBPfs).simplify();
      if (den instanceof Int && den.compute() === 1) return num;
      return new Fraction(num, den);
    }
    // TODO: powers
    return new Fraction(
      Factorisation.from(this.a),
      Factorisation.from(this.b),
    ).simplify();
  }
  compute() {
    return this.a.compute() / this.b.compute();
  }
}

class Power implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify() {
    return this;
  }
  compute() {
    return this.a.compute() ** this.b.compute();
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
