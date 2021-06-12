"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var _1 = require(".");
fs_1.writeFileSync("./log.md", "");
var f = function (_a) {
    var xi = _a[0], di = _a[1];
    var x = xi.compute();
    var d = di.compute();
    if (x < 1 || x - d < 1) {
        return new _1.Int(1);
    }
    else {
        var a = new _1.Choose(x, x - d);
        var b = new _1.Choose(x - 1, x - d - 1);
        return new _1.Sub(a, b);
    }
};
var term = function (x, m, p, indexSymbol) {
    var args = [x, new _1.Int(m - p)];
    var num = new _1.Func(f, args, "f", [indexSymbol, "" + (m - p)]);
    var den = new _1.Power(new _1.Int(2), x);
    return new _1.Fraction(num, den);
};
var sum = function (m, p, q, indexSymbol) {
    var lowerBound = new _1.Int(m - p);
    var upperBound = new _1.Int(2 * m - p - q - 1);
    return new _1.SigmaSummation(lowerBound, upperBound, function (x) { return term(x, m, p, indexSymbol); }, indexSymbol);
};
var surd = sum(38, 7, 2, "x");
var simple = surd.simplify();
var simpleSimple = simple.simplify();
var same = JSON.stringify(simple) === JSON.stringify(simpleSimple);
console.log(same);
//# sourceMappingURL=dev.js.map