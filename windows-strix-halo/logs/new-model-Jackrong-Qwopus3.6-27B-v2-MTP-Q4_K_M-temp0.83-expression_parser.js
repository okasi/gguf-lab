"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
Object.defineProperty(exports, "__esModule", { value: true });
function parseExpression() {
    let left = parseTerm();
    while (true) {
        skipSpaces();
        if (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
            const op = str[pos];
            pos++;
            let right = parseTerm();
            if (op === '+')
                left = left + right;
            else
                left = left - right;
        }
        else {
            break;
        }
    }
    return left;
}
parseTerm: function parseTerm() {
    let left = parseFactor();
    while (true) {
        skipSpaces();
        if (pos < str.length && (str[pos] === '*' || str[pos] === '/')) {
            const op = str[pos];
            pos++;
            let right = parseFactor();
            if (op === '*')
                left = left * right;
            else
                left = Math.trunc(left / right); // division truncates toward zero
        }
        else {
            break;
        }
    }
    return left;
}
parseFactor: function parseFactor() {
    return parseUnary();
}
parseUnary: function parseUnary() {
    skipSpaces();
    if (pos < str.length && (str[pos] === '+' || str[pos] === '-')) {
        const sign = str[pos];
        pos++;
        let value = parseUnary();
        return sign === '-' ? -value : value;
    }
    else {
        return parsePrimary();
    }
}
parsePrimary: function parsePrimary() {
    skipSpaces();
    if (pos < str.length && str[pos] === '(') {
        pos++; // consume '('
        let value = parseExpression();
        skipSpaces();
        if (pos < str.length && str[pos] === ')') {
            pos++;
            return value;
        }
        else {
            throw new Error("Missing closing parenthesis");
        }
    }
    else {
        return parseNumber();
    }
}
parseNumber: function parseNumber() {
    skipSpaces();
    let start = pos;
    while (pos < str.length && isDigit(str[pos])) {
        pos++;
    }
    if (start === pos) {
        throw new Error("Expected number");
    }
    return parseInt(str.substring(start, pos), 10);
}
Helper;
functions: isSpace, isDigit.
    Now, we;
need;
to;
read;
stdin: const input = fs.readFileSync(0, 'utf8').trim();
But;
note: the;
input;
might;
contain;
trailing;
newline;
we;
trim.
;
Then;
parse;
and;
output.
;
We;
need;
to;
ensure;
that;
we;
don;
't have any extra characters after parsing. But it';
s;
fine.
    Now, we;
must;
write;
TypeScript;
code.We;
'll include necessary imports: import * as fs from ';
fs;
';;
We;
'll write the program in a function main() and then call it.;
We;
'll need to handle errors? Probably not required, but we can throw.;
We;
need;
to;
ensure;
that;
division;
truncation;
toward;
zero: Math.trunc;
works;
for (both; positive; and)
    negative.But;
note: for (negative; numbers, Math.trunc(-5 / 2) = -2, which; is)
    correct.For;
positive, Math.trunc(5 / 2) = 2.;
Good.
;
But;
we;
must;
be;
careful: if (we)
    do
        left / right, it;
    while ('s floating division. For large integers, the result may lose precision. However, since all values are safe integers, the division might produce a non-integer with many decimal digits, but Math.trunc will still give the integer part, but due to floating point representation, the exact integer part might be off if the numbers are huge? For safe integers (up to 2^53-1), division of two such numbers can produce a result that is not exactly representable, but the integer part should be correct because the division result is close to the true quotient. However, there could be edge cases where the quotient is exactly an integer but due to rounding it might be off by one? For example, 1e16 / 2 = 5e15, which is exactly representable. For non-integer quotients, the integer part should be the floor of the true quotient for positive, but for negative, truncation toward zero. With floating point, the result might be slightly less than the true quotient due to rounding, causing Math.trunc to give one less than the true integer part? Let');
s;
consider: true;
quotient = 3.0000000000000004, but;
due;
to;
rounding;
it;
becomes;
2.9999999999999996, then;
Math.trunc;
yields;
2;
instead;
of;
3.;
That;
could;
happen;
if (the)
    division;
is;
not;
exact;
and;
the;
rounding;
error;
pushes;
it;
below;
the;
integer;
threshold.However, ;
with (integers)
    up;
