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
Object.defineProperty(exports, "__esModule", { value: true });
Thinking;
Process: 1. ** Understand;
the;
Goal:  ** The;
user;
wants;
a;
complete;
TypeScript;
program;
for (Node.js; that; evaluates)
    arithmetic;
expressions.The;
constraints;
are;
strict: no `eval`, `Function`, `vm`, or;
external;
packages.It;
must;
handle;
integers, spaces, parentheses, binary;
operators(`+`, `-`, `*`, `/`), and;
unary;
operators(`+`, `-`).Division;
truncates;
toward;
zero.Precedence;
is;
unary, then;
multiplicative, then;
additive.Input;
is;
read;
via `fs.readFileSync(0, "utf8")`.Output;
is;
the;
integer;
result.The;
code;
must;
be;
raw;
TypeScript;
without;
Markdown;
fences;
or;
explanations.
;
2. ** Analyze;
the;
Requirements:  **
    *  ** Language;
 ** TypeScript(Node.js, compatible).
    *  ** Input;
 ** `fs.readFileSync(0, "utf8")`.
    *  ** Output;
 ** Evaluated;
integer(printed, to, console).
    *  ** Expression;
Features:  **
    * Integers(positive, negative).
    * Spaces(ignore).
    * Parentheses(nested).
    * Binary;
Operators: `+`, `-`, `*`, `/`.
    * Unary;
Operators: `+`, `-`(precedence, higher, than, binary).
    * Division;
Truncate;
toward;
zero(e.g., `5/2 = 2`, `-5/2 = -2`).
    *  ** Constraints;
 **
    * No `eval`, `Function`, `vm`.
    * No;
external;
packages.
    * Implement;
a;
real;
parser;
or;
shunting - yard.
    * Read;
from;
stdin;
via `fs`.
    * Return;
only;
code, no;
markdown.
;
3. ** Choose;
the;
Algorithm:  **
    *  ** Shunting - yard;
algorithm ** is;
suitable;
for (converting; infix; to)
    postfix(RPN), then;
evaluating.
    *  ** Recursive;
Descent ** is;
also;
good;
for (parsing.
    * Given; the; specific)
    precedence;
rules(Unary > Multiplicative > Additive), a;
recursive;
descent;
parser;
structure;
is;
often;
cleaner;
to;
implement in TypeScript;
for (type; safety, but; Shunting - yard)
    is;
robust.
    * Let;
's go with a **Recursive Descent Parser** approach because it handles precedence naturally via function definitions.
    *  ** Grammar;
 **
    * `Expression` -  > `Term`(`+` | `-`) *
    * `Term` -  > `Factor`(`*` | `/`) *
    * `Factor` -  > `Number` | `(` `Expression` `)` | `+` `Factor` | `-` `Factor`
    *  ** Correction;
on;
Unary;
Precedence:  ** The;
prompt;
says;
"unary +/-, then * and /, then + and -".
    * This;
implies `+`;
and `-`;
operators;
have;
the;
highest;
precedence.
    * Standard;
recursive;
descent: 
    * `parseExpression`;
handles `+` `-`(left, associative).
    * `parseTerm`;
handles `*` `/`(left, associative).
    * `parseFactor`;
handles `(` `)`, numbers, and;
unary `+` `-`.
    *  ** Wait, standard;
precedence:  ** Usually, unary;
operators;
bind;
tighter;
than;
multiplication.E.g., `-2 * 3`;
is `(-2) * 3`, not `-(2 * 3)`.The;
prompt;
confirms: "unary +/-, then * and /, then + and -".
    *  ** Truncation;
 ** Division;
should;
use `Math.trunc(a / b)`;
or;
manual;
integer;
division;
logic;
for (negative; numbers. `Math.trunc`; truncates)
    toward;
zero.
    *  ** Input;
Reading:  ** `fs.readFileSync(0, "utf8")`;
returns;
a;
string.Trim;
whitespace ? The : ;
parser;
should;
ignore;
spaces.
    *  ** Tokenization;
 ** First, convert;
the;
string;
into;
tokens(Numbers, Operators, Parentheses).
    *  ** Parsing;
 ** Implement;
the;
grammar.
;
4. ** Drafting;
the;
Code;
Structure:  **
    *  ** Imports;
 ** `fs`, `path`(maybe, not, needed).
    *  ** Tokenization;
 **
    * Regex;
to;
match;
digits, `+`, `-`, `*`, `/`, `(`, `)`, ` `.
    * Skip;
spaces.
    * Handle;
multi - digit;
numbers.
    *  ** Parser;
Class / Functions;
 **
    * `pos`;
current;
index.
    * `tokens`;
array.
    * `peek()`;
get;
current;
token.
    * `consume()`;
move;
to;
next.
    * `parseExpression()`;
calls `parseTerm`, loops;
on `+` `-`.
    * `parseTerm()`;
calls `parseFactor`, loops;
on `*` `/`.
    * `parseFactor()`;
handles `(` `)`, numbers, unary `+` `-`.
    *  ** Evaluation;
 **
    * Return;
numbers;
directly.
    * Apply;
