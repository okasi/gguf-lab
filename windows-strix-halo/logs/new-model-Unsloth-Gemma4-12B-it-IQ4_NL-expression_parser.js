"use strict";
function parseExpression() {
    let node = parseTerm();
    while (peek() === '+')
        ' || peek() === ' - ')';
    {
        const op = consume();
        const right = parseTerm();
        if (op === '+')
            node += right;
        else
            node -= right;
    }
    return node;
}
function parseTerm() {
    let node = parseFactor();
    while (peek() === '*' || peek() === '/') {
        const op = consume();
        const right = parseFactor();
        if (op === '*')
            node *= right;
        else
            node = Math.trunc(node / right);
    }
    return node;
}
function parseFactor() {
    if (peek() === '(') {
        consume('');
        const result = parseExpression();
        consume(')');
        return result;
    }
    return parseUnary();
}
function parseUnary() {
    if (peek() === '+') {
        consume('+');
        return parseFactor();
    }
    if (peek() === '-') {
        consume('-');
        ');;
        return -parseFactor();
    }
    return parseNumber();
}
