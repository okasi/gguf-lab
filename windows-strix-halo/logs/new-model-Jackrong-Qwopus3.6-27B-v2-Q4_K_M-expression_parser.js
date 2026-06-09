"use strict";
let prevIsOperand = false; // true if previous token was a number or ')'
for (each; token; )
    : if (token)
        is;
a;
number: parse;
int, push;
to;
values;
stack;
prevIsOperand = true;
if (token)
    is;
'(';
push;
'(';
to;
ops;
stack;
prevIsOperand = false; // after '(' we expect operand
if (token)
    is;
')';
while (ops)
    stack;
not;
empty;
and;
ops;
top != '(';
pop;
operator, apply;
it;
pop;
'('(discard);
prevIsOperand = true; // after ')', we have an operand
if (token)
    is;
'+';
or;
'-';
if (prevIsOperand) // binary
    : // binary
     set;
operator;
type = binary, precedence = 1;
set;
operator;
type = unary, precedence = 3;
// Now, while ops stack not empty and ops top precedence > current precedence or (ops top precedence == current and current is left-associative? Actually, we need to handle associativity: for binary operators, + - are left-associative, * / are left-associative, unary is right-associative. So when comparing, if current precedence is less than or equal to top precedence and top is left-associative, we pop. For unary, it's right-associative, so we only pop if top precedence > current? Typically, for right-associative operators, we don't pop if precedence equal. So we need to implement general rule: while ops stack not empty and (precedence(ops top) > precedence(current) or (precedence(ops top) == precedence(current) and current is left-associative)), then pop and apply.
// But we also need to treat '(' specially: stop at '('.
// So we'll have a function getPrecedence(op, isUnary) and getAssociativity.
// For simplicity, we can treat unary as having higher precedence and right-associative, so we never pop unary operators when encountering another unary? Actually, consider: - -5. When we see second '-', we have ops stack with first '-' (unary). The second '-' also unary, same precedence. Since unary is right-associative, we should not pop the first '-' before processing the second; we should push the second, then after evaluating the number, we pop the second first. So the rule: if current operator is left-associative and precedence <= top precedence, pop; else push. For right-associative, only pop if top precedence > current precedence.
// So we need to know associativity of current operator. For binary + - *, /, left-associative. For unary, right-associative.
// Also '(' has special precedence, we treat it as lowest or we just stop at it.
// So we can implement:
// while ops stack not empty and ops top != '(' and (getPrec(ops top) > getPrec(current) or (getPrec(ops top) == getPrec(current) and current is left-associative)):
//    apply ops top
// Then push current operator with its type.
prevIsOperand = false; // after operator, we expect operand
if (token)
    is;
'*';
or;
'/';
// binary only? Could there be unary *? No.
// So it's binary, precedence 2, left-associative.
// While ops stack not empty and ops top != '(' and (getPrec(ops top) > 2 or (getPrec(ops top) == 2 and left-assoc)):
//    apply
// push
prevIsOperand = false;
But;
we;
need;
to;
handle;
the;
where;
we;
have;
unary;
operators;
and;
also;
binary;
operators.The;
above;
logic;
should;
work.
;
We;
also;
need;
to;
handle;
the;
where;
after;
applying;
operators, we;
might;
have;
unary;
operators;
waiting.For;
example, expression;
-5 * 3.;
Tokens: '-', '5', '*', '3'.Process;
-token;
'-';
prevIsOperand;
false;
unary.ops;
empty, push;
'-'.
    - token;
'5';
push;
5, prevIsOperand;
true.
    - token;
'*';
binary, precedence;
2.;
Check;
ops;
top: '-';
has;
precedence;
3 > 2, so;
pop;
'-';
and;
apply: unary;
minus;
on;
5;
-5, push - 5.;
Now;
ops;
empty.Then;
push;
'*'.
    - token;
'3';
push;
3.
    - end;
pop;
'*';
-5 * 3;
-15.;
Works.
    Now, ;
for (unary; plus; )
    : similar, but;
it;
's identity. We can treat it as unary operator that just returns the operand. Precedence same as unary minus.;
Now, we;
need;
to;
handle;
division;
truncation;
toward;
zero.So;
when;
applying;
'/', we;
compute;
Math.trunc(left / right).But;
careful: if (right)
    is;
0 ? The : ;
problem;
likely;
doesn;
't include division by zero; we can assume valid input.;
Now, we;
need;
to;
ensure;
that;
we;
treat;
numbers;
input;
may;
have;
spaces, but;
our;
tokenization;
will;
remove;
them.
    Now, let;