unary `-`;
by;
negating;
the;
result;
of `Factor`.
    * Apply;
binary;
operations;
by;
storing;
intermediate;
values.
;
5. ** Refining;
Precedence & Associativity;
 **
    *  ** Additive(`+`, `-`);
 ** Left;
associative. `a + b - c`;
is `(a + b) - c`. `parseExpression`;
does `val = parseTerm(); while (op == '+' or '-') { ... }`.
    *  ** Multiplicative(`*`, `/`);
 ** Left;
associative. `a * b / c`;
is `(a * b) / c`. `parseTerm`;
does;
similar.
    *  ** Unary(`+`, `-`);
 ** Prefix.Handled in `parseFactor`.
    *  ** Division;
 ** `Math.trunc(val1 / val2)`.
    *  ** Unary;
Precedence:  ** `+` `-`;
applied;
before `*` `/`.The;
grammar `Factor`;
calls `parseFactor`;
recursively;
for (unary; ops. `Term`; calls `Factor`.This)
    ensures `Unary > Multiplicative`.
    ;
6. ** Edge;
Cases:  **
    * Spaces;
inside;
numbers ? No : , regex;
handles;
digits.
    * `--5` ? Unary : ;
handling;
should;
support;
it.
    * `5.5` ? Prompt : ;
says;
"integers".Assume;
inputs;
are;
integers.
    * Empty;
input ? Handle : ;
gracefully.
    * Division;
by;
zero ? Prompt : ;
doesn;
't specify, assume valid inputs or throw. Let';
s;
assume;
valid;
inputs;
per;
"All intermediate values fit...".
;
7. ** Implementation;
Details:  **
    *  ** Tokenizer;
 **
    * Iterate;
char;
by;
char.
    * If;
digit, accumulate.
    * If;
symbol, emit.
    *  ** Parser;
 **
    * `parseExpression`;
returns;
number.
    * `parseTerm`;
returns;
number.
    * `parseFactor`;
returns;
number.
    *  ** Error;
Handling:  ** Basic;
checks(e.g., unexpected, token).
    *  ** Division;
 ** `Math.trunc`;
is;
safe;
for (JS; numbers; )
    if (they)
        fit in safe;
integers(2 ^ 53).The;
prompt;
says;
"All intermediate values fit in JavaScript safe integers".
    *  ** Unary;
Minus:  ** `parseFactor`;
needs;
to;
distinguish;
unary `-`;
from;
binary `-`.
    * In `parseExpression`, we;
consume `+`;
or `-`.
    * In `parseFactor`, we;
check;
if (the)
    current;
token;
is `+`;
or `-`.If;
so, it;
's unary.
    * Wait, `parseExpression`;
handles;
binary `+` `-`. `parseFactor`;
handles;
unary `+` `-`.
    * How;
to;
distinguish ?
        * Standard : ;
approach: `parseFactor`;
looks;
at;
current;
token.If `+`;
or `-`;
or `(`;
or;
number, it;
consumes;
and;
recurses.
    * `parseExpression`;
calls `parseTerm`. `parseTerm`;
calls `parseFactor`.
    * `parseExpression`;
checks `+` `-` * after * `parseTerm`;
returns.
    * If `parseFactor`;
sees `+`, it;
consumes;
it;
and;
calls `parseFactor`;
again.
    * The;
key;
is;
that `parseExpression`;
only;
consumes `+`;
or `-`;
if (they)
    are * between * terms.
        * So `parseFactor`;
consumes;
the;
unary;
operators.
    * Logic;
    * `parseExpression`;
    * `left = parseTerm()`
    * ;
while (`peek() == '+' || peek() == '-'`)
    : 
        * `op = consume()`
        * `right = parseTerm()`
        * apply;
op
    * `parseTerm`;
    * `left = parseFactor()`
    * ;
while (`peek() == '*' || peek() == '/'`)
    : 
        * `op = consume()`
        * `right = parseFactor()`
        * apply;
op
    * `parseFactor`;
    * ;
if (`peek() == '('`)
    : 
        * `consume()`
        * `val = parseExpression()`
        * `expect(')')`
        * ;
return `val`
    * ;
if (`peek() == '+'`)
    or `peek() == '-'`;
    * `op = consume()`
    * `val = parseFactor()`
    * ;
return `op == '+' ? val : -val`
    * ;
if (`peek()`)
    is;
number: 
    * `consume()`
    * ;
return `num`
    * ;
error.
    * Wait, does `parseExpression`;
handle;
the;
precedence;
correctly ?
        * `parseExpression` : ;
calls `parseTerm`.
    * `parseTerm`;
calls `parseFactor`.
    * `parseFactor`;
handles;
unary `+` `-`.
    * So `+` `-` in `parseExpression`;
are;
binary.
    * `*` `/` in `parseTerm`;
are;
binary.
    * This;
structure;
ensures;
Unary > Multiplicative > Additive.
    * Yes, this;
matches;
standard;
arithmetic;
grammar.
    *  ** Division;
 ** `Math.trunc(a / b)`.
    *  ** Unary;
 ** `+`;
