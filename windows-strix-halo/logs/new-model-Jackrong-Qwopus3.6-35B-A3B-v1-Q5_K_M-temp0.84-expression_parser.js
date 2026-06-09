"use strict";
number: number
    | Op;
op: '+' | '-' | '*' | '/';
isUnary: boolean ? // only for + and -
    But : ;
note: the;
problem;
does;
not;
require;
to;
distinguish in the;
output, but;
we;
need;
to;
know in the;
shunting - yard.
    Alternatively, we;
can;
create;
two;
tokens: UnaryPlus, UnaryMinus,
    BinaryPlus, BinaryMinus,
    Mul, Div,
    LParen, RParen,
    Number;
Then;
we;
can;
assign;
precedence;
and;
associativity;
to;
each.
    Let;
's do that.;
Token;
types: Number(n);
UnaryPlus;
UnaryMinus;
BinaryPlus;
BinaryMinus;
Mul;
Div;
LParen;
RParen;
Precedence;
and;
associativity: UnaryPlus: 3, right;
UnaryMinus: 3, right;
Mul: 2, left;
Div: 2, left;
BinaryPlus: 1, left;
BinaryMinus: 1, left;
How;
to;
distinguish in tokenization;
When;
we;
see;
a;
'+';
or;
'-';
and;
the;
condition;
for (unary; holds, we; create)
    UnaryPlus;
or;
UnaryMinus.
    Otherwise, we;
create;
BinaryPlus;
or;
BinaryMinus.
;
Steps;
for (tokenization; ; )
    : tokens: Token[];
i = 0;
while (i < len)
    : skip;
space;
if (i >= len)
    : break;
if (digit)
    : parse;
number(including, sign ? Actually : , we, are, going, to, parse, the, number, and, then, the, unary, operator, will, be, separate.But, note, the, number, might, be, negative ? Actually : , we, are, going, to, handle, the, sign, via, unary, operator.So, we, parse, the, number ? But : , wait, the, input, might, have, -5 -  > we, want, to, parse, the, minus, and, then, 5., So, we, parse, the, number, without, sign.
    Actually, we, can, parse, the, number, start = i);
while (i < len)
    and;
digit: i++;
num = parseInt(s.slice(start, i));
tokens.push(Number(num));
continue;
if (s[i])
    is;
'(';
or;
')';
tokens.push();
if ('(')
    then;
LParen;
RParen;
i++;
continue;
if (s[i])
    is;
'*';
or;
'/';
tokens.push();
if (s[i] == '*')
    then;
Mul;
Div;
i++;
continue;
if (s[i])
    is;
'+';
or;
'-';
// check if unary
if (i == 0)
    or;
tokens.length == 0;
or(tokens.length > 0, and, tokens[tokens.length - 1], is, LParen, or, is, an, Op(UnaryPlus, UnaryMinus, BinaryPlus, BinaryMinus, Mul, Div));
or(tokens.length > 0, and, tokens[tokens.length - 1], is, RParen ? Actually : , after, a, closing, parenthesis, we, might, have, an, operator ? Example : (5) + -3 -  > after, ')', we, have, a, binary, operator ? But : , wait, the, token, after, ')', is, a, binary, operator ? Actually : , no,  in (5) + -3, after, ')', we, have, a, space, and, then, '+', which, is, binary.Then, we, have, a, space, and, then, '-', which, is, unary.So, the, last, token, is, '+'(binary), and, then, we, see, '-' -  > so, the, condition, last, token, is, an, operator -  > so, unary.
    Actually, the, condition);
if (i == 0 -  > unary)
    ;
else if (last)
    token;
is;
LParen -  > unary;
if (last)
    token;
is;
an;
Op(any, operator, UnaryPlus, UnaryMinus, BinaryPlus, BinaryMinus, Mul, Div) -  > unary;
But;
note: what;
about;
after;
a;
closing;
parenthesis ? Example : (5) - -3 -  > after;
')';
we;
have;
a;
binary;
minus ? Then : ;
we;
have;
a;
unary;
minus.The;
last;
token;
is;
BinaryMinus -  > so;
condition;
holds.
    So;
if (i == 0)
    or;