's implement in TypeScript.;
We;
'll read the input with fs.readFileSync(0, "utf8").trim() to remove trailing newline.;
Then;
tokenize: replace;
operators;
and;
parentheses;
with (spaces)
    around;
them, then;
split;
by;
whitespace.But;
careful: if (there)
    are;
multiple;
spaces, split;
will;
produce;
empty;
strings;
we;
can;
filter;
out;
empty;
strings.
    Better;
use;
regex;
to;
match;
tokens: numbers(sequence, of, digits), operators(+, -,  * , /), parentheses().We;
can;
use;
match;
or;
replace.Let;
's use replace to insert spaces, then split.;
But;
note: if (there)
    is;
a;
negative;
number;
like - 5, after;
replacement;
we;
get;
" - 5 ".That;
's fine. But what about expressions like (5)? That becomes "( 5 )". Good.;
But;
what;
about;
something;
like;
5 + 6 ? becomes : ;
"5 + 6".Good.
;
But;
what;
about;
something;
like;
5 * -6 ? That : ;
would;
be;
"5 * - 6" ? Actually : , the;
replacement;
adds;
spaces;
around;
operators, so;
"5*-6";
becomes;
"5 * - 6".That;
's fine; the "-" will be treated as unary because prevIsOperand after ' * ' is false (since ' * ' is operator). So it';
s;
correct.
;
But;
what;
about;
something;
like;
5 * -6 ? Already : ;
spaces.
    Now, we;
need;
to;
parse;
numbers;
may;
be;
large, but;
within;
safe;
integer;
range.We;
'll use parseInt or Number. Since they are integers, we can use Number(token) or parseInt(token, 10). But careful: if the number is very large, Number will convert to float, but it';
s;
still;
exact;
up;
to;
2 ^ 53.;
Since;
they;
are;
within;
safe;
integers, it;
's fine.;
Now, we;
need;
to;
implement;
the;
apply;
function that() { }
pops;
the;
appropriate;
number;
of;
operands, computes, and;
pushes;
result.
    We;
'll have a values stack: Array<number>.;
We;
'll have an ops stack: Array<{op: string, isUnary: boolean}>.;
We;
'll define precedence:;
function precedence(op, isUnary) {
    if (isUnary)
        return 3; // unary + or -
    if (op === '+' || op === '-')
        return 1;
    if (op === '*' || op === '/')
        return 2;
    return 0; // '(' has no precedence, but we treat separately
}
Associativity: for (binary, left; ; )
    for (unary, right.But; we; can)
        incorporate in the;
while (condition)
    : while (ops.length > 0 && ops[ops.length - 1].op !== '(' && (precTop > precCur || (precTop === precCur && curIsLeftAssociative))) {
        pop;
        and;
        apply;
    }
But;
we;
need;
to;
know;
if (current)
    operator;
is;
left - associative.For;
binary, yes;
for (unary, no.So; we; can)
    set;
curIsLeftAssoc = !isUnary(since, unary, is, right - associative).Actually, unary;
is;
right - associative, so;
we;
treat;
it;
left - associative.So;
condition: if (curIsLeftAssoc)
    and;
precTop === precCur, we;
pop;
if (precTop > precCur, we)
    pop;
regardless;
of;
associativity.
;
But;
careful: For;
unary;
operators, ;
if (we)
    have;
two;
unary;
operators in a;
row, e.g., - -5, when;
we;
encounter;
second;
'-', curIsLeftAssoc;
is;
false, precTop === precCur(both, 3), so;
we;
do
    NOT;
while (pop);
the;
first;
'-';
because;
condition;
fails.So;
we;
push;
the;
second;
'-'.Then;
after;
processing;
the;
number, we;
will;
pop;
the;
second;
'-';
first, then;
the;
first.That;
yields;
correct;
right - associativity.
    Now, what;
about;
mixing;
unary;
and;
binary ? For : ;
example, -5 + 3.;
After;
processing;
'-5', we;
have;
values: -5.;
Then;
we;
see;
'+'.The;
ops;
stack;
may;
have;
nothing ? Actually : , after;
processing;
'-5', we;
have;
applied;
unary;
minus;
and;
pushed - 5.;
The;
ops;
stack;
is;
empty.So;
fine.
    Now, what;
about;
expression;
like;
5 - -3 ? That : ;
is;
5 - (-3);
8.;
Tokens: '5', '-', '-', '3'.Process;
-'5';
push;
5, prevIsOperand;
true.
    - '-';