returns `val`, `-`;
returns `-val`.
    *  ** Input;
 ** `fs.readFileSync(0, "utf8")`.
    *  ** Output;
 ** `console.log(result)`.
;
8. ** Code;
Assembly:  **
    * Define;
tokenizer.
    * Define;
parser.
    * Main;
execution;
block.
    * Ensure;
no `eval`.
    * Ensure;
types;
are;
correct;
for (TS.
    *  ** Tokenizer; Logic; )
    :  **
        * Regex;
`/\d+|[+\-*/() ]/g`.
    * Wait, `+`;
and `-`;
need;
to;
be;
distinguished;
from;
spaces.
    * Actually, just;
iterate;
chars.
    * State;
machine;
or;
simple;
regex;
match.
    * Let;
's use regex `/\d+|[+\-*/() ]/g`.
    * Filter;
out;
spaces.
    * Store;
of;
strings / objects.
    * Actually, keep;
it;
simple.Token;
types: `NUMBER`, `PLUS`, `MINUS`, `TIMES`, `DIVIDE`, `LPAREN`, `RPAREN`.
    * Regex;
`(\d+|[+\-*/()])`.
    * Skip;
spaces.
    * Better;
Iterate;
char;
by;
char.
    * If;
digit: build;
number;
string.
    * If `(`;
push `LPAREN`.
    * If `)`;
push `RPAREN`.
    * If `+`, `-`, `*`, `/`;
push;
operator.
    * If;
space: skip.
    * This;
handles;
multi - digit;
numbers;
correctly.
    * Wait, how;
to;
distinguish;
unary `-`;
from;
binary `-` ?
        * The : ;
parser;
logic;
handles;
this;
contextually.
    * Tokenizer;
just;
produces `-`.Parser;
decides.
    *  ** Type;
Definitions:  **
    * `TokenType`;
var ;
(function () {
})( || ( = {}));
    * `Token`;
interface.
    *  ** Division;
 **
    * `Math.trunc`;
works.
    *  ** Imports;
 **
    * `import * as fs from 'fs';`
    *  ** Execution;
 **
    * `const input = fs.readFileSync(0, 'utf8').trim();`
    * `const tokens = tokenize(input);`
    * `const result = parse(tokens);`
    * `console.log(result);`;
9. ** Refining;
the;
Code:  **
    * Make;
sure `parse`;
returns `number`.
    * Handle;
end;
of;
tokens.
    * Ensure `peek()`;
handles;
index;
out;
of;
bounds.
    * Ensure `consume()`;
checks;
validity.
    * Ensure `Math.trunc`;
is;
used;
for (division.
    *  ** One; tricky; )
    ;
 ** `parseFactor`;
sees `+`.It;
consumes;
it;
and;
calls `parseFactor`;
again.
    * `parseExpression`;
calls `parseTerm`. `parseTerm`;
calls `parseFactor`.
    * So `+`;
at;
the;
start;
of;
expression;
goes;
to `parseFactor`(Unary).
    * `+`;
between;
terms;
goes;
to `parseExpression`(Binary).
    * This;
is;
correct.
    *  ** Division;
 ** `5 / -2`.
    * `parseExpression` -  > `parseTerm` -  > `parseFactor`(5) -  > `parseTerm`;
loop(no `*` / `/`).
    * Wait, `5 / -2`.
    * `parseExpression`;
starts. `left = parseTerm`.
    * `parseTerm`;
starts. `left = parseFactor`.
    * `parseFactor`;
consumes `5`.
    * `parseTerm`;
sees `/`.Consumes.Calls `parseFactor`;
for (right.
    * `parseFactor`; sees `-`.Consumes; unary.Calls `parseFactor`.
    * `parseFactor`)
    consumes `2`.
        * Returns `2`.
        * Unary;
logic;
returns `-2`.
    * `parseTerm`;
computes `5 / -2`.
    * `parseExpression`;
returns;
result.
    * Correct.
    *  ** Wait, `Math.trunc`;
behavior:  **
    * `Math.trunc(-1.9) = -1`.
    * `5 / 2 = 2`. `Math.trunc(2.5) = 2`.
    * `-5 / 2 = -2.5`. `Math.trunc(-2.5) = -2`.
    * Correct.
;
10. ** Final;
Check;
on;
Constraints:  **
    * No `eval`.
    * No `Function`.
    * No `vm`.
    * No;
external;
packages.
    * Read `fs.readFileSync(0, "utf8")`.
    * Return;
only;
code, no;
markdown.
    *  ** Code;
Formatting:  ** Ensure;
valid;
TS;
syntax.
    *  ** Imports;
 ** `import * as fs from 'fs';`.
    *  ** Tokenizer;
 **
    * Regex `(\d+|[+\-*/()])`.
    * Iterate;
chars.
    * If;
digit: accumulate.
    * If;
other;
char: emit;
token.
    * Skip;
spaces.
    * Convert `+` `NUMBER`;
to `PLUS` `NUMBER`.
    * Wait, `+` `NUMBER`;
could;
be;
unary;
or;
binary.
    * Tokenizer;
doesn;
't care. Parser does.
    * So;
Tokenizer;
emits `+`, `-`, `*`, `/`
    *  ** Parser;
