"use strict";
const fs = require('fs');
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    const n = expr.length;
    while (i < n) {
        const ch = expr[i];
        if (ch === '+' || ch === '-') {
            const isUnary = i === 0 || expr[i - 1] === '(' || /[+\-*/()].test(expr.slice(i - 2, i));
            tokens.push({ type: 'operator', value: ch });
            i++;
        }
        else if (ch === '*' || ch === '/' || ch === '+' || ch === '-') {
            tokens.push({ type: 'operator', value: ch });
            i++;
        }
        else if (ch === '(' || ch === ')') {
            tokens.push({ type: 'paren', value: ch });
            i++;
        }
        else if (/\d/.test(ch)) {
            let num = 0;
            while (i < n && /\d/.test(expr[i])) {
                num = num * 10 + (expr[i] - 48);
                i++;
            }
            tokens.push({ type: 'number', value: num });
        }
        else {
            i++;
        }
    }
    return tokens;
}
function precedence(op) {
    if (op === '+' || op === '-')
        return 3;
    if (op === '*' || op === '/')
        return 4;
    return -1;
}
function evaluate(tokens) {
    const ops = [];
    const values = [];
    for (const token of tokens) {
        if (token.type === 'number') {
            values.push(token.value);
        }
        else {
            while (ops.length > 0 && precedence(ops[ops.length - 1]) >= precedence(token.value)) {
                const op = ops.pop();
                const b = values.pop();
                const a = values.pop();
                let res;
                if (op === '+')
                    res = a + b;
                else if (op === '-')
                    res = a - b;
                else if (op === '*')
                    res = a * b;
                else if (op === '/') {
                    res = Math.trunc(a / b);
                }
                values.push(res);
            }
            ops.push(token.value);
        }
    }
    while (ops.length > 0) {
        const op = ops.pop();
        const b = values.pop();
        const a = values.pop();
        let res;
        if (op === '+')
            res = a + b;
        else if (op === '-')
            res = a - b;
        else if (op === '*')
            res = a * b;
        else if (op === '/') {
            res = Math.trunc(a / b);
        }
        values.push(res);
    }
    return values[0];
}
function main() {
    const expr = fs.readFileSync(0, 'utf8');
    const tokens = tokenize(expr.trimEnd());
    console.log(evaluate(tokens));
}
main();