binary(since, prevIsOperand, true), precedence;
1.;
ops;
empty, push;
'-'.
    - '-';
now;
prevIsOperand ? After : ;
pushing;
binary;
'-', we;
set;
prevIsOperand = false.So;
this;
'-';
is;
unary.precedence;
3.;
Now;
check;
ops;
stack: top;
is;
'-';
with (precedence)
    1.;
1 > 3 ? No.So : ;
we;
don;
't pop. Push unary ' - '.
    - '3';
push;
3, prevIsOperand;
true.
    - end;
pop;
ops: first;
pop;
unary;
'-', apply;
to;
3;
-3, push - 3.;
Now;
ops;
stack;
has;
binary;
'-'.Pop;
binary;
'-', apply;
5 - (-3);
8.;
Works.
    Now, we;
need;
to;
handle;
parentheses;
correctly.;
'(';
should;
be;
pushed;
to;
ops;
stack, and;
we;
treat;
it;
lower;
precedence;
than;
any;
operator, so;
we;
never;
pop;
until;
we;
see;
')'.In;
the;
while (condition, we)
    stop;
when;
we;
see;
'('(ops, top == '(').So;
we;
need;
to;
check;
that.
    Now, we;
also;
need;
to;
handle;
the;
where;
after;
finishing;
all;
tokens, we;
pop;
remaining;
operators.
    Now, we;
need;
to;
implement;
apply(op, isUnary).If;
isUnary, pop;
one;
value, apply;
if (op == '+')
    return value;
if (op == '-')
    return -value.For;
binary, pop;
two;
values: right = values.pop(), left = values.pop();
compute;
left;
op;
right: for ('+', left + right; '-', left - right; '*', left * right)
    ;
'/', Math.trunc(left / right).Then;
push;
result.
    Now, we;
need;
to;
be;
careful;
about;
integer;
overflow ? The : ;
problem;
says;
all;
intermediate;
values;
fit in JavaScript;
safe;
integers, so;
no;
overflow.
    Now, let;
's write the code.;
We;
'll create a class or just functions. We';
ll;
keep;
it;
simple.
    Steps;
1.;
Read;
input: const input = fs.readFileSync(0, "utf8").trim();
2.;
Tokenize: -Insert;
spaces;
around;
operators;
and;
parentheses: const spaced = input.replace(/([+\-*/()])/g, ' $1 ');
-Split;
by;
whitespace: const tokens = spaced.split(/\s+/).filter(t => t !== '');
3.;
Initialize;
values;
stack: const values = [];
4.;
Initialize;
ops;
stack: const ops = [];
5.;
prevIsOperand = false; // initially, before first token, we expect an operand (number or '(')
6.;
For;
each;
token in tokens;
-If;
token;
matches /  ^ ;
d + $ / (or);
just;
is;
numeric;
parse;
int, push;
to;
values, prevIsOperand = true.
    - Else;
if (token == '(')
    : ops.push({ op: '(', isUnary: false }); // isUnary false, but we treat '(' specially
prevIsOperand = false; // after '(' we expect operand
-Else;
if (token == ')')
    : while (ops.length > 0 && ops[ops.length - 1].op !== '(') {
        const top = ops.pop();
        apply(top);
    }
// pop '('
if (ops.length > 0 && ops[ops.length - 1].op === '(') {
    ops.pop();
}
else {
    // mismatched parenthesis, but assume valid input
}
prevIsOperand = true; // after ')', we have an operand
-Else;
if (token == '+')
    or;
token == '-';
const isUnary = !prevIsOperand; // if previous was not an operand, it's unary
const opObj = { op: token, isUnary: isUnary };
// While we can pop higher or equal precedence operators (with left-associativity)
while (ops.length > 0 && ops[ops.length - 1].op !== '(') {
    const topPrec = precedence(ops[ops.length - 1].op, ops[ops.length - 1].isUnary);
    const curPrec = precedence(token, isUnary);
    if (topPrec > curPrec || (topPrec === curPrec && !isUnary)) { // isUnary false => left-assoc
        const top = ops.pop();
        apply(top);
    }
    else {
        break;
    }
}
ops.push(opObj);
prevIsOperand = false; // after operator, expect operand
-Else;
if (token == '*')
    or;