State:  **
    * Class `Parser`.
    * `tokens: Token[]`.
    * `pos: number`.
    * `tokens[pos]`;
access.
    * `peek()`;
checks `tokens[pos]`.
    * `consume()`;
increments `pos`.
    *  ** Types;
 **
    * `interface TokenType { kind: 'NUMBER' | 'PLUS' | 'MINUS' | 'TIMES' | 'DIVIDE' | 'LPAREN' | 'RPAREN'; value?: string | number; }`
    * Wait, `NUMBER`;
value;
is;
the;
parsed;
int.Others;
are;
symbols.
    *  ** Division;
Implementation:  **
    * `a / b` -  > `Math.trunc(a / b)`.
    *  ** Error;
Handling:  **
    * Throw;
error;
for (unexpected; tokens; or)
    mismatched;
parentheses.
    * The;
prompt;
asks;
for (a; program, not; necessarily)
    a;
perfect;
error;
message;
system, but;
it;
should;
run;
for (valid; inputs.
    * I; will)
    add;
basic;
checks.
    *  ** Code;
 **
    * Wrap in module.
    * Export;
nothing, just;
run.
    *  ** Wait, `parseFactor`;
logic:  **
    * If `token.kind === 'PLUS'`;
consume, recurse `parseFactor`.
    * If `token.kind === 'MINUS'`;
consume, recurse `parseFactor`, negate;
result.
    * If `token.kind === 'NUMBER'`;
consume, ;
return value.
    * If `token.kind === 'LPAREN'`;
consume, recurse `parseExpression`, expect `RPAREN`.
    * This;
is;
correct.
    *  ** Wait, `parseTerm`;
logic:  **
    * `val = parseFactor()`
    * ;
while (`peek() === 'TIMES'`)
    or `peek() === 'DIVIDE'`;
    * op;
consume()
    * right;
parseFactor()
    * ;
if (op === 'TIMES')
    : val = val * right
        * ;
else
    : val = Math.trunc(val / right)
        * Correct.
        *  ** Wait, `parseExpression`;
logic:  **
    * `val = parseTerm()`
    * ;
while (`peek() === 'PLUS'`)
    or `peek() === 'MINUS'`;
    * op;
consume()
    * right;
parseTerm()
    * ;
if (op === 'PLUS')
    : val = val + right
        * ;
else
    : val = val - right
        * Correct.
        *  ** Wait, `parseFactor`;
Unary;
Precedence:  **
    * Unary;
binds;
to;
the;
Factor.
    * The;
Factor;
is;
a;
Term.
    * My;
recursive;
structure: `Factor` -  > `Term` -  > `Expression`.
    * Wait, usually `Expression` -  > `Term` -  > `Factor`.
    * Let;
's re-verify the grammar hierarchy.
    * Grammar;
    * Expr -  > Term;
{
    (+ | -);
    Term;
}
    * Term -  > Factor;
{
    ( *  | /);
    Factor;
}
    * Factor -  > (Expr) | Number | {}(+ | -);
Factor;
    * This;
ensures: 
    * Unary(`+` `-`, inside, Factor) > Multiplicative(`*` `/`, inside, Term) > Additive(`+` `-`, inside, Expr).
    * Wait, `Factor`;
calls `parseExpression`;
for (parentheses.
    * `Factor`; calls `parseFactor`; )
    for (unary.
        * `Term`; calls `parseFactor`.
        * `Expr`; calls `parseTerm`.
        * So `Factor`)
        is;
the;
lowest;
level. `Expr`;
is;
highest;
level(lowest, precedence).
    * Wait, Precedence;
    * Unary(Highest)
    * Multiplicative
    * Additive(Lowest)
    * My;
structure: 
    * `Expr`;
handles;
Additive(Lowest).
    * `Term`;
handles;
Multiplicative(Middle).
    * `Factor`;
handles;
Unary(Highest).
    * This;
is;
correct. `Expr`;
calls `Term`. `Term`;
calls `Factor`. `Factor`;
handles;
Unary.
    * So `Factor` -  > `Expr`(Parentheses) -  > `Term` -  > `Factor`(Unary).
    * Yes.
    * Wait, `parseFactor`;
logic: 
    * If `(`, consume, call `parseExpression`.
    * If `+` / `-`, consume, call `parseFactor`.
    * If;
Number, consume.
    * This;
is;
correct.
    *  ** Wait, `parseExpression`;
calls `parseTerm`. **
    * `parseTerm`;
calls `parseFactor`.
    * `parseFactor`;
handles `+` `-`.
    * So `+`;
inside `parseFactor`;
is;
unary.
    * `+`;
inside `parseExpression`;
is;
binary.
    * This;
works.
    *  ** Wait, `parseExpression`;
loops;
on `+` `-`. **
    * `parseTerm`;
returns;
a;
value(which, might, have, internal, unary, ops).
    * Then `parseExpression`;
checks;
for (binary `+` `-`.
    * This; is; correct.
    *  ** One)
    detail:  ** `Math.trunc`;
