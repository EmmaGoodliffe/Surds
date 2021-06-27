import { writeFileSync } from "fs";
// import { inspect } from "util";
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

writeFileSync("log/log.md", "");

const f = ([xi, di]: (Int | Variable)[]) => {
  const x = xi.compute();
  const d = di.compute();
  if (x < 1 || x - d < 1) {
    return new Int(1);
  } else {
    const a = new Choose(x, x - d);
    const b = new Choose(x - 1n, x - d - 1n);
    return new Sub(a, b);
  }
};

const term = (x: Int | Variable, m: number, p: number, indexSymbol: string) => {
  const args = [x, new Int(m - p)];
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

// const writeObject = (path: string, obj: unknown) => {
//   const lines = ["```js", inspect(obj, false, null), "```", ""];
//   writeFileSync(path, lines.join("\n"));
// };

const surd = sum(38, 5, 3, "x");
const simple = surd.simplify();
const simpleSimple = simple.simplify();
const simpleCubed = simpleSimple.simplify();
const same = JSON.stringify(simple) === JSON.stringify(simpleSimple);
const secondSame = JSON.stringify(simpleSimple) === JSON.stringify(simpleCubed);
console.log(same, secondSame);

/*
Error: Not integer
    at Function.Factorisation.pf (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:330:26)
    at Function.Factorisation.pfs (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:344:35)
    at Function.Factorisation.pfs (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:347:42)
    at PowerFactorisation.toPfs (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:399:33)
    at Fraction.simplify (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:446:52)
    at Fraction.simplify (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:462:9)
    at /mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:152:41
    at Array.map (<anonymous>)
    at Summation.simplify (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:152:30)
    at SigmaSummation.simplify (/mnt/c/Users/emma/Documents/Coding/surds/src/index.ts:653:25)
*/
