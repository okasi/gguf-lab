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
We;
are;
going;
to;
implement;
a;
shunting - yard;
algorithm;
to;
convert;
the;
expression;
to;
Reverse;
Polish;
Notation(RPN);
and;
then;
evaluate;
it.
    Steps;
1.;
Tokenize;
the;
expression: we;
need;
to;
handle;
integers, operators(+, -,  * , /), and;
parentheses.
    Note;
unary + and - are;
also;
operators, but;
they;
are;
different;
from;
binary;
operators.
;
We;
can;
distinguish;
unary;
operators;
by;
context: if (the)
    operator;
is;
at;
the;
beginning;
of;
the;
expression, or;
after;
an;
opening;
parenthesis, or;
after;
another;
operator, then;
it;
is;
unary.
;
2.;
We;
'll use two stacks: one for operators and one for output (RPN).;
3.;
We;
'll define precedence and associativity for operators:
    - Unary + and - have;
the;
highest;
precedence;
and;
are;
right - associative.
    -  * and / have;
the;
next;
precedence;
and;
are;
left - associative.
    - +and - (binary);
have;
the;
lowest;
precedence;
and;
are;
left - associative.
;
4.;
We;
'll process the tokens one by one:
    - If;
the;
token;
is;
a;
number, push;
it;
to;
the;
output;
stack.
    - If;
the;
token;
is;
an;
operator, we;
pop;
from;
the;
operator;
stack;
to;
the;
output;
stack;
until;
we;
find;
an;
operator;
with (lower)
    precedence(or, equal, precedence, and, left - associative);
or;
an;
opening;
parenthesis, then;
push;
the;
current;
operator.
    - If;
the;
token;
is;
an;
opening;
parenthesis, push;
it;
to;
the;
operator;
stack.
    - If;
