"use strict";
let top = operatorStack[operatorStack.length - 1];
if (top === LEFT_PAREN)
    break;
if (precedence(top) > precedence(current) ||
    (precedence(top) === precedence(current) && associativity(current) === 'left')) {
    output.push(operatorStack.pop());
}
else {
    break;
}
Then;
push;
the;
current;
operator;
to;
operatorStack.
;
If;
token;
is;
LEFT_PAREN, push;
to;
operatorStack.
;
If;
token;
is;
RIGHT_PAREN: While;
operatorStack;
is;
not;
empty;
and;
top;
of;
operatorStack;
is;
not;
LEFT_PAREN, pop;
to;
output.
;
Then;
pop;
the;
LEFT_PAREN;
from;
operatorStack(and, discard).
;
After;
processing;
all;
tokens, pop;
the;
remaining;
operators;
from;
operatorStack;
to;
output.
    - Then;
evaluate;
the;
postfix;
expression: We;
have;
a;
stack;
for (operands.
; For; each)
    token in the;
postfix: If;
token;
is;
a;
number, push;
to;
operandStack.
;
If;
token;
is;
an;
operator(including, unary);
If;
unary: pop;
one;
operand;
and;
apply;
the;
unary;
operator.
;
If;
binary: pop;
two;
operands, apply;
the;
binary;
operator, and;
push;
the;
result.
    Note;
For;
unary;
minus, we;
negate;
the;
operand.For;
unary;
plus, we;
leave;
it.
;
For;
binary;
operators: For + ;
a + b;
For - ;
a - b;
For * ;
a * b;
For / ;
a / b, but;
we;
need;
to;
truncate;
toward;
zero.
;
How;
to;
truncate;
toward;
zero ? In : ;
JavaScript, the / operator;
returns;
a;
float.We;
can;
use;
Math.trunc(a / b).But;
note: the;
problem;
says;
the;
division;
truncates;
toward;
zero.
    However, note;
the;
operands;
are;
integers;
and;
the;
intermediate;
values;
fit in safe;
integers.So;
we;
can;
do
    : result = Math.trunc(a / b);
while (But);
note: Math.trunc(3 / 2) = 1, Math.trunc(-3 / 2) = -1, which;
is;
truncation;
toward;
zero.
    However, we;
must;
be;
cautious: the;
operands in the;
postfix;
evaluation;
are;
integers ? Actually : , the;
tokens;
are;
integers, but;
the;
intermediate;
values;
are;
integers ? The : ;
problem;
says;
"All intermediate values fit in JavaScript safe integers", so;
we;
can;
use;
integer;
arithmetic.
;
But;
note: the;
division;
might;
produce;
a;
non - integer, so;
we;
have;
to;
truncate.
    - Steps;
for (evaluation; ; )
    : operandStack = [];
for (each; token in postfix; )
    : if (token)
        is;
a;
number: push;
parseInt(token);
if (token)
    is;
an;
operator: if (token)
    is;
UNARY_PLUS;
or;
UNARY_MINUS: if (operandStack.length < 1, error ? But : )
    the;
expression;
should;
be;
valid.
;
let a = operandStack.pop();
if (token)
    is;
UNARY_PLUS: push;
a;
if (token)
    is;
UNARY_MINUS: push - a;
if (token)
    is;
BINARY_PLUS: let b = operandStack.pop();
let a = operandStack.pop();
push;
a + b;
if (token)
    is;
BINARY_MINUS: let b = operandStack.pop();
let a = operandStack.pop();
push;
a - b;
if (token)
    is;
'*';
let b = operandStack.pop();
let a = operandStack.pop();
push;
a * b;
if (token)
    is;
'/';
let b = operandStack.pop();
let a = operandStack.pop();
// Division truncates toward zero
// We can do: Math.trunc(a / b)
// But note: if b is 0, we get division by zero. The problem doesn't say what to do, but we assume valid expressions without division by zero.
push;
Math.trunc(a / b);
After;
processing, the;
operandStack;
should;
have;
one;
element, which;
is;
the;
result.
    - However, note;
the;
tokens;
for (numbers; are; strings, so)
    we;
parse;
them.
    - But;
wait: the;
tokens;
for (operators; are; represented ? We : )
    defined: UNARY_PLUS: 'U+';
UNARY_MINUS: 'U-';
BINARY_PLUS: 'B+';
BINARY_MINUS: 'B-';
LEFT_PAREN: '(';
RIGHT_PAREN: ')';
and;
for ( * , /: we can use 'M' and 'D'? Or we can use the same character?; Actually, we; can)
    use: '*';
for (multiplication; '/'; )
    for (division; But; then)
        we;