tokens.length == 0;
or(tokens.length > 0, and(tokens[tokens.length - 1], is, LParen, or, tokens[tokens.length - 1], is, an, Op)) -  > unary;
But;
wait: what;
about;
after;
a;
number ? Then : ;
the;
last;
token;
is;
Number -  > so;
binary.
    So;
if (i == 0)
    or;
tokens.length == 0;
or(tokens.length > 0, and(tokens[tokens.length - 1] instanceof LParen || tokens[tokens.length - 1] instanceof Op)) -  > unary;
However, note;
we;
have;
to;
check;
the;
type.We;
can;
do
    : let lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
while ();
if (i == 0 || !lastToken || (lastToken instanceof LParen) || (lastToken instanceof Op)) {
    // unary
    if (s[i] == '+' -  > UnaryPlus)
        ;
    else
        - > UnaryMinus;
}
else {
    // binary
    if (s[i] == '+' -  > BinaryPlus)
        ;
    else
        - > BinaryMinus;
}
i++;
error -  > unknown;
character;
Then;
we;
have;
tokens.
    Shunting - yard;
algorithm: output: Token[]; // postfix
stack: Token[]; // operators and parentheses
for (each; token in tokens; )
    : if (token)
        is;
Number: output.push(token);
if (token)
    is;
UnaryPlus;
or;
UnaryMinus: 
// push to stack? But note: unary operators are right-associative and have high precedence.
// We push to stack.
stack.push(token);
if (token)
    is;
Op(BinaryPlus, BinaryMinus, Mul, Div);
while (stack)
    is;
not;
empty;
and(stack.top, is, Op, or, UnaryPlus / Minus);
and((stack.top), precedence > token, precedence);
or(stack.top, precedence == token, precedence, and, token, is, left - associative);
and;
stack.top;
is;
not;
LParen: output.push(stack.pop());
stack.push(token);
if (token)
    is;
LParen: stack.push(token);
if (token)
    is;
RParen: while (stack.top)
    is;
not;
LParen: output.push(stack.pop());
stack.pop(); // remove LParen
// But note: if after removing LParen, the stack top is a unary operator? We don't pop it here because we only pop until LParen.
while (stack)
    is;
not;
empty: output.push(stack.pop());
However, note;
unary;
operators;
are;
right - associative.So;
when;
we;
have;
a;
unary;
operator;
on;
the;
stack;
and;
we;
see;
a;
new operator(say, binary * ), we;
should;
pop;
the;
unary;
operator;
because;
its;
precedence;
is;
higher.But;
if (we)
    see;
another;
unary;
operator, we;
don;
't pop because they are right-associative? Actually, the rule for right-associative: we don';
t;
pop;
if (the)
    new operator;
has;
the;
same;
precedence ? But : ;
unary;
operators;
are;
right - associative;
and;
we;
are;
going;
to;
push;
the;
new unary;
operator;
on;
top.Then;
when;
we;
evaluate, we;
will;
evaluate;
the;
top;
one;
first ? Actually : ,  in RPN;
evaluation, the;
order;
matters.
    Example;
--5;
tokens: [UnaryMinus, UnaryMinus, Number(5)];
output: [UnaryMinus, UnaryMinus, Number(5)] -  > but;
that;
's not correct.;
Actually, the;
shunting - yard;
for (right - associative; operators; )
    : we;
don;
't pop when the new operator has the same precedence? ;
We;
need;
to;
adjust;
the;
condition: while (stack)
    is;
not;
empty;
and(stack.top, is, Op, or, UnaryPlus / Minus);
and(stack.top, precedence > token, precedence);
or(stack.top, precedence == token, precedence, and, token, is, left - associative);
and;
stack.top;
is;
not;
LParen: For;
unary;
operators, they;
are;
right - associative.So;
when;
we;
have;
a;
unary;
operator;
on;
the;
stack;
and;
we;
see;
a;
new operator(same, precedence);
that;
is;
left - associative ? Actually : , unary;
operators;
are;
not;
left - associative.So;
we;
should;
not;
pop;
a;
unary;
operator;
when;
we;
see;
a;
new unary;
operator ?
    Example : --5;
