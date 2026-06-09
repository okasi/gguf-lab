"use strict";
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
let precedence = (op) => {
    if (op.unary)
        return 3;
    if (op.token === '*' || op.token === '/')
        return 2;
    if (op.token === '+' || op.token === '-')
        return 1;
};
let isLeftAssociative = (op) => {
    if (op.unary)
        return false;
    return true;
};
while (stack.length > 0) {
    let top = stack[stack.length - 1];
    if (top === LPAREN)
        break;
    if (top.unary && op2.unary) {
        if (precedence(top) > precedence(op2) || (precedence(top) == precedence(op2) && isLeftAssociative(op2))) {
            output.push(stack.pop());
        }
        else {
            break;
        }
    }
    else if (top.unary && !op2.unary) {
        // top is unary, op2 is binary -> precedence(top) > precedence(op2) always true, so pop.
        output.push(stack.pop());
    }
    else if (!top.unary && op2.unary) {
        // top is binary, op2 is unary -> precedence(top) < precedence(op2), so we don't pop.
        break;
    }
    else {
        // both binary
        if (precedence(top) > precedence(op2) || (precedence(top) == precedence(op2) && isLeftAssociative(op2))) {
            output.push(stack.pop());
        }
        else {
            break;
        }
    }
}
Then;
push;
op2;
to;
stack.
;
For;
parentheses: if (LPAREN)
    : push;
to;
stack.
;
if (RPAREN)
    : pop;
from;
stack;
to;
output;
until;
LPAREN;
is;
found.
;
After;
processing;
all;
tokens, pop;
all;
operators;
from;
stack;
to;
output.
;
Then;
evaluate;
the;
RPN.
;
Evaluation;
of;
RPN: We;
'll have a stack for values.;
For;
each;
token in RPN;
if (token)
    is;
NUMBER: push;
to;
value;
stack.
;
if (token)
    is;
operator: pop;
two;
values;
from;
value;
stack();
if (binary)
    operator;
- > but;
unary;
operator;
pops;
one;
value.
;
For;
unary;
operator: pop;
one;
value(the, operand);
if (op)
    is;
unary;
'+';
result = operand;
if (op)
    is;
unary;
'-';
result = -operand;
For;
binary;
operator: pop;
two;
values: right = pop(), left = pop();
if (op)
    is;
'+';
result = left + right;
if (op)
    is;
'-';
result = left - right;
if (op)
    is;
'*';
result = left * right;
if (op)
    is;
'/';
result = left / right(truncates, toward, zero);
Then;
push;
result.
    Note;
division;
truncates;
toward;
zero.In;
JavaScript, the / operator;
for (integers; truncates; toward)
    zero ? Actually : , ;
for (positive; numbers, it; does.But)
    for (negative; numbers, JavaScript; 's / truncates toward zero? Let me check: )
        7 / 2;
3.5 -  > truncates;
to;
3 ? But : ;
the;
problem;
says: division;
truncates;
toward;
zero.So;
7 / 2;
3, and - 7 / 2;
-3.5 -  > truncates;
to - 3 ? Actually : ,  in JavaScript, Math.trunc(7 / 2) = 3, Math.trunc(-7 / 2) = -3.;
So;
we;
can;
use;
Math.trunc.
    However, the;
problem;
says: all;
intermediate;
values;
fit in JavaScript;
safe;
integers, so;
we;
can;
use;
Math.trunc.
    Steps;
Step;
1;
Tokenize;
the;
expression.
    Step;
2;
Convert;
to;
RPN;
var shunting, or, Token;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    shunting = __addDisposableResource(env_1, void 0, false);
    -yard.
        Step;
    3;
    Evaluate;
    the;
    RPN.
        Let;
    's code accordingly.;
    We;
    'll define:;
    Token;
    types: NUMBER: {
        type: 'NUMBER', value;
        number;
    }
    OP: {
        type: 'OP', token;
        string, unary;
        boolean;
    }
    LPAREN: {
        type: 'LPAREN';
    }
    RPAREN: {
        type: 'RPAREN';
    }
    But;
    note: we;
    can;
    use;
    a;
    simpler;
    representation.
        Alternatively, we;
    can;
    use;
    a;
    or = class or {
    };
    just;
    objects.
        Let;
    's do:;
    Token = class Token {
        constructor(type, value, unary = false) {
            this.type = type; // 'NUMBER', 'OP', 'LPAREN', 'RPAREN'
            this.value = value; // for NUMBER: number, for OP: the operator string, for LPAREN/RPAREN: null
            this.unary = unary; // only for OP
        }
    };
    But;
    for (simplicity, we; can; use)
        an;
    object.
        However, we;
    can;
    also;
    use;
    a;
    different;
    approach: store;
    the;
    token;
    object;
    with (properties.
    )
        Let;
    me;
    define: ;
    But in TypeScript, we;
    can;
    use;
    union;
    type.
        However, ;
    for (simplicity, I; 'll use a common interface with a discriminator.; Alternatively, we)
        can;
    use;
    a;
    string;
    representation;
    for (operators; ; )
        : For;
    unary: '+';
    or;
    '-', ;
    for (binary; ; )
        : '+', '-', '*', '/';
    But;
    we;
    need;
    to;
    know;
    if (it)
        's unary. So we can store:;
    For;
    an;
    operator;
    token: if (unary)
        : we;
    can;
    use;
    a;
    special;
    string;
    like;
    '+u';
    or;
    '-u' ? But : ;
    that;
    might;
    complicate.
        Instead, we;
    can;
    store: ;
    But;
    note: the;
    op;
    string;
    for (unary; and; binary)
        might;
    be;
    the;
    same.So;
    we;
    need;
    the;
    unary;
    flag.
        Let;
    's do that.;
    Implementation: Step;
    1;
    Tokenize.
        We;
    'll traverse the string.;
    Step;
    2;
    Shunting - yard.
        Step;
    3;
    Evaluate.
        Let;
    's code accordingly.;
    Note: We;
    must;
    not;
    use;
    eval, Function, vm, or;
    external;
    packages.
        We;
    'll read from stdin using fs.readFileSync(0, "utf8").;
    Let;
    's write the code.;
    We;
    'll define the token types as:;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