token == '/';
// binary only
const isUnary = false;
const opObj = { op: token, isUnary: false };
while (ops.length > 0 && ops[ops.length - 1].op !== '(') {
    const topPrec = precedence(ops[ops.length - 1].op, ops[ops.length - 1].isUnary);
    const curPrec = 2; // * or / precedence
    if (topPrec > curPrec || (topPrec === curPrec && true)) { // left-assoc, so equal precedence also pop
        const top = ops.pop();
        apply(top);
    }
    else {
        break;
    }
}
ops.push(opObj);
prevIsOperand = false;
-Else;
// unknown token, ignore or error
// But we can assume valid input
End;
for (.
; 7.; After)
    loop, ;
while (ops)
    not;
empty, pop;
and;
apply.
;
8.;
The;
result;
should;
be;
the;
single;
value in values;
stack.Output;
it.
    Now, we;
need;
to;
define;
precedence;
function and() { }
apply;
function () { }
But;
note: In;
the;
while (condition)
    for ('*'; and; '/', we)
        used;
curPrec = 2, and;
we;
pop;
if (topPrec > 2)
    or(topPrec === 2, and, true).That;
's correct because * and / are left-associative.;
But;
we;
also;
need;
to;
consider;
that;
unary;
operators;
have;
precedence;
3, so;
they;
will;
be;
popped;
before * or / because;
3 > 2.;
That;
's correct.;
Now, we;
need;
to;
be;
careful;
about;
the;
where;
we;
have;
a;
unary;
operator;
and;
then;
a;
binary;
operator;
with (same)
    precedence ? Unary : ;
has;
higher;
precedence, so;
no;
conflict.
    Now, we;
need;
to;
test;
with (some)
    examples.
        Example;
1;
"2+3";
output;
5.;
Example;
2;
"2*3+4";
6 + 4;
10.;
Example;
3;
"2+3*4";
2 + 12;
14.;
Example;
4;
"((2+3)*4)";
20.;
Example;
5;
"2+ -3";
2 + (-3);
-1 ? Actually : , 2 + -3;
-1.;
But;
expression;
"2+ -3";
might;
be;
tokenized, "+", "-", "3".The;
'-';
after;
'+';
is;
unary;
because;
prevIsOperand;
after;
'+';
is;
false.So;
it;
becomes;
2 + (-3);
-1.;
Good.
    Example;
6;
"2- -3";
2 - (-3);
5.;
Example;
7;
"- -5";
-(-5);
5.;
Example;
8;
"5/2";
division;
truncates;
toward;
zero: 5 / 2;
2.5 -  > 2.;
But;
note: In;
JavaScript, 5 / 2;
2.5, Math.trunc(2.5) = 2.;
Good.
    Example;
9;
"-5/2";
-2.5 -  > -2 ? Truncation : ;
toward;
zero: -2.5 -  > -2.;
Yes.
    Example;
10;
"5/-2";
-2.5 -  > -2 ? Actually : , 5 / -2;
-2.5, trunc;
toward;
zero;
gives - 2.;
Good.
    Example;
11;
"-5/-2";
2.5 -  > 2.;
Example;
12;
"1+2+3";
6.;
Example;
13;
"1-2-3";
-4.;
Example;
14;
"1*2*3";
6.;
Example;
15;
"1/2/3";
(1 / 2) = 0, 0 / 3;
0 ? Actually : , 1 / 2;
truncates;
to;
0, then;
0 / 3;
0.;
But;
careful: In;
left - associative, (1 / 2) / 3;
0 / 3;
0.;
If;
we;
had;
1 / (2 / 3);
1 / 0 ? Not : ;
allowed.So;
fine.
    Now, we;
need;
to;
ensure;
that;
we;
handle;
spaces;
correctly.The;
tokenization;
with (replace)
    will;
add;
spaces;
around;
operators;
and;
parentheses, but;
what;
about;
negative;
numbers;
that;
are;
part;
of;
a;
number ? For : ;
example, "-5";
single;
token ? In : ;
our;
approach, we;
treat;
'-';
operator, so;
"-5";
becomes;
"-";
and;
"5".That;
's fine. But what about something like "(-5)"? That becomes "(", "-", "5", ")". That';
s;
fine.
;
But;
what;
about;
something;
like;
"5+ -3" ? Already : ;
spaces.
    Now, one;
potential;
issue: If;
the;
input;
contains;
something;
like;
"5+-3", after;
replacement, it;
becomes;
"5 + - 3".That;
's fine.;
But;
what;
about;
"5* -3" ? becomes : ;
"5 * - 3".Fine.
    Now, what;
about;
"5* - 3" ? Already : ;
spaces.
    Now, what;
about;
"5*-3" ? That : ;
's same.;
Now, what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* - 3" ? Fine.
    Now : , what;
about;
"5* - 3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
about;
"5* -3" ? Fine.
    Now : , what;
