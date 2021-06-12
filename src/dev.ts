import { writeFileSync } from "fs";
import { inspect } from "util";
import {
  Choose,
  Fraction,
  Func,
  Int,
  Power,
  SigmaSummation,
  Sub,
  Variable,
} from ".";

writeFileSync("./log/log.md", "");

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

const term = (x: Int | Variable, m: number, p: number, indexSymbol: string) => {
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

const surd = sum(38, 7, 2, "x");
const simple = surd.simplify();
const simpleSimple = simple.simplify();
const same = JSON.stringify(simple) === JSON.stringify(simpleSimple);
console.log(same);
writeFileSync("./log/simple.md", inspect(simple, false, null));
writeFileSync("./log/simpleSimple.md", inspect(simpleSimple, false, null));