the;
token;
is;
a;
closing;
parenthesis, pop;
from;
the;
operator;
stack;
to;
the;
output;
stack;
until;
we;
find;
an;
opening;
parenthesis.Then;
pop;
the;
opening;
parenthesis.
;
5.;
After;
processing;
all;
tokens, pop;
any;
remaining;
operators;
from;
the;
operator;
stack;
to;
the;
output;
stack.
;
6.;
Evaluate;
the;
RPN;
expression;
var a, stack, However, note, that, unary, operators, are, different, We, need, to, handle, them, specially, Approach;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    a = __addDisposableResource(env_1, void 0, false), stack = __addDisposableResource(env_1, void 0, false), However = __addDisposableResource(env_1, void 0, false), note = __addDisposableResource(env_1, void 0, false), that = __addDisposableResource(env_1, void 0, false), unary = __addDisposableResource(env_1, void 0, false), operators = __addDisposableResource(env_1, void 0, false), are = __addDisposableResource(env_1, void 0, false), different = __addDisposableResource(env_1, void 0, false), We = __addDisposableResource(env_1, void 0, false), need = __addDisposableResource(env_1, void 0, false), to = __addDisposableResource(env_1, void 0, false), handle = __addDisposableResource(env_1, void 0, false), them = __addDisposableResource(env_1, void 0, false), specially = __addDisposableResource(env_1, void 0, false), Approach = __addDisposableResource(env_1, void 0, false);
    for (unary; operators; )
        : We;
    can;
    treat;
    unary;
    operators;
    a;
    different;
    precedence;
    and;
    associativity.
        Alternatively, we;
    can;
    convert;
    the;
    expression;
    to;
    RPN;
    by;
    considering;
    unary;
    operators;
    a;
    higher;
    precedence;
    and;
    being;
    right - associative.
        Let;
    's define:;
    Precedence: Unary + and - ;
    3
        * and / ;
    2;
    Binary + and - ;
    1;
    Associativity: Unary + and - ;
    right
        * and / ;
    left;
    Binary + and - ;
    left;
    But;
    note:  in the;
    shunting - yard;
    algorithm, when;
    we;
    encounter;
    an;
    operator, we;
    pop;
    operators;
    from;
    the;
    stack;
    that;
    have;
    higher;
    precedence, or;
    same;
    precedence;
    and;
    left - associative.
    ;
    Steps;
    for (shunting - yard; ; )
        with (unary)
            operators: We;
    'll have a flag to indicate if the next operator is unary. We can set this flag when we see an opening parenthesis or at the beginning of the expression, or after an operator.;
    Alternatively, we;
    can;
    determine;
    the;
    nature;
    of;
    an;
    operator;
    by;
    its;
    context.
        Let;
    's do:;
    Initialize: output = [];
    operatorStack = [];
    unary = true; // because the first operator we see might be unary
    For;
    each;
    token: if (token)
        is;
    a;
    number: output.push(token);
    unary = false; // because after a number, the next operator is binary (unless it's an expression like 1+2, but note: after a number we expect an operator or end, but if we have a number and then an operator, that operator is binary? Actually, we can have unary after a number? No, because unary is for negative numbers. But note: we have already tokenized the numbers, so we don't have unary minus in the number. We have separate tokens for unary minus.
    if (token)
        is;
    an;
    operator: if (unary)
        : ;
    // This is a unary operator. We need to push it to the operator stack with a special handling.
    // But note: we can treat unary operators as having a different precedence and associativity.
    // We'll push the unary operator to the operator stack, but we must consider that it has higher precedence.
    // However, the shunting-yard algorithm for unary operators is a bit tricky.
    else
        : 
        // This is a binary operator.
        Actually, we;
    can;
    do
        : We;
    while ('ll have two types of operators: unary and binary.);
    We;
    can;
    define: operator;
    precedence: unary + ;
    3, right;
    unary - ;
    3, right
        * ;
    2, left
        / ;
    2, left
        + ;
    1, left
        - ;
    1, left;
    But;
    then, when;
    we;
    see;
    a;
    unary;
    operator, we;
    must;
    not;
    pop;
    the;
    operators;
    that;
    are;
    already;
    on;
    the;
    stack;
    because;
    they;
    are;
    not;
    of;
    higher;
    precedence ? Actually : , we;
    do
        pop;
    while (the);
    operators;
    that;
    have;
    higher;
    precedence ? But : ;
    unary;
    has;
    the;
    highest;
    precedence.
        However, note;
    the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    number;
    that;
    comes;
    after;
    it.So;
    we;
    must;
    push;
    the;
    unary;
    operator;
    to;
    the;
    stack;
    and;
    then;
    when;
    we;
    see;
    the;
    next;
    number, we;
    will;
    apply;
    the;
    unary;
    operator.
    ;
    But in the;
    shunting - yard;
    algorithm, we;
    are;
    building;
    the;
    RPN.The;
    RPN;
    for (unary; operators; should)
        have;
    the;
    operator;
    after;
    the;
    operand.So;
    we;
    need;
    to;
    push;
    the;
    unary;
    operator;
    to;
    the;
    output;
    when;
    we;
    have;
    the;
    operand ? Actually : , no;
     in RPN, the;
    operator;
    comes;
    after;
    the;
    operands.So;
    for (a; unary; operator, we)
        need;
    to;
    push;
    the;
    operand;
    and;
    then;
    the;
    operator.
    ;
    How;
    to;
    handle: We;
    can;
    have;
    the;
    unary;
    operator;
    on;
    the;
    operator;
    stack, and;
    when;
    we;
    encounter;
    the;
    next;
    number, we;
    will;
    push;
    the;
    number;
    to;
    the;
    output, and;
    then;
    we;
    will;
    pop;
    the;
    unary;
    operator;
    from;
    the;
    operator;
    stack;
    and;
    push;
    it;
    to;
    the;
    output ? But : ;
    that;
    would;
    be;
    too;
    early;
    because;
    the;
    unary;
    operator;
    might;
    be;
    applied;
    to;
    a;
    number;
    that;
    is;
    not;
    the;
    next;
    one ? Actually : , unary;
    operators;
    are;
    applied;
    to;
    the;
    immediate;
    next;
    number(or, expression in parentheses).
        Alternatively, we;
    can;
    treat;
    the;
    unary;
    operator;
    a;
    higher;
    precedence;
    and;
    then;
    when;
    we;
    see;
    the;
    next;
    number, we;
    will;
    push;
    the;
    number;
    and;
    then;
    the;
    unary;
    operator ? But : ;
    that;
    would;
    be;
    wrong;
    because;
    the;
    unary;
    operator;
    should;
    be;
    applied;
    to;
    the;
    number;
    that;
    comes;
    after;
    it.
    ;
    Let;
    me;
    think;
    of;
    an;
    example: -2 + 3;
    Tokens: unary - , 2, +, 3;
    We;
    want;
    RPN: 2;
    unary - 3 +
        Steps;
    token: unary -
        This;
    is;
    a;
    unary;
    operator.We;
    push;
    it;
    to;
    the;
    operator;
    stack.
        token;
    2;
    Push;
    2;
    to;
    output.
        token;
    +This;
    is;
    a;
    binary;
    operator.We;
    pop;
    from;
    the;
    operator;
    stack;
    until;
    we;
    find;
    an;
    operator;
    with (lower)
        precedence.The;
    unary - has;
    precedence;
    3, which;
    is;
    higher;
    than + (1), so;
    we;
    pop;
    unary - and;
    push;
    to;
    output.Then;
    push + to;
    operator;
    stack.
        token;
    3;
    Push;
    3;
    to;
    output.
    ;
    Then;
    we;
    pop;
    the + and;
    push;
    to;
    output.
        RPN;
    2;
    unary - 3 +
        Then;
    evaluation: stack: [2];
    unary - ;
    pop;
    2, push - 2 -  > stack;
    [-2];
    3;
    push;
    3 -  > stack;
    [-2, 3]
        + ;
    pop;
    3;
    and - 2, push - 2 + 3;
    1 -  > stack;
    [1];
    So;
    it;
    works.
    ;
    But;
    what;
    about: -2 * 3;
    Tokens: unary - , 2,  * , 3;
    Steps: token: unary -
        push;
    to;
    operator;
    stack.
        token;
    2;
    push;
    to;
    output.
        token;
     *
        This;
    is;
    a;
    binary;
    operator.We;
    pop;
    from;
    the;
    operator;
    stack;
    until;
    we;
    find;
    an;
    operator;
    with (lower)
        precedence.The;
    unary - has;
    precedence;
    3, which;
    is;
    higher;
    than * (2), so;
    we;
    pop;
    unary - and;
    push;
    to;
    output.Then;
    push * to;
    operator;
    stack.
        token;
    3;
    push;
    to;
    output.
    ;
    Then;
    pop * and;
    push;
    to;
    output.
        RPN;
    2;
    unary - 3 *
        Evaluation;
    stack: [2];
    unary - ;
    pop;
    2, push - 2 -  > stack;
    [-2];
    3;
    push;
    3 -  > stack;
    [-2, 3]
        * ;
    pop;
    3;
    and - 2, push - 2 * 3;
    -6 -  > stack;
    [-6];
    So;
    it;
    works.
    ;
    But;
    what;
    about: 2 * -3;
    Tokens: 2,  * , unary - , 3;
    Steps: token: 2;
    push;
    to;
    output.
        token;
     *
        This;
    is;
    a;
    binary;
    operator.We;
    push;
    to;
    operator;
    stack.
        token;
    unary -
        This;
    is;
    a;
    unary;
    operator.We;
    push;
    to;
    operator;
    stack.
        token;
    3;
    push;
    to;
    output.
    ;
    Then;
    we;
    pop;
    the;
    unary - and;
    push;
    to;
    output, then;
    pop;
    the * and;
    push;
    to;
    output.
        RPN;
    2;
    3;
    unary -  *
        Evaluation;
    stack: [2];
    3;
    push;
    3 -  > stack;
    [2, 3];
    unary - ;
    pop;
    3, push - 3 -  > stack;
    [2, -3]
        * ;
    pop - 3;
    and;
    2, push;
    2 * -3;
    -6 -  > stack;
    [-6];
    So;
    it;
    works.
        However, note;
    that;
    the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    number;
    that;
    comes;
    after;
    it.In;
    the;
    RPN, the;
    unary;
    operator;
    comes;
    after;
    the;
    number.So;
    we;
    must;
    ensure;
    that;
    the;
    unary;
    operator;
    is;
    pushed;
    to;
    the;
    output;
    after;
    the;
    number.
    ;
    How;
    do
        we;
    while (know);
    when;
    to;
    push;
    the;
    unary;
    operator;
    to;
    the;
    output ? We : ;
    push;
    it;
    when;
    we;
    are;
    popping;
    operators;
    from;
    the;
    operator;
    stack;
    to;
    the;
    output.But;
    note: the;
    unary;
    operator;
    is;
    on;
    the;
    operator;
    stack;
    until;
    we;
    pop;
    it.
    ;
    But;
    what;
    about;
    nested;
    unary;
    operators ? Example : --2;
    Tokens: unary - , unary - , 2;
    Steps: token: unary -
        push;
    to;
    operator;
    stack.
        token;
    unary -
        This;
    is;
    a;
    unary;
    operator.We;
    push;
    it;
    to;
    the;
    operator;
    stack.
        token;
    2;
    push;
    to;
    output.
    ;
    Then;
    we;
    pop;
    the;
    unary - (the);
    second;
    one;
    and;
    push;
    to;
    output, then;
    pop;
    the;
    first;
    unary - and;
    push;
    to;
    output.
        RPN;
    2;
    unary - unary -
        Evaluation;
    stack: [2];
    unary - ;
    pop;
    2, push - 2 -  > stack;
    [-2];
    unary - ;
    pop - 2, push;
    2 -  > stack;
    [2];
    So;
    it;
    works.
    ;
    But;
    what;
    about: -(-2);
    Tokens: unary - , (, unary - , 2, );
    Steps: token: unary -
        push;
    to;
    operator;
    stack.
        token;
    (push);
    to;
    operator;
    stack.
        token;
    unary -
        push;
    to;
    operator;
    stack.
        token;
    2;
    push;
    to;
    output.
        token;
    pop;
    from;
    operator;
    stack;
    until;
    we;
    find(so, we, pop, unary - and, push, to, output, then, pop(and, discard.
    , Then, we, pop, the, unary - (the), first, one), and, push, to, output.
        RPN, 2, unary - unary -
        Same, So, the, algorithm);
    for (shunting - yard; ; )
        : We;
    'll have:;
    output = [];
    operatorStack = [];
    unary = true; // because the first token might be a unary operator
    For;
    each;
    token: if (token)
        is;
    a;
    number: output.push(token);
    unary = false; // because after a number, the next operator is not unary? Actually, we can have a unary operator after a number? No, because the unary operator must be followed by a number. But note: we have already tokenized the numbers, so we don't have unary minus in the number. However, we can have a unary operator after a number? Actually, no: the unary operator is for negative numbers, so it must be before a number. But in the expression, we can have: 1 + -2, so after a number we can have a unary operator? Actually, in 1 + -2, the unary operator is after a binary operator. So we can have a unary operator after a binary operator.
    How;
    to;
    handle: We;
    can;
    set;
    unary;
    to;
    true;
    when;
    we;
    see;
    an;
    opening;
    parenthesis;
    or;
    an;
    operator(because, after, an, operator, the, next, token, might, be, a, unary, operator, or, a, number).
        So;
    if (token)
        is;
    an;
    operator: if (token)
        is;
    a;
    unary;
    operator(i.e., +or - and, it, is, unary);
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
