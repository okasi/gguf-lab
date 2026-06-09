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
numbers;
and;
operators(including, unary + /-).
;
2.;
Handle;
unary;
operators: -A;
unary + or - at;
the;
beginning;
of;
the;
expression, or;
after;
an;
operator;
or;
opening;
parenthesis;
is;
unary.
;
3.;
Convert;
infix;
to;
postfix(RPN);
var shunting, the, above, algorithm;
const env_1 = { stack: [], error: void 0, hasError: false };
try {
    shunting = __addDisposableResource(env_1, void 0, false);
    -yard, considering;
    unary;
    operators.
    ;
    4.;
    Evaluate;
    the;
    RPN.
        However, note;
    the;
    problem;
    says;
    to;
    evaluate;
    one;
    arithmetic;
    expression.We;
    are;
    to;
    read;
    from;
    stdin.
        Let;
    's break down:;
    Tokenization: We;
    'll traverse the string and extract tokens:
        - Numbers;
    sequence;
    of;
    digits.
        - Operators;
    +, -,  * , /
        - Parentheses;
    (, );
    But;
    note: unary;
    operators.How;
    to;
    distinguish ?
        -A : ;
    unary;
    operator;
    is;
    an;
    operator;
    that;
    is;
    not;
    preceded;
    by;
    an;
    operand(or, is, at, the, start, or, after, an, operator, or, '(').
    ;
    We;
    can;
    do
        : -If;
    while (we);
    see;
    a;
    '-';
    or;
    '+';
    that;
    is;
    at;
    the;
    start, or;
    after;
    an;
    operator;
    or;
    '(', then;
    it;
    's unary.;
    However,  in the;
    shunting - yard;
    algorithm, we;
    can;
    handle;
    unary;
    by;
    treating;
    them;
    with (higher)
        precedence.
            Alternatively, we;
    can;
    preprocess;
    the;
    tokens;
    to;
    assign;
    a;
    type(unary, or, binary);
    to;
    the + and - .
        Approach;
    -We;
    'll create a token stream that includes:;
    {
        type: 'number', value;
        number;
    }
    {
        type: 'operator', value;
        op, precedence;
        precedence, isUnary;
        boolean;
    }
    {
        type: 'leftParen';
    }
    {
        type: 'rightParen';
    }
    How;
    to;
    determine;
    if (an)
        operator;
    is;
    unary ?
        -The : ;
    first;
    token;
    if (it)
        is;
    '+';
    or;
    '-';
    is;
    unary.
        - After;
    an;
    operator(binary, or, unary);
    or;
    after;
    '(', the;
    next;
    operator;
    if (it)
        is;
    '+';
    or;
    '-';
    is;
    unary.
    ;
    But;
    note: what;
    about;
    consecutive;
    operators ? For : ;
    example, "--5" -  > unary;
    minus;
    applied;
    twice.
    ;
    We;
    can;
    do
        a;
    while (pass);
    to;
    mark;
    unary;
    operators: -We;
    'll traverse the token list. For each token that is an operator (either ' + ' or ' - '), check:
        - If;
    it;
    's the first token, then it';
    s;
    unary.
        - If;
    the;
    previous;
    token;
    is;
    an;
    operator(any, operator);
    or;
    a;
    left;
    parenthesis, then;
    it;
    's unary.;
    However, note;
    what;
    about;
    something;
    like;
    "3*-5" ?
        -The : ;
    '-';
    here;
    is;
    after;
    a;
    binary;
    operator;
    '*', so;
    it;
    should;
    be;
    unary.
    ;
    Steps;
    for (tokenization; ; )
        : Let;
    's define:;
    tokens = [];
    i = 0;
    while (i < length)
        : if (current)
            char;
    is;
    digit: read;
    number;
    if (current)
        char;
    is;
    one;
    of;
    '+', '-', '*', '/', '(', ')';
    if (the)
        char;
    is;
    '+';
    or;
    '-', check;
    if (it)
        's unary.;
    else
        , just;
    an;
    operator.
    ;
    if (space)
        : skip.
        ;
    How;
    to;
    check;
    if (a)
        '+';
    or;
    '-';
    is;
    unary ?
        -If : ;
    i == 0;
    unary.
        - Else, look;
    at;
    the;
    previous;
    token();
    if (any)
        : -If;
    the;
    previous;
    token;
    is;
    an;
    operator(binary, or, unary);
    or;
    a;
    left;
    parenthesis, then;
    it;
    's unary.;
    But;
    note: what;
    about;
    something;
    like;
    "3 - -5" ?
        -The : ;
    first;
    '-';
    is;
    binary(because, it, 's after a number), the second ' - ' is unary (because it', s, after, an, operator).
        Implementation;
    We;
    'll create a list of tokens. We';
    ll;
    also;
    keep;
    a;
    flag;
    for (the; last; token)
        type.
            Alternatively, we;
    can;
    do
        : tokens = [];
    while (lastTokenType = null); // to be set to 'operator', 'number', 'leftParen', etc.
    for (each; char in the; expression)
        : if (digit)
            : parse;
    the;
    number, add;
    token, set;
    lastTokenType = 'number';
    elif;
    char in '+-';
    // check if unary: 
    if (lastTokenType)
        is;
    null;
    or;
    lastTokenType;
    is;
    'operator';
    or;
    lastTokenType;
    is;
    'leftParen';
    // unary
    add;
    token;
    with (isUnary = true)
        ;
    add;
    token;
    with (isUnary = false)
        set;
    lastTokenType = 'operator';
    elif;
    char in '* /';
    add;
    token;
    with (isUnary = false(since, these, are, always, binary))
        set;
    lastTokenType = 'operator';
    elif;
    char == '(';
    add;
    token;
    with (type = 'leftParen')
        set;
    lastTokenType = 'leftParen';
    elif;
    char == ')';
    add;
    token;
    with (type = 'rightParen')
        set;
    lastTokenType = 'rightParen';
    Then,  in the;
    shunting - yard;
    algorithm, we;
    need;
    to;
    handle;
    unary;
    operators.
        Precedence;
    unary: highest(say, 3)
        * , / : 2
        + , -;
    1;
    Associativity: All;
    operators;
    are;
    left - associative.
    ;
    Steps;
    for (shunting - yard; ; )
        : outputQueue = [];
    operatorStack = [];
    for (each; token in tokens; )
        : if (token)
            is;
    number: outputQueue.push(token);
    elif;
    token;
    is;
    operator: while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    operator;
    and((isLeftAssociative), and, token.precedence <= operatorStack.last.precedence);
    or(not, isLeftAssociative, and, token.precedence < operatorStack.last.precedence);
    and;
    operatorStack.last.isUnary != token.isUnary; // we don't want to pop unary? Actually, we have to be careful.
    outputQueue.push(operatorStack.pop());
    operatorStack.push(token);
    elif;
    token;
    is;
    leftParen: operatorStack.push(token);
    elif;
    token;
    is;
    rightParen: while (operatorStack.last)
        is;
    not;
    leftParen: outputQueue.push(operatorStack.pop());
    operatorStack.pop(); // remove the leftParen
    while (operatorStack)
        not;
    empty: outputQueue.push(operatorStack.pop());
    However, note;
    the;
    unary;
    operators;
    are;
    right - associative ? Actually : , they;
    are;
    left - associative ?
        But : ;
    typically, unary;
    operators;
    are;
    right - associative.However,  in our;
    the;
    unary;
    operator;
    is;
    only;
    one;
    level.
    ;
    But;
    the;
    problem: we;
    have;
    to;
    handle;
    unary;
    operators in the;
    shunting - yard.The;
    standard;
    shunting - yard;
    doesn;
    't handle unary.;
    Alternative;
    approach: preprocess;
    the;
    expression;
    to;
    replace;
    unary;
    operators;
    with (a)
        special;
    token.
    ;
    Another;
    idea: we;
    can;
    handle;
    unary;
    operators in the;
    evaluation;
    phase;
    by;
    treating;
    them;
    of;
    the;
    number ?
        But : ;
    that;
    might;
    be;
    tricky;
    because;
    we;
    have;
    to;
    parse;
    the;
    sign.
    ;
    Let;
    me;
    try { }
    finally { }
    a;
    different;
    approach: we;
    can;
    convert;
    the;
    expression;
    to;
    RPN;
    by;
    handling;
    unary;
    operators;
    during;
    tokenization;
    by;
    creating;
    a;
    unary;
    operator;
    token;
    that;
    has;
    a;
    different;
    precedence;
    and;
    associativity.
        However, the;
    problem: the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    next;
    operand.So in RPN, we;
    would;
    have: [operand][unary];
    operator;
    - > which;
    is;
    a;
    unary;
    postfix;
    operator.
    ;
    So;
    we;
    can;
    do
        : In;
    while (the);
    shunting - yard, when;
    we;
    see;
    a;
    unary;
    operator, we;
    push;
    it;
    to;
    the;
    operator;
    stack.
        Then, when;
    we;
    see;
    a;
    right;
    parenthesis, we;
    pop;
    until;
    we;
    see;
    a;
    left;
    parenthesis, but;
    note: the;
    unary;
    operator;
    is;
    not;
    between;
    two;
    operands.
        Actually, the;
    unary;
    operator;
    should;
    be;
    popped;
    when;
    we;
    have;
    an;
    operand;
    after;
    it.
    ;
    The;
    standard;
    way;
    to;
    handle;
    unary;
    operators in shunting - yard;
    is;
    to;
    have;
    them;
    with (higher)
        precedence;
    and;
    right - associative.
    ;
    But;
    note: the;
    unary;
    operator;
    is;
    followed;
    by;
    an;
    operand, so;
    it;
    should;
    be;
    popped;
    when;
    we;
    have;
    two;
    operands ? Actually : , no.
    ;
    We;
    can;
    do
        : When;
    while (we);
    see;
    a;
    unary;
    operator, we;
    push;
    it;
    to;
    the;
    stack.
        Then, when;
    we;
    see;
    an;
    operand(number);
    or;
    a;
    right;
    parenthesis, we;
    pop;
    the;
    unary;
    operator;
    from;
    the;
    stack;
    and;
    push;
    to;
    output ?
        But : ;
    that;
    would;
    break the;
    order.
        Actually, the;
    unary;
    operator;
    should;
    be;
    applied;
    to;
    the;
    next;
    operand.So in RPN, the;
    unary;
    operator;
    should;
    come;
    after;
    the;
    operand.
        Example;
    -5 -  > RPN;
    5 -
        How;
    to;
    get;
    that ?
        We : ;
    can;
    do
        a;
    while (preprocessing);
    step: replace;
    unary;
    operators;
    with (a)
        special;
    token;
    that;
    we;
    can;
    handle in the;
    evaluation.
        Alternatively, we;
    can;
    do
        : In;
    while (the);
    shunting - yard, when;
    we;
    see;
    a;
    unary;
    operator, we;
    push;
    it;
    to;
    the;
    stack.
        Then, when;
    we;
    see;
    an;
    operand(number);
    or;
    a;
    right;
    parenthesis, we;
    check;
    if (the)
        top;
    of;
    the;
    operator;
    stack;
    is;
    a;
    unary;
    operator ?
        Actually : , we;
    don;
    't want to pop the unary operator immediately because it might be part of a longer expression.;
    Another;
    idea: we;
    can;
    convert;
    the;
    expression;
    to;
    RPN;
    by;
    having;
    the;
    unary;
    operator;
    operator;
    that;
    takes;
    one;
    operand.
        Steps;
    We;
    'll have the same shunting-yard, but when we push a unary operator, we don';
    t;
    pop;
    it;
    until;
    we;
    have;
    an;
    operand;
    after;
    it ?
        Actually : , the;
    standard;
    solution;
    for (unary; operators in shunting - yard; is)
        : -Unary;
    operators;
    are;
    given;
    the;
    highest;
    precedence;
    and;
    are;
    right - associative.
        - When;
    an;
    operand;
    is;
    encountered, ;
    if (there)
        is;
    a;
    unary;
    operator;
    on;
    top;
    of;
    the;
    stack, we;
    pop;
    it;
    and;
    push;
    to;
    output.
    ;
    But;
    that;
    is;
    not;
    exactly;
    correct.
    ;
    Let;
    me;
    look;
    for (a; reference.
        Alternatively, we; can)
        do
            a;
        while (two - pass);
    first, handle;
    the;
    unary;
    operators;
    by;
    creating;
    a;
    new token;
    list;
    that;
    replaces;
    unary;
    operators;
    with (a)
        unary;
    operator;
    token;
    that;
    has;
    a;
    unique;
    precedence, and;
    then;
    do
        the;
    while (standard);
    shunting - yard;
    for (binary; operators.
        However, we; are)
        allowed;
    to;
    use;
    a;
    shunting - yard;
    evaluator, so;
    let;
    's try to adapt.;
    I;
    found;
    a;
    common;
    approach: Preprocess;
    the;
    expression;
    to;
    mark;
    unary;
    operators;
    and;
    then;
    convert;
    the;
    expression;
    to;
    RPN;
    with (the)
        unary;
    operators;
    having;
    a;
    higher;
    precedence.
    ;
    But;
    note: the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    next;
    token.So in RPN, the;
    unary;
    operator;
    should;
    come;
    after;
    the;
    operand.
        Example;
    Infix: -5;
    RPN: 5 -
        How;
    to;
    generate;
    that ?
        We : ;
    can;
    do
        : token: unary_minus, then;
    while (number);
    5.;
    When;
    we;
    see;
    the;
    unary_minus, we;
    push;
    it;
    to;
    the;
    stack.
    ;
    Then;
    when;
    we;
    see;
    the;
    number;
    5, we;
    push;
    it;
    to;
    output.
        Then, after;
    the;
    number, we;
    check;
    the;
    stack: if (the)
        top;
    is;
    a;
    unary;
    operator, we;
    pop;
    it;
    and;
    push;
    to;
    output.
    ;
    So;
    we;
    can;
    do
        : After;
    while (pushing);
    an;
    operand(number);
    to;
    the;
    output, we;
    check;
    the;
    operator;
    stack: if (the)
        top;
    is;
    a;
    unary;
    operator, we;
    pop;
    it;
    and;
    push;
    to;
    output.
    ;
    But;
    note: what;
    about;
    multiple;
    unary;
    operators ?
        --5 :
        token;
    unary_minus, unary_minus, number;
    5.;
    After;
    pushing;
    number;
    5, we;
    pop;
    the;
    top;
    unary;
    operator(the, second, minus);
    and;
    push;
    to;
    output, then;
    pop;
    the;
    first;
    minus;
    and;
    push;
    to;
    output ?
        But : ;
    that;
    would;
    give: 5 - -However, we;
    want: 5 - -(which);
    is;
    correct;
    for (--5;;)
        .
        ;
    So;
    the;
    algorithm: outputQueue = [];
    operatorStack = [];
    for (token in tokens)
        : if (token)
            is;
    number: outputQueue.push(token);
    // After pushing an operand, check if the top of the operator stack is a unary operator?
    // But note: the unary operator might be applied to multiple operands? Actually, no, unary is one operand.
    // However, we have to be cautious: what if there is a binary operator between? 
    // Actually, the unary operator should be applied to the immediate next operand.
    // But consider: 3 * -5
    // tokens: 3, *, unary_minus, 5
    // After pushing 3: output: [3]
    // Then * is pushed to stack: [ * ]
    // Then unary_minus: we push it to stack? But then we have to pop it when we see the 5?
    // After pushing 5: output: [3, 5]
    // Then we check the stack: top is unary_minus? -> we pop it and push to output: [3,5,-]
    // Then we see the end, then we pop the *: [3,5,-,*] -> which is correct.
    // But what about: -3 * 5
    // tokens: unary_minus, 3, *, 5
    // After pushing unary_minus: stack: [unary_minus]
    // Then push 3: output: [3]
    // Then we check the stack: top is unary_minus -> pop and push to output: [3, -]
    // Then we see *: push to stack: [ * ]
    // Then push 5: output: [3, -, 5]
    // Then we check the stack: top is *, but it's binary, so we don't pop.
    // Then at the end, pop *: [3, -, 5, *] -> which is correct.
    // However, what about: 3 - -5
    // tokens: 3, -, unary_minus, 5
    // After pushing 3: output: [3]
    // Then push -: stack: [ - ]
    // Then push unary_minus: stack: [ -, unary_minus ]   (but note: unary_minus has higher precedence, so we don't pop the binary -)
    // Then push 5: output: [3,5]
    // Then we check the stack: top is unary_minus -> pop and push to output: [3,5,-]
    // Then we check the stack again: top is binary - -> but we don't pop because we are not at the end and we don't have another operand? 
    // Actually, we only check after pushing an operand. So we don't check after pushing the unary_minus? 
    // We need to check after pushing an operand and also after pushing a right parenthesis? 
    // Also, what about: - (3+5)
    // tokens: unary_minus, (, 3, +, 5, )
    // After pushing unary_minus: stack: [unary_minus]
    // Then push (: stack: [unary_minus, (]
    // Then push 3: output: [3]
    // Then check stack: top is (, not unary, so skip.
    // Then push +: stack: [unary_minus, (, +]
    // Then push 5: output: [3,5]
    // Then check stack: top is +, not unary, skip.
    // Then we see ): pop until (: output: [3,5,+] and then pop ( -> stack: [unary_minus]
    // Then we check: after pushing the right parenthesis, we check the stack? 
    // We need to check after pushing the right parenthesis: if the top is unary_minus, then pop and push to output: [3,5,+, -]
    So;
    we;
    need;
    to;
    check;
    after;
    pushing;
    an;
    operand;
    and;
    after;
    pushing;
    a;
    right;
    parenthesis.
        Steps;
    for (token in tokens)
        : if (token)
            is;
    number: outputQueue.push(token);
    checkUnaryAfterOperand();
    elif;
    token;
    is;
    operator: while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    operator;
    and((isLeftAssociative(token)), and, token.precedence <= operatorStack.last.precedence);
    or(not, isLeftAssociative(token), and, token.precedence < operatorStack.last.precedence);
    and;
    operatorStack.last.isUnary != token.isUnary; // Actually, we don't want to pop a unary operator when we have a binary operator of same precedence? 
    // But note: unary has higher precedence, so we won't pop unary when we have a binary of lower precedence.
    // However, if we have a binary operator and the top of stack is unary, we don't pop because unary has higher precedence? 
    // Actually, the condition: if the top of stack is unary, then it has higher precedence, so we won't pop it for a binary operator of lower or equal precedence? 
    // But wait: the condition is: token.precedence <= operatorStack.last.precedence for left-associative.
    // Since unary has higher precedence, if token is binary and has lower precedence, then we don't pop the unary? 
    // Actually, the condition: we pop if the top of stack has precedence >= current token's precedence (for left-associative).
    // So if the top is unary (precedence 3) and current token is binary (precedence 2), then 2 <= 3 -> true, so we pop the unary? 
    // But that would be wrong: we don't want to pop the unary operator when we have a binary operator because the unary operator is waiting for an operand.
    This;
    indicates;
    that;
    our;
    condition;
    for (popping; is; flawed)
        when;
    unary;
    operators;
    are;
    involved.
        Alternative;
    we;
    can;
    remove;
    the;
    condition;
    about;
    unary in the;
    while (loop)
        and;
    handle;
    unary;
    separately.
    ;
    Revised;
    plan: We;
    'll treat unary operators as having higher precedence and right-associative.;
    Precedence: unary: 3
        * , /: 2
        + , -;
    1;
    Associativity: unary: right
        * , /: left
        + , -;
    left;
    Then;
    the;
    shunting - yard;
    algorithm;
    for (binary; operators; is)
        standard.
        ;
    But;
    how;
    to;
    handle;
    unary in the;
    algorithm ?
        We : ;
    can;
    do
        : When;
    while (we);
    see;
    a;
    unary;
    operator, we;
    push;
    it;
    to;
    the;
    stack.
    ;
    When;
    we;
    see;
    an;
    operand, we;
    push;
    it;
    to;
    output.
    ;
    When;
    we;
    see;
    an;
    operator(binary, or, unary);
    that;
    has;
    lower;
    or;
    equal;
    precedence();
    for (left - associative;;)
        or;
    lower;
    precedence();
    for (right - associative;;)
        than;
    the;
    top;
    of;
    the;
    stack, we;
    pop;
    the;
    top;
    of;
    the;
    stack;
    to;
    output.
        However, the;
    issue;
    is;
    that;
    the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    next;
    operand, so;
    it;
    should;
    be;
    popped;
    after;
    the;
    operand;
    is;
    seen.
    ;
    But;
    the;
    standard;
    algorithm;
    doesn;
    't pop the unary operator immediately after the operand.;
    Another;
    idea: we;
    can;
    convert;
    the;
    expression;
    to;
    RPN;
    by;
    having;
    the;
    unary;
    operator;
    operator;
    that;
    is;
    applied;
    after;
    the;
    operand, so in the;
    RPN, the;
    unary;
    operator;
    comes;
    after;
    the;
    operand.
    ;
    How;
    about;
    we;
    do
        a;
    while (preprocessing);
    step: for (every; unary; operator, we)
        insert;
    a;
    token;
    that;
    says;
    "apply unary";
    after;
    the;
    next;
    operand ?
        But : ;
    that;
    might;
    complicate.
    ;
    I;
    found;
    a;
    reference: https: //en.wikipedia.org/wiki/Shunting_yard_algorithm#Handling_unary_operators
     According;
    to;
    the;
    Wikipedia;
    article: "A unary operator may be distinguished from a binary operator by the fact that it is either:
        - the;
    first;
    token in the;
    input
        - or;
    preceded;
    by;
    an;
    operator, left;
    parenthesis, or;
    another;
    unary;
    operator;
    ";
    And;
    then: "When the unary operator is encountered, it is pushed onto the operator stack. However, when an operand is encountered, the unary operator is popped and pushed onto the output queue.";
    So;
    the;
    algorithm: outputQueue = [];
    operatorStack = [];
    for (token in tokens)
        : if (token)
            is;
    number: outputQueue.push(token);
    // After pushing an operand, check if the top of the operator stack is a unary operator?
    while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    unary;
    operator;
    outputQueue.push(operatorStack.pop());
    elif;
    token;
    is;
    operator: 
    // For binary operators, we pop the operators with higher or equal precedence.
    // For unary operators, we push without popping? 
    // But note: the unary operator has higher precedence, so when we see a binary operator, we might pop the unary operator? 
    // Actually, the unary operator should be applied to the next operand, so it should be popped after the operand is seen, not when we see the next operator.
    // So for a binary operator, we do the standard popping, but we don't pop the unary operator? 
    // Actually, the unary operator is on the stack, and when we see a binary operator, we should not pop the unary operator because the unary operator is waiting for an operand.
    // How to avoid popping the unary operator? 
    // We can set the precedence of the unary operator to be higher than any binary operator, so when we see a binary operator, the condition for popping is: 
    //   while (operatorStack not empty and operatorStack.last is operator and 
    //          ( (isLeftAssociative(token) and token.precedence <= operatorStack.last.precedence) or
    //            (not isLeftAssociative(token) and token.precedence < operatorStack.last.precedence) ) and
    //          operatorStack.last.isUnary != token.isUnary)   // This condition is not necessary because unary has higher precedence.
    // But wait: the condition for popping is: if the top of stack has precedence >= current token's precedence (for left-associative), then pop.
    // Since unary has precedence 3, and binary has 2, then when we see a binary operator, the top of stack (if unary) has precedence 3 which is > 2, so we don't pop.
    // So the standard popping condition will not pop the unary operator when we see a binary operator.
    // Then, after the operand is seen, we pop the unary operator.
    // So the algorithm:
    if (token)
        is;
    binary;
    operator: while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    operator;
    and((isLeftAssociative(token)), and, token.precedence <= operatorStack.last.precedence);
    or(not, isLeftAssociative(token), and, token.precedence < operatorStack.last.precedence);
    and;
    operatorStack.last.isUnary != token.isUnary; // Actually, we don't need this because unary has higher precedence and won't be popped by a binary of lower precedence.
    outputQueue.push(operatorStack.pop());
    operatorStack.push(token);
    elif;
    token;
    is;
    unary;
    operator: operatorStack.push(token);
    elif;
    token;
    is;
    leftParen: operatorStack.push(token);
    elif;
    token;
    is;
    rightParen: while (operatorStack.last)
        is;
    not;
    leftParen;
    outputQueue.push(operatorStack.pop());
    operatorStack.pop(); // remove the leftParen
    // After popping the leftParen, check if the top of the stack is a unary operator? 
    // But note: the unary operator might be before the leftParen? 
    // Example: - (3+5)
    // After pushing the right parenthesis, we pop until leftParen, then we remove the leftParen.
    // Then we check: the top of the stack might be a unary operator? 
    // In this example, the stack before the rightParen was: [unary_minus, (]
    // After popping until leftParen, we have: outputQueue: [3,5,+] and operatorStack: [unary_minus]
    // Then we pop the leftParen -> operatorStack: []? 
    // Actually, we pop the leftParen and then we have operatorStack: [unary_minus] -> but wait, we popped the leftParen and then we are done with the parentheses, so we check the unary operator? 
    // But the unary operator is still on the stack. Then we need to check after the parentheses: if there is a unary operator, we pop it.
    // So we can do: after popping the leftParen, we check the stack for unary operators? 
    // But note: the unary operator might be applied to the entire parentheses expression, so it should be popped after the parentheses.
    // How about: after popping the leftParen, we check the stack for unary operators? 
    // Actually, we can do: after the rightParen, we check the stack for unary operators, but only if the unary operator was before the leftParen? 
    // Alternatively, we can do: after the rightParen, we check the stack for unary operators and pop them.
    // But note: the unary operator might be applied to a single operand, so it might be in the middle of the expression.
    // Example: 3 * -5 -> we have unary_minus after the 5, and then at the end of the expression, we check the stack for unary operators? 
    // But we only check after pushing an operand and after pushing a right parenthesis.
    // So for the rightParen, we can do the same check: while the top of the stack is a unary operator, pop and push to output.
    After;
    the;
    tokens, we;
    pop;
    the;
    remaining;
    operators.
        However, there;
    's a catch: the unary operator might be applied to a subexpression that is not immediately after it? ;
    But;
    by;
    the;
    definition, the;
    unary;
    operator;
    is;
    applied;
    to;
    the;
    next;
    operand;
    or;
    subexpression.
    ;
    So;
    the;
    algorithm: outputQueue = [];
    operatorStack = [];
    for (token in tokens)
        : if (token)
            is;
    number: outputQueue.push(token);
    while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    unary;
    operator;
    outputQueue.push(operatorStack.pop());
    elif;
    token;
    is;
    binary;
    operator: while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    operator;
    and((isLeftAssociative(token)), and, token.precedence <= operatorStack.last.precedence);
    or(not, isLeftAssociative(token), and, token.precedence < operatorStack.last.precedence);
    and;
    operatorStack.last.isUnary != token.isUnary; // This condition is redundant because unary has higher precedence and won't be popped by a binary of lower precedence, but for safety we can leave it out.
    outputQueue.push(operatorStack.pop());
    operatorStack.push(token);
    elif;
    token;
    is;
    unary;
    operator: operatorStack.push(token);
    elif;
    token;
    is;
    leftParen: operatorStack.push(token);
    elif;
    token;
    is;
    rightParen: while (operatorStack.last)
        is;
    not;
    leftParen;
    outputQueue.push(operatorStack.pop());
    operatorStack.pop(); // remove the leftParen
    // After removing the leftParen, check for unary operators?
    // But note: the unary operator might be before the leftParen? 
    // Example: - (3+5) -> after popping the leftParen, the stack has the unary_minus, so we need to pop it.
    // So we do:
    while (operatorStack)
        not;
    empty;
    and;
    operatorStack.last;
    is;
    unary;
    operator;
    outputQueue.push(operatorStack.pop());
    // After the tokens, pop the remaining operators
    while (operatorStack)
        not;
    empty;
    outputQueue.push(operatorStack.pop());
    But;
    wait: what;
    about;
    the;
    unary;
    operator;
    after;
    a;
    number ?
        Example : 3 - 5 -  > tokens;
    3, -, unary_minus, 5;
    After;
    pushing;
    3;
    output: [3];
    Then;
    push - ;
    stack: [-];
    Then;
    push;
    unary_minus: stack: [-, unary_minus];
    Then;
    push;
    5;
    output: [3, 5];
    Then;
    we;
    check: after;
    pushing;
    5, we;
    check;
    the;
    stack: top;
    is;
    unary_minus -  > pop;
    and;
    push;
    to;
    output: [3, 5, -];
    Then;
    we;
    check;
    again: top;
    is - , but;
    it;
    's binary, so we don';
    t;
    pop.
    ;
    Then;
    at;
    the;
    end, we;
    pop;
    the - ;
    [3, 5, -, -] -  > which;
    is;
    correct.
        However, what;
    about: 3 * -5;
    tokens: 3,  * , unary_minus, 5;
    After;
    pushing;
    3;
    output: [3];
    Then;
    push * ;
    stack: [ * ];
    Then;
    push;
    unary_minus: stack: [ * , unary_minus];
    Then;
    push;
    5;
    output: [3, 5];
    Then;
    check: top;
    is;
    unary_minus -  > pop;
    and;
    push;
    to;
    output: [3, 5, -];
    Then;
    check: top;
    is * , binary, so;
    we;
    don;
    't pop.;
    Then;
    at;
    the;
    end, pop * ;
    [3, 5, -,  * ] -  > correct.
        And;
    -3 * 5;
    tokens: unary_minus, 3,  * , 5;
    After;
    pushing;
    unary_minus: stack: [unary_minus];
    Then;
    push;
    3;
    output: [3];
    Then;
    check: top;
    is;
    unary_minus -  > pop;
    and;
    push;
    to;
    output: [3, -];
    Then;
    push * ;
    stack: [ * ];
    Then;
    push;
    5;
    output: [3, -, 5];
    Then;
    check: top;
    is * , binary, so;
    we;
    don;
    't pop.;
    Then;
    at;
    the;
    end, pop * ;
    [3, -, 5,  * ] -  > correct.
        And;
    -(3 + 5);
    tokens: unary_minus, (, 3, +, 5, );
    After;
    pushing;
    unary_minus: stack: [unary_minus];
    Then;
    push(stack, [unary_minus, ()], Then, push, 3, output, [3], Then, check, top, is(not, unary, skip.
    , Then, push + , stack, [unary_minus, (, +)], Then, push, 5, output, [3, 5], Then, check, top, is + , not, unary, skip.
    , Then, push), pop, until(output, [3, 5, +], and, then, pop(- > stack, [unary_minus], Then, after, popping, the, leftParen, we, check, top, is, unary_minus -  > pop, and, push, to, output, [3, 5, +, -], And, 3 + -5, tokens, 3, +, unary_minus, 5, After, pushing, 3, output, [3], Then, push + , stack, [+], Then, push, unary_minus, stack, [+, unary_minus], Then, push, 5, output, [3, 5], Then, check, top, is, unary_minus -  > pop, and, push, to, output, [3, 5, -], Then, check, top, is + , binary, so, we, don, 't pop., Then, at, the, end, pop + , [3, 5, -, +] -  > correct.
    , So, the, algorithm, seems, to, work.
        Now, we, need, to, implement, the, shunting - yard)));
    with (this)
        logic.
            Steps;
    1.;
    Tokenize;
    the;
    expression.
    ;
    2.;
    Convert;
    to;
    RPN;
    the = __addDisposableResource(env_1, void 0, false), above = __addDisposableResource(env_1, void 0, false), algorithm = __addDisposableResource(env_1, void 0, false);
    3.;
    Evaluate;
    the;
    RPN.
        Let;
    's define the precedence and associativity:;
    Precedence: unary: 3
        * , /: 2
        + , -;
    1;
    Associativity: unary: right(but, we, don, 't really need it because we pop it after the operand)
        * , /: left
        + , -, left, However, note, the, associativity);
    for (unary; operators; )
        : since;
    they;
    are;
    right - associative, when;
    we;
    have;
    multiple;
    unary;
    operators, they;
    are;
    applied;
    from;
    right;
    to;
    left ?
        But in our : ;
    algorithm, we;
    pop;
    them in order;
    the;
    last;
    unary;
    operator;
    pushed;
    is;
    the;
    first;
    one;
    popped.
        Example;
    --5 -  >
        tokens;
    unary_minus, unary_minus, 5;
    After;
    pushing;
    unary_minus, unary_minus;
    stack: [unary_minus, unary_minus];
    Then;
    push;
    5;
    output: [5];
    Then;
    check: pop;
    the;
    top;
    unary_minus -  > output;
    [5, -];
    Then;
    check: pop;
    the;
    next;
    unary_minus -  > output;
    [5, -, -];
    Then;
    we;
    evaluate: 5 - - - > which;
    is;
    5 - (-5);
    10 ? But : ;
    wait,  in our;
    evaluation, we;
    will;
    do
        : 5 -  > stack;
    while ();
    [5];
    then - - > stack;
    [5] -  > then;
    apply;
    unary;
    minus: [-5];
    then - - > stack;
    [-5] -  > then;
    apply;
    unary;
    minus: [5];
    But;
    we;
    want: --5;
    -(-5);
    5.;
    So;
    the;
    evaluation;
    will;
    handle;
    it;
    correctly.
        Implementation;
    We;
    'll create a token class or just use objects.;
    Let;
    's code:;
    Steps;
    for (tokenization; ; )
        : We;
    'll create an array of tokens.;
    We;
    'll traverse the string.;
    We;
    'll keep a variable: lastTokenType to help determine if a ' + ' or ' - ' is unary.;
    Steps;
    for (RPN; ; )
        : We;
    'll create outputQueue and operatorStack.;
    Steps;
    for (evaluation; ; )
        : We;
    'll use a stack.;
    For;
    each;
    token in RPN;
    if (number)
        : push;
    to;
    stack.
    ;
    if (operator(binary))
        : pop;
    two;
    operands, apply, push;
    result.
    ;
    if (operator(unary))
        : pop;
    one;
    operand, apply, push;
    result.
        Let;
    's code accordingly.;
    Note: the;
    problem;
    says;
    division;
    truncates;
    toward;
    zero.In;
    JavaScript, the / operator;
    for (integers; truncates; toward)
        zero ?
            Actually : , ;
    for (positive; numbers, it; truncates)
        toward;
    zero.For;
    negative;
    numbers, it;
    truncates;
    toward;
    zero ?
        But in JavaScript : , the / operator;
    for (integers; ; )
        : 5 / 2;
    2.5 -  > but;
    we;
    want;
    integer;
    division;
    that;
    truncates;
    toward;
    zero.
    ;
    We;
    can;
    use: Math.trunc(a / b);
    but;
}
catch (e_1) {
    env_1.error = e_1;
    env_1.hasError = true;
}
finally {
    __disposeResources(env_1);
}
