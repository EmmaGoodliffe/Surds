import { Add, Int, PowerFactorisation } from ".";

const num = new Add(new Int(-1), new Int(-1));
console.log(PowerFactorisation.from(num.simplify()));