tokens: [UnaryMinus, UnaryMinus, Number(5)];
Step1: output: [Number(5)] -  > no, wait, we;
process;
tokens;
one;
by;
one.
    Token1;
UnaryMinus -  > push;
to;
stack: stack = [UnaryMinus];
Token2: UnaryMinus -  >
    Check;
stack;
top;
is;
UnaryMinus(precedence, 3);
and;
current;
token;
is;
UnaryMinus(precedence, 3);
and;
token;
is;
right - associative ? Actually : , we;
are;
pushing;
the;
current;
token.The;
condition: while (stack.top)
    precedence > token;
precedence ? 3 > 3 : ;
false.
    or(stack.top, precedence == token, precedence, and, token, is, left - associative) -  > token;
is;
right - associative, so;
condition;
false.
;
So;
we;
push: stack = [UnaryMinus, UnaryMinus];
Token3: Number(5) -  > output;
[Number(5)];
Then;
we;
pop;
the;
stack: output = [Number(5), UnaryMinus, UnaryMinus];
Now;
evaluation: We;
have;
RPN: 5;
UnaryMinus;
UnaryMinus -  >
    Evaluate;
UnaryMinus: apply;
to;
top;
of;
stack: 5 -  > -5;
Then;
apply;
UnaryMinus;
again: -5 -  > 5 ?
    But : ;
we;
want;
5 ? Actually : , --5;
5.;
So;
that;
works.
;
But;
what;
about: 5 * -3;
tokens: [Number(5), Mul, UnaryMinus, Number(3)];
Step1: output: [5];
Step2: Mul -  > push;
to;
stack: stack = [Mul];
Step3: UnaryMinus -  >
    Check;
stack;
top;
is;
Mul(precedence, 2);
and;
current;
token;
is;
UnaryMinus(precedence, 3).
    Condition;
stack.top;
precedence > token;
precedence ? 2 > 3 : ;
false.
    Condition;
stack.top;
precedence == token;
precedence ? 2 == 3 : ;
false.
;
So;
we;
push: stack = [Mul, UnaryMinus];
Step4: Number(3) -  > output;
[5, 3];
Then;
pop;
stack: output = [5, 3, UnaryMinus, Mul];
Evaluation: 5, 3 -  > push;
5, push;
3;
UnaryMinus: pop;
3 -  > -3, push - 3;
Mul: pop - 3;
and;
5 -  > 5 * (-3);
-15 -  > correct.
;
What;
about: -5 * 3;
tokens: [UnaryMinus, Number(5), Mul, Number(3)];
Step1: UnaryMinus -  > stack;
[UnaryMinus];
Step2: Number(5) -  > output;
[5];
Step3: Mul -  >
    Check;
stack;
top;
is;
UnaryMinus(3);
and;
current;
token;
is;
Mul(2).
    Condition;
stack.top;
precedence(3) > current;
token;
precedence(2) -  > true -  > so;
pop;
UnaryMinus;
to;
output.
;
Then;
stack: [Mul];
and;
output: [5, UnaryMinus];
Then;
push;
Mul: stack = [Mul];
Step4: Number(3) -  > output;
[5, UnaryMinus, 3];
Then;
pop;
stack: output = [5, UnaryMinus, 3, Mul];
Evaluation: 5 -  > push;
5;
UnaryMinus: pop;
5 -  > -5, push - 5;
3 -  > push;
3;
Mul: pop;
3;
and - 5 -  > -5 * 3;
-15 -  > correct.
;
So;
the;
shunting - yard;
condition;
for (popping; ; )
    : while (stack)
        is;
not;
empty;
and(stack.top, is, Op, or, UnaryPlus / Minus);
and(stack.top, precedence > token, precedence);
or(stack.top, precedence == token, precedence, and, token, is, left - associative);
and;
stack.top;
is;
not;
LParen: But;
note: the;
condition;
"stack.top is not LParen";
is;
already;
handled;
because;
we;
don;
't pop LParen.;
However, we;
have;
to;
be;
careful: the;
condition;
for (popping; is; that)
    the;