is;
available in standard;
JS.
    *  ** Imports;
 ** `import * as fs from 'fs';`.
    *  ** Output;
 ** `console.log(result)`.
    *  ** Final;
Check:  ** "Return only TypeScript code, no explanation and no Markdown fence."
    * I;
need;
to;
ensure;
the;
output;
is;
just;
the;
code;
block;
without `` `ts.

    *   **Wait, `;
parseFactor ` recursion for unary:**
        *   `;
if (token.kind === 'PLUS') {
    consume();
    return parseFactor();
}
`
        *   `;
if (token.kind === 'MINUS') {
    consume();
    return -parseFactor();
}
`
        *   This is correct.

    *   **Tokenizer:**
        *   Input: `;
1 + 2 `.
        *   Tokens: `;
NUMBER(1) `, `;
PLUS `, `;
NUMBER(2) `.
        *   Input: `;
1 + 2 `.
        *   Tokens: `;
NUMBER(1) `, `;
PLUS `, `;
NUMBER(2) `.
        *   Input: ` - 5 `.
        *   Tokens: `;
MINUS `, `;
NUMBER(5) `.
        *   Input: `--;
5 `.
        *   Tokens: `;
MINUS `, `;
MINUS `, `;
NUMBER(5) `.
        *   Parser: `;
parseFactor ` (MINUS) -> `;
parseFactor ` (MINUS) -> `;
parseFactor ` (NUMBER) -> `;
parseExpression ` -> ...
        *   This handles `--;
5 ` as ` - (-(5));
5 `. Correct.

    *   **Implementation:**
        *   Write the tokenizer function.
        *   Write the parser class.
        *   Write the main block.
        *   Make sure `;
tokens ` are objects or enums.
        *   Use a simple enum for TokenKind.

    *   **TokenKind:**
        *   `;
NUMBER `, `;
PLUS `, `;
MINUS `, `;
TIMES `, `;
DIVIDE `, `;
LPAREN `, `;
RPAREN `.
        *   `;
Token ` interface: `;
kind: TokenKind;
value: string | number `.
        *   For `;
NUMBER `, value is the integer.
        *   For others, value is not used (or null).

    *   **Tokenizer Logic:**
        *   `;
const str = input;
`
        *   `;
let i = 0;
`
        *   `;
while (i < str.length) {
    `
        *   `;
    if (str[i] === ' ') {
        i++;
        continue;
    }
    `
        *   `;
    if (/\d/.test(str[i])) {
        `
        *   `;
        let j = i;
        `
        *   `;
        while (j < str.length && /\d/.test(str[j]))
            j++;
        `
        *   `;
        tokens.push({ kind: 'NUMBER', value: parseInt(str.slice(i, j), 10) });
        `
        *   `;
        i = j;
        `
        *   `;
    }
    else {
        `
        *   `;
        const c = str[i];
        `
        *   `;
        if (c === '+')
            tokens.push({ kind: 'PLUS' });
        `
        *   `;
        if (c === '-')
            tokens.push({ kind: 'MINUS' });
        `
        *   `;
        if (c === '*')
            tokens.push({ kind: 'TIMES' });
        `
        *   `;
        if (c === '/')
            tokens.push({ kind: 'DIVIDE' });
        `
        *   `;
        if (c === '(')
            tokens.push({ kind: 'LPAREN' });
        `
        *   `;
        if (c === ')')
            tokens.push({ kind: 'RPAREN' });
        `
        *   `;
        {
            throw new Error(`Unknown character: ${c}`);
        }
        `
        *   `;
        i++;
        `
        *   `;
    }
    `
        *   `;
}
`

    *   **Parser Logic:**
        *   Class `;
ArithmeticParser `.
        *   `;
tokens: Token[] `, `;
pos: number `.
        *   `;
peek() `, `;
consume() `.
        *   `;
parseExpression() `, `;
parseTerm() `, `;
parseFactor() `.
        *   Helper `;
expect(kind) `.

    *   **Main:**
        *   `;
const input = fs.readFileSync(0, 'utf8').trim();
`
        *   `;
if (!input)
    return;
`
        *   `;
const parser = new ArithmeticParser(tokenize(input));
`
        *   `;
const result = parser.parseExpression();
`
        *   `;
console.log(result);
`

    *   **Wait, `;
Math.trunc `**:
        *   If `;
val / right ` is negative, `;
Math.trunc ` works correctly.
        *   Example: ` - 5 / 2;
-2.5 `. `;
Math.trunc(-2.5) = -2 `.
        *   Example: `;
5 / -2;
-2.5 `. `;
Math.trunc(-2.5) = -2 `.
        *   Example: ` - 5 / -2;
2.5 `. `;
Math.trunc(2.5) = 2 `.
        *   Correct.

    *   **Wait, one detail:** `;
parseExpression ` checks for binary ` + ` ` - `.
        *   `;
parseTerm ` returns a value.
        *   If `;
peek() === PLUS `, consume, parse `;
parseTerm ` (right), add.
        *   This ensures `;
1 + 2 * 3 ` -> `;
1 + (2 * 3) ` because `;
parseTerm ` consumes ` * ` before `;
parseExpression ` sees it.
        *   Correct.

    *   **Wait, `;
