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
  constructor(public x: number) {}
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
  static from(x: Surd) {
    if (x instanceof Factorisation) return x;
    if (x instanceof Int) return new Factorisation(x.compute());
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
    return new Fraction(
      Factorisation.from(this.a),
      Factorisation.from(this.b),
    ).simplify();
  }
  compute() {
    return this.a.compute() / this.b.compute();
  }
  static cf(a: number, b: number) {
    if (a < 0 || b < 0) {
      throw new Error("Negative");
    }
    const aLastDig = digits(a).slice(-1)[0];
    const bLastDig = digits(b).slice(-1)[0];
    const aLastDig0 = aLastDig === 0;
    const bLastDig0 = bLastDig === 0;
    const aLastDigBy5 = aLastDig === 5 || aLastDig0;
    const bLastDigBy5 = bLastDig === 5 || bLastDig0;
    const aLastDigEven = aLastDig % 2 === 0;
    const bLastDigEven = bLastDig % 2 === 0;
    const aSum = sumDigits(a);
    const bSum = sumDigits(b);
    const aSumBy9 = aSum % 9 === 0;
    const bSumBy9 = bSum % 9 === 0;
    const aSumBy3 = aSum % 3 === 0;
    const bSumBy3 = bSum % 3 === 0;
    if (aLastDig0 && bLastDig0) return 10;
    if (aSumBy9 && bSumBy9) return 9;
    if (aLastDigBy5 && bLastDigBy5) return 5;
    if (aSumBy3 && bSumBy3) return 3;
    if (aLastDigEven && bLastDigEven) return 2;
    return 1;
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