to;
2 ^ 53, the;
division;
result;
is;
at;
most;
around;
2 ^ 53, and;
the;
spacing;
between;
floating;
point;
numbers;
is;
about;
2 ^ -52;
relative;
to;
the;
magnitude.For;
large;
numbers, the;
gap;
between;
representable;
numbers;
is;
larger, so;
the;
risk;
of;
the;
integer;
part;
being;
off;
by;
one;
is;
higher.For;
example, consider;
a = 2 ^ 53 - 1, b = 2.;
The;
true;
quotient;
is(2 ^ 53 - 1) / 2;
2 ^ 52 - 0.5.The;
floating;
point;
representation;
of;
a;
is;
exact(since, it, 's within safe integer). b=2 exact. Division a/b will be computed as a * (1/2) in double. Since a is odd, the result is not exactly representable; the nearest double to 2^52 - 0.5 is? Let', s, compute, 2 ^ 52, 4503599627370496., 2 ^ 52 - 0.5, 4503599627370495.5.The, nearest, double, to, that, is ? The : , spacing, of, double, at, that, magnitude, is, 2 ^ (exponent - 52).The, exponent);
for (2 ^ 52; is; 52, so)
    the;
unit in last;
place(ULP);
is;
2 ^ (52 - 52);
1.;
So;
double;
can;
represent;
integers;
exactly;
up;
to;
2 ^ 53, but;
for (numbers; ; )
    with (fractional)
        part, the;
precision;
is;
such;
that;
the;
gap;
between;
representable;
numbers;
is;
1.;
So;
2 ^ 52 - 0.5;
is;
exactly;
halfway;
between;
2 ^ 52 - 1;
and;
2 ^ 52 ? Actually : ;
2 ^ 52;
is;
integer, 2 ^ 52 - 1;
is;
integer.The;
number;
2 ^ 52 - 0.5;
is;
not;
integer.The;
nearest;
double;
to;
2 ^ 52 - 0.5;
would;
be;
either;
2 ^ 52 - 1;
or;
2 ^ 52 ? The : ;
distance;
to;
2 ^ 52;
is;
0.5, to;
2 ^ 52 - 1;
is;
0.5;
it;
's exactly halfway. Double rounding rules (round to nearest even) would choose the even integer, which is 2^52 (since 2^52 is even). So the computed double would be 2^52. Then Math.trunc(2^52) = 2^52, but the true integer part (truncation toward zero) of (2^53-1)/2 is floor((2^53-1)/2) for positive? Actually truncation toward zero for positive numbers is floor, which is 2^52 - 1? Wait: (2^53-1)/2 = 2^52 - 0.5. The integer part (floor) is 2^52 - 1. But the computed double is 2^52, which is off by 1. So Math.trunc would give 2^52, which is wrong. This is a potential issue.;
Thus, using;
floating;
point;
division;
and;
Math.trunc;
may;
not;
be;
safe;
for (large; integers.We; need)
    to;
implement;
integer;
division;
that;
truncates;
toward;
zero;
without;
floating;
point;
errors.Since;
all;
numbers;
fit in safe;
integers, we;
can;
use;
integer;
arithmetic;
with (remainder.
)
    We;
can;
implement;
division;
function div(a, b) { if (b === 0)
    throw ; ; let q = Math.floor(a / b); if (a >= 0 && b >= 0 || a < 0 && b < 0)
    return q;
else
    return q - 1; }
Wait, that;
's for floor division? Actually, we want truncation toward zero, which is like integer division in C. For positive numbers, truncation is same as floor. For negative numbers, floor gives more negative, while truncation gives less negative. For example, -5/2 = -2 in truncation, but floor(-2.5) = -3. So we can compute using Math.trunc? But as we saw, floating point may cause off-by-one.;
Better: Use;
integer;
division: let q = Math.floor(a / b), but, that, uses, floating, point, Alternatively, we, can, compute, using, integer, arithmetic, q = Math.floor(a / b), is, still, floating, point, We, could, implement, division, using, the, fact, that, we, have, safe, integers, but, we, need, to, avoid, floating, point, We, can, use, Math, trunc;
(a / b);
but;
that;
's still floating point. However, the risk is real. To be safe, we can implement division using integer arithmetic: we can compute the quotient using the / operator but then adjust using remainder? But we still need to compute the remainder, which also uses floating point.;
Alternatively, we;
can;
use;
the;
fact;
that;
JavaScript;
numbers;
are;
64 - bit;
floats, but;
we;
can;
use;
BigInt ? The : ;
problem;
says;
all;
intermediate;
values;
fit in JavaScript;
safe;
integers, but;
we;
could;
use;
BigInt;
for (arbitrary; precision; and)
    then;
