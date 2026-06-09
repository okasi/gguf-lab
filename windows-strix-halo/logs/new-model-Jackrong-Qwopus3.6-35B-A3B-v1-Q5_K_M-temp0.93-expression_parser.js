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
infix;
expression;
to;
postfix(RPN);
and;
then;
evaluate;
the;
RPN.
    Steps;
1.;
Tokenize;
the;
expression: split;
into;
tokens.We;
need;
to;
handle;
integers, operators(+, -,  * , /), parentheses, and;
unary;
signs.
    Note;
Unary;
operators;
are;
tricky.We;
can;
distinguish;
unary + and - from;
binary;
by;
context: -A;
unary + or - occurs;
at;
the;
beginning;
of;
the;
expression, after;
an;
opening;
parenthesis, or;
after;
an;
operator.
;
2.;
Build;
the;
postfix;
expression(RPN);
var the, shunting, the, shunting;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    the = __addDisposableResource(env_1, void 0, false), shunting = __addDisposableResource(env_1, void 0, false);
    -yard;
    algorithm.
    ;
    3.;
    Evaluate;
    the;
    RPN;
    expression.
        However, note;
    the;
    problem;
    says;
    "unary + / -".We;
    have;
    to;
    handle;
    unary;
    operators.
    ;
    Approach;
    for (tokenization; ; )
        : We;
    can;
    traverse;
    the;
    string;
    and;
    extract;
    tokens.We;
    'll consider:
        - Integers;
    one;
    or;
    more;
    digits.But;
    note: negative;
    numbers ? Actually : , the;
    unary;
    minus;
    might;
    be;
    separate;
    from;
    the;
    integer.
        However, we;
    can;
    also;
    have;
    negative;
    numbers ? The : ;
    problem;
    says: "integers, spaces, parentheses, binary + - * /, and unary + / -";
    So;
    we;
    can;
    have;
    negative;
    numbers;
    of;
    the;
    token ? But : ;
    note: the;
    unary;
    minus;
    is;
    an;
    operator.So;
    we;
    must;
    separate;
    unary;
    minus;
    from;
    the;
    integer.
        However, consider;
    "-3".Is;
    this;
    a;
    unary;
    minus;
    followed;
    by;
    3, or;
    a;
    negative;
    number ? In : ;
    our;
    tokenization, we;
    can;
    treat;
    the;
    unary;
    minus;
    operator;
    and;
    then;
    the;
    3;
    integer.
    ;
    But;
    then;
    the;
    expression;
    would;
    be: unary_minus, integer(3).This;
    is;
    acceptable.
    ;
    But;
    note: what;
    about;
    "3 - -4" ? This : ;
    should;
    be;
    3 - (-4);
    7.;
    So;
    we;
    want;
    to;
    parse;
    it;
    3, binary_minus, unary_minus, 4.;
    Steps;
    for (tokenization; ; )
        : We;
    'll create an array of tokens. Each token is either:
        - number(integer)
        - operator;
    one;
    of;
    '+', '-', '*', '/'
        - left_paren, right_paren;
    How;
    to;
    distinguish;
    unary;
    operators: We;
    'll look at the context. We can note that a unary operator occurs:
        - at;
    the;
    start;
    of;
    the;
    expression
        - after;
    an;
    opening;
    parenthesis
        - after;
    an;
    operator(including, unary, operators);
    However, note;
    we;
    can;
    also;
    have;
    consecutive;
    unary;
    operators, e.g., "+-3";
    meaning + (-3);
    -3.;
    Algorithm;
    for (tokenization; ; )
        with (unary)
            operators: We;
    can;
    use;
    a;
    flag;
    to;
    indicate;
    if (the)
        next;
    operator;
    is;
    unary;
    or;
    binary.
        We;
    'll maintain a state: ;
    state = 'expect_operand' -  > then;
    we;
    expect;
    a;
    number;
    or;
    an;
    opening;
    parenthesis(which, will, start, a, new operand, context);
    or;
    a;
    unary;
    operator ?
        Actually : , after;
    an;
    operator(binary, or, unary);
    we;
    are in a;
    state;
    where;
    we;
    expect;
    an;
    operand(which, could, be, a, number, a, unary, operator, or, an, opening, parenthesis).
    ;
    But;
    note: an;
    opening;
    parenthesis;
    is;
    not;
    an;
    operator, but;
    it;
    can;
    be;
    followed;
    by;
    a;
    unary;
    operator.
        Alternatively, we;
    can;
    do
        : tokens = [];
    while (i = 0);
    while (i < length)
        : skip;
    spaces;
    if (current)
        char;
    is;
    digit;
    or;
    '-';
    or;
    '+';
    if (current)
        char;
    is;
    '-';
    or;
    '+', then;
    check;
    if (it)
        is;
    unary: if (tokens)
        is;
    empty, or;
    last;
    token;
    is;
    an;
    operator, or;
    last;
    token;
    is;
    left_paren, then;
    it;
    's unary.;
    it;
    's a binary operator.;
    it;
    's a digit -> read the whole number.;
    This;
    approach;
    might;
    be;
    messy.
    ;
    Another;
    idea: we;
    can;
    treat;
    unary;
    operators;
    and;
    then;
    when;
    we;
    parse;
    the;
    number, we;
    can;
    combine;
    the;
    unary;
    operator;
    with (the)
        number ?
            But : ;
    the;
    problem;
    says: "unary + / -";
    we;
    are;
    to;
    treat;
    them, note;
    the;
    problem;
    says;
    "all intermediate values fit in JavaScript safe integers", so;
    we;
    can;
    use;
    64 - bit;
    integers ? But : ;
    the;
    problem;
    says;
    safe;
    integers, which;
    are;
    2 ^ 53 - 1.;
    Let;
    me;
    propose;
    a;
    tokenization;
    that;
    separates;
    unary;
    operators: We;
    'll iterate through the string. We';
    ll;
    have;
    an;
    array;
    of;
    tokens.
    ;
    We;
    also;
    have;
    a;
    state: `expectOperand`;
    which;
    is;
    true;
    at;
    the;
    beginning, after;
    an;
    operator, or;
    after;
    a;
    left;
    parenthesis.
        Steps;
    i = 0;
    while (i < n)
        : c = s[i];
    if (c)
        is;
    space: i++, ;
    continue;
    if (c)
        is;
    digit: parse;
    the;
    entire;
    number: take;
    consecutive;
    digits.
    ;
    push;
    the;
    number;
    token(as, a, string, or, number ? We : , 'll push as number? But note: we need to handle negative numbers? Actually, we are going to treat unary minus as separate, so we don', t, have, negative, numbers ?
        But : , wait, what, about, "-3" ? We : , are, going, to, tokenize, it, So, we, don, 't have negative numbers as literals., However, what);
    if (we)
        have;
    "3 - -4" ? We : ;
    want: [3, binary_minus, unary_minus, 4].So;
    we;
    do
        want;
    while (to);
    separate.
    ;
    So;
    for (a; digit, we; parse)
        the;
    whole;
    integer(positive);
    and;
    push;
    number;
    token.
    ;
    if (c)
        is;
    '+';
    or;
    '-';
    if (expectOperand)
        : push;
    unary_plus;
    or;
    unary_minus;
    operator;
    token.
        else;
    push;
    binary_plus;
    or;
    binary_minus;
    operator;
    token.
        expectOperand = true;
    if (c)
        is;
    '(';
    push;
    left_paren;
    expectOperand = true; // because after '(', we expect an operand (which could be a unary operator, a number, or another '(')
    if (c)
        is;
    ')';
    push;
    right_paren;
    expectOperand = false; // because after ')', we might have an operator or end of expression.
    But;
    note: what;
    about;
    multiple;
    unary;
    operators ? e.g. : , "+-3" -  > we;
    want[unary_plus, unary_minus, 3].
        i = 0;
    c = '+', expectOperand = true -  > push;
    unary_plus, expectOperand;
    remains;
    true ?
        i = 1 : c = '-', expectOperand = true -  > push;
    unary_minus, expectOperand;
    remains;
    true ?
        i = 2 : c = '3' -  > push;
    3.;
    However, what;
    about;
    "3 - -4";
    i = 0;
    '3' -  > push;
    3, expectOperand;
    becomes;
    false(because, after, an, operand, we, don, 't expect an operand until after an operator or parenthesis)., i = 1, ' ' -  > skip, i = 2, '-' -  > expectOperand, false -  > so, binary_minus, then, set, expectOperand = true(because, after, a, binary, operator, we, expect, an, operand), i = 3, '-' -  > expectOperand, true -  > unary_minus, then, set, expectOperand = true(because, after, a, unary, operator, we, still, expect, an, operand), i = 4, '4' -  > push, 4., But, wait, after, a, unary, operator, we, still, expect, an, operand ? Yes : , because, the, unary, operator, is, acting, on, the, next, operand.
        However, what, about, "3 * (-4)" ?
        i = 0 : '3' -  > push, 3, expectOperand = false, i = 1, ' ' -  > skip, i = 2, '*' -  > expectOperand, false -  > binary_multiply, set, expectOperand = true, i = 3, ' ' -  > skip, i = 4, '(' -  > push, left_paren, set, expectOperand = true, i = 5, '-' -  > expectOperand, true -  > unary_minus, set, expectOperand = true, i = 6, '4' -  > push, 4, i = 7, ')' -  > push, right_paren, set, expectOperand = false, This, seems, to, work.
        However, there, is, a);
    try { }
    catch { }
    what;
    about;
    "3 - (-4)" ?
        i = 0 : '3' -  > push;
    3, expectOperand = false;
    i = 1;
    ' ' -  > skip;
    i = 2;
    '-' -  > binary_minus, set;
    expectOperand = true;
    i = 3;
    ' ' -  > skip;
    i = 4;
    '(' -  > push;
    left_paren, set;
    expectOperand = true;
    i = 5;
    '-' -  > unary_minus, set;
    expectOperand = true;
    i = 6;
    '4' -  > push;
    4;
    i = 7;
    ')' -  > push;
    right_paren, set;
    expectOperand = false;
    This;
    is;
    correct.
    ;
    But;
    what;
    about;
    "3 - -4" ? We : ;
    have: i = 0;
    '3' -  > push;
    3, expectOperand = false;
    i = 1;
    ' ' -  > skip;
    i = 2;
    '-' -  > binary_minus, set;
    expectOperand = true;
    i = 3;
    '-' -  > unary_minus, set;
    expectOperand = true;
    i = 4;
    '4' -  > push;
    4;
    This;
    is;
    also;
    correct.
        However, what;
    about;
    "3 - (-4)" ? We : ;
    have;
    the;
    same ? Actually : ,  in the;
    above;
    we;
    have: After;
    the;
    binary_minus, we;
    have;
    a;
    space;
    and;
    then;
    a;
    '(';
    and;
    then;
    a;
    unary_minus.So;
    the;
    unary_minus;
    is;
    inside;
    the;
    parentheses.
    ;
    But;
    what;
    about;
    "3 - -4" ? There : ;
    is;
    no;
    parentheses.So;
    the;
    unary_minus;
    is;
    directly;
    after;
    the;
    binary_minus.
    ;
    This;
    tokenization;
    seems;
    to;
    handle;
    the;
    unary;
    operators;
    correctly.
        However, note;
    what;
    about;
    positive;
    numbers ? e.g. : , "3 + +4" -  >
        i;
    0;
    '3' -  > push;
    3, expectOperand = false;
    i = 1;
    ' ' -  > skip;
    i = 2;
    '+' -  > binary_plus, set;
    expectOperand = true;
    i = 3;
    '+' -  > unary_plus, set;
    expectOperand = true;
    i = 4;
    '4' -  > push;
    4;
    This;
    is;
    correct.
    ;
    But;
    what;
    about;
    "3 + -4" ?
        i = 0 : '3' -  > push;
    3, expectOperand = false;
    i = 1;
    ' ' -  > skip;
    i = 2;
    '+' -  > binary_plus, set;
    expectOperand = true;
    i = 3;
    '-' -  > unary_minus, set;
    expectOperand = true;
    i = 4;
    '4' -  > push;
    4;
    This;
    is;
    correct.
    ;
    So;
    the;
    tokenization;
    algorithm: tokens = [];
    expectOperand = true; // because we start expecting an operand
    i = 0;
    n = s.length;
    while (i < n)
        : c = s[i];
    if (c)
        is;
    space: i++, ;
    continue;
    if (c)
        is;
    digit: j = i;
    while (j < n)
        and;
    s[j];
    is;
    digit: j++;
    token = s.substring(i, j);
    tokens.push(parseInt(token));
    expectOperand = false;
    i = j;
    if (c)
        is;
    '+';
    or;
    c;
    is;
    '-';
    if (expectOperand)
        : tokens.push({ type: 'unary', op: c });
    else
        : tokens.push({ type: 'binary', op: c });
    expectOperand = true; // because after any operator (unary or binary) we expect an operand
    if (c)
        is;
    '(';
    tokens.push({ type: 'paren', op: '(' });
    expectOperand = true; // because after '(', we expect an operand (which could be a unary operator, a number, or another '(')
    if (c)
        is;
    ')';
    tokens.push({ type: 'paren', op: ')' });
    expectOperand = false; // because after ')', we might have an operator or end, but not an operand immediately? Actually, we can have something like: 3 + (4 * 5) - 6 -> after ')' we have '-' which is an operator.
    // But note: what if we have: 3 + (4) -> after ')' we are at the end? So we don't need to set expectOperand to false? Actually, it doesn't matter because after ')' we are not expecting an operand until we see an operator.
    i++;
    However, what;
    about;
    consecutive;
    parentheses ? e.g. : , "((3))" -  >
        i;
    0;
    '(' -  > push;
    left_paren, expectOperand = true;
    i = 1;
    '(' -  > push;
    left_paren, expectOperand = true;
    i = 2;
    '3' -  > push;
    3, expectOperand = false;
    i = 3;
    ')' -  > push;
    right_paren, expectOperand = false;
    i = 4;
    ')' -  > push;
    right_paren, expectOperand = false;
    This;
    is;
    acceptable.
    ;
    But;
    note: what;
    about;
    "3)4" ? This : ;
    is;
    invalid.We;
    don;
    't need to handle invalid expressions? The problem says "valid expression", so we assume it';
    s;
    valid.
        However, we;
    must;
    handle;
    the;
    where;
    we;
    have;
    an;
    operator in the;
    middle;
    of;
    numbers ? The : ;
    problem;
    says;
    the;
    expression;
    is;
    valid.
        Now, after;
    tokenization, we;
    have;
    an;
    array;
    of;
    tokens.Each;
    token;
    is;
    either: -a;
    number(integer)
        - an;
    operator;
    token: either;
    unary;
    or;
    binary();
    for (+, -,  * , /;;)
        -a;
    parenthesis;
    token: '(';
    or;
    ')';
    Now, we;
    want;
    to;
    convert;
    the;
    infix;
    expression;
    to;
    postfix(RPN);
    the = __addDisposableResource(env_1, void 0, false), shunting = __addDisposableResource(env_1, void 0, false);
    -yard;
    algorithm.
        Shunting - yard;
    algorithm: output = []; // queue for postfix
    operators = []; // stack for operators and parentheses
    For;
    each;
    token: if (token)
        is;
    a;
    number: push;
    to;
    output;
    if (token)
        is;
    an;
    operator(unary, or, binary);
    while (operators)
        is;
    not;
    empty;
    and(top, of, operators, is, an, operator);
    and(precedence, of, top, operator > current, operator, 's precedence) and (top, operator, is, not, '('), and());
    if (current)
        operator;
    is;
    right - associative, then;
    we;
    don;
    't pop for same precedence? But note: our operators are left-associative? ;
    Actually, all;
    our;
    operators;
    are;
    left - associative.So;
    we;
    pop;
    operators;
    with (precedence >= current)
        operator;
    's precedence? ;
    But;
    wait: unary;
    operators;
    are;
    right - associative ? Actually : , unary;
    operators;
    are;
    typically;
    right - associative ?
        However : ,  in our;
    we;
    have;
    unary + and - which;
    are;
    right - associative ?
        Example : --3 -  > -(-3);
    3.;
    So;
    we;
    want;
    to;
    parse;
    (unary_minus(3)).
    ;
    So;
    when;
    we;
    have;
    two;
    unary;
    operators in a;
    row, we;
    don;
    't pop the first one when we see the second one? ;
    Because;
    the;
    precedence;
    of;
    unary_minus;
    is;
    the;
    same, but;
    they;
    are;
    right - associative.
    ;
    So;
    we;
    need;
    to;
    consider;
    associativity.
    ;
    We;
    assign;
    precedence;
    and;
    associativity;
    for (each; operator; )
        : unary;
    operators: unary_plus: precedence = 4(highest), right - associative;
    unary_minus: precedence = 4, right - associative;
    binary;
    operators: '*';
    and;
    '/';
    precedence = 3, left - associative;
    '+';
    and;
    '-';
    precedence = 2, left - associative;
    Note: We;
    must;
    also;
    consider;
    that;
    unary;
    operators;
    have;
    higher;
    precedence;
    than;
    binary;
    operators.
        However, there;
    is;
    a;
    nuance: the;
    unary;
    operators;
    are;
    not;
    just;
    precedence;
    and;
    associativity, but;
    they;
    are;
    also;
    applied;
    to;
    the;
    operand;
    that;
    follows.
    ;
    In;
    the;
    shunting - yard;
    algorithm, we;
    treat;
    unary;
    operators;
    that;
    take;
    one;
    operand.But;
    the;
    algorithm;
    for (binary; operators; is)
        well;
    known.
    ;
    How;
    to;
    handle;
    unary;
    operators in shunting - yard ?
        We : ;
    can;
    treat;
    unary;
    operators;
    higher;
    precedence;
    and;
    being;
    right - associative.
    ;
    But;
    note: the;
    algorithm;
    must;
    handle;
    the;
    fact;
    that;
    a;
    unary;
    operator;
    has;
    only;
    one;
    operand.So;
    when;
    we;
    pop, we;
    pop;
    one;
    operand;
    for (unary, and; two; )
        for (binary.
        ; Steps; )
            for (the; shunting - yard; )
                : For;
    each;
    token: if (token)
        is;
    a;
    number: push;
    to;
    output;
    if (token)
        is;
    '(';
    push;
    to;
    operators;
    stack;
    if (token)
        is;
    ')';
    pop;
    from;
    operators;
    stack;
    until;
    '(';
    is;
    found.Push;
    each;
    popped;
    operator;
    to;
    output.
    ;
    if (token)
        is;
    an;
    operator(unary, or, binary);
    while (operators)
        stack;
    is;
    not;
    empty;
    and(top, of, operators, is, an, operator);
    and((precedence), of, top, operator > precedence, of, current, operator);
    or(precedence, equal, and, current, operator, is, left - associative);
    and(top, operator, is, not, '(');
    pop;
    the;
    top;
    operator;
    and;
    push;
    to;
    output;
    push;
    current;
    operator;
    to;
    operators;
    stack;
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
    But;
    note: the;
    condition;
    for (popping; ; )
        : We;
    pop;
    operators;
    that;
    have;
    higher;
    precedence, or;
    same;
    precedence;
    and;
    left - associative.
        However, ;
    for (right - associative; operators, we; )
        do
            not;
        while (pop);
    when;
    the;
    precedence;
    is;
    equal ?
        So : ;
    the;
    condition: while (operators)
        stack;
    is;
    not;
    empty;
    and(top, of, operators, is, an, operator);
    and((prec(top) > prec(current)), or(prec(top) == prec(current), and, current.associativity == 'left'));
    and(top != '(');
    pop;
    top;
    to;
    output;
    However, there;
    is;
    a;
    try { }
    catch { }
    what;
    if (the)
        top;
    operator;
    is;
    a;
    right - associative;
    operator;
    and;
    the;
    current;
    operator;
    is;
    also;
    right - associative;
    with (the)
        same;
    precedence ? Then : ;
    we;
    don;
    't pop? ;
    Example: unary;
    operators: current;
    operator: unary_minus(prec = 4, right - associative);
    top;
    operator: unary_minus(prec = 4, right - associative) -  > we;
    do
        not;
    while (pop.
    );
    Then;
    we;
    push;
    the;
    current;
    unary_minus.Then;
    when;
    we;
    encounter;
    the;
    operand(a, number), we;
    push;
    it;
    to;
    output.Then;
    when;
    we;
    finish, we;
    pop;
    the;
    operators: We;
    pop;
    unary_minus(the, last, one) -  > output;
    [number, unary_minus];
    Then;
    we;
    pop;
    the;
    next;
    unary_minus -  > output;
    [number, unary_minus, unary_minus];
    Then;
    when;
    we;
    evaluate;
    the;
    RPN: For;
    a;
    unary;
    operator, we;
    pop;
    one;
    operand;
    and;
    apply;
    the;
    operator.
    ;
    So;
    the;
    evaluation;
    of;
    RPN;
    for (unary; operators; )
        : We;
    need;
    to;
    know;
    the;
    arity;
    of;
    the;
    operator.
    ;
    We;
    can;
    represent;
    the;
    operators in the;
    stack;
    an;
    arity.
    ;
    unary;
    operators: arity = 1;
    binary;
    operators: arity = 2;
    Then;
    when;
    popping;
    during;
    shunting - yard, we;
    don;
    't need the arity, but during evaluation we do.;
    Alternatively, we;
    can;
    handle;
    the;
    unary;
    operators;
    during;
    tokenization;
    by;
    combining;
    them;
    with (the)
        next;
    operand ? But : ;
    the;
    problem;
    says;
    to;
    treat;
    them, there;
    is;
    a;
    simpler;
    approach: we;
    can;
    preprocess;
    the;
    tokens;
    to;
    combine;
    unary;
    operators;
    with (the)
        following;
    number ?
        But : ;
    note: what;
    about;
    "3 - -4" ? We : ;
    have: [3, binary_minus, unary_minus, 4] -  > we;
    want;
    to;
    combine;
    unary_minus;
    and;
    4;
    into;
    a;
    negative;
    number ?
        But : ;
    then;
    we;
    would;
    have: [3, binary_minus, -4] -  > which;
    is;
    3 - (-4);
    7.;
    But;
    what;
    about;
    "3 - +4" ? - > [3, binary_minus, unary_plus, 4] -  > combine : ;
    unary_plus;
    and;
    4 -  > [3, binary_minus, 4] -  > 3 - 4;
    -1.;
    And;
    what;
    about;
    "3 * -4" ? - > [3, binary_multiply, unary_minus, 4] -  > combine : ;
    to[3, binary_multiply, -4] -  > 3 * -4;
    -12.;
    This;
    seems;
    to;
    work.
    ;
    How;
    to;
    combine: We;
    can;
    traverse;
    the;
    tokens;
    and;
    whenever;
    we;
    see;
    a;
    unary;
    operator;
    immediately;
    followed;
    by;
    a;
    number, we;
    combine;
    them.
    ;
    But;
    note: what;
    about;
    "3 - - -4" ?
        tokens : [3, binary_minus, unary_minus, unary_minus, 4];
    We;
    combine;
    the;
    last;
    two: unary_minus;
    and;
    4 -  > -4, then;
    we;
    have: [3, binary_minus, unary_minus, -4] -  > then;
    combine;
    unary_minus;
    and - 4 -  > 4 ?
        But : ;
    wait: -(-4);
    4, so;
    3 - 4;
    -1.;
    Alternatively, we;
    can;
    combine;
    all;
    consecutive;
    unary;
    operators;
    with (the)
        next;
    number ?
        But : ;
    note: the;
    next;
    number;
    might;
    not;
    be;
    immediately;
    after;
    the;
    unary;
    operators ? Actually : ,  in our;
    tokenization, the;
    unary;
    operators;
    are;
    only;
    followed;
    by;
    a;
    number;
    or;
    an;
    opening;
    parenthesis ?
        But : ;
    wait: what;
    about;
    "3 - (-4)" ?
        tokens : [3, binary_minus, left_paren, unary_minus, 4, right_paren];
    We;
    don;
    't want to combine unary_minus and 4 because there is a left_paren in between? Actually, no: the unary_minus is after the left_paren, so it';
    s;
    the;
    start;
    of;
    the;
    operand;
    inside;
    the;
    parentheses.
    ;
    So;
    we;
    can;
    combine;
    unary;
    operators;
    that;
    are;
    immediately;
    followed;
    by;
    a;
    number ? But : ;
    what;
    about;
    "3 - (-4)" ?
        We : ;
    have: ;
    left_paren, unary_minus, 4, right_paren -  > we;
    don;
    't want to combine unary_minus and 4 because the left_paren is in between? Actually, the unary_minus is the first token inside the parentheses, so it is the operator for the number 4.;
    But;
    note: we;
    cannot;
    combine;
    the;
    unary_minus;
    and;
    4;
    into;
    a;
    negative;
    number;
    because;
    the;
    left_paren;
    is;
    not;
    an;
    operator;
    that;
    we;
    would;
    combine.We;
    are;
    only;
    combining;
    unary;
    operators;
    with (the)
        next;
    number ?
        However : ,  in the;
    expression;
    "3 - (-4)", the;
    unary_minus;
    is;
    acting;
    on;
    the;
    number;
    4, and;
    then;
    the;
    left_paren;
    is;
    grouping;
    the;
    entire;
    "-4".So;
    we;
    can;
    combine;
    the;
    unary_minus;
    and;
    4;
    into - 4 ?
        But : ;
    then;
    we;
    have: [3, binary_minus, left_paren, -4, right_paren] -  > which;
    is;
    3 - (-4);
    7.;
    Similarly, "3 - -4" -  > [3, binary_minus, unary_minus, 4] -  > combine;
    unary_minus;
    and;
    4 -  > [3, binary_minus, -4] -  > 3 - (-4);
    7.;
    So;
    we;
    can;
    do
        : tokens2 = [];
    while (i = 0);
    while (i < tokens.length)
        : if (tokens[i])
            is;
    a;
    unary;
    operator: if (i + 1 < tokens.length)
        and;
    tokens[i + 1];
    is;
    a;
    number: 
    // combine: apply unary operator to the number
    num = tokens[i + 1];
    if (tokens[i].op == '-')
        : num = -num;
    // if tokens[i].op == '+', then num = +num -> which is the same
    tokens2.push(num);
    i += 2; // skip the number
    // what if the next token is not a number? For example, an opening parenthesis? 
    // Example: "3 - (-4)" -> tokens: [3, binary_minus, left_paren, unary_minus, 4, right_paren]
    // When we are at unary_minus, the next token is 4 (a number) -> so we combine.
    // But what if we have: "3 - ( -4 )" -> same thing.
    // What if we have: "3 - ( +4 )" -> tokens: [3, binary_minus, left_paren, unary_plus, 4, right_paren] -> combine unary_plus and 4 -> 4.
    // What if we have: "3 - ( - -4 )" -> tokens: [3, binary_minus, left_paren, unary_minus, unary_minus, 4, right_paren]
    //   i=0: 3 -> push
    //   i=1: binary_minus -> push
    //   i=2: left_paren -> push
    //   i=3: unary_minus -> next token is unary_minus (not a number) -> so we don't combine? 
    //   But wait, the next token is not a number, so we push the unary_minus as is? 
    //   Then i=4: unary_minus -> next token is 4 (a number) -> combine: -4 -> push 4? But wait: unary_minus on 4 is -4, but then we have two unary_minus? 
    //   Actually, we have: unary_minus (first) and unary_minus (second) and then 4. 
    //   We want: -(-4) = 4. 
    //   So if we don't combine the first unary_minus, then when we get to the second unary_minus and 4, we combine to -4? Then we have: 
    //        tokens2: [3, binary_minus, left_paren, unary_minus, 4] -> then we need to apply unary_minus to 4? But wait, the unary_minus is an operator that requires an operand. 
    //        But in the RPN, we would have: ... unary_minus, 4 -> then we pop 4, apply unary_minus -> -4, then we have ... unary_minus, -4 -> then we pop -4, apply unary_minus -> 4.
    //   So it works without combining the consecutive unary operators? 
    //   But note: in the shunting-yard, the consecutive unary operators will be pushed to the output in order? 
    //   Example: unary_minus, unary_minus, 4 -> 
    //        shunting-yard: 
    //          output: []
    //          operators: []
    //          token1: unary_minus -> operators: [unary_minus]
    //          token2: unary_minus -> operators: [unary_minus, unary_minus]   (because same precedence and right-associative, so we don't pop the first)
    //          token3: 4 -> output: [4]
    //        then pop operators: 
    //          pop unary_minus -> output: [4, unary_minus]
    //          pop unary_minus -> output: [4, unary_minus, unary_minus]
    //        evaluation: 
    //          pop 4, pop unary_minus -> apply unary_minus to 4 -> -4
    //          pop -4, pop unary_minus -> apply unary_minus to -4 -> 4
    //        which is correct.
    //   So we don't need to combine consecutive unary operators with a number that is not immediately following? 
    //   But wait, in the above, the second unary_minus is immediately followed by 4. The first unary_minus is followed by the second unary_minus, which is not a number. 
    //   So we can only combine a unary operator with a number that is immediately after it? 
    //   Therefore, we can only combine a unary operator with a number if the next token is a number. Otherwise, we leave it.
    tokens2.push(tokens[i]);
    i += 1;
    tokens2.push(tokens[i]);
    i += 1;
    This;
    will;
    combine;
    unary;
    operators;
    only;
    when;
    they;
    are;
    immediately;
    followed;
    by;
    a;
    number.
    ;
    But;
    what;
    about;
    "3 - - -4" ?
        tokens : [3, binary_minus, unary_minus, unary_minus, 4];
    i = 0;
    3 -  > push;
    i = 1;
    binary_minus -  > push;
    i = 2;
    unary_minus -  > next;
    token;
    is;
    unary_minus(not, a, number) -  > push;
    unary_minus;
    i = 3;
    unary_minus -  > next;
    token;
    is;
    4(a, number) -  > combine;
    -4 -  > push;
    4;
    tokens2: [3, binary_minus, unary_minus, -4] -  > but;
    wait, we;
    pushed;
    4 ? Actually : , we;
    pushed;
    the;
    combined;
    number: tokens[3];
    is;
    unary_minus, tokens[4];
    is;
    4 -  > combine;
    -4 -  > push - 4.;
    So;
    tokens2: [3, binary_minus, unary_minus, -4];
    Then;
    evaluation: 3 -  > push;
    3;
    binary_minus -  > push;
    operator;
    unary_minus -  > push;
    operator
        - 4 -  > push - 4;
    Then;
    evaluate: pop - 4, pop;
    unary_minus -  > apply;
    unary_minus;
    to - 4 -  > 4;
    pop;
    4, pop;
    binary_minus -  > pop;
    3, apply;
    binary_minus;
    to;
    3;
    and;
    4 -  > 3 - 4;
    -1;
    So;
    3 - (-(-4));
    3 - 4;
    -1 -  > correct.
    ;
    But;
    what;
    about;
    "3 - - - -4" ?
        tokens : [3, binary_minus, unary_minus, unary_minus, unary_minus, 4];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    unary_minus(next, is, unary_minus, not, number) -  > push;
    unary_minus;
    i = 3;
    unary_minus(next, is, unary_minus, not, number) -  > push;
    unary_minus;
    i = 4;
    unary_minus(next, is, 4) -  > combine;
    -4 -  > push - 4;
    tokens2: [3, binary_minus, unary_minus, unary_minus, -4];
    evaluation: push;
    3, push;
    binary_minus, push;
    unary_minus, push;
    unary_minus, push - 4;
    pop - 4, pop;
    unary_minus -  > 4;
    pop;
    4, pop;
    unary_minus -  > -4;
    pop - 4, pop;
    binary_minus -  > 3 - (-4);
    7 -  > correct.
    ;
    So;
    this;
    combination;
    only;
    works;
    for (the; last; unary)
        operator;
    that;
    is;
    followed;
    by;
    a;
    number.The;
    others;
    are;
    left;
    unary;
    operators.
        However, what;
    about;
    "3 - + -4" ?
        tokens : [3, binary_minus, unary_plus, unary_minus, 4];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    unary_plus(next, is, unary_minus, not, number) -  > push;
    unary_plus;
    i = 3;
    unary_minus(next, is, 4) -  > combine;
    -4 -  > push - 4;
    tokens2: [3, binary_minus, unary_plus, -4];
    evaluation: push;
    3, push;
    binary_minus, push;
    unary_plus, push - 4;
    pop - 4, pop;
    unary_plus -  > -4(because, unary_plus, does, nothing);
    pop - 4, pop;
    binary_minus -  > 3 - (-4);
    7 -  > correct.
    ;
    But;
    what;
    about;
    "3 - + +4" ?
        tokens : [3, binary_minus, unary_plus, unary_plus, 4];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    unary_plus(next, is, unary_plus, not, number) -  > push;
    unary_plus;
    i = 3;
    unary_plus(next, is, 4) -  > combine;
    +4 -  > 4 -  > push;
    4;
    tokens2: [3, binary_minus, unary_plus, 4];
    evaluation: push;
    3, push;
    binary_minus, push;
    unary_plus, push;
    4;
    pop;
    4, pop;
    unary_plus -  > 4;
    pop;
    4, pop;
    binary_minus -  > 3 - 4;
    -1 -  > correct.
    ;
    So;
    this;
    combination;
    works.
        However, what;
    about;
    "3 - ( -4 )" ?
        tokens : [3, binary_minus, left_paren, unary_minus, 4, right_paren];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    left_paren, i = 3;
    unary_minus(next, is, 4, a, number) -  > combine;
    -4 -  > push - 4;
    tokens2: [3, binary_minus, left_paren, -4, right_paren];
    Then;
    shunting - yard;
    output: [];
    operators: [];
    token1: 3 -  > output;
    [3];
    token2: binary_minus -  > operators;
    [binary_minus];
    token3: left_paren -  > operators;
    [binary_minus, left_paren];
    token4: -4 -  > output;
    [3, -4];
    token5: right_paren -  > pop;
    until;
    left_paren: pop;
    binary_minus ? - > no : , because;
    left_paren;
    is;
    on;
    top ?
        Actually : , we;
    pop;
    until;
    we;
    find;
    left_paren.So;
    we;
    pop;
    left_paren;
    and;
    discard.Then;
    we;
    push;
    the;
    popped;
    operators;
    to;
    output ?
        But : ;
    wait, the;
    shunting - yard;
    algorithm: when;
    we;
    see;
    ')', pop;
    from;
    operators;
    until;
    '(';
    is;
    found.
    ;
    So;
    we;
    pop;
    left_paren;
    and;
    discard.Then;
    we;
    push;
    the;
    popped;
    operators;
    to;
    output ? But : ;
    there;
    are;
    no;
    operators;
    popped ?
        So : ;
    output: [3, -4];
    and;
    operators: [];
    Then;
    after;
    the;
    expression, pop;
    operators: none.
    ;
    Then;
    evaluate: 3 - (-4);
    7 -  > correct.
    ;
    But;
    what;
    about;
    "3 - ( +4 )" ?
        tokens : [3, binary_minus, left_paren, unary_plus, 4, right_paren];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    left_paren, i = 3;
    unary_plus(next, is, 4) -  > combine;
    +4 -  > 4 -  > push;
    4;
    tokens2: [3, binary_minus, left_paren, 4, right_paren];
    Then;
    evaluation: 3 - 4;
    -1 -  > correct.
    ;
    So;
    this;
    combination;
    seems;
    to;
    work.
        However, what;
    about;
    "3 - ( - -4 )" ?
        tokens : [3, binary_minus, left_paren, unary_minus, unary_minus, 4, right_paren];
    i = 0;
    3, i = 1;
    binary_minus, i = 2;
    left_paren, i = 3;
    unary_minus(next, is, unary_minus, not, number) -  > push;
    unary_minus;
    i = 4;
    unary_minus;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