parseFactor ` checks for unary ` + ` ` - `.**
        *   If `;
peek() === MINUS `, consume, parse `;
parseFactor `, negate.
        *   This ensures ` - 2 * 3 ` -> `(-2) * 3 ` because `;
parseFactor ` consumes the first ` - ` inside the term.
        *   Correct.

    *   **Wait, `;
parseFactor ` checks for `(`.**
        *   If `, peek() === LPAREN `, consume, parse `, parseExpression `, expect `, RPAREN `.
        *   This ensures `(1 + 2) * 3 ` -> `((1 + 2)) * 3 `.
        *   Correct.

    *   **Wait, `, parseFactor ` checks for `, NUMBER `.**
        *   If `, peek() === NUMBER `, consume, return value.
        *   Correct.

    *   **Wait, `, parseExpression ` checks for end.**
        *   Does not need to check. Just call `, parseExpression ` at start.
        *   Does `, parseExpression ` need to check if `, peek() ` is empty?
        *   If input is empty, tokenizer returns empty array. `, parseExpression ` calls `, parseTerm `. `, parseTerm ` calls `, parseFactor `. `, parseFactor ` checks `, peek() `.
        *   If `, pos >= tokens.length `, throw error.
        *   This handles empty input gracefully.

    *   **Wait, `, parseExpression ` loop:**
        *   `);
while (peek() === PLUS || peek() === MINUS)
    `
        *   `;
op = consume() `
        *   `;
right = parseTerm() `
        *   `;
`
        *   Correct.

    *   **Wait, `;
parseTerm ` loop:**
        *   `;
while (peek() === TIMES || peek() === DIVIDE)
    `
        *   `;
op = consume() `
        *   `;
right = parseFactor() `
        *   `;
`
        *   Correct.

    *   **Wait, `;
parseFactor `:**
        *   `;
if (peek() === LPAREN)
    ;
`
        *   `;
if (peek() === PLUS || peek() === MINUS)
    ;
`
        *   `;
if (peek() === NUMBER)
    ;
`
        *   `;
throw ;
`
        *   Correct.

    *   **Wait, `;
parseFactor ` Unary:**
        *   `;
op = consume() `
        *   `;
return op === PLUS ? parseFactor() : -parseFactor() `
        *   Correct.

    *   **Wait, `;
parseFactor ` Parenthesis:**
        *   `;
consume() ` (LPAREN)
        *   `;
val = parseExpression() `
        *   `;
expect(RPAREN) `
        *   `;
return val `
        *   Correct.

    *   **Wait, `;
parseFactor ` Number:**
        *   `;
consume() `
        *   `;
return token.value `
        *   Correct.

    *   **Wait, `;
parseExpression ` Binary:**
        *   `;
left = parseTerm() `
        *   `;
while (peek() === PLUS || peek() === MINUS) { }
`
        *   Correct.

    *   **Wait, `;
parseTerm ` Binary:**
        *   `;
left = parseFactor() `
        *   `;
while (peek() === TIMES || peek() === DIVIDE) { }
`
        *   Correct.

    *   **Wait, Tokenizer `;
NUMBER `:**
        *   `;
parseInt ` handles leading zeros correctly (0, 01, etc).
        *   Prompt says "integers". `;
parseInt ` is fine.
        *   Wait, `;
parseInt("007") ` returns `;
7 `.
        *   Is that okay? Yes.
        *   Wait, negative numbers in input: `;
"-5" `. Tokenizer handles ` - ` then `;
5 `.
        *   Tokenizer: `;
MINUS `, `;
NUMBER(5) `.
        *   Parser: `;
parseFactor ` (MINUS) -> `;
parseFactor ` (NUMBER 5) -> ` - 5 `.
        *   Correct.

    *   **Wait, `;
parseExpression ` Binary `;
MINUS `:**
        *   `;
left - right `.
        *   `;
parseTerm ` returns left.
        *   `;
parseTerm ` loop finishes.
        *   `;
parseExpression ` sees ` - `.
        *   Consumes.
        *   Calls `;
parseTerm `.
        *   Correct.

    *   **Wait, `;
parseExpression ` Binary `;
PLUS `:**
        *   `;
left + right `.
        *   Correct.

    *   **Wait, Division:**
        *   `;
Math.trunc(left / right) `.
        *   Correct.

    *   **Wait, `;
expect ` helper:**
        *   `;
if (pos >= tokens.length || tokens[pos].kind !== expected)
    throw ;
`
        *   Correct.

    *   **Wait, imports:**
        *   `;
const fs = __importStar(require("fs"));
`
        *   This is required.

    *   **Wait, TS strictness:**
        *   ` // @ts-nocheck` might be needed if I'm lazy, but I should write valid TS.
    * I;
will;
write;
valid;
TS;
without `@ts-nocheck`.
    *  ** Wait, `Math.trunc`;
 **
    * Available in global;
scope.
    *  ** Wait, `Number`;
type:  **
    * Return;
type `number`.
    *  ** Wait, `fs.readFileSync`;
 **
    * `const input = fs.readFileSync(0, 'utf8').trim();`
    * If;