convert;
back.But;
the;
problem;
says;
"All intermediate values fit in JavaScript safe integers", implying;
we;
can;
use;
regular;
numbers, but;
we;
need;
to;
be;
careful;
about;
division.Possibly;
the;
test;
cases;
are;
not;
so;
extreme;
that;
floating;
point;
issues;
occur.But;
to;
be;
robust, we;
could;
implement;
integer;
division;
const fs = __importStar(require("fs"));
function main() {
    const input = fs.readFileSync(0, 'utf8').trim();
    const parser = new Parser(input);
    const result = parser.parse();
    console.log(result.toString());
}
var a, method, that, avoids, floating, point, by, using, the, division, algorithm, regular, numbers, and, division, the, BigInt, is, fine, However, we, need, to, ensure, that, we, parse, numbers, as, BigInt, and, then, perform, operations, Evaluator, Parser;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    a = __addDisposableResource(env_1, void 0, false), method = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), avoids = __addDisposableResource(env_1, void 0, false), floating = __addDisposableResource(env_1, void 0, false), point = __addDisposableResource(env_1, void 0, false), by = __addDisposableResource(env_1, void 0, false), using = __addDisposableResource(env_1, void 0, false), the = __addDisposableResource(env_1, void 0, false), division = __addDisposableResource(env_1, void 0, false), algorithm = __addDisposableResource(env_1, void 0, false);
    with (multiplication ? That : )
        would;
    be;
    overkill.
    ;
    Given;
    that;
    the;
    problem;
    is;
    about;
    parsing;
    and;
    evaluation, and;
    they;
    explicitly;
    say;
    "All intermediate values fit in JavaScript safe integers", they;
    likely;
    expect;
    regular = __addDisposableResource(env_1, void 0, false), numbers = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), division = __addDisposableResource(env_1, void 0, false);
    with (truncation.Many)
        such;
    problems;
    use;
    Math.trunc;
    or;
    integer;
    division;
    by;
    using(a - a % b) / b ? But % also : ;
    uses;
    floating;
    point.
        Let;
    's think: In JavaScript, the % operator returns the remainder after division, but it also uses floating point. For large numbers, a % b may also be inaccurate? Actually, for integers within safe range, the % operator should be exact because the numbers are integers and the remainder is also an integer within safe range. The division algorithm: a = b * q + r, where 0 <= r < |b| for positive b, but for negative b it';
    s;
    more;
    complex.However, the % operator in JavaScript;
    returns;
    the;
    remainder;
    with (the)
        sign;
    of;
    the;
    dividend.For;
    truncation;
    toward;
    zero, we;
    can;
    compute: let q = Math.floor(a / b), is, not, good, Instead, we, can, compute, q = Math.trunc(a / b), is, also, floating, point, But, maybe, we, can, compute, integer, division, using, the, following, b;
     > 0, then;
    q = Math.floor(a / b);
    if (a >= 0)
        ;
    else
        -Math.floor(-a / b) ? Actually : , we;
    can;
    use;
    the;
    fact;
    that;
    for (integers, we; can; compute)
        the;
    quotient;
    the = __addDisposableResource(env_1, void 0, false);
    / operator and then convert to integer by truncation, but as we saw, there is risk.;
    But;
    perhaps;
    the;
    test;
    cases;
    are;
    small;
    enough;
    that;
    floating;
    point;
    errors;
    don;
    't occur. However, to be safe, we could use BigInt for the evaluation, then convert back to Number for output. The problem says "All intermediate values fit in JavaScript safe integers", meaning they are within the safe integer range, but using BigInt would still work and avoid floating point issues. However, the problem might expect using regular numbers, but using BigInt is allowed as long as we don';
    t;
    use;
    external;
    packages.BigInt;
    is;
    built -  in .So;
    we;
    could;
    parse;
    numbers, and;
    perform;
    operations;
    with (BigInt.Division in BigInt)
        truncates;
    toward;
    zero;
    automatically(since, BigInt, division, is, integer, division);
    with (truncation)
        toward;
    zero;
    That;
    would;
    be;
    perfect;
    and;
    avoid;
    floating;
    point;
    issues.However, we;
    need;
    to;
    be;
    careful: BigInt;
    division;
    is;
    integer;
    division;
    that;
    truncates;
    toward;
    zero ? Actually : ,  in JavaScript, BigInt;
    division;
    uses;
    the / operator, which;
    returns;
    a;
    BigInt;
    with (the)
        result;
    truncated;
    toward;
    zero ? Let : ;
    's check: For BigInt, 5n / 2n = 2n, -5n / 2n = -2n, -5n / -2n = 2n. Yes, it truncates toward zero. So using BigInt is ideal.;
    But;
    the;
    problem;
    says;
    "All intermediate values fit in JavaScript safe integers", which;
    implies;
    they;
    are;
    within;
    the;
    safe;
    integer;
    range, but;
    BigInt = __addDisposableResource(env_1, void 0, false), is = __addDisposableResource(env_1, void 0, false), fine = __addDisposableResource(env_1, void 0, false), However = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), ensure = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), we = __addDisposableResource(env_1, void 0, false), parse = __addDisposableResource(env_1, void 0, false), numbers = __addDisposableResource(env_1, void 0, false), as = __addDisposableResource(env_1, void 0, false), BigInt = __addDisposableResource(env_1, void 0, false), and = __addDisposableResource(env_1, void 0, false), then = __addDisposableResource(env_1, void 0, false), perform = __addDisposableResource(env_1, void 0, false), operations = __addDisposableResource(env_1, void 0, false);
    with (BigInt.At)
        the;
    end, we;
    need;
    to;
    output;
    an;
    integer.We;
    can;
    convert;
    the;
    BigInt;
    to;
    a;
    string;
    or;
    number.Since;
    it;
    fits in safe;
    integer, converting;
    to;
    Number;
    is;
    safe, but;
    we;
    can;
    also;
    output;
    problem;
    expects;
    an;
    integer;
    output, likely;
    string;
    without;
    decimal.So;
    we;
    can;
    just;
    output;
    the;
    BigInt, which;
    will;
    be;
    the;
    integer;
    representation.
    ;
    But;
    we;
    must;
    consider;
    that;
    the;
    input;
    expression;
    may;
    contain;
    numbers;
    that;
    are;
    within;
    safe;
    integer;
    range, but;
    intermediate;
    results;
    might;
    also;
    be;
    within;
    safe;
    integer;
    range.Using;
    BigInt;
    will;
    handle;
    them;
    exactly.
        Thus, I;
    'll implement the parser using BigInt.;
    Now, we;
    need;
    to;
    adjust;
    the;
    parser;
    to;
    return BigInt;
    values.We;
    'll parse numbers as BigInt. For unary, we';
    ll;
    compute - value(using, BigInt, negation);
    or + value.
    ;
    For;
    division, we;
    'll use BigInt division: left / right (BigInt division). That automatically truncates toward zero.;
    For;
    multiplication, left * right.
    ;
    For;
    addition;
    and;
    subtraction, left + right, left - right.
    ;
    All;
    operations;
    will;
    be;
    BigInt.
    ;
    We;
    need;
    to;
    be;
    careful;
    with (unary)
        plus: we;
    just;
    return value.
        Now, we;
    need;
    to;
    handle;
    spaces;
    and;
    parentheses.
        We;
    'll implement the parser with BigInt.;
    Now, we;
    need;
    to;
    read;
    stdin.Use;
    fs.readFileSync(0, 'utf8').trim().
        Now, we;
    need;
    to;
    write;
    TypeScript;
    code.
        We;
    'll define a class or just functions. I';
    ll;
    define;
    a;
    Evaluator = class Evaluator {
    };
    with (a)
        string;
    and;
    position.
        We;
    'll have methods: parseExpression, parseTerm, parseFactor, parseUnary, parsePrimary, parseNumber.;
    We;
    'll also have helper methods: skipSpaces, peekChar, consumeChar.;
    We;
    'll implement in TypeScript with proper types.;
    Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any extra characters after parsing. But we can ignore if there are trailing spaces.;
    Now, we;
    'll write the code.;
    Let;
    's outline:;
    Parser = class Parser {
        constructor(input) {
            this.input = input;
            this.pos = 0;
        }
        skipSpaces() {
            while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
                this.pos++;
            }
        }
        peek() {
            this.skipSpaces();
            if (this.pos < this.input.length) {
                return this.input[this.pos];
            }
            return undefined;
        }
        consume() {
            this.skipSpaces();
            if (this.pos >= this.input.length) {
                throw new Error('Unexpected end of input');
            }
            const ch = this.input[this.pos];
            this.pos++;
            return ch;
        }
        parse() {
            const result = this.parseExpression();
            this.skipSpaces();
            if (this.pos < this.input.length) {
                // There are extra characters, but maybe ignore? Or throw.
                // For safety, we could throw, but likely not needed.
                throw new Error('Extra characters after expression');
            }
            return result;
        }
        parseExpression() {
            let left = this.parseTerm();
            while (true) {
                const op = this.peek();
                if (op === '+' || op === '-') {
                    this.consume();
                    const right = this.parseTerm();
                    if (op === '+') {
                        left = left + right;
                    }
                    else {
                        left = left - right;
                    }
                }
                else {
                    break;
                }
            }
            return left;
        }
        parseTerm() {
            let left = this.parseFactor();
            while (true) {
                const op = this.peek();
                if (op === '*' || op === '/') {
                    this.consume();
                    const right = this.parseFactor();
                    if (op === '*') {
                        left = left * right;
                    }
                    else {
                        left = left / right; // BigInt division truncates toward zero
                    }
                }
                else {
                    break;
                }
            }
            return left;
        }
        parseFactor() {
            return this.parseUnary();
        }
        parseUnary() {
            const op = this.peek();
            if (op === '+' || op === '-') {
                this.consume();
                const value = this.parseUnary();
                return op === '-' ? -value : value;
            }
            else {
                return this.parsePrimary();
            }
        }
        parsePrimary() {
            const ch = this.peek();
            if (ch === '(') {
                this.consume(); // consume '('
                const value = this.parseExpression();
                this.skipSpaces();
                if (this.peek() !== ')') {
                    throw new Error('Missing closing parenthesis');
                }
                this.consume(); // consume ')'
                return value;
            }
            else {
                return this.parseNumber();
            }
        }
        parseNumber() {
            const start = this.pos;
            while (this.pos < this.input.length && /\d/.test(this.input[this.pos])) {
                this.pos++;
            }
            if (this.pos === start) {
                throw new Error('Expected number');
            }
            return BigInt(this.input.substring(start, this.pos));
        }
    };
    main();
    Now, we;
    need;
    to;
    ensure;
    that;
    the;
    parser;
    handles;
    unary;
    signs;
    correctly in all;
    cases.For;
    example, "3 * -2";
    works: parseFactor -  > parseUnary;
    sees;
    '-', consumes, then;
    recursively;
    parseUnary -  > parsePrimary -  > parseNumber;
    2 -  > returns;
    2, then;
    unary;
    returns - 2, factor;
    returns - 2, term;
    multiplies;
    3 * -2;
    -6.;
    But;
    note: In;
    parseUnary, we;
    call;
    this.peek();
    after;
    skipping;
    spaces.In;
    the;
    of;
    "3 * -2", after;
    parsing;
    factor;
    for (3, we; go; to)
        parseTerm;
    's while loop, peek sees ' * ', consume, then parseFactor -> parseUnary: peek sees ' - ', consume, then recursively parseUnary: peek sees ';
    2;
    ', parsePrimary -> parseNumber returns 2, then unary returns -2. Good.;
    What;
    about;
    "3 - -2" ? parseExpression : left = parseTerm -  > parseFactor -  > parseUnary -  > parsePrimary -  > 3.;
    Then;
    while ()
        : peek;
    sees;
    '-', consume, then;
    parseTerm: parseFactor -  > parseUnary;
    peek;
    sees;
    '-', consume, then;
    recursively;
    parseUnary: peek;
    sees;
    '2', parsePrimary -  > 2, unary;
    returns - 2, factor;
    returns - 2, term;
    returns - 2.;
    Then;
    left = 3 - (-2);
    5.;
    What;
    about;
    "- - 5" ? parseUnary : peek;
    sees;
    '-', consume, then;
    recursively;
    parseUnary: peek;
    sees;
    '-', consume, then;
    recursively;
    parseUnary: peek;
    sees;
    '5', parsePrimary -  > 5, then;
    unary;
    returns - 5 ? Actually : ;
    first;
    unary: after;
    consuming;
    '-', it;
    calls;
    parseUnary;
    recursively.That;
    recursive;
    call;
    sees;
    '-', consumes, then;
    calls;
    parseUnary;
    recursively;
    again, which;
    sees;
    '5', returns;
    5.;
    So;
    the;
    inner;
    unary;
    returns - 5, then;
    the;
    outer;
    unary;
    returns - (-5);
    5.;
    So;
    result;
    5.;
    What;
    about;
    "+ - 5" ? parseUnary : peek;
    '+', consume, then;
    recursively;
    parseUnary: sees;
    '-', consume, then;
    recursively;
    parseUnary: sees;
    '5', returns;
    5, then;
    unary;
    returns - 5, then;
    outer;
    returns - 5.;
    So;
    result - 5.;
    What;
    about;
    "3 * - - 5" ? parseTerm : factor;
    for (3, then; '*', then; factor)
        : parseUnary: sees;
    '-', consume, then;
    recursively;
    parseUnary: sees;
    '-', consume, then;
    recursively;
    parseUnary: sees;
    '5', returns;
    5, then;
    unary;
    returns - 5, then;
    unary;
    returns - (-5);
    5 ? Wait : The;
    first;
    '-';
    consumes, then;
    calls;
    parseUnary.That;
    parseUnary;
    sees;
    '-', consumes, calls;
    parseUnary, which;
    returns;
    5.;
    So;
    the;
    inner;
    unary;
    returns - 5.;
    Then;
    the;
    outer;
    unary(the, first, '-');
    returns - (-5);
    5.;
    So;
    factor;
    returns;
    5.;
    Then;
    term;
    multiplies;
    3 * 5;
    15.;
    But;
    is;
    that;
    correct ? The : ;
    expression;
    "3 * - - 5";
    is;
    ambiguous ? Typically : , unary;
    minus;
    applies;
    to;
    the;
    next;
    number, so - -5;
    is - (-5);
    5, so;
    3 * 5;
    15.;
    Yes.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    handle;
    spaces;
    correctly.In;
    parseUnary, we;
    call;
    this.peek();
    which;
    skips;
    spaces.So;
    after;
    consuming;
    a;
    sign, we;
    need;
    to;
    skip;
    spaces;
    before;
    checking;
    the;
    next;
    character.That;
    's done because peek skips spaces. However, in the recursive call, we call parseUnary again, which will first call peek to skip spaces and then check sign. So spaces are handled.;
    Now, we;
    need;
    to;
    consider;
    the;
    where;
    after;
    a;
    sign, there;
    is;
    a;
    parenthesis: "3 * (-5)".In;
    parseFactor -  > parseUnary;
    sees;
    '*', then;
    parseFactor -  > parseUnary;
    peek;
    sees;
    '(', not;
    a;
    sign, so;
    goes;
    to;
    parsePrimary, which;
    sees;
    '(';
    and;
    then;
    parses;
    expression;
    inside.Inside;
    expression, parseTerm -  > parseFactor -  > parseUnary;
    sees;
    '-', consumes, then;
    recursively;
    parseUnary: sees;
    '5', returns;
    5, unary;
    returns - 5, then;
    parsePrimary;
    returns - 5, then;
    expression;
    returns - 5, then;
    primary;
    returns - 5.;
    So;
    factor;
    returns - 5, term;
    multiplies;
    3 * -5;
    -15.;
    Good.
        Now, we;
    need;
    to;
    handle;
    division;
    truncation: using BigInt, division, it;
    's fine.;
    Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't have any issues with negative zero? BigInt zero is 0n, and -0n is 0n. So fine.;
    Now, we;
    need;
    to;
    output;
    the;
    result;
    integer.Using;
    console.log(result.toString());
    will;
    output;
    without;
    decimal.
        Now, we;
    need;
    to;
    consider;
    if (the)
        input;
    may;
    contain;
    multiple;
    lines ? The : ;
    problem;
    says;
    one;
    line;
    containing;
    the;
    expression.So;
    we;
    read;
    one;
    line, but;
    there;
    could;
    be;
    trailing;
    newline.We;
    trim.
        Now, we;
    need;
    to;
    ensure;
    that;
    we;
    don;
    't use any external packages, only built-in.;
    Now, we;
    need;
    to;
    return only;
    TypeScript;
    code, no;
    explanation;
    and;
    no;
    Markdown;
    fence.
        Thus, final;
    code;
    should;
    be;
    But;
    we;
    must;
    ensure;
    that;
    the;
    parser;
    handles;
    the;
    where;
    there;
    is;
    no;
    expression ? Probably : ;
    not.
        Now, we;
    should;
    test;
    with (some)
        examples;
    mentally.
        Example;
    1;
    "1 + 2";
    3.;
    Example;
    2;
    "3 * 4 - 5";
    12 - 5;
    7.;
    Example;
    3;
    "2 + 3 * 4";
    2 + 12;
    14.;
    Example;
    4;
    "5 / 2";
    2(truncates, toward, zero).Using;
    BigInt, 5n / 2n;
    2n.
        Example;
    5;
    "-5 / 2";
    -2n ? Actually - 5n / 2n : ;
    -2n(since - 5 / 2, -2.5, trunc, toward, zero, gives - 2).Yes.
        Example;
    6;
    "5 / -2";
    -2n.
        Example;
    7;
    "-5 / -2";
    2n.
        Example;
    8;
    "3 * -2";
    -6n.
        Example;
    9;
    "- - 5";
    5n.
        Example;
    10;
    "1 + 2 + 3";
    6.;
    Example;
    11;
    "(1 + 2) * 3";
    9.;
    Example;
    12;
    "1 + 2 * (3 + 4)";
    1 + 2 * 7;
    15.;
    Example;
    13;
    "1 + 2 * 3 / 4";
    1 + 6 / 4;
    1 + 1;
    2 ? Actually : ;
    6 / 4;
    1(trunc), so;
    1 + 1;
    2.;
    Example;
    14;
    "1 + 2 * 3 / 4 + 5";
    1 + 1 + 5;
    7.;
    Example;
    15;
    "1 + 2 * (3 / 4)";
    1 + 2 * 0;
    1.;
    All;
    good.
        Now, we;
    need;
    to;
    ensure;
    that;
    the;
    parser;
    doesn;
    't accidentally treat a unary sign as binary when it';
    s;
    ambiguous ? In : ;
    our;
    grammar, after;
    parsing;
    a;
    term, we;
    check;
    for ('+'; or; '-')
        for (binary.But; what; )
            if (we)
                have;
    something;
    like;
    "3 - -2" ? After : ;
    parsing;
    first;
    term(3), we;
    see;
    '-', we;
    treat;
    it;
    minus, then;
    we;
    parse;
    term.That;
    term;
    's factor';
    s;
    parseUnary;
    will;
    see;
    the;
    second;
    '-';
    and;
    treat;
    it;
    it;
    's correct.;
    What;
    about;
    "3 - - 2" ? The : ;
    spaces;
    don;
    't matter.;
    Now, what;
    about;
    "3 - ( -2 )" ? After : ;
    binary;
    '-', we;
    parse;
    term, which;
    will;
    parse;
    factor -  > parseUnary -  > sees;
    '(' ? Actually : ;
    parseFactor -  > parseUnary;
    peek;
    sees;
    '(', not;
    a;
    sign, so;
    goes;
    to;
    parsePrimary, which;
    sees;
    '(';
    and;
    then;
    parses;
    expression.Inside;
    expression, parseTerm -  > parseFactor -  > parseUnary;
    sees;
    '-', consumes, then;
    recursively;
    parseUnary: sees;
    '2', returns;
    2, unary;
    returns - 2, then;
    expression;
    returns - 2, then;
    primary;
    returns - 2.;
    So;
    term;
    returns - 2, then;
    binary;
    subtract: ;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