top;
of;
the;
stack;
has;
higher;
precedence;
than;
the;
current;
token, or;
same;
precedence;
and;
the;
current;
token;
is;
left - associative.
;
For;
unary;
operators, they;
are;
right - associative, so;
when;
we;
see;
a;
new operator;
with (the)
    same;
precedence, we;
don;
't pop the unary operator? Actually, we don';
t;
pop;
because;
the;
condition;
for (same; precedence; only)
    pops;
if (the)
    current;
token;
is;
left - associative.But;
unary;
operators;
are;
not;
left - associative, so;
we;
don;
't pop.;
But;
what;
if (we)
    have: 5 * -3 * 2;
tokens: [5, Mul, UnaryMinus, 3, Mul, 2];
Step1: output = [5];
Step2: Mul -  > stack;
[Mul];
Step3: UnaryMinus -  >
    Check;
stack;
top;
Mul(2);
and;
current;
token;
UnaryMinus(3);
2 > 3;
false, 2 == 3;
false -  > push;
stack = [Mul, UnaryMinus];
Step4: 3 -  > output;
[5, 3];
Step5: Mul -  >
    Check;
stack;
top;
UnaryMinus(3);
and;
current;
token;
Mul(2);
3 > 2;
true -  > pop;
UnaryMinus;
to;
output: output = [5, 3, UnaryMinus], stack = [Mul];
Then;
check;
stack;
top;
Mul(2);
and;
current;
token;
Mul(2);
same;
precedence, and;
current;
token;
is;
left - associative ? Yes : , because;
Mul;
is;
left - associative -  > pop;
Mul;
to;
output: output = [5, 3, UnaryMinus, Mul], stack = [];
Then;
push;
current;
Mul: stack = [Mul];
Step6: 2 -  > output;
[5, 3, UnaryMinus, Mul, 2];
Then;
pop;
stack: output = [5, 3, UnaryMinus, Mul, 2, Mul];
Evaluation: 5 -  > push;
5;
3 -  > push;
3;
UnaryMinus: pop;
3 -  > -3, push - 3;
Mul: pop - 3;
and;
5 -  > 5 * (-3);
-15, push - 15;
2 -  > push;
2;
Mul: pop;
2;
and - 15 -  > -15 * 2;
-30 -  > correct.
;
So;
it;
works.
;
Evaluation;
of;
RPN: stack = [];
for (token in output)
    : if (token)
        is;
Number: stack.push(token.number);
if (token)
    is;
UnaryPlus: stack.push(stack.pop()); // no change
if (token)
    is;
UnaryMinus: stack.push(-stack.pop());
if (token)
    is;
Op: b = stack.pop();
a = stack.pop();
if (token)
    is;
BinaryPlus: stack.push(a + b);
if (token)
    is;
BinaryMinus: stack.push(a - b);
if (token)
    is;
Mul: stack.push(a * b);
if (token)
    is;
Div: stack.push(a / b); // truncates toward zero
Then;
the;
result;
is;
stack[0];
However, note;
the;
problem;
says;
division;
truncates;
toward;
zero.In;
JavaScript, division;
of;
integers;
truncates;
toward;
zero ? Actually : ,  in JavaScript, the;
division;
operator / ;
for (integers; truncates; toward)
    zero ? Let : ;
me;
check: 7 / 2;
3.5 -  > but;
we;
want;
integer;
division ? The : ;
problem;
says: "Division truncates toward zero.";
and;
"All intermediate values fit in JavaScript safe integers.";
But;
note: the;
problem;
says;
"integers", so;
we;
are;
doing;
integer;
division ? Actually : , the;
problem;
says;
"arithmetic expression containing integers", so;
we;
are;
to;
do
    integer;
while (division);
that;
truncates;
toward;
zero.
    However,  in JavaScript, the / operator;
does;
floating;
point;
division.So;
we;
have;
to;
use;
Math.trunc(a / b);
or(a / b) | 0 ? But : ;
note: a / b;
might;
be;
negative.
    Example;
7 / 2;
3.5 -  > trunc;
toward;
zero -  > 3
    - 7 / 2;
-3.5 -  > trunc;
toward;
zero -  > -3;
We;
can;
do
    : Math.trunc(a / b);