input;
is;
empty;
string, `trim()`;
makes;
it;
empty.
    * Tokenizer;
returns;
empty;
array.
    * Parser;
throws;
error;
or;
returns `undefined` ?
        * Prompt : ;
says;
"Input: one line containing the expression."
    * Assume;
valid;
expression.
    * If;
empty, `parseFactor`;
throws;
error.
    * I;
'll let it throw.
    *  ** Wait, `parseFactor`;
check;
for (end; ; )
    :  **
        * `if (pos >= tokens.length) throw ...`
        * This;
is;
needed.
    *  ** Wait, `parseExpression`;
check;
for (end; ; )
    :  **
        * `const left = parseTerm();`
        * `while (peek() === PLUS || peek() === MINUS) ...`
        * `parseTerm`;
calls `parseFactor`;
which;
checks `pos`.
    * So `pos`;
check;
is;
handled in `parseFactor`.
    *  ** Wait, `parseTerm`;
check;
for (end; ; )
    :  **
        * `const left = parseFactor();`
        * `while (peek() === TIMES || peek() === DIVIDE) ...`
        * Handled.
        *  ** Wait, `parseExpression`;
check;
for (end; ; )
    :  **
        * No;
check;
inside, relies;
on `parseTerm`.
    * Wait, `parseExpression`;
starts;
with (`parseTerm`.
    * `parseTerm`)
    starts;
with (`parseFactor`.
    * `parseFactor`)
    checks `pos`.
        * If `pos`;
is;
at;
end, `parseFactor`;
throws.
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === PLUS || peek() === MINUS)`.
    * If `pos`;
is;
at;
end, `peek()`;
handles;
it.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === TIMES || peek() === DIVIDE)`.
    * Correct.
    *  ** Wait, `parseFactor`;
 **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseFactor`;
unary:  **
    * `if (peek() === PLUS || peek() === MINUS)`.
    * `op = consume()`.
    * `val = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
number:  **
    * `if (peek() === NUMBER)`.
    * `val = token.value`.
    * Correct.
    *  ** Wait, `parseFactor`;
parenthesis:  **
    * `if (peek() === LPAREN)`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect(RPAREN)`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseExpression`;
binary:  **
    * `left = parseTerm()`.
    * `while (peek() === PLUS || peek() === MINUS)`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === PLUS`;
add, ;
sub.
    * Correct.
    *  ** Wait, `parseTerm`;
binary:  **
    * `left = parseFactor()`.
    * `while (peek() === TIMES || peek() === DIVIDE)`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === TIMES`;
mul, ;
div.
    * Correct.
    *  ** Wait, `parseExpression`;
initial;
call:  **
    * `return parseExpression()`.
    * Correct.
    *  ** Wait, `fs.readFileSync`;
 **
    * `import * as fs from 'fs';`
    * This;
is;
valid;
TS.
    *  ** Wait, `console.log`;
 **
    * Valid.
    *  ** Wait, `trim()`;
 **
    * `input.trim()`.
    * Removes;
leading / trailing;
whitespace.
    * Spaces;
inside;
are;
handled;
by;
tokenizer(skipped).
    * Correct.
    *  ** Wait, `parseInt`;
 **
    * `parseInt(str.slice(i, j), 10)`.
    * Correct.
    *  ** Wait, `expect`;
logic:  **
    * `if (pos >= tokens.length || tokens[pos].kind !== kind) throw ...`
    * Correct.
    *  ** Wait, `peek`;
logic:  **
    * `if (pos >= tokens.length) throw ...`
    * `return tokens[pos];`
    * Correct.
    *  ** Wait, `consume`;
logic:  **
    * `return tokens[pos++];`
    * Correct.
    *  ** Wait, `parseFactor`;
logic:  **
    * `if (pos >= tokens.length) throw ...`
    * `const token = tokens[pos];`
    * `if (token.kind === 'LPAREN') ...`
    * `else if (token.kind === 'PLUS' || token.kind === 'MINUS') ...`
    * `else if (token.kind === 'NUMBER') ...`
    * `else throw ...`
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === 'PLUS'`;
left += right.
    * `else`;
left -= right.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary:  **
    * `left = parseFactor()`.
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === 'TIMES'`;
left *= right.
    * `else`;
left = Math.trunc(left / right).
    * Correct.
    *  ** Wait, `parseExpression`;
Unary:  **
    * No, Unary;
is in `parseFactor`.
    * Correct.
    *  ** Wait, `import`;
 **
    * `import * as fs from 'fs';`
    * Correct.
    *  ** Wait, `console.log`;
 **
    * `console.log(result);`
    * Correct.
    *  ** Wait, `Math.trunc`;
 **
    * Global;
function () { }
    * Correct.
    *  ** Wait, `Token`;
definition:  **
    * `interface Token { kind: TokenKind; value: number | null; }`
    * `enum TokenKind { NUMBER, PLUS, MINUS, TIMES, DIVIDE, LPAREN, RPAREN }`
    * Correct.
    *  ** Wait, `parseFactor`;
Unary;
Precedence:  **
    * Unary;
