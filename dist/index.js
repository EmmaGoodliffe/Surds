"use strict";
// import { appendFileSync as write } from "fs";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SigmaSummation = exports.Permute = exports.Choose = exports.Factorial = exports.Power = exports.Fraction = exports.PowerFactorisation = exports.Factorisation = exports.Mult = exports.Sub = exports.Add = exports.Summation = exports.Func = exports.Variable = exports.Int = void 0;
var digits = function (x) {
    if (("" + x).includes("e"))
        throw new Error("Standard form");
    return ("" + x).split("").map(function (d) { return parseInt(d); });
};
var sumDigits = function (x) { return digits(x).reduce(function (a, b) { return a + b; }, 0); };
var isInt = function (x) { return x === Math.floor(x); };
var isZero = function (x) { return x instanceof Int && x.compute() === 0; };
var isOne = function (x) { return x instanceof Int && x.compute() === 1; };
var remove = function (arr, x) {
    var result = __spreadArray([], arr);
    result.splice(result.indexOf(x), 1);
    return result;
};
var removePowers = function (a, b) {
    var result = {};
    for (var i in a) {
        var factor = parseInt(i);
        var newPower = a[factor] - (b[factor] || 0);
        if (newPower < 0)
            throw new Error("Negative power in power factorisation");
        if (newPower > 0) {
            result[factor] = newPower;
        }
    }
    return result;
};
var getOverlap = function (a, b) {
    for (var i in a) {
        var x = a[i];
        if (b.includes(x)) {
            return __spreadArray([x], getOverlap(a.slice(parseInt(i) + 1), remove(b, x)));
        }
    }
    return [];
};
var getPowerOverlap = function (a, b) {
    var aFactors = Object.keys(a);
    var bFactors = Object.keys(b);
    var commonFactors = getOverlap(aFactors, bFactors).map(function (f) { return parseInt(f); });
    var result = {};
    for (var _i = 0, commonFactors_1 = commonFactors; _i < commonFactors_1.length; _i++) {
        var factor = commonFactors_1[_i];
        var overlapPower = Math.min(a[factor] || 0, b[factor] || 0);
        if (overlapPower > 0) {
            result[factor] = overlapPower;
        }
    }
    return result;
};
var unique = function (arr) { return Array.from(new Set(arr)); };
var count = function (arr, x) {
    return arr.reduce(function (a, v) { return (x === v ? a + 1 : a); }, 0);
};
// const log = (from: Surd, to: Surd) =>
//   write(
//     "./log.md",
//     ["$$", `${from.katex()} = ${to.katex()}`, "$$", "", ""].join("\n"),
//   );
var log = function (from, to) {
    from;
    to;
};
var Int = /** @class */ (function () {
    function Int(x) {
        this.x = x;
        if (!isInt(x))
            throw new Error("Not integer");
        if (("" + x).includes("e"))
            throw new Error("Standard form");
    }
    Int.prototype.simplify = function () {
        return this;
    };
    Int.prototype.compute = function () {
        return this.x;
    };
    Int.prototype.katex = function () {
        return "" + this.x;
    };
    Int.prototype.preferablyInt = function () {
        return this;
    };
    return Int;
}());
exports.Int = Int;
var Variable = /** @class */ (function () {
    function Variable(symbol) {
        this.symbol = symbol;
    }
    Variable.prototype.simplify = function () {
        return this;
    };
    Variable.prototype.compute = function () {
        throw new Error("Impossible to compute surd containing variable");
    };
    Variable.prototype.katex = function () {
        return this.symbol;
    };
    Variable.prototype.preferablyInt = function () {
        return this;
    };
    return Variable;
}());
exports.Variable = Variable;
var Func = /** @class */ (function () {
    function Func(run, args, symbol, argSymbols) {
        if (symbol === void 0) { symbol = "f"; }
        if (argSymbols === void 0) { argSymbols = ["x"]; }
        this.run = run;
        this.args = args;
        this.symbol = symbol;
        this.argSymbols = argSymbols;
    }
    Func.prototype.maths = function () {
        // f(x) = f(x)
        var result = this.run(this.args);
        log(this, result);
        return result;
    };
    Func.prototype.simplify = function () {
        return this.maths().simplify();
    };
    Func.prototype.compute = function () {
        return this.maths().compute();
    };
    Func.prototype.katex = function () {
        return this.symbol + "(" + this.argSymbols.join(", ") + ")";
    };
    Func.prototype.preferablyInt = function () {
        return this.maths().preferablyInt();
    };
    return Func;
}());
exports.Func = Func;
var Summation = /** @class */ (function () {
    function Summation(terms) {
        this.terms = terms;
    }
    Summation.prototype.simplify = function () {
        var terms = this.terms.map(function (t) { return t.simplify().preferablyInt(); });
        var integers = terms.filter(function (t) { return t instanceof Int; }).map(function (i) { return i.compute(); });
        var fractions = terms.filter(function (t) { return t instanceof Fraction; });
        var other = terms.filter(function (t) { return !(t instanceof Int || t instanceof Fraction); });
        var possibleFacts = other.map(function (t) {
            try {
                return PowerFactorisation.from(t);
            }
            catch (err) {
                return t;
            }
        });
        var facts = possibleFacts.filter(function (t) { return t instanceof PowerFactorisation; });
        var otherOther = possibleFacts.filter(function (t) { return !(t instanceof PowerFactorisation); });
        var intSum = integers.reduce(function (a, b) { return a + b; }, 0);
        var fractionSum = fractions.length === 0
            ? new Int(0)
            : fractions.reduce(function (a, b) { return Fraction.add(a, b); }).simplify();
        var factSum = PowerFactorisation.add(facts);
        var simpleFactSum = factSum instanceof Summation
            ? new Summation(factSum.terms.map(function (t) { return t.simplify(); }))
            : factSum.simplify();
        var summedTerms = __spreadArray([
            new Int(intSum),
            fractionSum,
            simpleFactSum
        ], otherOther);
        var newTerms = summedTerms.filter(function (t) { return !isZero(t); });
        var result = new Summation(newTerms);
        log(this, result);
        if (newTerms.length === 0)
            return new Int(0);
        if (newTerms.length === 1)
            return newTerms[0];
        return result;
    };
    Summation.prototype.compute = function () {
        return this.terms.reduce(function (a, t) { return a + t.compute(); }, 0);
    };
    Summation.prototype.katex = function () {
        return "[" + this.terms.map(function (t) { return "{(" + t.katex() + ")}"; }).join(" + ") + "]";
    };
    Summation.prototype.preferablyInt = function () {
        var terms = this.terms.map(function (t) { return t.simplify().preferablyInt(); });
        var integers = terms.filter(function (t) { return t instanceof Int; }).map(function (i) { return i.compute(); });
        if (integers.length === terms.length) {
            var result = new Int(integers.reduce(function (a, b) { return a + b; }, 0));
            log(this, result);
            return result;
        }
        return this;
    };
    return Summation;
}());
exports.Summation = Summation;
var Add = /** @class */ (function (_super) {
    __extends(Add, _super);
    function Add(a, b) {
        return _super.call(this, [a, b]) || this;
    }
    return Add;
}(Summation));
exports.Add = Add;
var Sub = /** @class */ (function () {
    function Sub(a, b) {
        this.a = a;
        this.b = b;
    }
    Sub.prototype.simplify = function () {
        var a = this.a.simplify();
        var b = this.b.simplify();
        return new Sub(a, b);
    };
    Sub.prototype.compute = function () {
        return this.a.compute() - this.b.compute();
    };
    Sub.prototype.katex = function () {
        return "[{(" + this.a.katex() + ")} - {(" + this.b.katex() + ")}]";
    };
    Sub.prototype.preferablyInt = function () {
        var a = this.a.simplify().preferablyInt();
        var b = this.b.simplify().preferablyInt();
        if (a instanceof Int && b instanceof Int) {
            var result = new Int(a.compute() - b.compute());
            log(this, result);
            return result;
        }
        return this;
    };
    return Sub;
}());
exports.Sub = Sub;
var Mult = /** @class */ (function () {
    function Mult(a, b) {
        this.a = a;
        this.b = b;
    }
    Mult.prototype.simplify = function () {
        var a = this.a.simplify();
        var b = this.b.simplify();
        if (isOne(a))
            return b;
        if (isOne(b))
            return a;
        return new Mult(a, b);
    };
    Mult.prototype.compute = function () {
        return this.a.compute() * this.b.compute();
    };
    Mult.prototype.katex = function () {
        return "{" + this.a.katex() + "} \\times {" + this.b.katex() + "}";
    };
    Mult.prototype.preferablyInt = function () {
        var a = this.a.simplify().preferablyInt();
        var b = this.b.simplify().preferablyInt();
        if (a instanceof Int && b instanceof Int) {
            try {
                return new Int(a.compute() * b.compute());
            }
            catch (err) {
                return this;
            }
        }
        return this;
    };
    return Mult;
}());
exports.Mult = Mult;
var Factorisation = /** @class */ (function () {
    function Factorisation() {
        var factors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            factors[_i] = arguments[_i];
        }
        if (factors.filter(function (f) { return !isInt(f); }).length)
            throw new Error("Not integer");
        if (factors.includes(0)) {
            this.sign = 0;
        }
        else {
            var negatives = factors.filter(function (f) { return Math.sign(f) === -1; }).length;
            this.sign = negatives % 2 === 0 ? 1 : -1;
        }
        this.factors = factors.map(function (n) { return Math.abs(n); }).filter(function (f) { return f !== 1; });
    }
    Factorisation.prototype.simplify = function () {
        if (this.sign === 0)
            return new Int(0);
        if (this.factors.length === 0)
            return new Int(this.sign);
        if (this.factors.length === 1)
            return new Int(this.sign * this.factors[0]);
        return this;
    };
    Factorisation.prototype.compute = function () {
        return this.factors.reduce(function (a, b) { return a * b; }, 1);
    };
    Factorisation.prototype.katex = function () {
        return __spreadArray([this.sign], this.factors).join(" \\times ");
    };
    Factorisation.prototype.preferablyInt = function () {
        return new Int(this.compute());
    };
    Factorisation.prototype.toPfs = function () {
        var pfs = [];
        for (var _i = 0, _a = this.factors; _i < _a.length; _i++) {
            var f = _a[_i];
            pfs.push.apply(pfs, Factorisation.pfs(f));
        }
        return new (Factorisation.bind.apply(Factorisation, __spreadArray([void 0], pfs)))();
    };
    Factorisation.from = function (x) {
        if (x instanceof Factorisation)
            return x;
        if (x instanceof Int)
            return new Factorisation(x.compute());
        if (x instanceof Mult) {
            return new (Factorisation.bind.apply(Factorisation, __spreadArray(__spreadArray([void 0], Factorisation.from(x.a).factors), Factorisation.from(x.b).factors)))();
        }
        if (x instanceof Power && x.exponent instanceof Int) {
            var ex = x.exponent.compute();
            var surds = Array(ex).fill(x.base);
            var factorisations = surds.map(function (s) { return Factorisation.from(s); });
            var factors = factorisations.map(function (f) { return f.factors; }).flat();
            return new (Factorisation.bind.apply(Factorisation, __spreadArray([void 0], factors)))();
        }
        if (x instanceof Factorial)
            return Factorisation.from(x.simplify());
        var intX = x.simplify().preferablyInt();
        if (intX instanceof Int)
            return Factorisation.from(intX);
        throw new Error("Impossible to convert to factorisation");
    };
    Factorisation.pf = function (x) {
        if (!isInt)
            throw new Error("Not integer");
        var lastDig = digits(x).slice(-1)[0];
        var restDigits = parseInt(digits(x).slice(0, -1).join(""));
        var sum = sumDigits(x);
        if (lastDig === 0)
            return [2, 5];
        if (sum % 9 === 0)
            return [3, 3];
        if ((restDigits - 2 * lastDig) % 7 === 0)
            return [7];
        if (lastDig === 5)
            return [5];
        if (sum % 3 === 0)
            return [3];
        if (lastDig % 2 === 0)
            return [2];
        // No brute force
        return [1];
    };
    Factorisation.pfs = function (x) {
        var factors = Factorisation.pf(x);
        var leftOver = x / factors.reduce(function (a, b) { return a * b; }, 1);
        if (factors[0] === 1)
            return [leftOver];
        return __spreadArray(__spreadArray([], factors), Factorisation.pfs(leftOver)).filter(function (f) { return f !== 1; });
    };
    return Factorisation;
}());
exports.Factorisation = Factorisation;
var PowerFactorisation = /** @class */ (function () {
    function PowerFactorisation(factors, sign) {
        if (factors === void 0) { factors = {}; }
        this.factors = factors;
        this.sign = sign;
        for (var factor in factors) {
            if (parseInt(factor) < 0) {
                throw new Error("Negative factor of power factorisation");
            }
            if (parseInt(factor) === 0)
                return new PowerFactorisation({}, 0);
        }
    }
    PowerFactorisation.prototype.simplify = function () {
        if (this.sign === 0)
            return new Int(0);
        var factors = Object.keys(this.factors);
        if (factors.length === 0)
            return new Int(this.sign);
        if (factors.length === 1) {
            var factor = parseInt(factors[0]);
            var power = this.factors[factor];
            var absolute = new Power(new Int(factor), new Int(power));
            var signed = this.sign === -1 ? new Mult(new Int(-1), absolute) : absolute;
            return signed.simplify();
        }
        return this;
    };
    PowerFactorisation.prototype.katex = function () {
        var _this = this;
        return this.sign + " \\times " + Object.keys(this.factors)
            .map(function (key) { return "{" + key + "}^{" + _this.factors[parseInt(key)] + "}"; })
            .join(" \\times ");
    };
    PowerFactorisation.prototype.preferablyInt = function () {
        try {
            return new Int(this.compute());
        }
        catch (err) {
            return this;
        }
    };
    PowerFactorisation.prototype.compute = function () {
        var total = 1;
        for (var factor in this.factors) {
            var power = this.factors[factor];
            total *= Math.pow(parseInt(factor), power);
        }
        return this.sign * total;
    };
    PowerFactorisation.prototype.toPfs = function () {
        var result = {};
        for (var parentKey in this.factors) {
            var parentFactor = parseInt(parentKey);
            var parentPower = this.factors[parentFactor];
            var pfs = Factorisation.pfs(parentFactor);
            var powerPfs = PowerFactorisation.from(new (Factorisation.bind.apply(Factorisation, __spreadArray([void 0], pfs)))());
            for (var key in powerPfs.factors) {
                var factor = parseInt(key);
                var power = powerPfs.factors[factor];
                var totalPower = parentPower * power;
                result[factor] = (result[factor] || 0) + totalPower;
            }
        }
        return new PowerFactorisation(result, this.sign);
    };
    PowerFactorisation.add = function (terms) {
        // xy + xz = x(y + z)
        if (!terms.length)
            return new Int(0);
        var overlap = terms
            .map(function (t) { return t.factors; })
            .reduce(function (a, b) { return getPowerOverlap(a, b); });
        var factor = new PowerFactorisation(overlap, 1).simplify();
        var newTerms = terms.map(function (t) { return new Fraction(t, factor).simplify(); });
        if (isOne(factor))
            return new Summation(newTerms);
        return new Mult(factor, new Summation(newTerms));
    };
    PowerFactorisation.from = function (x) {
        if (x instanceof PowerFactorisation)
            return x;
        var f = Factorisation.from(x);
        var result = {};
        for (var _i = 0, _a = unique(f.factors); _i < _a.length; _i++) {
            var factor = _a[_i];
            var power = count(f.factors, factor);
            result[factor] = power;
        }
        return new PowerFactorisation(result, f.sign);
    };
    return PowerFactorisation;
}());
exports.PowerFactorisation = PowerFactorisation;
var Fraction = /** @class */ (function () {
    function Fraction(num, den) {
        this.num = num;
        this.den = den;
    }
    Fraction.prototype.simplify = function () {
        if (this.num instanceof PowerFactorisation &&
            this.den instanceof PowerFactorisation) {
            if (this.num.sign === 0)
                return new Int(0);
            if (this.den.sign === 0)
                throw new Error("0 division");
            var sign = this.num.sign === this.den.sign ? 1 : -1;
            var overlap = getPowerOverlap(this.num.factors, this.den.factors);
            var newA = removePowers(this.num.factors, overlap);
            var newB = removePowers(this.den.factors, overlap);
            var aPfs = new PowerFactorisation(newA, 1).toPfs();
            var bPfs = new PowerFactorisation(newB, 1).toPfs();
            var pfOverlap = getPowerOverlap(aPfs.factors, bPfs.factors);
            var newAPfs = removePowers(aPfs.factors, pfOverlap);
            var newBPfs = removePowers(bPfs.factors, pfOverlap);
            var num = new PowerFactorisation(newAPfs, sign).simplify();
            var den = new PowerFactorisation(newBPfs, 1).simplify();
            var result = new Fraction(num, den);
            log(this, result);
            if (isOne(den))
                return num;
            return result;
        }
        try {
            return new Fraction(PowerFactorisation.from(this.num.simplify()), PowerFactorisation.from(this.den.simplify())).simplify();
        }
        catch (err) {
            if (!("" + err).includes("factorisation"))
                throw err;
            return new Fraction(this.num.simplify(), this.den.simplify());
        }
    };
    Fraction.prototype.compute = function () {
        return this.num.compute() / this.den.compute();
    };
    Fraction.prototype.katex = function () {
        return "\\frac{" + this.num.katex() + "}{" + this.den.katex() + "}";
    };
    Fraction.prototype.preferablyInt = function () {
        return this;
    };
    Fraction.add = function (a, b) {
        try {
            // TODO: make comment more explicit
            // (w/x) + (y/z)
            var w = PowerFactorisation.from(a.num);
            var x = PowerFactorisation.from(a.den).toPfs();
            var y = PowerFactorisation.from(b.num);
            var z = PowerFactorisation.from(b.den).toPfs();
            var aSign = w.sign === x.sign ? 1 : -1;
            var bSign = y.sign === z.sign ? 1 : -1;
            var overlap = getPowerOverlap(x.factors, z.factors);
            var multiplier1 = new PowerFactorisation(removePowers(z.factors, overlap), aSign);
            var multiplier2 = new PowerFactorisation(removePowers(x.factors, overlap), bSign);
            var commonDenominator = new Mult(new Mult(multiplier1, multiplier2), new PowerFactorisation(overlap, 1));
            var absW = new PowerFactorisation(w.factors, 1);
            var absY = new PowerFactorisation(y.factors, 1);
            var num = new Add(new Mult(multiplier1, absW), new Mult(multiplier2, absY));
            var den = commonDenominator;
            return new Fraction(num, den);
        }
        catch (err) {
            // (w/x) + (y/z) = (wz + xy)/(xz)
            var w = a.num;
            var x = a.den;
            var y = b.num;
            var z = b.den;
            var num = new Add(new Mult(w, z), new Mult(x, y));
            var den = new Mult(x, z);
            return new Fraction(num, den);
        }
    };
    return Fraction;
}());
exports.Fraction = Fraction;
var Power = /** @class */ (function () {
    function Power(base, exponent) {
        this.base = base;
        this.exponent = exponent;
    }
    Power.prototype.simplify = function () {
        var base = this.base.simplify();
        var ex = this.exponent.simplify();
        if (isOne(ex))
            return base;
        if (isZero(base))
            return base;
        if (isOne(base))
            return base;
        return new Power(base, ex);
    };
    Power.prototype.compute = function () {
        return Math.pow(this.base.compute(), this.exponent.compute());
    };
    Power.prototype.katex = function () {
        return "{" + this.base.katex() + "}^{" + this.exponent.katex() + "}";
    };
    Power.prototype.preferablyInt = function () {
        var base = this.base.simplify().preferablyInt();
        var ex = this.exponent.simplify().preferablyInt();
        if (base instanceof Int && ex instanceof Int) {
            try {
                return new Int(Math.pow(base.compute(), ex.compute()));
            }
            catch (err) {
                return this;
            }
        }
        return this;
    };
    return Power;
}());
exports.Power = Power;
var Factorial = /** @class */ (function () {
    function Factorial(x) {
        this.x = x;
        if (!isInt(x))
            throw new Error("Not integer");
    }
    Factorial.prototype.maths = function () {
        // x! = x * (x - 1) * ... * 2 * 1
        var factors = [];
        for (var n = this.x; n >= 1; n--) {
            factors.push(n);
        }
        return new (Factorisation.bind.apply(Factorisation, __spreadArray([void 0], factors)))();
    };
    Factorial.prototype.simplify = function () {
        return this.maths().simplify();
    };
    Factorial.prototype.compute = function () {
        return this.maths().compute();
    };
    Factorial.prototype.katex = function () {
        return this.x + "!";
    };
    Factorial.prototype.preferablyInt = function () {
        return this.maths().preferablyInt();
    };
    return Factorial;
}());
exports.Factorial = Factorial;
var Choose = /** @class */ (function () {
    function Choose(n, r) {
        this.n = n;
        this.r = r;
        if (!(isInt(n) && isInt(r)))
            throw new Error("Not integer");
    }
    Choose.prototype.maths = function () {
        // nCr = (n!)/(r!(n - r)!)
        var num = new Factorial(this.n);
        var den = new Mult(new Factorial(this.r), new Factorial(this.n - this.r));
        var result = new Fraction(num, den);
        log(this, result);
        return result;
    };
    Choose.prototype.simplify = function () {
        return this.maths().simplify();
    };
    Choose.prototype.compute = function () {
        return this.maths().compute();
    };
    Choose.prototype.katex = function () {
        return "{" + this.n + " \\choose " + this.r + "}";
    };
    Choose.prototype.preferablyInt = function () {
        return this.maths().preferablyInt();
    };
    return Choose;
}());
exports.Choose = Choose;
var Permute = /** @class */ (function () {
    function Permute(n, r) {
        this.n = n;
        this.r = r;
        if (!(isInt(n) && isInt(r)))
            throw new Error("Not integer");
    }
    Permute.prototype.maths = function () {
        // nPr = (n!)/((n - r)!)
        var num = new Factorial(this.n);
        var den = new Factorial(this.n - this.r);
        var result = new Fraction(num, den);
        log(this, result);
        return result;
    };
    Permute.prototype.simplify = function () {
        return this.maths().simplify();
    };
    Permute.prototype.compute = function () {
        return this.maths().compute();
    };
    Permute.prototype.katex = function () {
        return "{}_{" + this.n + "}P^{" + this.r + "}";
    };
    Permute.prototype.preferablyInt = function () {
        return this.maths().preferablyInt();
    };
    return Permute;
}());
exports.Permute = Permute;
var SigmaSummation = /** @class */ (function () {
    function SigmaSummation(lowerBound, upperBound, term, indexSymbol) {
        if (indexSymbol === void 0) { indexSymbol = "i"; }
        this.lowerBound = lowerBound;
        this.upperBound = upperBound;
        this.term = term;
        this.indexSymbol = indexSymbol;
        if (lowerBound > upperBound) {
            throw new Error("Lower bigger than upper bound");
        }
    }
    SigmaSummation.prototype.maths = function () {
        var l = this.lowerBound.compute();
        var u = this.upperBound.compute();
        var terms = [];
        for (var i = l; i <= u; i++) {
            var term = this.term(new Int(i));
            terms.push(term);
        }
        var result = new Summation(terms);
        log(this, result);
        return result;
    };
    SigmaSummation.prototype.simplify = function () {
        return this.maths().simplify();
    };
    SigmaSummation.prototype.compute = function () {
        return this.maths().compute();
    };
    SigmaSummation.prototype.katex = function () {
        var l = this.lowerBound.compute();
        var u = this.upperBound.compute();
        var term = this.term(new Variable(this.indexSymbol)).katex();
        return "\\sum_{" + this.indexSymbol + " = " + l + "}^{" + u + "} {" + term + "}";
    };
    SigmaSummation.prototype.preferablyInt = function () {
        return this.maths().preferablyInt();
    };
    return SigmaSummation;
}());
exports.SigmaSummation = SigmaSummation;
//# sourceMappingURL=index.js.map