while (But);
note: the;
problem;
says;
"All intermediate values fit in JavaScript safe integers", so;
we;
can;
use: function div(a, b) {
    // truncate toward zero
    let quotient = a / b;
    // But quotient might be negative and we want to truncate toward zero: 
    // For positive: Math.floor(quotient) is the same as truncating toward zero? No, because Math.floor(3.5)=3, but Math.floor(-3.5)=-4 -> not truncating toward zero.
    // We can use: 
    //   if quotient >= 0: Math.floor(quotient)
    //   else: Math.ceil(quotient)
    // But easier: Math.trunc(quotient)
    return Math.trunc(quotient);
}
Alternatively, we;
can;
do
    : let result = a / b;
// But we want integer division that truncates toward zero.
// We can use: 
//   Math.trunc(a/b)   -> this truncates toward zero.
while (
// But we want integer division that truncates toward zero.
// We can use: 
//   Math.trunc(a/b)   -> this truncates toward zero.
So);
we;
'll use Math.trunc(a/b).;
But;
note: the;
problem;
says;
"All intermediate values fit in JavaScript safe integers", so;
we;
can;
use;
Number.isSafeInteger ? But : ;
we;
don;
't need to check because the problem says they fit.;
However, we;
must;
be;
cautious: the;
intermediate;
values;
might;
be;
negative;
and;
large, but;
within;
safe;
integer;
range.
    Let;
