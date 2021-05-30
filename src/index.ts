interface Surd {
  simplify(): Surd;
  compute(): number;
}

const digits = (x: number) => {
  if (`${x}`.includes("e")) throw new Error("Standard form");
  return `${x}`.split("").map(d => parseInt(d));
};

const sumDigits = (x: number) => digits(x).reduce((a, b) => a + b);

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

class Fraction implements Surd {
  constructor(public a: Surd, public b: Surd) {}
  simplify(): Surd {
    if (this.a instanceof Int && this.b instanceof Int) {
      const a = this.a.compute();
      const b = this.b.compute();
      if (b === 1) return new Int(a);
      const sign = Math.sign(a) === Math.sign(b) ? 1 : -1;
      const a_ = Math.abs(a);
      const b_ = Math.abs(b);
      const cf = Fraction.cf(a_, b_);
      if (cf === 1) return this;
      const num = (sign * a_) / cf;
      const den = b_ / cf;
      return new Fraction(new Int(num), new Int(den)).simplify();
    } else {
    }
  }
  compute() {
    return this.a.compute() / this.b.compute();
  }
  static cf(a: number, b: number) {
    if (a < 0 || b < 0) {
      throw new Error("Both inputs must be positive");
    }
    const aLastDig = parseInt(`${a}`.slice(-1));
    const bLastDig = parseInt(`${b}`.slice(-1));
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