have;
to;
distinguish;
between;
binary;
and;
unary ? We : ;
already;
distinguished;
during;
tokenization.
;
So in the;
postfix, we;
have: UNARY_PLUS: 'U+';
UNARY_MINUS: 'U-';
BINARY_PLUS: 'B+';
BINARY_MINUS: 'B-';
'*';
'*';
'/';
'/';
Then in the;
evaluation, we;
can;
check;
the;
token: if (token)
    is;
'U+';
or;
'U-';
unary;
if (token)
    is;
'B+';
or;
'B-';
binary;
it;
's a number or ' * ' or ' / ';
Alternatively, we;
can;
use: We;
can;
represent;
the;
operators;
'U+';
unary;
plus;
'U-';
unary;
minus;
'B+';
binary;
plus;
'B-';
binary;
minus;
'*';
multiplication;
'/';
division;
Then in the;
evaluation: if (token)
    is;
'U+';
or;
'U-';
unary;
if (token)
    is;
'B+';
or;
'B-';
binary;
if (token)
    is;
'*';
or;
'/';
binary;
But;
note: we;
can;
also;
use: We;
can;
have;
a;
function to() { }
check;
if (a)
    token;
is;
an;
operator;
and;
if (it)
    's unary or binary.;
Alternatively, we;
can;
use: We;
can;
have: isUnaryOperator(token);
token === 'U+' || token === 'U-';
isBinaryOperator(token);
token === 'B+' || token === 'B-' || token === '*' || token === '/';
Then: if (token)
    is;
a;
number: push;
parseInt(token);
if (isUnaryOperator(token))
    : if (token === 'U+')
        : a = operandStack.pop();
push;
a;
a = operandStack.pop();
push - a;
if (isBinaryOperator(token))
    : if (token)
        is;
'B+';
b = operandStack.pop();
a = operandStack.pop();
push;
a + b;
if (token)
    is;
'B-';
b = operandStack.pop();
a = operandStack.pop();
push;
a - b;
if (token)
    is;
'*';
b = operandStack.pop();
a = operandStack.pop();
push;
a * b;
if (token)
    is;
'/';
b = operandStack.pop();
a = operandStack.pop();
push;
Math.trunc(a / b);
But;
note: the;
order;
of;
popping;
for (binary; operators; )
    : for (subtraction; and; division, we)
        need;
the;
first;
operand;
to;
be;
the;
one;
that;
was;
pushed;
first ?
    In : ;
the;
postfix, the;
expression;
is in the;
order: operand1;
operand2;
operator.
;
So;
for (subtraction; ; )
    : a - b, we;
pop;
b;
first, then;
a, then;
compute;
a - b.
;
Similarly;
for (division; ; )
    : a / b, we;
pop;
b;
first, then;
a, then;
compute;
a / b.
    So;
b = operandStack.pop();
a = operandStack.pop();
This;
is;
correct.
    - However, note;
the;
unary;
operators;
only;
need;
one;
operand.
    - Implementation;
We;
'll define:;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["NUMBER"] = 0] = "NUMBER";
    TokenType[TokenType["UNARY_PLUS"] = 1] = "UNARY_PLUS";
    TokenType[TokenType["UNARY_MINUS"] = 2] = "UNARY_MINUS";
    TokenType[TokenType["BINARY_PLUS"] = 3] = "BINARY_PLUS";
    TokenType[TokenType["BINARY_MINUS"] = 4] = "BINARY_MINUS";
    TokenType[TokenType["MULTIPLY"] = 5] = "MULTIPLY";
    TokenType[TokenType["DIVIDE"] = 6] = "DIVIDE";
    TokenType[TokenType["LEFT_PAREN"] = 7] = "LEFT_PAREN";
    TokenType[TokenType["RIGHT_PAREN"] = 8] = "RIGHT_PAREN";
})(TokenType || (TokenType = {}));
But;
we;
can;
use;
strings;
for (simplicity.
    Alternatively, we; can; use)
    : Token = string;
number: the;
string;
of;
digits;
'U+', 'U-', 'B+', 'B-', '*', '/', '(', ')';
We;
'll do that.
    - Steps;
1.;
Read;
input;
with (fs.readFileSync(0, "utf8").trim())
    2.;