's code accordingly.;
Steps: 1.;
Read;
input;
from;
stdin: fs.readFileSync(0, "utf8").trim();
2.;
Tokenize;
3.;
Shunting - yard;
to;
RPN;
4.;
Evaluate;
RPN;
Let;
's define the token types:;
class Token {
}
class NumberToken extends Token {
}
class UnaryPlusToken extends Token {
}
class UnaryMinusToken extends Token {
}
class BinaryPlusToken extends Token {
}
class BinaryMinusToken extends Token {
}
class MulToken extends Token {
}
class DivToken extends Token {
}
class LParenToken extends Token {
}
class RParenToken extends Token {
}
Precedence;
and;
associativity: function precedence(token) {
    if (token instanceof UnaryPlusToken || token instanceof UnaryMinusToken)
        return 3;
    if (token instanceof MulToken || token instanceof DivToken)
        return 2;
    if (token instanceof BinaryPlusToken || token instanceof BinaryMinusToken)
        return 1;
    return 0; // should not happen for operators
}
function isLeftAssociative(token) {
    if (token instanceof UnaryPlusToken || token instanceof UnaryMinusToken)
        return false; // right-associative
    if (token instanceof BinaryPlusToken || token instanceof BinaryMinusToken || token instanceof MulToken || token instanceof DivToken)
        return true;
    return false;
}
Tokenization: function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const len = expr.length;
    while (i < len) {
        // skip space
        if (expr[i] === ' ') {
            i++;
            continue;
        }
        // digit
        if (expr[i] >= '0' && expr[i] <= '9') {
            let j = i;
            while (j < len && expr[j] >= '0' && expr[j] <= '9')
                j++;
            const num = parseInt(expr.slice(i, j));
            tokens.push(new NumberToken(num));
            i = j;
            continue;
        }
        // parentheses and operators
        if (expr[i] === '(') {
            tokens.push(new LParenToken());
            i++;
            continue;
        }
        if (expr[i] === ')') {
            tokens.push(new RParenToken());
            i++;
            continue;
        }
        if (expr[i] === '*') {
            tokens.push(new MulToken());
            i++;
            continue;
        }
        if (expr[i] === '/') {
            tokens.push(new DivToken());
            i++;
            continue;
        }
        if (expr[i] === '+' || expr[i] === '-') {
            // check if unary
            let isUnary = false;
            if (i === 0) {
                isUnary = true;
            }
            else {
                const lastToken = tokens[tokens.length - 1];
                if (lastToken instanceof LParenToken ||
                    lastToken instanceof UnaryPlusToken ||
                    lastToken instanceof UnaryMinusToken ||
                    lastToken instanceof BinaryPlusToken ||
                    lastToken instanceof BinaryMinusToken ||
                    lastToken instanceof MulToken ||
                    lastToken instanceof DivToken) {
                    isUnary = true;
                }
            }
            if (isUnary) {
                if (expr[i] === '+') {
                    tokens.push(new UnaryPlusToken());
                }
                else {
                    tokens.push(new UnaryMinusToken());
                }
            }
            else {
                if (expr[i] === '+') {
                    tokens.push(new BinaryPlusToken());
                }
                else {
                    tokens.push(new BinaryMinusToken());
                }
            }
            i++;
            continue;
        }
        // unknown character
        throw new Error(`Unknown character: ${expr[i]}`);
    }
    return tokens;
}
Shunting - yard;
function toRPN(tokens) {
    const output = [];
    const stack = [];
    for (const token of tokens) {
        if (token instanceof NumberToken) {
            output.push(token);
        }
        else if (token instanceof UnaryPlusToken || token instanceof UnaryMinusToken) {
            stack.push(token);
        }
        else if (token instanceof BinaryPlusToken || token instanceof BinaryMinusToken || token instanceof MulToken || token instanceof DivToken) {
            // while stack is not empty and top is an operator or unary and has higher precedence or same precedence and left-associative
            while (stack.length > 0) {
                const top = stack[stack.length - 1];
                if (top instanceof LParenToken) {
                    break;
                }
                if (top instanceof OpToken) { // but we have to check if it's an operator (including unary) and not LParen
                    const topPrec = precedence(top);
                    const tokenPrec = precedence(token);
                    if (topPrec > tokenPrec || (topPrec === tokenPrec && isLeftAssociative(token))) {
                        output.push(stack.pop());
                        continue;
                    }
                }
                break;
            }
            stack.push(token);
        }
        else if (token instanceof LParenToken) {
            stack.push(token);
        }
        else if (token instanceof RParenToken) {
            while (stack.length > 0 && !(stack[stack.length - 1] instanceof LParenToken)) {
                output.push(stack.pop());
            }
            if (stack.length > 0) {
                stack.pop(); // remove LParen
            }
            else {
                throw new Error("Mismatched parentheses");
            }
        }
    }
    while (stack.length > 0) {
        const top = stack.pop();
        if (top instanceof LParenToken) {
            throw new Error("Mismatched parentheses");
        }
        output.push(top);
    }
    return output;
}
Evaluation: function evaluateRPN(tokens) {
    const stack = [];
    for (const token of tokens) {
        if (token instanceof NumberToken) {
            stack.push(token.value);
        }
        else if (token instanceof UnaryPlusToken) {
            // no change
            // but we do: stack.push(stack.pop())
            stack.push(stack.pop());
        }
        else if (token instanceof UnaryMinusToken) {
            stack.push(-stack.pop());
        }
        else if (token instanceof BinaryPlusToken) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a + b);
        }
        else if (token instanceof BinaryMinusToken) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a - b);
        }
        else if (token instanceof MulToken) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(a * b);
        }
        else if (token instanceof DivToken) {
            const b = stack.pop();
            const a = stack.pop();
            // trunc toward zero
            stack.push(Math.trunc(a / b));
        }
    }
    return stack.pop();
}
Main: import * as fs from 'fs';
const expr = fs.readFileSync(0, 'utf8').trim();
const tokens = tokenize(expr);
const rpn = toRPN(tokens);
const result = evaluateRPN(rpn);
console.log(result);
Let;
's test with a few expressions:;
"1+2" -  > tokens;
[Number(1), BinaryPlus, Number(2)] -  > RPN;
[1, 2, +] -  > result;
3;
"1-2" -  > tokens;
[Number(1), BinaryMinus, Number(2)] -  > RPN;
[1, 2, -] -  > result;
-1;
"1*2" -  > tokens;
[Number(1), Mul, Number(2)] -  > RPN;
[1, 2,  * ] -  > result;
2;
"1/2" -  > tokens;
[Number(1), Div, Number(2)] -  > RPN;
[1, 2, /] -> result=0 (because 1/2 = 0.5 -  > trunc, toward, zero -  > 0,
    But, note, 1 / 2 in integer, division, is, 0.,
    "-5" -  > tokens, [UnaryMinus, Number(5)] -  > RPN, [5, UnaryMinus] -  > result, -5,
    "--5" -  > tokens, []];