is;
highest.
    * `parseFactor`;
handles;
Unary.
    * `parseTerm`;
calls `parseFactor`.
    * `parseExpression`;
calls `parseTerm`.
    * So `Unary > Multiplicative > Additive`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary;
Associativity:  **
    * Left;
associative.
    * `left = parseTerm(); while (peek() === '+' or '-') { right = parseTerm(); ... }`.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary;
Associativity:  **
    * Left;
associative.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary;
Associativity:  **
    * Prefix. `--5` -  > `-( - (5) )`.
    * `parseFactor`;
consumes `MINUS`, calls `parseFactor`, which;
consumes `MINUS`, calls `parseFactor`, which;
consumes `NUMBER`.
    * Returns `val`.
    * Returns `-val`.
    * Returns `-(-val)`.
    * Correct.
    *  ** Wait, `Math.trunc`;
 **
    * `Math.trunc`;
is;
available in ES6 + .
    * Node.js;
supports;
it.
    * Correct.
    *  ** Wait, `parseInt`;
 **
    * `parseInt("123", 10)`.
    * Correct.
    *  ** Wait, `fs.readFileSync`;
 **
    * `import * as fs from 'fs';`.
    * Correct.
    *  ** Wait, `parseExpression`;
start:  **
    * `return parseExpression();`
    * Correct.
    *  ** Wait, `parseExpression`;
check:  **
    * No;
check;
needed;
inside.
    * `parseTerm`;
calls `parseFactor`;
which;
checks `pos`.
    * Correct.
    *  ** Wait, `parseFactor`;
check:  **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `if (token.kind === 'PLUS' || token.kind === 'MINUS')`.
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `if (token.kind === 'LPAREN')`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `if (token.kind === 'NUMBER')`.
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === 'PLUS'`;
left += right.
    * `else`;
left -= right.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary:  **
    * `left = parseFactor()`.
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === 'TIMES'`;
left *= right.
    * `else`;
left = Math.trunc(left / right).
    * Correct.
    *  ** Wait, `parseFactor`;
check:  **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseExpression`;
start:  **
    * `return parseExpression();`
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `if (token.kind === 'PLUS' || token.kind === 'MINUS')`.
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `if (token.kind === 'LPAREN')`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `if (token.kind === 'NUMBER')`.
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === 'PLUS'`;
left += right.
    * `else`;
left -= right.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary:  **
    * `left = parseFactor()`.
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === 'TIMES'`;
left *= right.
    * `else`;
left = Math.trunc(left / right).
    * Correct.
    *  ** Wait, `parseFactor`;
check:  **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseExpression`;
start:  **
    * `return parseExpression();`
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `if (token.kind === 'PLUS' || token.kind === 'MINUS')`.
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `if (token.kind === 'LPAREN')`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `if (token.kind === 'NUMBER')`.
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === 'PLUS'`;
left += right.
    * `else`;
left -= right.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary:  **
    * `left = parseFactor()`.
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === 'TIMES'`;
left *= right.
    * `else`;
left = Math.trunc(left / right).
    * Correct.
    *  ** Wait, `parseFactor`;
check:  **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseExpression`;
start:  **
    * `return parseExpression();`
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `if (token.kind === 'PLUS' || token.kind === 'MINUS')`.
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `if (token.kind === 'LPAREN')`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `if (token.kind === 'NUMBER')`.
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * `if op === 'PLUS'`;
left += right.
    * `else`;
left -= right.
    * Correct.
    *  ** Wait, `parseTerm`;
Binary:  **
    * `left = parseFactor()`.
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * `if op === 'TIMES'`;
left *= right.
    * `else`;
left = Math.trunc(left / right).
    * Correct.
    *  ** Wait, `parseFactor`;
check:  **
    * `if (pos >= tokens.length) throw ...`
    * Correct.
    *  ** Wait, `parseExpression`;
start:  **
    * `return parseExpression();`
    * Correct.
    *  ** Wait, `parseExpression`;
loop:  **
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    * `op = consume()`.
    * `right = parseTerm()`.
    * Correct.
    *  ** Wait, `parseTerm`;
loop:  **
    * `while (peek() === 'TIMES' || peek() === 'DIVIDE')`.
    * `op = consume()`.
    * `right = parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Unary:  **
    * `if (token.kind === 'PLUS' || token.kind === 'MINUS')`.
    * `op = consume()`.
    * `return op === 'PLUS' ? parseFactor() : -parseFactor()`.
    * Correct.
    *  ** Wait, `parseFactor`;
Parenthesis:  **
    * `if (token.kind === 'LPAREN')`.
    * `consume()`.
    * `val = parseExpression()`.
    * `expect('RPAREN')`.
    * `return val`.
    * Correct.
    *  ** Wait, `parseFactor`;
Number:  **
    * `if (token.kind === 'NUMBER')`.
    * `consume()`.
    * `return token.value`.
    * Correct.
    *  ** Wait, `parseExpression`;
Binary:  **
    * `left = parseTerm()`.
    * `while (peek() === 'PLUS' || peek() === 'MINUS')`.
    *
;
