"use strict";
// import { appendFileSync as write } from "fs";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigmaSummation = exports.Permute = exports.Choose = exports.Factorial = exports.Power = exports.Fraction = exports.PowerFactorisation = exports.Factorisation = exports.Mult = exports.Sub = exports.Add = exports.Summation = exports.Func = exports.Variable = exports.Int = void 0;
// const digits = (x: bigint) => {
//   return `${x}`.split("").map(d => parseInt(d));
// };
// const sumDigits = (x: bigint) => digits(x).reduce((a, b) => a + b, 0);
/**
 * Check whether a surd is an integer of value zero
 * @param x - Surd
 * @returns Answer
 */
const isZero = (x) => x instanceof Int && x.compute() === 0n;
const isOne = (x) => x instanceof Int && x.compute() === 1n;
const remove = (arr, x) => {
    const result = [...arr];
    result.splice(result.indexOf(x), 1);
    return result;
};
const removePowers = (a, b) => {
    const result = {};
    for (const factor in a) {
        const newPower = a[factor] - (b[factor] || 0n);
        if (newPower < 0)
            throw new Error("Negative power in power factorisation");
        if (newPower > 0) {
            result[factor] = newPower;
        }
    }
    return result;
};
const getOverlap = (a, b) => {
    for (const i in a) {
        const x = a[i];
        if (b.includes(x))
            return [x, ...getOverlap(a.slice(parseInt(i) + 1), remove(b, x))];
    }
    return [];
};
const getPowerOverlap = (a, b) => {
    const aFactors = Object.keys(a);
    const bFactors = Object.keys(b);
    const commonFactors = getOverlap(aFactors, bFactors);
    const result = {};
    for (const factor of commonFactors) {
        const overlapPower = min(a[factor] || 0n, b[factor] || 0n);
        if (overlapPower > 0) {
            result[factor] = overlapPower;
        }
    }
    return result;
};
const unique = (arr) => Array.from(new Set(arr));
const count = (arr, x) => arr.reduce((a, v) => (x === v ? a + 1n : a), 0n);
// const log = (from: Surd, to: Surd) =>
//   write(
//     "./log.md",
//     ["$$", `${from.katex()} = ${to.katex()}`, "$$", "", ""].join("\n"),
//   );
const log = (from, to) => {
    from;
    to;
};
const BI = (x) => {
    if (typeof x === "bigint")
        return x;
    if (`${x}`.includes("e"))
        throw new Error("Standard form");
    if (typeof x === "string")
        return BigInt(x);
    if (!(x === Math.floor(x)))
        throw new Error("Not integer");
    return BigInt(x);
};
const toSign = (x) => (x > 0n ? 1 : x === 0n ? 0 : -1);
const abs = (x) => (toSign(x) === -1 ? -1n * x : x);
const toNumber = (x, exact = false) => {
    if (typeof x === "number")
        return x;
    if (exact && x > Number.MAX_SAFE_INTEGER)
        throw new Error("Too big to convert");
    return Number(x);
};
const min = (a, b) => (a < b ? a : b);
const allInt = (arr) => arr.length === arr.filter(x => typeof x === "bigint").length;
class Int {
    constructor(x) {
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
exports.Int = Int;
class Variable {
    constructor(symbol) {
        this.symbol = symbol;
    }
    simplify() {
        return this;
    }
    compute() {
        throw new Error("Impossible to compute surd containing variable");
    }
    katex() {
        return this.symbol;
    }
    preferablyInt() {
        return this;
    }
}
exports.Variable = Variable;
class Func {
    constructor(run, args, symbol = "f", argSymbols = ["x"]) {
        this.run = run;
        this.args = args;
        this.symbol = symbol;
        this.argSymbols = argSymbols;
    }
    maths() {
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
exports.Func = Func;
class Summation {
    constructor(terms) {
        this.terms = terms;
    }
    simplify() {
        const terms = this.terms.map(t => t.simplify().preferablyInt());
        const integers = terms
            .filter(t => t instanceof Int)
            .map(i => i.compute());
        const fractions = terms.filter(t => t instanceof Fraction);
        const other = terms.filter(t => !(t instanceof Int || t instanceof Fraction));
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
        const fractionSum = fractions.length === 0
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
        if (newTerms.length === 0)
            return new Int(0n);
        if (newTerms.length === 1)
            return newTerms[0];
        return result;
    }
    compute() {
        const computed = this.terms.map(t => t.compute());
        if (allInt(computed))
            return computed.reduce((a, t) => a + t, 0n);
        return computed.reduce((a, t) => toNumber(a) + toNumber(t), 0);
    }
    katex() {
        return `[${this.terms.map(t => `{(${t.katex()})}`).join(" + ")}]`;
    }
    preferablyInt() {
        const terms = this.terms.map(t => t.simplify().preferablyInt());
        const integers = terms
            .filter(t => t instanceof Int)
            .map(i => i.compute());
        if (integers.length === terms.length) {
            const result = new Int(integers.reduce((a, b) => a + b, 0n));
            log(this, result);
            return result;
        }
        return this;
    }
}
exports.Summation = Summation;
class Add extends Summation {
    constructor(a, b) {
        super([a, b]);
    }
}
exports.Add = Add;
class Sub {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
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
            log(this, result);
            return result;
        }
        return this;
    }
}
exports.Sub = Sub;
class Mult {
    constructor(a, b) {
        this.a = a;
        this.b = b;
    }
    simplify() {
        const a = this.a.simplify();
        const b = this.b.simplify();
        if (isOne(a))
            return b;
        if (isOne(b))
            return a;
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
            }
            catch (err) {
                return this;
            }
        }
        return this;
    }
}
exports.Mult = Mult;
class Factorisation {
    constructor(...factors) {
        const intFactors = factors.map(f => BI(f));
        if (intFactors.includes(0n)) {
            this.sign = 0;
        }
        else {
            const negatives = intFactors.filter(f => toSign(f) === -1).length;
            this.sign = negatives % 2 === 0 ? 1 : -1;
        }
        this.factors = intFactors.map(n => abs(n)).filter(f => f !== 1n);
    }
    simplify() {
        if (this.sign === 0)
            return new Int(0n);
        if (this.factors.length === 0)
            return new Int(BI(this.sign));
        if (this.factors.length === 1)
            return new Int(BI(this.sign) * this.factors[0]);
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
        const pfs = [];
        for (const f of this.factors) {
            pfs.push(...Factorisation.pfs(f));
        }
        return new Factorisation(...pfs);
    }
    static from(x) {
        if (x instanceof Factorisation)
            return x;
        if (x instanceof Int)
            return new Factorisation(x.compute());
        if (x instanceof Mult)
            return new Factorisation(...Factorisation.from(x.a).factors, ...Factorisation.from(x.b).factors);
        if (x instanceof Power && x.exponent instanceof Int) {
            const ex = x.exponent.compute();
            const surds = Array(toNumber(ex, true)).fill(x.base);
            const factorisations = surds.map(s => Factorisation.from(s));
            const factors = factorisations.map(f => f.factors).flat();
            return new Factorisation(...factors);
        }
        if (x instanceof Factorial)
            return Factorisation.from(x.simplify());
        const intX = x.simplify().preferablyInt();
        if (intX instanceof Int)
            return Factorisation.from(intX);
        throw new Error("Impossible to convert to factorisation");
    }
    static pf(x) {
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
        ].map(BI);
        for (const prime of primes) {
            if (x % prime === 0n)
                return [prime];
        }
        // No brute force
        return [1n];
    }
    static pfs(x) {
        const factors = Factorisation.pf(x);
        const leftOver = x / factors.reduce((a, b) => a * b, 1n);
        if (factors[0] === 1n)
            return [leftOver];
        return [...factors, ...Factorisation.pfs(leftOver)].filter(f => f !== 1n);
    }
}
exports.Factorisation = Factorisation;
class PowerFactorisation {
    constructor(factors = {}, sign) {
        this.factors = factors;
        this.sign = sign;
        for (const factor in factors) {
            if (BI(factor) < 0n)
                throw new Error("Negative factor of power factorisation");
            if (BI(factor) === 0n)
                return new PowerFactorisation({}, 0);
        }
    }
    simplify() {
        if (this.sign === 0)
            return new Int(0n);
        const factors = Object.keys(this.factors);
        if (factors.length === 0)
            return new Int(BI(this.sign));
        if (factors.length === 1) {
            const factor = factors[0];
            const power = this.factors[factor];
            const absolute = new Power(new Int(BI(factor)), new Int(power));
            const signed = this.sign === -1 ? new Mult(new Int(-1n), absolute) : absolute;
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
        }
        catch (err) {
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
        const result = {};
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
    static add(terms) {
        // xy + xz = x(y + z)
        if (!terms.length)
            return new Int(0n);
        const overlap = terms
            .map(t => t.factors)
            .reduce((a, b) => getPowerOverlap(a, b));
        const factor = new PowerFactorisation(overlap, 1).simplify();
        const newTerms = terms.map(t => new Fraction(t, factor).simplify());
        if (isOne(factor))
            return new Summation(newTerms);
        return new Mult(factor, new Summation(newTerms));
    }
    static from(x) {
        if (x instanceof PowerFactorisation)
            return x;
        const f = Factorisation.from(x);
        const result = {};
        for (const factor of unique(f.factors)) {
            const power = count(f.factors, factor);
            result[`${factor}`] = power;
        }
        return new PowerFactorisation(result, f.sign);
    }
}
exports.PowerFactorisation = PowerFactorisation;
class Fraction {
    constructor(num, den) {
        this.num = num;
        this.den = den;
    }
    simplify() {
        if (this.num instanceof PowerFactorisation &&
            this.den instanceof PowerFactorisation) {
            if (this.num.sign === 0)
                return new Int(0n);
            if (this.den.sign === 0)
                throw new Error("0 division");
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
            if (isOne(den))
                return num;
            return result;
        }
        try {
            return new Fraction(PowerFactorisation.from(this.num.simplify()), PowerFactorisation.from(this.den.simplify())).simplify();
        }
        catch (err) {
            if (!`${err}`.includes("factorisation"))
                throw err;
            return new Fraction(this.num.simplify(), this.den.simplify());
        }
    }
    compute() {
        const num = this.num.compute();
        const den = this.den.compute();
        if (typeof num === "bigint" && typeof den === "bigint") {
            if (num % den === 0n)
                return num / den;
        }
        return toNumber(num) / toNumber(den);
    }
    katex() {
        return `\\frac{${this.num.katex()}}{${this.den.katex()}}`;
    }
    preferablyInt() {
        return this;
    }
    static add(a, b) {
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
            const multiplier1 = new PowerFactorisation(removePowers(z.factors, overlap), aSign);
            const multiplier2 = new PowerFactorisation(removePowers(x.factors, overlap), bSign);
            const commonDenominator = new Mult(new Mult(multiplier1, multiplier2), new PowerFactorisation(overlap, 1));
            const absW = new PowerFactorisation(w.factors, 1);
            const absY = new PowerFactorisation(y.factors, 1);
            const num = new Add(new Mult(multiplier1, absW), new Mult(multiplier2, absY));
            const den = commonDenominator;
            return new Fraction(num, den);
        }
        catch (err) {
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
exports.Fraction = Fraction;
class Power {
    constructor(base, exponent) {
        this.base = base;
        this.exponent = exponent;
    }
    simplify() {
        const base = this.base.simplify();
        const ex = this.exponent.simplify();
        if (isOne(ex))
            return base;
        if (isZero(base))
            return base;
        if (isOne(base))
            return base;
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
            }
            catch (err) {
                return this;
            }
        }
        return this;
    }
}
exports.Power = Power;
class Factorial {
    constructor(x) {
        this.x = x;
        try {
            toNumber(x, true);
        }
        catch (err) {
            throw new Error("Factorial is too large");
        }
    }
    maths() {
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
exports.Factorial = Factorial;
class Choose {
    constructor(n, r) {
        this.n = n;
        this.r = r;
    }
    maths() {
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
exports.Choose = Choose;
class Permute {
    constructor(n, r) {
        this.n = n;
        this.r = r;
    }
    maths() {
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
exports.Permute = Permute;
class SigmaSummation {
    constructor(lowerBound, upperBound, term, indexSymbol = "i") {
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.term = term;
        this.indexSymbol = indexSymbol;
        if (lowerBound > upperBound)
            throw new Error("Lower bigger than upper bound");
    }
    maths() {
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
exports.SigmaSummation = SigmaSummation;
//# sourceMappingURL=index.js.map