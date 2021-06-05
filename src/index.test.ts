import {
  Add,
  Choose,
  Factorial,
  Factorisation,
  Fraction,
  Func,
  Int,
  Mult,
  Permute,
  Power,
  PowerFactorisation,
  SigmaSummation,
  Sub,
  Summation,
  Variable,
} from "./index";

test("new", () => {
  const two = new Int(2);
  const three = new Int(3);
  expect(two.simplify().compute()).toBe(2);
  const summation = new Summation([two, three]);
  expect(summation.simplify().compute()).toBe(5);
  const add = new Add(two, three);
  expect(add.simplify().compute()).toBe(5);
  const sub = new Sub(two, three);
  expect(sub.simplify().compute()).toBe(-1);
  const mult = new Mult(two, three);
  expect(mult.simplify().compute()).toBe(6);
  const fact = new Factorisation(-12);
  expect(fact.simplify().compute()).toBe(-12);
  expect(fact.toPfs().factors.sort()).toEqual([2, 2, 3]);
  const powerFact = new PowerFactorisation({ 4: 1, 3: 1 }, -1);
  expect(powerFact.simplify().compute()).toBe(-12);
  expect(powerFact.toPfs().factors).toEqual({ 2: 2, 3: 1 });
  const frac = new Fraction(two, new Int(-12));
  expect(frac.simplify().compute()).toBe(2 / -12);
  const power = new Power(two, three);
  expect(power.simplify().compute()).toBe(8);
  const factorial = new Factorial(5);
  expect(factorial.simplify().compute()).toBe(5 * 4 * 3 * 2 * 1);
  const choose = new Choose(5, 2);
  expect(choose.simplify().compute()).toBe((5 * 4) / 2);
  const permute = new Permute(5, 2);
  expect(permute.simplify().compute()).toBe(5 * 4);
  const sigma = new SigmaSummation(two, three, x => new Fraction(x, two));
  expect(sigma.simplify().compute()).toBe(5 / 2);
});

// TODO: from

test("heads/tails", () => {
  const f = ([xi, di]: Int[]) => {
    const x = xi.compute();
    const d = di.compute();
    if (x < 1 || x - d < 1) {
      return new Int(1);
    } else {
      const a = new Choose(x, x - d);
      const b = new Choose(x - 1, x - d - 1);
      return new Sub(a, b);
    }
  };

  const term = (
    x: Int | Variable,
    m: number,
    p: number,
    indexSymbol: string,
  ) => {
    const args = [x, new Int(m - p)] as Int[];
    const num = new Func(f, args, "f", [indexSymbol, `${m - p}`]);
    const den = new Power(new Int(2), x);
    return new Fraction(num, den);
  };

  const sum = (m: number, p: number, q: number, indexSymbol: string) => {
    const lowerBound = new Int(m - p);
    const upperBound = new Int(2 * m - p - q - 1);
    return new SigmaSummation(
      lowerBound,
      upperBound,
      x => term(x, m, p, indexSymbol),
      indexSymbol,
    );
  };

  const m = 5;
  const p = 3;
  const q = 2;
  const surd = sum(m, p, q, "x");
  expect(surd.simplify().compute()).toBe(11 / 16);
  console.log(`${surd.katex()} = ${surd.simplify().katex()}`);
  console.log(surd.simplify(), surd.simplify().simplify());
});