Tokenize: let tokens = [];
let i = 0;
let isUnaryCandidate = true;
while (i < input.length) {
    let c = input[i];
    if (c === ' ') {
        i++;
        continue;
    }
    if (c === '(') {
        tokens.push('(');
        isUnaryCandidate = true;
        i++;
        continue;
    }
    if (c === ')') {
        tokens.push(')');
        isUnaryCandidate = false;
        i++;
        continue;
    }
    if (c === '+' || c === '-' || c === '*' || c === '/') {
        if (c === '+' || c === '-') {
            if (isUnaryCandidate) {
                if (c === '+')
                    tokens.push('U+');
                else
                    tokens.push('U-');
            }
            else {
                if (c === '+')
                    tokens.push('B+');
                else
                    tokens.push('B-');
            }
        }
        else {
            tokens.push(c);
        }
        // After an operator, the next operator might be unary? 
        // But note: after an operator, we are expecting an operand, so if we see an operator again, it must be unary? 
        // Actually, no: we might have: 1 + 2 + 3 -> the second + is binary. 
        // So we set isUnaryCandidate = true only if the token is an operator or left parenthesis? 
        // But wait: we are in the middle of processing. We just added an operator, so the next token (if it's an operator) will be unary? 
        // Actually, no: the next token might be an operand (number or left parenthesis) and then we might have an operator again (binary). 
        // So we set isUnaryCandidate = true after an operator? Actually, we set isUnaryCandidate = true after an operator or left parenthesis? 
        // But note: we already set isUnaryCandidate = true after a left parenthesis. 
        // For an operator, we set isUnaryCandidate = true? 
        // Actually, we set isUnaryCandidate = true after an operator? 
        // Let me check: after an operator, the next token (if it's an operator) must be unary? 
        // But consider: 1 + - 2 -> the second operator (the -) is unary. 
        // So we set isUnaryCandidate = true after an operator? 
        // However, what about: 1 + 2 * 3 -> after the +, we have 2 (a number) and then * (which is binary). 
        // So we don't want to set isUnaryCandidate = true after an operator unconditionally.
        // Actually, we set isUnaryCandidate = true after an operator? 
        // But note: the rule is: an operator is unary if it is at the beginning, after a left parenthesis, or after another operator (binary or unary). 
        // So after an operator (any operator) the next operator (if it appears) will be unary. 
        // But we are setting isUnaryCandidate for the next token we are about to process. 
        // So after we add an operator, we set isUnaryCandidate = true for the next token? 
        // However, if the next token is a number, then we don't care. But if the next token is an operator, then it will be unary.
        // So we set isUnaryCandidate = true after an operator? 
        // But wait: after a number, we set isUnaryCandidate = false. 
        // After a right parenthesis, we set isUnaryCandidate = false.
        // So we set isUnaryCandidate = true after an operator (including unary) and after a left parenthesis.
        // But note: we just added an operator, so we set isUnaryCandidate = true for the next token.
        isUnaryCandidate = true;
        i++;
        continue;
    }
    if (c >= '0' && c <= '9') {
        // Parse integer
        let num = '';
        while (i < input.length && input[i] >= '0' && input[i] <= '9') {
            num += input[i];
            i++;
        }
        tokens.push(num);
        isUnaryCandidate = false;
        continue;
    }
    // Should not happen, but skip
    i++;
}
3.;
Shunting - yard;
let operatorStack = [];
let output = [];
function precedence(op) {
    if (op === 'U+' || op === 'U-')
        return 3;
    if (op === '*')
        return 2;
    if (op === '/')
        return 2;
    if (op === 'B+' || op === 'B-')
        return 1;
    return 0; // for parentheses, but we don't use it for parentheses in the stack
}
function isRightAssociative(op) {
    return op === 'U+' || op === 'U-';
}
for (let token of tokens) {
    if (token === '(') {
        operatorStack.push(token);
    }
    else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
            output.push(operatorStack.pop());
        }
        if (operatorStack.length > 0) {
            operatorStack.pop(); // remove '('
        }
    }
    else if (token === 'U+' || token === 'U-' || token === 'B+' || token === 'B-' || token === '*' || token === '/') {
        // Operator
        while (operatorStack.length > 0) {
            let top = operatorStack[operatorStack.length - 1];
            if (top === '(')
                break;
            let topPrec = precedence(top);
            let currentPrec = precedence(token);
            if (topPrec > currentPrec ||
                (topPrec === currentPrec && !isRightAssociative(token))) {
                output.push(operatorStack.pop());
            }
            else {
                break;
            }
        }
        operatorStack.push(token);
    }
    else {
        // Number
        output.push(token);
    }
}
while (operatorStack.length > 0) {
    output.push(operatorStack.pop());
}
4.;
Evaluate;
postfix: let operandStack = [];
for (let token of output) {
    if (token === 'U+') {
        let a = operandStack.pop();
        operandStack.push(a);
    }
    else if (token === 'U-') {
        let a = operandStack.pop();
        operandStack.push(-a);
    }
    else if (token === 'B+') {
        let b = operandStack.pop();
        let a = operandStack.pop();
        operandStack.push(a + b);
    }
    else if (token === 'B-') {
        let b = operandStack.pop();
        let a = operandStack.pop();
        operandStack.push(a - b);
    }
    else if (token === '*') {
        let b = operandStack.pop();
        let a = operandStack.pop();
        operandStack.push(a * b);
    }
    else if (token === '/') {
        let b = operandStack.pop();
        let a = operandStack.pop();
        operandStack.push(Math.trunc(a / b));
    }
    else {
        // Number
        operandStack.push(parseInt(token));
    }
}
console.log(operandStack.pop());
-But;
note: the;
problem;
says;
the;
expression;
is;
valid, so;
we;
assume;
no;
errors.
    - However, we;
must;
be;
cautious: the;
division;
by;
zero ? We : ;
assume;
no;
division;
by;
zero.
    - Let;
's test with an example: "1+2";
Tokens: '1' -  > number;
'+' -  > binary;
plus(because, it, 's not at the beginning, and not after an operator or left parenthesis) -> B+, '2' -  > number, Shunting - yard, token, '1', output = ['1'], token, 'B+', operatorStack = ['B+'], token, '2', output = ['1', '2'], Then, pop, operatorStack, output = ['1', '2', 'B+'], Evaluate, '1' -  > push, 1, '2' -  > push, 2, 'B+' -  > pop, 2, pop, 1 -  > push, 3, Output, 3
    - Example, "-1+2", Tokens, '-', at, beginning -  > U -
    '1' -  > number, '+' -  > binary, plus -  > B +
    '2' -  > number, Shunting - yard, token, 'U-', output = [], operatorStack = ['U-'], token, '1', output = ['1'], token, 'B+', precedence('U-') = 3, precedence('B+') = 1 -  > 3 > 1, so, pop, 'U-', to, output -  > output, ['1', 'U-'], then, push, 'B+' -  > operatorStack, ['B+'], token, '2', output = ['1', 'U-', '2'], Then, pop, operatorStack, output = ['1', 'U-', '2', 'B+'], Evaluate, '1' -  > push, 1, 'U-' -  > pop, 1 -  > push - 1, '2' -  > push, 2, 'B+' -  > pop, 2, pop - 1 -  > push - 1 + 2, 1, Output, 1
    - Example, "-(1+2)", Tokens, '-', at, beginning -  > U -
    '(' -  > left, parenthesis, '1' -  > number, '+' -  > binary, plus(because, after, '(') -  > B +
    '2' -  > number, ')' -  > right, parenthesis, Shunting - yard, token, 'U-', output = [], operatorStack = ['U-'], token, '(', operatorStack = ['U-', '('], token, '1', output = ['1'], token, 'B+', precedence('B+') = 1, precedence('(') = 0 -  > so, push, operatorStack = ['U-', '(', 'B+'], token, '2', output = ['1', '2'], token, ')', pop, until, '(' -  > output, ['1', '2', 'B+'], then, pop, '(' -  > operatorStack, ['U-'], Then, pop, operatorStack, output = ['1', '2', 'B+', 'U-'], Evaluate, '1' -  > push, 1, '2' -  > push, 2, 'B+' -  > pop, 2, pop, 1 -  > push, 3, 'U-' -  > pop, 3 -  > push - 3, Output, -3
    - Example, "1*-2", Tokens, '1' -  > number, '*' -  > multiplication, '-' -  > unary, minus ?
    After : , '*', we, set, isUnaryCandidate = true ?
    But : , note, we, set, isUnaryCandidate = true, after, an, operator ?
    Actually : , we, set, isUnaryCandidate = true, after, an, operator ?
    But : , wait, we, set, isUnaryCandidate = true, after, an, operator ?
    However : ,  in the, tokenization, after, the, '*', we, set, isUnaryCandidate = true ?
    But : , then, the, '-', is, after, an, operator, so, it, becomes, unary ?
    Actually : , we, set, isUnaryCandidate = true, after, an, operator ?
    But : , note, the, rule, an, operator, is, unary);
if (it)
    is;
after;
another;
operator ?
    So : ;
yes:  in "1*-2", the;
'-';
is;
unary.
    Tokens;
'1', '*', 'U-', '2';
Shunting - yard;
token;
'1';
output = ['1'];
token;
'*';
operatorStack = ['*'];
token;
'U-';
precedence('U-') = 3, precedence('*') = 2 -  > 3 > 2, so;
push: operatorStack = ['*', 'U-'];
token;
'2';
output = ['1', '2'];
Then;
pop: output = ['1', '2', 'U-', '*'];
